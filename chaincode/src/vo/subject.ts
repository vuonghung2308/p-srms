import { Object, Property } from 'fabric-contract-api'

@Object()
export class Subject {
    @Property()
    public docType?: string;
    @Property()
    public id: string;
    @Property()
    public name: string;
    @Property()
    public attendancePointRate: number;
    @Property()
    public practicePointRate: number;
    @Property()
    public midtermExamPointRate: number;
    @Property()
    public exercisePointRate: number;
    @Property()
    public finalExamPointRate: number;
    @Property()
    public numberOfCredit: number;
}