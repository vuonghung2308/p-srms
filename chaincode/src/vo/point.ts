import { Object, Property } from 'fabric-contract-api'

@Object()
export class Point {
    @Property()
    public docType?: string;
    @Property()
    public id: string;
    @Property()
    public studentId: string;
    @Property()
    public classId: string;

    @Property()
    public attendancePoint: number;
    @Property()
    public practicePoint: number;
    @Property()
    public midtermExamPoint: number;
    @Property()
    public exercisePoint: number;
    @Property()
    public examId: string;
}