import { Context, Info, Transaction } from "fabric-contract-api";
import { BaseContract } from "./contract";
import * as jwt from "../auth/jwt";
import * as ledger from "../ledger/common";
import { failed, success } from "../ledger/response";
import { Teacher } from "../vo/teacher";


@Info({ title: 'TeacherContract', description: 'Smart contract for teacher' })
export class TeacherContract extends BaseContract {
    public constructor() { super('Teacher'); }

    @Transaction(false)
    public async GetTeachers(ctx: Context, token: string): Promise<string> {
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
        const subjects = await ledger.getStates(ctx, "TEACHER");
        return success(subjects);
    }

    @Transaction(false)
    public async SearchTeacher(
        ctx: Context, token: string, key: string
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
        const subjects = await ledger.getStates(ctx, "TEACHER");
        if (key.length === 0) {
            return success(subjects);
        } else {
            const newSubjects = subjects.filter((value: Teacher) => {
                const str = `${value.id} ${value.name}`.toLowerCase();
                return str.indexOf(key.toLowerCase()) !== -1;
            })
            return success(newSubjects);
        }
    }

    // @Transaction(false)
    // public async GetInfo(ctx: Context, token: string, id: string): Promise<string> {
    //     const payload = jwt.verify(token);
    //     if (payload.type === "EMPLOYEE" || (payload.type === "TEACHER" && payload.id === id)) {
    //         const teacher = await ledger.getState(ctx, id, "TEACHER");
    //         if (teacher) {
    //             return JSON.stringify(teacher);
    //         } else { throw new Error(`The teacher ${id} does not exist`); }
    //     } else throw new Error("You do not have permission");
    // }
}