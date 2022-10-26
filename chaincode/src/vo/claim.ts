import { Object, Property } from 'fabric-contract-api'

@Object()
export class Claim {
    @Property()
    public docType?: string;
    @Property()
    public id: string;
    @Property()
    public studentId: string;
    @Property()
    public censor: string;
    @Property()
    public time: number;
    @Property()
    public type: string;
    @Property()
    public status: string;
    @Property()
    public note: string;
}