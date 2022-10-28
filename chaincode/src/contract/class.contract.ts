import { Context, Info, Transaction } from "fabric-contract-api";
import { Class } from "../vo/class";
import { BaseContract } from "./contract";
import * as jwt from "../auth/jwt";
import * as ledger from "../ledger/common";
import { Point } from "../vo/point";
import { failed, success } from "../ledger/response";
import { Confirm } from "../vo/confirm";


@Info({ title: 'ClassContract', description: 'Smart contract for Class' })
export class ClassContract extends BaseContract {
    public constructor() { super('Class'); }

    @Transaction(false)
    public async GetClasses(ctx: Context, token: string) {
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
        let classes = [];
        switch (this.currentPayload.type) {
            case "STUDENT": {
                await ledger.getStates(
                    ctx, "POINT", async (record: Point) => {
                        if (record.studentId === this.currentPayload.id) {
                            const cls: Class = await ledger.getState(
                                ctx, record.classId, "CLASS"
                            );
                            const values = await Promise.all([
                                ledger.getState(ctx, cls.subjectId, "SUBJECT"),
                                ledger.getState(ctx, cls.teacherId, "TEACHER")
                            ])
                            delete cls.subjectId; cls["subject"] = values[0];
                            delete cls.teacherId; cls["teacher"] = values[1];
                            classes.push(cls);
                        }
                        return true;
                    }
                );
                break;
            }
            case "EMPLOYEE": {
                classes = await ledger.getStates(
                    ctx, "CLASS", async (record: Class) => {
                        const values = await Promise.all([
                            ledger.getState(ctx, record.subjectId, "SUBJECT"),
                            ledger.getState(ctx, record.teacherId, "TEACHER")
                        ])
                        delete record.subjectId; record["subject"] = values[0];
                        delete record.teacherId; record["teacher"] = values[1];
                        return true;
                    }
                );
                break;
            }
            case "TEACHER": {
                classes = await ledger.getStates(
                    ctx, "CLASS", async (record: Class) => {
                        const confirm: Confirm = await ledger.getFirstState(
                            ctx, "CONFIRM", async (c: Confirm) => {
                                return c.objectId === record.id
                            }
                        )
                        if (record.teacherId === this.currentPayload.id ||
                            (confirm && confirm.censorId1 === this.currentPayload.id)
                        ) {
                            const values = await Promise.all([
                                ledger.getState(ctx, record.subjectId, "SUBJECT"),
                                ledger.getState(ctx, record.teacherId, "TEACHER"),
                            ])
                            delete record.subjectId; record["subject"] = values[0];
                            delete record.teacherId; record["teacher"] = values[1];
                            return true;
                        } else return false;
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
        return success(classes);
    }

    @Transaction(false)
    public async GetClass(ctx: Context, token: string, classId: string) {
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
        const [cls, confirm]: [Class, Confirm] = await Promise.all([
            ledger.getState(ctx, classId, "CLASS"),
            ledger.getFirstState(ctx, "CONFIRM",
                async (record: Confirm) => {
                    return record.objectId === classId
                }
            )
        ]);
        if (cls) {
            const getListCensor = async () => {
                if (confirm) {
                    return [
                        await ledger.getState(ctx, confirm.censorId1, "TEACHER"),
                        await ledger.getState(ctx, confirm.censorId2, "EMPLOYEE")
                    ]
                }
                return null
            }
            const [subject, teacher, censors] = await Promise.all([
                ledger.getState(ctx, cls.subjectId, "SUBJECT"),
                ledger.getState(ctx, cls.teacherId, "TEACHER"),
                getListCensor(),
            ])
            if (confirm) {
                delete confirm.censorId1; delete confirm.censorId2;
                if (censors[0]) confirm["censor1"] = censors[0];
                if (censors[1]) confirm["censor2"] = censors[0];
                cls['confirm'] = confirm;
            }
            delete cls.subjectId; cls["subject"] = subject;
            delete cls.teacherId; cls["teacher"] = teacher;
            switch (this.currentPayload.type) {
                case "STUDENT": {
                    const point: Point = await ledger.getFirstState(
                        ctx, "POINT", async (record: Point) => {
                            return record.studentId === this.currentPayload.id &&
                                record.classId === classId
                        }
                    )
                    if (point) { return success(cls); } else {
                        return failed({
                            code: "INCORRECT", param: 'classId',
                            msg: `The class ${classId} not found.`
                        });
                    }
                }
                case "EMPLOYEE": { return success(cls); }
                case "TEACHER": {
                    if (cls["teacher"].id === this.currentPayload.id ||
                        confirm.censorId1 === this.currentPayload.id
                    ) { return success(cls); } else {
                        return failed({
                            code: "INCORRECT", param: 'classId',
                            msg: `The class ${classId} not found.`
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
                code: "INCORRECT", param: 'classId',
                msg: `The class ${classId} not found.`
            });
        }
    }

    @Transaction(false)
    public async GetStudents(
        ctx: Context, token: string, classId: string
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
        let result: any[] = []
        switch (this.currentPayload.type) {
            case "STUDENT": {
                const pointId = `${this.currentPayload.id}.${classId}`;
                const point = await ledger.getState(ctx, pointId, "POINT");
                if (!point) {
                    return failed({
                        code: "INVALID", param: 'classId',
                        msg: `You is not in class ${classId}`
                    });
                }
                await ledger.getStates(
                    ctx, 'POINT', async (record) => {
                        if (record.classId === classId) {
                            const student = await ledger.getState(
                                ctx, record.studentId, "STUDENT"
                            );
                            result.push(student)
                            return true;
                        } return false;
                    }
                );
                break;
            }
            case "EMPLOYEE": case "TEACHER": {
                const cls: Class = await ledger.getState(ctx, classId, "CLASS");
                const confirm: Confirm = await ledger.getFirstState(
                    ctx, "CONFIRM", async (record: Confirm) => {
                        return record.objectId === classId
                    }
                )
                if (!cls) {
                    return failed({
                        code: "NOT_EXISTED", param: 'classId',
                        msg: `The class ${classId} does not exist`
                    });
                }
                if (this.currentPayload.type === "TEACHER" &&
                    cls.teacherId !== this.currentPayload.id &&
                    confirm.censorId1 !== this.currentPayload.id
                ) {
                    return failed({
                        code: "INVALID", param: 'classId',
                        msg: `You do not teach class ${classId}`
                    });
                }
                result = await ledger.getStates(
                    ctx, 'POINT', async (record) => {
                        if (record.classId === classId) {
                            const exam = await ledger.getState(
                                ctx, record.examId, "EXAM"
                            );
                            const student = await ledger.getState(
                                ctx, record.studentId, "STUDENT"
                            );
                            if (exam) {
                                delete record.examId;
                                record.examPoint = exam.point;
                            }
                            delete record.studentId;
                            record.student = student;
                            return true;
                        } return false;
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
        return success(result);
    }

    @Transaction()
    public async CreateClass(
        ctx: Context, token: string, classId: string, subjectId: string,
        year: number, semester: string, teacherId: string
    ): Promise<string> {
        const status = this.setCurrentPayload(
            jwt.verifyEmployee(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }
        const subject = await ledger.getState(
            ctx, subjectId, "SUBJECT"
        );
        if (await ledger.isStateExists(ctx, classId, "CLASS")) {
            return failed({
                code: "EXISTED", param: 'classId',
                msg: `The class ${classId} already exists`
            });
        }
        if (!subject) {
            return failed({
                code: "NOT_EXISTED", param: 'subjectId',
                msg: `The subject ${subjectId} does not exist`
            });
        }
        if (!await ledger.isStateExists(ctx, teacherId, "TEACHER")) {
            return failed({
                code: "NOT_EXISTED", param: 'teacherId',
                msg: `The teacher ${teacherId} does not exist`
            });
        }

        const cls: Class = {
            id: classId, subjectId, year,
            semester, teacherId
        };
        cls.docType = 'CLASS';
        await ledger.putState(
            ctx, this, cls.id,
            cls, cls.docType
        );
        delete cls['docType'];
        return success({ ...cls, subject });
    }

    @Transaction()
    public async AddStudent(
        ctx: Context, token: string, classId: string, studentId: string
    ): Promise<string> {
        const status = this.setCurrentPayload(
            jwt.verifyEmployee(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }
        const pointId = `${studentId}.${classId}`;
        const student = await ledger.getState(
            ctx, studentId, "STUDENT"
        );
        if (await ledger.isStateExists(ctx, pointId, 'POINT')) {
            return failed({
                code: "INVALID", param: 'studentId|classId',
                msg: `The student ${studentId} is already in class ${classId}`
            });
        }
        if (!await ledger.isStateExists(ctx, classId, "CLASS")) {
            return failed({
                code: "NOT_EXISTED", param: 'classId',
                msg: `The class ${classId} does not exist`
            });
        }
        if (!student) {
            return failed({
                code: "NOT_EXISTED", param: 'studentId',
                msg: `The student ${studentId} does not exist`
            });
        }

        const point: Point = {
            id: pointId, studentId: studentId,
            classId: classId, attendancePoint: null,
            practicePoint: null, exercisePoint: null,
            midtermExamPoint: null, examId: null
        };
        point.docType = 'POINT';
        await ledger.putState(
            ctx, this, point.id,
            point, point.docType
        );
        delete point.docType;
        return success({ ...point, student });
    }
}