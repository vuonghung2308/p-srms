import { Object, Property } from 'fabric-contract-api'

@Object()
export class Exam {
    @Property()
    public docType?: string;
    @Property()
    public id: string;
    @Property()
    public code: string;
    @Property()
    public roomId: string;
    @Property()
    public point: number;
    @Property()
    public censor: string;
    @Property()
    public status: string;
    @Property()
    public note: string;
}