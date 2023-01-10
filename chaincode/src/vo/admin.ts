import { Object, Property } from 'fabric-contract-api'

@Object()
export class Admin {
    @Property()
    public docType?: string;
    @Property()
    public id: string;
    @Property()
    public name: string;
    @Property()
    public address: string;
    @Property()
    public dateOfBirth: number;
    @Property()
    public email: string;
    @Property()
    public phone: string;
}