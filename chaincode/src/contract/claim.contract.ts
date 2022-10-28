import { Context, Info, Transaction } from "fabric-contract-api";
import { BaseContract } from "./contract";
import * as jwt from "../auth/jwt";
import * as ledger from "../ledger/common";
import { failed, success } from "../ledger/response";
import { Claim } from "../vo/claim";
import { Point } from "../vo/point";
import { Class } from "../vo/class";

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
            const currentClaims = await ledger.getStates(
                ctx, "CLAIM", async (record: Claim) => {
                    return record.objectId === id
                }
            )
            if (currentClaims.length === 1) {
                return failed({
                    code: "EXISTED",
                    param: 'id',
                    msg: `The claim for ${id} already exists`
                });
            }

            const claims: Claim[] = await ledger
                .getStates(ctx, "CLAIM");
            const claim: Claim = {
                id: `${claims.length}.${id}`,
                studentId: this.currentPayload.id,
                time: (new Date().getTime() / 1000),
                type, note, status: "INITIALIZED",
                docType: "CLAIM", objectId: id
            }

            if (type === "COMPONENTS_POINT") {
                const point: Point = await ledger.getState(
                    ctx, id, "POINT"
                );
                if (point === null || point.studentId !== this.currentPayload.id) {
                    return failed({
                        code: 'NOT_ALLOWED', param: 'id',
                        msg: `The point ${id} is not valid.`
                    });
                }
                // check point is confirmed here
                await ledger.putState(
                    ctx, this, claim.id,
                    claim, claim.docType
                )
            } else {
                const [exam, points] = await Promise.all([
                    ledger.getState(ctx, id, "EXAMP"),
                    ledger.getStates(
                        ctx, "POINT", async (record: Point) => {
                            return record.studentId === this.currentPayload.id &&
                                record.examId === id
                        }
                    )
                ]);
                // check exam is confirmed here
                if (exam !== null && points.length == 1) {
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
            return success(claim);
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
        const claim: Claim = await ledger.getState(
            ctx, id, "CLAIM"
        );
        if (claim && claim.studentId === this.currentPayload.id) {
            claim.status = "CANCELED"; claim.note = note;
            claim.time = new Date().getTime() / 1000;
            claim.docType = "CLAIM";
            await ledger.putState(
                ctx, this, claim.id,
                claim, claim.docType
            )
            delete claim.docType;
            return success(claim);
        } else {
            return failed({
                code: 'NOT_ALLOWED', param: 'id',
                msg: `The claim ${id} is not valid.`
            });
        }
    }

    @Transaction()
    public async Accept(
        ctx: Context, token: string, id: string, note: string
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
                if (claim.type === "COMPONENTS_POINT" && this.currentPayload.type === "EMPLOYEE") {
                    return failed({
                        code: "NOT_ALLOWED", param: 'token',
                        msg: "You do not have permission"
                    });
                }
                if (claim.type === "EXAM_POINT" && this.currentPayload.type === "TEACHER") {
                    return failed({
                        code: "NOT_ALLOWED", param: 'token',
                        msg: "You do not have permission"
                    });
                }
                claim.status = "ACCEPTED"; claim.note = note;
                claim.time = new Date().getTime() / 1000;
                claim.docType = "CLAIM";
                await ledger.putState(
                    ctx, this, claim.id,
                    claim, claim.docType
                )
                delete claim.docType;
                return success(claim);
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
                if (claim.type === "COMPONENTS_POINT" && this.currentPayload.type === "EMPLOYEE") {
                    return failed({
                        code: "NOT_ALLOWED",
                        param: 'token',
                        msg: "You do not have permission"
                    });
                }
                if (claim.type === "EXAM_POINT" && this.currentPayload.type === "TEACHER") {
                    return failed({
                        code: "NOT_ALLOWED",
                        param: 'token',
                        msg: "You do not have permission"
                    });
                }
                claim.status = "REJECTED";
                claim.time = new Date().getTime() / 1000;
                claim.note = note;
                claim.docType = "CLAIM";
                await ledger.putState(
                    ctx, this, claim.id,
                    claim, claim.docType
                )
                delete claim.docType;
                return success(claim);
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
        ctx: Context, token: string,
        id: string, note: string
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
                if (claim.type === "COMPONENTS_POINT" && this.currentPayload.type === "EMPLOYEE") {
                    return failed({
                        code: "NOT_ALLOWED",
                        param: 'token',
                        msg: "You do not have permission"
                    });
                }
                if (claim.type === "EXAM_POINT" && this.currentPayload.type === "TEACHER") {
                    return failed({
                        code: "NOT_ALLOWED",
                        param: 'token',
                        msg: "You do not have permission"
                    });
                }
                claim.status = "DONE";
                claim.time = new Date().getTime() / 1000;
                claim.note = note;
                claim.docType = "CLAIM";
                await ledger.putState(
                    ctx, this, claim.id,
                    claim, claim.docType
                )
                delete claim.docType;
                return success(claim);
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
}