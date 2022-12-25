import { Context, Info, Transaction } from "fabric-contract-api";
import { BaseContract } from "./contract";
import * as jwt from "../auth/jwt";
import * as ledger from "../ledger/common";
import { failed, success } from "../ledger/response";
import { Claim, ClaimAction } from "../vo/claim";
import { Point } from "../vo/point";
import { Class } from "../vo/class";
import { time } from "console";
import { Room } from "../vo/room";
import { Exam } from "../vo/exam";
import { Teacher } from "../vo/teacher";
import { Employee } from "../vo/employee";

@Info({ title: 'ClaimContract', description: 'Smart contract for Claim' })
export class ClaimContract extends BaseContract {
    public constructor() { super('Claim'); }

    @Transaction(false)
    public async GetClaims(
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
        let claims = [];
        switch (this.currentPayload.type) {
            case "STUDENT": {
                claims = await ledger.getStates(
                    ctx, "CLAIM", async (record: Claim) => {
                        return record.studentId === this.currentPayload.id
                    }
                );
                break;
            }
            case "EMPLOYEE": {
                claims = await ledger.getStates(
                    ctx, "CLAIM", async (record: Claim) => {
                        return record.type === "EXAM_POINT"
                    }
                );
                break;
            }
            case "TEACHER": {
                claims = await ledger.getStates(
                    ctx, "CLAIM", async (record: Claim) => {
                        if (record.type === "COMPONENTS_POINT") {
                            const point: Point = await ledger.getState(
                                ctx, record.objectId, "POINT"
                            );
                            const cls: Class = await ledger.getState(
                                ctx, point.classId, "CLASS"
                            );
                            return cls.teacherId === this.currentPayload.id;
                        } else { return false; }
                    }
                );
                break;
            }
            case "ADMIN": default: {
                return failed({
                    code: "NOT_ALLOWED", param: 'token',
                    msg: "You do not have permission"
                });
            }
        }
        return success(claims);
    }

    @Transaction(false)
    public async GetClaim(
        ctx: Context, token: string, claimId: string
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
        const claim: Claim = await ledger.getState(
            ctx, claimId, "CLAIM"
        );
        if (claim) {
            switch (this.currentPayload.type) {
                case "STUDENT": {
                    if (claim.studentId === this.currentPayload.id) {
                        return success(claim);
                    } else {
                        return failed({
                            code: "INVALID", param: 'claimId',
                            msg: `The claim ${claimId} is not valid.`
                        });
                    }
                }
                case "EMPLOYEE": {
                    return success(claim);
                }
                case "TEACHER": {
                    const point: Point = await ledger.getState(
                        ctx, claim.objectId, "POINT"
                    );
                    const cls: Class = await ledger.getState(
                        ctx, point.classId, "CLASS"
                    );
                    if (cls.teacherId === this.currentPayload.id) {
                        return success(claim);
                    } else {
                        return failed({
                            code: "INVALID", param: 'claimId',
                            msg: `The claim ${claimId} is not valid.`
                        });
                    }
                }
                case "ADMIN": default: {
                    return failed({
                        code: "NOT_ALLOWED", param: 'token',
                        msg: "You do not have permission"
                    });
                }
            }
        } else {
            return failed({
                code: "NOT_FOUND", param: 'claimId',
                msg: `The claim ${claimId} not found.`
            });
        }
    }

    @Transaction()
    public async Create(
        ctx: Context, token: string,
        type: string, id: string,
        note: string
    ): Promise<string> {
        const time = new Date().getTime() / 1000;
        const status = this.setCurrentPayload(
            jwt.verifyStudent(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }

        if (type === "COMPONENTS_POINT" || type === "EXAM_POINT") {
            const currentClaim: Claim = await ledger.getFirstState(
                ctx, "CLAIM", async (record: Claim) => {
                    return record.objectId === id
                }
            )
            const claims: Claim[] = await ledger
                .getStates(ctx, "CLAIM");

            const action: ClaimAction = {
                time: time, note: note, action: "INITIALIZE",
                actorId: this.currentPayload.id,
                actorType: this.currentPayload.type
            }
            const claim: Claim = {
                id: `${claims.length}.${id}`,
                studentId: this.currentPayload.id,
                type, status: "INITIALIZED",
                docType: "CLAIM", objectId: id,
                teacherId: null, actions: [action]
            }

            if (currentClaim && currentClaim.status !== "CANCELED"
                && !currentClaim.status.includes("REJECTED")
            ) {
                return failed({
                    code: "EXISTED",
                    param: 'id',
                    msg: `The claim for ${id} already exists`
                });
            } else if (currentClaim) {
                const cActions = currentClaim.actions;
                claim.actions = [...cActions, action]
                claim.id = currentClaim.id;
            }

            if (type === "COMPONENTS_POINT") {
                const point: Point = await ledger.getState(
                    ctx, id, "POINT"
                );
                const cls: Class = await ledger.getState(
                    ctx, point.classId, "CLASS"
                )
                if (point === null || point.studentId !== this.currentPayload.id) {
                    return failed({
                        code: 'NOT_ALLOWED', param: 'id',
                        msg: `The point ${id} is not valid.`
                    });
                }
                // check point is confirmed here
                claim.teacherId = cls.teacherId;
                await ledger.putState(
                    ctx, this, claim.id,
                    claim, claim.docType
                )
            } else {
                const [exam, points] = await Promise.all([
                    ledger.getState(ctx, id, "EXAM"),
                    ledger.getStates(
                        ctx, "POINT", async (record: Point) => {
                            return record.studentId === this.currentPayload.id &&
                                record.examId === id
                        }
                    )
                ]);
                // check exam is confirmed here
                if (exam !== null && points.length == 1) {
                    const room: Room = await ledger.getState(
                        ctx, exam.teacherId, "TEACHER"
                    );
                    claim.teacherId = room.teacherId;
                    await ledger.putState(
                        ctx, this, claim.id,
                        claim, claim.docType
                    );
                } else {
                    return failed({
                        code: 'NOT_EXIST', param: 'id',
                        msg: `The exam ${id} does not exist.`
                    });
                }
            }

            delete claim.docType;
            const nClaim = await this.getActionData(ctx, claim);
            return success(nClaim);
        } else {
            return failed({
                code: 'NOT_ALLOWED', param: 'type',
                msg: "The claim type is not valid."
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
            jwt.verifyStudent(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }
        const action: ClaimAction = {
            time: time, note: note, action: "CANCEL",
            actorId: this.currentPayload.id,
            actorType: this.currentPayload.type,
        }
        const claim: Claim = await ledger.getState(
            ctx, id, "CLAIM"
        );
        if (claim && claim.studentId === this.currentPayload.id) {
            claim.actions.push(action);
            claim.status = "CANCELED";
            claim.docType = "CLAIM";
            await ledger.putState(
                ctx, this, claim.id,
                claim, claim.docType
            )
            delete claim.docType;
            const nClaim = await this.getActionData(ctx, claim);
            return success(nClaim);
        } else {
            return failed({
                code: 'NOT_ALLOWED', param: 'id',
                msg: `The claim ${id} is not valid.`
            });
        }
    }

    @Transaction()
    public async Accept(
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
        const action: ClaimAction = {
            time: time, note: note, action: "ACCEPT",
            actorId: this.currentPayload.id,
            actorType: this.currentPayload.type,
        }
        switch (this.currentPayload.type) {
            case "TEACHER": case "EMPLOYEE": {
                const claim: Claim = await ledger.getState(
                    ctx, id, "CLAIM"
                );
                if (claim === null) {
                    return failed({
                        code: 'NOT_ALLOWED', param: 'id',
                        msg: `The claim ${id} is not valid.`
                    });
                }
                if (claim.type === "COMPONENTS_POINT") {
                    if (this.currentPayload.type === "EMPLOYEE" ||
                        this.currentPayload.id !== claim.teacherId
                    ) {
                        return failed({
                            code: "NOT_ALLOWED", param: 'token',
                            msg: "You do not have permission"
                        });
                    }
                }
                if (claim.type === "EXAM_POINT") {
                    if (this.currentPayload.type !== "EMPLOYEE") {
                        return failed({
                            code: "NOT_ALLOWED", param: 'token',
                            msg: "You do not have permission"
                        });
                    }
                }
                claim.actions.push(action);
                claim.status = "ACCEPTED";
                claim.docType = "CLAIM";
                await ledger.putState(
                    ctx, this, claim.id,
                    claim, claim.docType
                )
                delete claim.docType;
                const nClaim = await this.getActionData(ctx, claim);
                return success(nClaim);
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
        const action: ClaimAction = {
            time: time, note: note, action: "ACCEPT",
            actorId: this.currentPayload.id,
            actorType: this.currentPayload.type,
        }
        switch (this.currentPayload.type) {
            case "TEACHER": case "EMPLOYEE": {
                const claim: Claim = await ledger.getState(
                    ctx, id, "CLAIM"
                );
                if (claim === null) {
                    return failed({
                        code: 'NOT_ALLOWED',
                        param: 'id',
                        msg: `The claim ${id} is not valid.`
                    });
                }
                if (claim.type === "COMPONENTS_POINT") {
                    if (this.currentPayload.type === "EMPLOYEE" ||
                        this.currentPayload.id !== claim.teacherId
                    ) {
                        return failed({
                            code: "NOT_ALLOWED", param: 'token',
                            msg: "You do not have permission"
                        });
                    }
                }
                if (claim.type === "EXAM_POINT") {
                    if (this.currentPayload.type !== "EMPLOYEE") {
                        return failed({
                            code: "NOT_ALLOWED", param: 'token',
                            msg: "You do not have permission"
                        });
                    }
                }
                claim.actions.push(action);
                claim.status = "REJECTED";
                claim.docType = "CLAIM";
                await ledger.putState(
                    ctx, this, claim.id,
                    claim, claim.docType
                )
                delete claim.docType;
                const nClaim = await this.getActionData(ctx, claim);
                return success(nClaim);
            }
            case "STUDENT": case "ADMIN": default: {
                return failed({
                    code: "NOT_ALLOWED",
                    param: 'token',
                    msg: "You do not have permission"
                });
            }
        }
    }

    @Transaction()
    public async Done(
        ctx: Context, token: string, id: string,
        note: string, eaPoint: string, atPoint: string,
        prPoint: string, miPoint: string, eePoint: string
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

        const action: ClaimAction = {
            time: time, note: note, action: "ACCEPT",
            actorId: this.currentPayload.id,
            actorType: this.currentPayload.type,
        }

        switch (this.currentPayload.type) {
            case "TEACHER": case "EMPLOYEE": {
                const claim: Claim = await ledger.getState(
                    ctx, id, "CLAIM"
                );
                if (claim === null) {
                    return failed({
                        code: 'NOT_ALLOWED',
                        param: 'id',
                        msg: `The claim ${id} is not valid.`
                    });
                }
                if (claim.type === "COMPONENTS_POINT") {
                    if (this.currentPayload.type === "EMPLOYEE" ||
                        this.currentPayload.id !== claim.teacherId
                    ) {
                        return failed({
                            code: "NOT_ALLOWED", param: 'token',
                            msg: "You do not have permission"
                        });
                    }
                    const point: Point = await ledger.getState(
                        ctx, claim.objectId, "POINT"
                    )
                    if (atPoint !== "undefined") {
                        point.attendancePoint = Number(atPoint);
                    } else point.attendancePoint = null;
                    if (prPoint !== "undefined") {
                        point.practicePoint = Number(prPoint);
                    } else point.practicePoint = null;
                    if (miPoint !== "undefined") {
                        point.midtermExamPoint = Number(miPoint);
                    } else point.midtermExamPoint = null;
                    if (eePoint !== "undefined") {
                        point.exercisePoint = Number(eePoint);
                    } else point.exercisePoint = null;
                }
                if (claim.type === "EXAM_POINT") {
                    if (this.currentPayload.type !== "EMPLOYEE") {
                        return failed({
                            code: "NOT_ALLOWED", param: 'token',
                            msg: "You do not have permission"
                        });
                    }
                    const exam: Exam = await ledger.getState(
                        ctx, claim.objectId, "EXAM"
                    )
                    if (eaPoint !== "undefined") {
                        exam.point = Number(eaPoint);
                    } else exam.point = null;
                }
                claim.actions.push(action);
                claim.status = "DONE";
                claim.docType = "CLAIM";
                await ledger.putState(
                    ctx, this, claim.id,
                    claim, claim.docType
                )
                delete claim.docType;
                const nClaim = await this.getActionData(ctx, claim);
                return success(nClaim);
            }
            case "STUDENT": case "ADMIN": default: {
                return failed({
                    code: "NOT_ALLOWED",
                    param: 'token',
                    msg: "You do not have permission"
                });
            }
        }
    }

    private async getActionData(
        ctx: Context, claim: Claim
    ): Promise<Claim> {
        claim.actions.sort((a, b) => b.time - a.time)
        for (const action of claim.actions) {
            const actor = await ledger.getState(
                ctx, action.actorId,
                action.actorType
            );
            action["actorName"] = actor.name;
        }
        return claim;
    }
}