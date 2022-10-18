import { Object, Property } from 'fabric-contract-api'

@Object()
export class Room {
    @Property()
    public docType?: string;
    @Property()
    public id: string;
    @Property()
    public subjectId: string;
    @Property()
    public teacherId: string;
    @Property()
    public roomName: string;

    @Property()
    public year: number;
    @Property()
    public semester: string;
    @Property()
    public timeStart: number;
    @Property()
    public duration: number;
}