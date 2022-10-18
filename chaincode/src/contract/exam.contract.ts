import { Context, Info, Transaction } from "fabric-contract-api";
import { BaseContract } from "./contract";
import * as jwt from "../auth/jwt";
import * as ledger from "../ledger/common";
import { Exam } from "../vo/exam";
import { Room } from "../vo/room";
import { Class } from "../vo/class";
import { Point } from "../vo/point";
import { failed, success } from "../ledger/response";


@Info({ title: 'ExamContract', description: 'Smart contract for Exam' })
export class ExamContract extends BaseContract {
    public constructor() { super('Exam'); }

    @Transaction(false)
    public async GetExams(
        ctx: Context, token: string, roomId: string
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
                const exams = await ledger.getStates(
                    ctx, "EXAM", true,
                    async (record) => {
                        if (record.roomId === roomId) {
                            const student = await ledger.getState(
                                ctx, record.studentId, "STUDENT"
                            );
                            delete record.studentId;
                            if (this.currentPayload.type === "EMPLOYEE") {
                                record.student = student;
                            }
                            return true;
                        } else { return false; }
                    }
                );
                return success(exams);
            }
            case "STUDENT": case "ADMIN": default: {
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
            }
        }
    }

    @Transaction()
    public async AddExam(
        ctx: Context, token: string,
        roomId: string, studentId: string
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
        const examId = `${studentId}.${roomId}`;
        const room: Room = await ledger.getState(ctx, roomId, "ROOM");
        const student = await ledger.getState(ctx, studentId, "STUDENT");
        if (!room) {
            return failed({
                code: "NOT_EXISTED",
                param: 'roomId',
                msg: `The room ${roomId} does not exist`
            });
        }
        if (!student) {
            return failed({
                code: "NOT_EXISTED",
                param: 'studentId',
                msg: `The student ${studentId} does not exist`
            });
        }
        if (await ledger.isStateExists(ctx, examId, 'EXAM')) {
            return failed({
                code: "INVALID",
                param: 'studentId|roomId',
                msg: `The student ${studentId} already had an exam in ${roomId}`
            });
        }

        const classes: Class[] = await this.getClassByYear(
            ctx, room.subjectId, room.year, room.semester
        );

        if (!classes || classes.length === 0) {
            return failed({
                code: "INVALID",
                param: 'classId|subjectId|semester|year',
                msg: `No class with subject ${room.subjectId}` +
                    ` in semester ${room.semester}-${room.year}`
            });
        }
        let point: Point = null;
        for (const cls of classes) {
            point = await ledger.getState(
                ctx, `${studentId}.${cls.id}`, "POINT"
            );
            if (point) break;
        }

        if (!point) {
            return failed({
                code: "INVALID",
                param: 'studentId|subjectId|semester|year',
                msg: `The student does not learn ${room.subjectId}` +
                    ` in semester ${room.semester}-${room.year}`
            });
        }

        const time = new Date(room.timeStart * 1000);
        const examCode = await this.getExamCode(
            ctx, time.getFullYear(),
            time.getMonth(), time.getDate()
        );

        const exam: Exam = {
            id: examId, studentId, roomId,
            point: null, code: examCode
        };
        point.examId = examId;
        exam.docType = 'EXAM';
        point.docType = 'POINT';
        await ledger.putState(
            ctx, this, point.id,
            point, point.docType
        );
        await ledger.putState(
            ctx, this, exam.id,
            exam, exam.docType
        );
        delete exam.studentId;
        return success({ ...exam, student });
    }

    @Transaction()
    public async SetPoint(
        ctx: Context, token: string,
        examCode: string, point: number
    ): Promise<string> {
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
        const exam: Exam = await this.getExamByCode(ctx, examCode);
        if (exam) {
            const room: Room = await ledger.getState(
                ctx, exam.roomId, "ROOM"
            );
            if (room && room.teacherId === this.currentPayload.id) {
                exam.docType = "EXAM";
                exam.point = point;
                await ledger.putState(
                    ctx, this, exam.id,
                    exam, exam.docType
                );
                delete exam.docType;
                return success(exam);
            } else {
                return failed({
                    code: "NOT_ALLOWED",
                    param: 'token',
                    msg: "You do not have permission"
                });
            }
        } else {
            return failed({
                code: "NOT_EXISTED",
                param: 'examCode',
                msg: `The exam ${examCode} does not exist`
            });
        }
    }

    private async getExamByCode(
        ctx: Context, code: string
    ): Promise<Exam> {
        let exams = await ledger.getStates(
            ctx, "EXAM", true,
            async (record: Exam) => {
                return record.code === code;
            }
        );
        if (!exams || exams.length === 0) {
            return null;
        } else return exams[0];
    }

    private async getExamCode(
        ctx: Context, year: number,
        month: number, date: number
    ): Promise<string> {
        const exams = await ledger.getStates(
            ctx, "EXAM", true,
            async (record: Exam) => {
                const room: Room = await ledger.getState(
                    ctx, record.roomId, "ROOM"
                );
                const time = new Date(room.timeStart * 1000);
                return time.getFullYear() === year &&
                    time.getMonth() === month &&
                    time.getDate() === date;
            }
        );
        const str = `${exams.length.toString().padStart(4, '0')}` +
            `${year}${month.toString().padStart(2, '0')}` +
            `${date.toString().padStart(2, '0')}`;
        return Number(str).toString(36).toUpperCase();
    }

    private async getClassByYear(
        ctx: Context, subjectId: string,
        year: number, semester: string
    ): Promise<Class[]> {
        let classes: Class[] = await ledger.getStates(
            ctx, "CLASS", true,
            async (record: Class) => {
                return record.year === year &&
                    record.semester === semester &&
                    record.subjectId === subjectId;
            }
        );
        return classes;
    }
}