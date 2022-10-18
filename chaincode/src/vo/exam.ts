import { Object, Property } from 'fabric-contract-api'

@Object()
export class Exam {
    @Property()
    public docType?: string;
    @Property()
    public id: string;
    @Property()
    public code: string;
    // TODO check here
    @Property()
    public studentId: string;
    @Property()
    public roomId: string;
    @Property()
    public point: number;
}