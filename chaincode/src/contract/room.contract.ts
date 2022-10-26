import { Context, Info, Transaction } from "fabric-contract-api";
import { BaseContract } from "./contract";
import * as jwt from "../auth/jwt";
import * as ledger from "../ledger/common";
import { Room } from "../vo/room";
import { failed, success } from "../ledger/response";
import { Teacher } from "../vo/teacher";
import { Subject } from "../vo/subject";


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
                    ctx, "ROOM", true, async (record: Room) => {
                        const values = await Promise.all([
                            ledger.getState(ctx, record.teacherId, "TEACHER"),
                            ledger.getState(ctx, record.subjectId, "SUBJECT")
                        ]);
                        delete record.teacherId; record['teacher'] = values[0];
                        delete record.subjectId; record['subject'] = values[1];
                        return record.teacherId === this.currentPayload.id;
                    }
                );
                break;
            }
            case "EMPLOYEE": {
                rooms = await ledger.getStates(
                    ctx, "ROOM", true, async (record: Room) => {
                        const values = await Promise.all([
                            ledger.getState(ctx, record.teacherId, "TEACHER"),
                            ledger.getState(ctx, record.subjectId, "SUBJECT")
                        ]);
                        delete record.teacherId; record['teacher'] = values[0];
                        delete record.subjectId; record['subject'] = values[1];
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
        const room: Room = await ledger.getState(
            ctx, roomId, "ROOM"
        );
        if (room) {
            const values = await Promise.all([
                ledger.getState(ctx, room.teacherId, "TEACHER"),
                ledger.getState(ctx, room.subjectId, "SUBJECT")
            ])
            delete room.teacherId; room['teacher'] = values[0];
            delete room.subjectId; room['subject'] = values[1];
            switch (this.currentPayload.type) {
                case "TEACHER": {
                    if (room.teacherId === this.currentPayload.id) {
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
        if (!await ledger.isStateExists(ctx, subjectId, "SUBJECT")) {
            return failed({
                code: "NOT_EXISTED",
                param: 'subjectId',
                msg: `The subject ${subjectId} does not exist`
            });
        }
        if (!await ledger.isStateExists(ctx, teacherId, "TEACHER")) {
            return failed({
                code: "NOT_EXISTED",
                param: 'teacherId',
                msg: `The teacher ${teacherId} does not exist`
            });
        }
        if (await ledger.isStateExists(ctx, roomId, "ROOM")) {
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
        return success(room);
    }

    private getRoomId(roomName: string, timeStart: number): string {
        const date = new Date(timeStart * 1000);
        const result = `${roomName}.${date.getFullYear()}.${date.getMonth()}` +
            `.${date.getDate()}.${date.getHours()}.${date.getMinutes()}`;
        return result;
    }
}