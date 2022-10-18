import { Context, Info, Transaction } from "fabric-contract-api";
import { BaseContract } from "./contract";
import * as jwt from "../auth/jwt";
import * as ledger from "../ledger/common";
import { failed, success } from "../ledger/response";
import { Student } from "../vo/student";


@Info({ title: 'StudentContract', description: 'Smart contract for Student' })
export class StudentContract extends BaseContract {
    public constructor() { super('Student'); }

    @Transaction(false)
    public async GetStudents(ctx: Context, token: string): Promise<string> {
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
        const subjects = await ledger.getStates(ctx, "STUDENT");
        return success(subjects);
    }

    @Transaction(false)
    public async SearchStudent(
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
        const subjects = await ledger.getStates(ctx, "STUDENT");
        if (key.length === 0) {
            return success(subjects);
        } else {
            const newSubjects = subjects.filter((value: Student) => {
                const str = `${value.id} ${value.name}`.toLowerCase();
                return str.indexOf(key.toLowerCase()) !== -1;
            })
            return success(newSubjects);
        }
    }
    // @Transaction(false)
    // public async GetInfo(ctx: Context, token: string, id: string): Promise<string> {
    //     const payload = jwt.verify(token);
    //     if (payload.type === "EMPLOYEE" || (payload.type === "STUDENT" && payload.id === id)) {
    //         const student = await ledger.getState(ctx, id, "STUDENT");
    //         if (student) {
    //             return JSON.stringify(student);
    //         } else { throw new Error(`The student ${id} does not exist`); }
    //     } else throw new Error("You do not have permission");
    // }
}