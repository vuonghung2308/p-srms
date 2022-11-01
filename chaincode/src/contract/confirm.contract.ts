import { Context, Info, Transaction } from "fabric-contract-api";
import { BaseContract } from "./contract";
import * as jwt from "../auth/jwt";
import * as ledger from "../ledger/common";
import { failed, success } from "../ledger/response";
import { Class } from "../vo/class";
import { Confirm } from "../vo/confirm";
import { Room } from "../vo/room";
import { Teacher } from "../vo/teacher";
import { Employee } from "../vo/employee";

@Info({ title: 'ConfirmContract', description: 'Smart contract for Confirm' })
export class ConfirmContract extends BaseContract {
    public constructor() { super('Confirm'); }

    @Transaction(false)
    public async GetConfirms(
        ctx: Context, token: string
    ): Promise<string> {
        const status = this.setCurrentPayload(
            jwt.verify(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }
        let confirms = [];
        switch (this.currentPayload.type) {
            case "EMPLOYEE": {
                confirms = await ledger.getStates(
                    ctx, "CONFIRM", async (record: Confirm) => {
                        return record.censorId2 === this.currentPayload.id ||
                            record.censorId2 === null
                    }
                );
                break;
            }
            case "TEACHER": {
                confirms = await ledger.getStates(
                    ctx, "CONFIRM", async (record: Confirm) => {
                        return record.censorId1 === this.currentPayload.id ||
                            record.teacherId === this.currentPayload.id
                    }
                );
                break;
            }
            case "STUDENT": case "ADMIN": default: {
                return failed({
                    code: "NOT_ALLOWED", param: 'token',
                    msg: "You do not have permission"
                });
            }
        }
        return success(confirms);
    }

    @Transaction(false)
    public async GetConfirm(
        ctx: Context, token: string, confirmId: string
    ): Promise<string> {
        const status = this.setCurrentPayload(
            jwt.verify(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }
        const confirm: Confirm = await ledger.getState(
            ctx, confirmId, "CONFIRM"
        );
        if (confirm) {
            switch (this.currentPayload.type) {
                case "EMPLOYEE": {
                    if (confirm.censorId2 === this.currentPayload.id ||
                        confirm.censorId2 === null
                    ) {
                        return failed({
                            code: "INVALID", param: 'confirmId',
                            msg: `The confirm ${confirmId} is not valid.`
                        });
                    }
                    return success(confirm);
                }
                case "TEACHER": {
                    if (confirm.teacherId === this.currentPayload.id ||
                        confirm.censorId1 === this.currentPayload.id
                    ) {
                        return success(confirm);
                    } else {
                        return failed({
                            code: "INVALID", param: 'confirmId',
                            msg: `The confirm ${confirmId} is not valid.`
                        });
                    }
                }
                case "STUDENT": case "ADMIN": default: {
                    return failed({
                        code: "NOT_ALLOWED", param: 'token',
                        msg: "You do not have permission"
                    });
                }
            }
        } else {
            return failed({
                code: "NOT_FOUND", param: 'confirmId',
                msg: `The confirm ${confirmId} not found.`
            });
        }
    }

    @Transaction()
    public async Create(
        ctx: Context, token: string, type: string,
        id: string, censorId: string, note: string
    ): Promise<string> {
        const time = new Date().getTime() / 1000;
        const status = this.setCurrentPayload(
            jwt.verifyTeacher(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }

        if (type === "COMPONENTS_POINT" || type === "EXAM_POINT") {
            const [currentConfirm, confirms, censor1] = await Promise.all([
                ledger.getFirstState(ctx, "CONFIRM", async (record) => {
                    return record.objectId === id
                }), ledger.getStates(ctx, "CONFIRM"),
                ledger.getState(ctx, censorId, "TEACHER")
            ]);

            if (currentConfirm && currentConfirm.status !== "CANCELED" &&
                !currentConfirm.status.includes("REJECTED")
            ) {
                return failed({
                    code: "EXISTED", param: 'id',
                    msg: `The confirm for ${id} already exists`
                });
            }

            const confirm: Confirm = {
                id: `${confirms.length}.${id}`,
                type, note, status: "INITIALIZED",
                docType: "CONFIRM", objectId: id,
                censorId1: censorId, censorId2: null,
                teacherId: this.currentPayload.id
            }

            if (currentConfirm) {
                confirm.id = currentConfirm.id;
            }

            if (type === "COMPONENTS_POINT") {
                if (censor1 === null) {
                    return failed({
                        code: "NOT_EXIST", param: 'censorId',
                        msg: `The teacher ${censorId} does not exist`
                    });
                }
                const cls: Class = await ledger.getState(
                    ctx, id, "CLASS"
                );
                if (cls === null || cls.teacherId !== this.currentPayload.id) {
                    return failed({
                        code: 'NOT_ALLOWED', param: 'id',
                        msg: `The class ${id} is not valid.`
                    });
                }
                // check point is confirmed here
                await ledger.putState(
                    ctx, this, confirm.id,
                    confirm, confirm.docType
                )
                delete confirm.censorId1;
                confirm['censor1'] = censor1;
            } else {
                const room: Room = await ledger.getState(
                    ctx, id, "ROOM"
                );
                if (room === null || room.teacherId !== this.currentPayload.id) {
                    return failed({
                        code: 'NOT_ALLOWED', param: 'id',
                        msg: `The room ${id} is not valid.`
                    });
                }
                // check point is confirmed here
                confirm.censorId1 = null;
                await ledger.putState(
                    ctx, this, confirm.id,
                    confirm, confirm.docType
                )
            }

            delete confirm.docType;
            confirm['time'] = time;
            return success(confirm);
        } else {
            return failed({
                code: 'NOT_ALLOWED', param: 'type',
                msg: "The confirm type is not valid."
            });
        }
    }

    @Transaction()
    public async Cancel(
        ctx: Context, token: string,
        id: string, note: string
    ): Promise<string> {
        const time = new Date().getTime() / 1000;
        const status = this.setCurrentPayload(
            jwt.verifyTeacher(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }
        const confirm: Confirm = await ledger.getState(
            ctx, id, "CONFIRM"
        );
        if (confirm === null) {
            return failed({
                code: 'NOT_EXIST', param: 'id',
                msg: `The confirm ${id} does not exist.`
            });
        }
        const [cls, room, censor1]: [Class, Room, Teacher]
            = await Promise.all([
                ledger.getState(ctx, confirm.objectId, "CLASS"),
                ledger.getState(ctx, confirm.objectId, "ROOM"),
                ledger.getState(ctx, confirm.censorId1, "TEACHER"),
            ]);
        if (confirm.type === "COMPONENTS_POINT") {
            if (cls !== null && cls.teacherId === this.currentPayload.id) {
                confirm.status = "CANCELED"; confirm.note = note;
                confirm.docType = "CONFIRM";
                await ledger.putState(
                    ctx, this, confirm.id,
                    confirm, confirm.docType
                )
                delete confirm.docType;
                delete confirm.censorId1;
                confirm['censor1'] = censor1;
                confirm['time'] = time;
                return success(confirm);
            } else {
                return failed({
                    code: 'NOT_ALLOWED', param: 'token',
                    msg: `The token is not valid.`
                });
            }
        } else {
            if (room !== null && room.teacherId === this.currentPayload.id) {
                confirm.status = "CANCELED"; confirm.note = note;
                confirm.docType = "CONFIRM";
                await ledger.putState(
                    ctx, this, confirm.id,
                    confirm, confirm.docType
                )
                delete confirm.docType;
                confirm['time'] = time;
                return success(confirm);
            } else {
                return failed({
                    code: 'NOT_ALLOWED', param: 'token',
                    msg: `The token is not valid.`
                });
            }
        }
    }

    @Transaction()
    public async Accept(
        ctx: Context, token: string, id: string, note: string
    ): Promise<string> {
        const time = new Date().getTime() / 1000;
        const status = this.setCurrentPayload(
            jwt.verify(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }

        switch (this.currentPayload.type) {
            case "TEACHER": case "EMPLOYEE": {
                const confirm: Confirm = await ledger.getState(
                    ctx, id, "CONFIRM"
                );
                if (confirm === null) {
                    return failed({
                        code: 'NOT_ALLOWED', param: 'id',
                        msg: `The confirm ${id} is not valid.`
                    });
                }
                if (confirm.type === "EXAM_POINT" &&
                    this.currentPayload.type === "TEACHER"
                ) {
                    return failed({
                        code: "NOT_ALLOWED", param: 'token',
                        msg: "You do not have permission"
                    });
                }
                confirm.status = "ACCEPTED"; confirm.note = note;
                confirm.docType = "CONFIRM"; let censor2 = null;
                if (this.currentPayload.type === "EMPLOYEE") {
                    if (confirm.status !== "DONE" && confirm.type === "COMPONENTS_POINT") {
                        return failed({
                            code: "NOT_ALLOWED", param: 'id',
                            msg: `The confirm ${id} must be confirmed by censor 1.`
                        });
                    }
                    confirm.censorId2 = this.currentPayload.id
                    censor2 = await ledger.getState(
                        ctx, confirm.censorId2, "EMPLOYEE"
                    );
                }
                const censor1 = await ledger.getState(
                    ctx, confirm.censorId1, "TEACHER"
                );
                await ledger.putState(
                    ctx, this, confirm.id,
                    confirm, confirm.docType
                )
                delete confirm.docType;
                delete confirm.censorId1;
                confirm["censor1"] = censor1;
                confirm['time'] = time;
                if (censor2) {
                    delete confirm.censorId2;
                    confirm["censor2"] = censor2;
                }
                return success(confirm);
            }
            case "STUDENT": case "ADMIN": default: {
                return failed({
                    code: "NOT_ALLOWED", param: 'token',
                    msg: "You do not have permission"
                });
            }
        }
    }

    @Transaction()
    public async Reject(
        ctx: Context, token: string,
        id: string, note: string
    ): Promise<string> {
        const time = new Date().getTime() / 1000;
        const status = this.setCurrentPayload(
            jwt.verify(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }

        switch (this.currentPayload.type) {
            case "TEACHER": case "EMPLOYEE": {
                const confirm: Confirm = await ledger.getState(
                    ctx, id, "CONFIRM"
                );
                if (confirm === null) {
                    return failed({
                        code: 'NOT_ALLOWED', param: 'id',
                        msg: `The confirm ${id} is not valid.`
                    });
                }
                if (confirm.type === "EXAM_POINT" && this.currentPayload.type === "TEACHER") {
                    return failed({
                        code: "NOT_ALLOWED", param: 'token',
                        msg: "You do not have permission"
                    });
                }
                let censor2 = null; confirm.docType = "CONFIRM";
                confirm.status = "T_REJECTED"; confirm.note = note;
                if (this.currentPayload.type === "EMPLOYEE") {
                    confirm.censorId2 = this.currentPayload.id;
                    confirm.status = "E_REJECTED"
                    censor2 = await ledger.getState(
                        ctx, confirm.censorId2, "EMPLOYEE"
                    );
                }
                const censor1 = await ledger.getState(
                    ctx, confirm.censorId1, "TEACHER"
                );
                await ledger.putState(
                    ctx, this, confirm.id,
                    confirm, confirm.docType
                )
                delete confirm.docType;
                delete confirm.censorId1;
                confirm["censor1"] = censor1;
                confirm['time'] = time;
                if (censor2) {
                    delete confirm.censorId2;
                    confirm["censor2"] = censor2;
                }
                return success(confirm);
            }
            case "STUDENT": case "ADMIN": default: {
                return failed({
                    code: "NOT_ALLOWED", param: 'token',
                    msg: "You do not have permission"
                });
            }
        }
    }

    @Transaction()
    public async Done(
        ctx: Context, token: string,
        id: string, note: string
    ): Promise<string> {
        const time = new Date().getTime() / 1000;
        const status = this.setCurrentPayload(
            jwt.verify(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }

        switch (this.currentPayload.type) {
            case "EMPLOYEE": {
                const confirm: Confirm = await ledger.getState(
                    ctx, id, "CONFIRM"
                );
                if (confirm === null) {
                    return failed({
                        code: 'NOT_ALLOWED', param: 'id',
                        msg: `The confirm ${id} is not valid.`
                    });
                }
                if (confirm.type === "EXAM_POINT" && this.currentPayload.type === "TEACHER") {
                    return failed({
                        code: "NOT_ALLOWED", param: 'token',
                        msg: "You do not have permission"
                    });
                }
                confirm.status = "DONE"; confirm.note = note;
                confirm.censorId2 = this.currentPayload.id;
                confirm.docType = "CONFIRM";
                const [censor1, censor2]: [Teacher, Employee] = await Promise.all([
                    ledger.getState(ctx, confirm.censorId1, "TEACHER"),
                    ledger.getState(ctx, confirm.censorId2, "EMPLOYEE")
                ]);
                await ledger.putState(
                    ctx, this, confirm.id,
                    confirm, confirm.docType
                )
                delete confirm.docType; confirm['time'] = time;
                delete confirm.censorId2; confirm["censor2"] = censor2;
                delete confirm.censorId1; confirm["censor1"] = censor1;
                return success(confirm);
            }
            case "TEACHER": case "STUDENT": case "ADMIN": default: {
                return failed({
                    code: "NOT_ALLOWED", param: 'token',
                    msg: "You do not have permission"
                });
            }
        }
    }
}