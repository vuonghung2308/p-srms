import { Context, Info, Transaction } from "fabric-contract-api";
import { Class } from "../vo/class";
import { BaseContract } from "./contract";
import * as jwt from "../auth/jwt";
import * as ledger from "../ledger/common";
import { Point } from "../vo/point";
import { failed, success } from "../ledger/response";
import { Confirm } from "../vo/confirm";
import { Exam } from "../vo/exam";
import { Student } from "../vo/student";
import logger from "../utils/logger";
import { Teacher } from "../vo/teacher";
import { Employee } from "../vo/employee";


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
                        ]);
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
                        const isCensor = (confirm: Confirm) => confirm.actions.some(a =>
                            a.censorId === this.currentPayload.id
                        )
                        if (record.teacherId === this.currentPayload.id ||
                            confirm && isCensor(confirm)
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
            this.getConfirm(ctx, classId)
        ]);
        if (cls) {
            const [subject, teacher] = await Promise.all([
                ledger.getState(ctx, cls.subjectId, "SUBJECT"),
                ledger.getState(ctx, cls.teacherId, "TEACHER"),
            ]);
            cls["confirm"] = confirm;
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
                            const exam: Exam = await ledger.getState(
                                ctx, record.examId, "EXAM"
                            );
                            const [student, eConfirm]: [Student, Confirm]
                                = await Promise.all([
                                    ledger.getState(ctx, record.studentId, "STUDENT"),
                                    ledger.getFirstState(
                                        ctx, "CONFIRM", async (record: Confirm) => {
                                            return record.objectId === exam.roomId
                                        }
                                    )
                                ])
                            if (exam && eConfirm && eConfirm.status === "DONE") {
                                delete record.examId;
                                record.examPoint = exam.point;
                            }
                            delete record.studentId; record.student = student;
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
        const teacher = await ledger.getState(ctx, teacherId, "TEACHER");
        if (!teacher) {
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
        return success({ ...cls, subject, teacher });
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

    private async getConfirm(
        ctx: Context, classId: string
    ): Promise<Confirm> {

        const confirm: Confirm = await ledger.getFirstState(
            ctx, "CONFIRM", async (record: Confirm) => {
                return record.objectId === classId
            }
        )

        if (confirm) {
            confirm.actions.sort((a, b) => b.time - a.time)
            for (const action of confirm.actions) {
                if (action.censorId) {
                    const t: Teacher = await ledger.getState(
                        ctx, action.censorId,
                        action.actorType
                    );
                    action["censorName"] = t.name;
                }
                if (action.actorType === "TEACHER") {
                    const t: Teacher = await ledger.getState(
                        ctx, action.actorId,
                        action.actorType
                    );
                    action["actorName"] = t.name;
                } else {
                    const e: Employee = await ledger.getState(
                        ctx, action.actorId,
                        action.actorType
                    );
                    action["actorName"] = e.name;
                }
            }
            return confirm;
        }
        return undefined;
    }
}