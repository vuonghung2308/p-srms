import { Object, Property } from 'fabric-contract-api'

@Object()
export class Request {
    @Property()
    public docType?: string;
    @Property()
    public id: string;
    @Property()
    public censor: string;
    @Property()
    public status: string;
    @Property()
    public note: string;
    @Property()
    public time: number;
}