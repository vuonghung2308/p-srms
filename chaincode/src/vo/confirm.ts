import { Object, Property } from 'fabric-contract-api'

@Object()
export class Confirm {
    @Property()
    public docType?: string;
    @Property()
    public id: string;
    @Property()
    public objectId: string;
    @Property()
    public teacherId: string;
    @Property()
    public censorId1: string;
    @Property()
    public censorId2: string;
    @Property()
    public type: string;
    @Property()
    public status: string;
    @Property()
    public note: string;
}