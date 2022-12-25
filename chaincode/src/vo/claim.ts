import { Object, Property } from 'fabric-contract-api'

@Object()
export class Claim {
    @Property()
    public docType?: string;
    @Property()
    public id: string;
    @Property()
    public objectId: string;
    @Property()
    public studentId: string;
    @Property()
    public type: string;
    @Property()
    public status: string;
    @Property()
    public teacherId: string;
    @Property()
    public actions: ClaimAction[];
}

@Object()
export class ClaimAction {
    @Property()
    public time: number;
    @Property()
    public actorId: string;
    @Property()
    public actorType: string;
    @Property()
    public action: string;
    @Property()
    public note: string;
}