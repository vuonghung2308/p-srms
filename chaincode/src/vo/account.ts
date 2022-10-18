import { Object, Property } from 'fabric-contract-api'

@Object()
export class Account {
    @Property()
    public docType?: string;
    @Property()
    public id: string;
    @Property()
    public password: string;
    @Property()
    public type: string;
}