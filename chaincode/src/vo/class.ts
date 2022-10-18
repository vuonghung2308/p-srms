import { Object, Property } from 'fabric-contract-api'

@Object()
export class Class {
    @Property()
    public docType?: string;
    @Property()
    public id: string;
    @Property()
    public subjectId: string;
    @Property()
    public year: number;
    @Property()
    public semester: string;
    @Property()
    public teacherId: string;
}