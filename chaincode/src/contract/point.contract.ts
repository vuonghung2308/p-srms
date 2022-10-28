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


@Info({ title: 'PointContract', description: 'Smart contract for Point' })
export class PointContract extends BaseContract {
    public constructor() { super('Point'); }

    @Transaction()
    public async SetPoint(
        ctx: Context, token: string,
        studentId: string, classId: string,
        attendancePoint: number, practicePoint: number,
        midtermExamPoint: number, exercisePoint: number
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

        point.attendancePoint = attendancePoint;
        point.practicePoint = practicePoint;
        point.midtermExamPoint = midtermExamPoint;
        point.exercisePoint = exercisePoint;
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

    // @Transaction(false)
    // public async GetHistory(
    //     ctx: Context, token: string,
    //     studentId: string, classId: string
    // ): Promise<string> {
    //     this.currentPayload = jwt.verifyEmployee(token);
    //     if (!await ledger.isStateExists(ctx, classId, "CLASS")) {
    //         throw new Error(`The class ${classId} does not exist`);
    //     }
    //     if (!await ledger.isStateExists(ctx, studentId, "STUDENT")) {
    //         throw new Error(`The student ${studentId} does not exist`);
    //     }
    //     const pointId = `${studentId}.${classId}`;
    //     const point: Point = await ledger.getState(ctx, pointId, 'POINT')
    //     if (!point) {
    //         throw new Error(`The student ${studentId} is not in class ${classId}`);
    //     }
    //     const histories = await ledger.getHistory(ctx, pointId, 'POINT');
    //     return JSON.stringify(histories);
    // }

    @Transaction(false)
    public async GetPoint(
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
        const result = await this.getStudentPoint(ctx);
        return success(result);
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
        const result = await this.getStudentPoint(ctx);
        return success({
            ...result,
            student: student
        });
    }

    private async getStudentPoint(ctx: Context): Promise<any> {
        const classes: Class[] = [];
        const points = await ledger.getStates(ctx, "POINT", async (record: Point) => {
            if (record.studentId === this.currentPayload.id) {
                const exam: Exam = await ledger.getState(ctx, record.examId, "EXAM");
                const cls: Class = await ledger.getState(ctx, record.classId, "CLASS");
                const subject: Subject = await ledger.getState(ctx, cls.subjectId, "SUBJECT");
                classes.push(cls);
                delete record.examId;
                delete record.classId;
                delete cls.subjectId;
                cls['subject'] = subject;
                record['cls'] = cls;
                if (exam) {
                    record['examPoint'] = exam.point;
                }
                if (record['examPoint'] != null && record.attendancePoint != null &&
                    record.exercisePoint != null && record.practicePoint != null &&
                    record.midtermExamPoint != null
                ) { calculateAveragePoint(record); }
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
}