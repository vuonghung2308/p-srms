import { Context, Info, Transaction } from "fabric-contract-api";
import { BaseContract } from "./contract";
import * as jwt from "../auth/jwt";
import * as ledger from "../ledger/common";
import { Room } from "../vo/room";
import { failed, success } from "../ledger/response";
import { Teacher } from "../vo/teacher";
import { Subject } from "../vo/subject";
import { Confirm } from "../vo/confirm";


@Info({ title: 'RoomContract', description: 'Smart contract for Room' })
export class RoomContract extends BaseContract {
    public constructor() { super('Room'); }

    @Transaction(false)
    public async GetRooms(ctx: Context, token: string): Promise<string> {
        const status = this.setCurrentPayload(
            jwt.verify(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }
        let rooms: Room[] = []
        switch (this.currentPayload.type) {
            case "TEACHER": {
                rooms = await ledger.getStates(
                    ctx, "ROOM", async (record: Room) => {
                        const [teacher, subject]: [Teacher, Subject] = await Promise.all([
                            ledger.getState(ctx, record.teacherId, "TEACHER"),
                            ledger.getState(ctx, record.subjectId, "SUBJECT")
                        ]);
                        delete record.teacherId; record['teacher'] = teacher;
                        delete record.subjectId; record['subject'] = subject;
                        return teacher.id === this.currentPayload.id;
                    }
                );
                break;
            }
            case "EMPLOYEE": {
                rooms = await ledger.getStates(
                    ctx, "ROOM", async (record: Room) => {
                        const [teacher, subject]: [Teacher, Subject] = await Promise.all([
                            ledger.getState(ctx, record.teacherId, "TEACHER"),
                            ledger.getState(ctx, record.subjectId, "SUBJECT")
                        ]);
                        delete record.teacherId; record['teacher'] = teacher;
                        delete record.subjectId; record['subject'] = subject;
                        return true;
                    });
                break;
            }
            case "STUDENT": case "ADMIN": default: {
                return failed({
                    code: "NOT_ALLOWED",
                    param: 'token',
                    msg: "You do not have permission"
                });
            }
        }
        return success(rooms);
    }

    @Transaction(false)
    public async GetRoom(
        ctx: Context, token: string, roomId: string
    ): Promise<string> {
        const status = this.setCurrentPayload(
            jwt.verify(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }
        const [room, confirm]: [Room, Confirm] = await Promise.all([
            ledger.getState(ctx, roomId, "ROOM"),
            ledger.getFirstState(ctx, "CONFIRM",
                async (record: Confirm) => {
                    return record.objectId === roomId
                }
            )
        ]);
        if (room) {
            let confirmId: string = null;
            if (confirm) confirmId = confirm.id;
            const [teacher, subject, confirms]: [Teacher, Subject, Confirm[]]
                = await Promise.all([
                    ledger.getState(ctx, room.teacherId, "TEACHER"),
                    ledger.getState(ctx, room.subjectId, "SUBJECT"),
                    this.getConfirms(ctx, confirmId)
                ]);
            delete room.teacherId; room['teacher'] = teacher;
            delete room.subjectId; room['subject'] = subject;
            if (confirms.length !== 0) room['confirms'] = confirms;
            switch (this.currentPayload.type) {
                case "TEACHER": {
                    if (teacher.id === this.currentPayload.id) {
                        return success(room);
                    } else {
                        return failed({
                            code: "INCORRECT",
                            param: 'roomId',
                            msg: `The room ${roomId} not found.`
                        });
                    }
                }
                case "EMPLOYEE": {
                    return success(room);
                }
                case "STUDENT": case "ADMIN": default: {
                    return failed({
                        code: "NOT_ALLOWED",
                        param: 'token',
                        msg: "You do not have permission"
                    });
                }
            }
        } else {
            return failed({
                code: "INCORRECT",
                param: 'roomId',
                msg: `The room ${roomId} not found.`
            });
        }
    }

    @Transaction()
    public async CreateRoom(
        ctx: Context, token: string, roomName: string,
        subjectId: string, teacherId: string, year: number,
        semester: string, timeStart: number, duration: number
    ): Promise<string> {
        const status = this.setCurrentPayload(
            jwt.verifyEmployee(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }
        const roomId = this.getRoomId(roomName, timeStart);
        const [subject, teacher, currentRoom]: [Subject, Teacher, Room]
            = await Promise.all([
                ledger.getState(ctx, subjectId, "SUBJECT"),
                ledger.getState(ctx, teacherId, "TEACHER"),
                ledger.getState(ctx, roomId, "ROOM")
            ]);
        if (!subject) {
            return failed({
                code: "NOT_EXISTED",
                param: 'subjectId',
                msg: `The subject ${subjectId} does not exist`
            });
        }
        if (!teacher) {
            return failed({
                code: "NOT_EXISTED",
                param: 'teacherId',
                msg: `The teacher ${teacherId} does not exist`
            });
        }
        if (currentRoom) {
            return failed({
                code: "EXISTED",
                param: 'roomId',
                msg: `The room ${roomId} already exists`
            });
        }

        const room: Room = {
            id: roomId, subjectId,
            year, semester, teacherId,
            timeStart, duration, roomName
        };
        room.docType = 'ROOM';
        await ledger.putState(
            ctx, this, room.id,
            room, room.docType
        );
        delete room.docType;
        delete room.subjectId; room['subject'] = subject;
        delete room.teacherId; room['teacher'] = teacher;
        return success(room);
    }

    private getRoomId(roomName: string, timeStart: number): string {
        const date = new Date(timeStart * 1000);
        const result = `${roomName}.${date.getFullYear()}.${date.getMonth()}` +
            `.${date.getDate()}.${date.getHours()}.${date.getMinutes()}`;
        return result;
    }

    private async getConfirms(
        ctx: Context, confirmId: string
    ): Promise<Confirm[]> {
        const confirms = [];
        const censors = {};
        if (!confirmId) return confirms;
        const history: [] = await ledger.getHistory(
            ctx, `CONFIRM.${confirmId}`
        );
        for (const item of history) {
            const value: Confirm = item['value'];
            if (!censors[value.censorId2]) {
                const censor = await ledger.getState(
                    ctx, value.censorId2, "EMPLOYEE"
                );
                censors[value.censorId2] = censor;
            }
            const censor2 = censors[value.censorId2];
            delete value.censorId1; delete value.censorId2;
            delete value.docType;
            const time = item['timestamp']['seconds'] / 1
                + item['timestamp']['nanos'] / 1000000000;
            confirms.push({
                ...value, censor2,
                time: Number(time)
            });
        }
        confirms.sort((a, b) => b.time - a.time)
        return confirms;
    }
}