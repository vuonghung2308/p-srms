import { Context, Info, Transaction } from "fabric-contract-api";
import { BaseContract } from "./contract";
import * as jwt from "../auth/jwt";
import * as ledger from "../ledger/common";
import { Point } from "../vo/point";
import { Exam } from "../vo/exam";
import { Subject } from "../vo/subject";
import { Class } from "../vo/class";
import { failed, success } from "../ledger/response";
import { calculateAveragePoint, getNumberAveragePoint } from "../utils/point";
import { Confirm } from "../vo/confirm";
import { Room } from "../vo/room";
import { Teacher } from "../vo/teacher";
import { Claim } from "../vo/claim";

@Info({ title: 'PointContract', description: 'Smart contract for Point' })
export class PointContract extends BaseContract {
    public constructor() { super('Point'); }

    @Transaction()
    public async SetPoint(
        ctx: Context, token: string,
        studentId: string, classId: string,
        attendancePoint: string, practicePoint: string,
        midtermExamPoint: string, exercisePoint: string
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
        const student = await ledger.getState(
            ctx, studentId, "STUDENT"
        );
        if (!await ledger.isStateExists(ctx, classId, "CLASS")) {
            return failed({
                code: "NOT_EXISTED",
                param: 'classId',
                msg: `The class ${classId} does not exist`
            });
        }
        if (!student) {
            return failed({
                code: "NOT_EXISTED",
                param: 'studentId',
                msg: `The student ${studentId} does not exist`
            });
        }
        const pointId = `${studentId}.${classId}`;
        const point: Point = await ledger.getState(ctx, pointId, 'POINT')
        if (!point) {
            return failed({
                code: "INVALID",
                param: 'studentId|classId',
                msg: `The student ${studentId} is not in class ${classId}`
            });
        }
        if (attendancePoint !== "undefined") {
            point.attendancePoint = Number(attendancePoint);
        } else point.attendancePoint = null;
        if (practicePoint !== "undefined") {
            point.practicePoint = Number(practicePoint);
        } else point.practicePoint = null;
        if (midtermExamPoint !== "undefined") {
            point.midtermExamPoint = Number(midtermExamPoint);
        } else point.midtermExamPoint = null;
        if (exercisePoint !== "undefined") {
            point.exercisePoint = Number(exercisePoint);
        } else point.exercisePoint = null;
        point.docType = 'POINT'
        await ledger.putState(
            ctx, this, point.id,
            point, point.docType
        );
        delete point.docType;
        delete point.studentId;
        const exam = await ledger.getState(
            ctx, point.examId, "EXAM"
        );
        if (exam) {
            delete point.examId;
            (point as any).examPoint = exam.point;
        }
        return success({ ...point, student });
    }

    @Transaction(false)
    public async GetPoints(
        ctx: Context, token: string
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
        const result = await this.getStudentPoints(ctx);
        return success(result);
    }

    @Transaction(false)
    public async GetPoint(
        ctx: Context, token: string, pointId: string
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
        const point: Point = await ledger.getState(
            ctx, pointId, "POINT"
        );
        if (!point) {
            return failed({
                code: "NOT_EXISTED",
                param: 'pointId',
                msg: `The point ${pointId} does not exist`
            });
        }
        if (point.studentId !== this.currentPayload.id) {
            return failed({
                code: "INVALID",
                param: 'pointId',
                msg: `The pointId ${pointId} is not valid`
            });
        }
        const [cls, exam, claim]: [Class, Exam, Claim] = await Promise.all([
            ledger.getState(ctx, point.classId, "CLASS"),
            ledger.getState(ctx, point.examId, "EXAM"),
            this.getClaim(ctx, point.id)
        ])
        const [subject, teacher, pConfirm]:
            [Subject, Teacher, Confirm] = await Promise.all([
                ledger.getState(ctx, cls.subjectId, "SUBJECT"),
                ledger.getState(ctx, cls.teacherId, "TEACHER"),
                ledger.getFirstState(ctx, "CONFIRM", async (record: Confirm) => {
                    return record.objectId === cls.id;
                })
            ])
        if (point.examId) {
            const room: Room = await ledger.getState(ctx, exam.roomId, "ROOM");
            const teacher: Teacher = await ledger.getState(ctx, room.teacherId, "TEACHER");
            const claim: Claim = await this.getClaim(ctx, point.examId);
            delete exam.roomId; exam['room'] = room; exam['claim'] = claim;
            delete room.teacherId; room['teacher'] = teacher;
            delete room.subjectId; delete exam['studentId'];
            const confirm: Confirm = await ledger.getFirstState(
                ctx, "CONFIRM", async (record: Confirm) => {
                    return record.objectId === room.id;
                }
            );
            if (confirm) {
                delete confirm.requestor;
                delete confirm.censorId1;
                delete confirm.objectId;
                if (confirm.censorId2) {
                    const censor2 = await ledger.getState(
                        ctx, confirm.censorId2, "EMPLOYEE"
                    );
                    delete confirm.censorId2;
                    confirm['censor2'] = censor2;
                }
                exam['confirm'] = confirm;
            }
        }
        if (pConfirm) {
            if (pConfirm.censorId1) {
                const censor1 = await ledger.getState(
                    ctx, pConfirm.censorId1, "TEACHER");
                delete pConfirm.censorId1;
                pConfirm['censor1'] = censor1;
            }
            if (pConfirm.censorId2) {
                const censor2 = await ledger.getState(
                    ctx, pConfirm.censorId2, "EMPLOYEE");
                delete pConfirm.censorId2;
                pConfirm['censor2'] = censor2;
            }
            delete pConfirm.objectId;
            delete pConfirm.requestor;
            point['confirm'] = pConfirm;
        }
        delete point.classId; delete point.studentId;
        delete cls.teacherId; cls['teacher'] = teacher;
        delete cls.subjectId; cls['subject'] = subject;
        delete point.examId; point['claim'] = claim;

        if (exam && exam['confirm'] &&
            exam['confirm'].status === "DONE"
        ) {
            return success({
                class: cls,
                point: point,
                exam: exam
            });
        } else {
            return success({
                class: cls,
                point: point
            });
        }
    }

    @Transaction(false)
    public async ExportData(
        ctx: Context, token: string
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
        const student = await ledger.getState(
            ctx, this.currentPayload.id, "STUDENT"
        );
        const result = await this.getStudentPoints(ctx);
        return success({
            ...result,
            student: student
        });
    }

    private async getStudentPoints(ctx: Context): Promise<any> {
        const classes: Class[] = [];
        const points = await ledger.getStates(ctx, "POINT", async (record: Point) => {
            if (record.studentId === this.currentPayload.id) {
                const [exam, cls]: [Exam, Class] = await Promise.all([
                    ledger.getState(ctx, record.examId, "EXAM"),
                    ledger.getState(ctx, record.classId, "CLASS")
                ])
                const [subject, confirm]: [Subject, Confirm] = await Promise.all([
                    ledger.getState(ctx, cls.subjectId, "SUBJECT"),
                    ledger.getFirstState(
                        ctx, "CONFIRM", async (record: Confirm) => {
                            return record.objectId === exam.roomId
                        }
                    )
                ]);
                classes.push(cls); delete record.examId;
                delete record.classId; delete cls.subjectId;
                cls['subject'] = subject; record['cls'] = cls;
                if (exam && confirm && confirm.status === "DONE") {
                    record['examPoint'] = exam.point;
                }
                if (record['examPoint'] != null) {
                    calculateAveragePoint(record);
                }
                return true;
            }
            return false;
        });

        const result = [];
        classes.forEach(cls => {
            if (!result.some(value =>
                value.year === cls.year &&
                value.semester === cls.semester
            )) {
                result.push({
                    year: cls.year,
                    semester: cls.semester,
                    points: []
                })
            }
        });
        result.sort((a, b) => {
            if (a.year === b.year) {
                if (a.semester < b.semester) {
                    return -1
                } else return 1;
            } return a.year - b.year;
        });
        points.forEach((point: Point) => {
            const c: Class = point['cls'];
            const r = result.find(value =>
                value.year === c.year &&
                value.semester === c.semester
            );
            delete point['cls'];
            r.points.push({ ...point, subject: c['subject'] })
        });
        let totalPassed = 0;
        let totalCreadit = 0;
        let totalPoint = 0;
        result.forEach(value => {
            let sumPassed = 0;
            let sumCreadit = 0;
            let sumPoint = 0;
            value.points.forEach((point: any) => {
                const subject: Subject = point.subject;
                if (point.letterAveragePoint) {
                    const number = getNumberAveragePoint(point.letterAveragePoint);
                    sumCreadit += subject.numberOfCredit;
                    sumPoint += subject.numberOfCredit * number;
                    sumPassed += point.letterAveragePoint === "F" ? 0 :
                        subject.numberOfCredit;
                }
            });
            totalCreadit += sumCreadit;
            totalPoint += sumPoint;
            totalPassed += sumPassed;
            value.averagePoint = Number((sumPoint / sumCreadit).toFixed(2));
            value.numberOfAccumulatedCredit = sumPassed;
        })
        const average = Number((totalPoint / totalCreadit).toFixed(2));
        return {
            semesters: result,
            averagePoint: average ? average : 0,
            numberOfAccumulatedCredit: totalPassed
        };
    }

    private async getClaim(
        ctx: Context, objectId: string
    ): Promise<Claim> {

        const claim: Claim = await ledger.getFirstState(
            ctx, "CLAIM", async (record: Claim) => {
                return record.objectId === objectId
            }
        )

        if (claim) {
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
        return undefined;
    }
}