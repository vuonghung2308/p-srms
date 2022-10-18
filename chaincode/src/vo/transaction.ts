import { Object, Property } from 'fabric-contract-api'

@Object()
export class Transaction {
    @Property()
    public docType?: string;
    @Property()
    public txId: string;
    @Property()
    public creator: string;
    @Property()
    public keys: string[];
    @Property()
    public timestamp?: Timestamp;
}


@Object()
class Timestamp {
    @Property()
    public seconds: number;
    @Property()
    public nanos: number;
}