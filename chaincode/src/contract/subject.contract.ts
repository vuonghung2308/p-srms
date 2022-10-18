import { Context, Info, Transaction } from "fabric-contract-api";
import { BaseContract } from "./contract";
import * as jwt from "../auth/jwt";
import * as ledger from "../ledger/common";
import { failed, success } from "../ledger/response";
import { Subject } from "../vo/subject";


@Info({ title: 'SubjectContract', description: 'Smart contract for Subject' })
export class SubjectContract extends BaseContract {
    public constructor() { super('Subject'); }

    @Transaction(false)
    public async GetSubjects(ctx: Context, token: string): Promise<string> {
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
        const subjects = await ledger.getStates(ctx, "SUBJECT");
        return success(subjects);
    }

    @Transaction(false)
    public async SearchSubject(
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
        const subjects = await ledger.getStates(ctx, "SUBJECT");
        if (key.length === 0) {
            return success(subjects);
        } else {
            const newSubjects = subjects.filter((value: Subject) => {
                const str = `${value.id} ${value.name}`.toLowerCase();
                return str.indexOf(key.toLowerCase()) !== -1;
            })
            return success(newSubjects);
        }
    }

    // @Transaction(false)
    // public async GetSubject(ctx: Context, token: string, id: string): Promise<string> {
    //     this.currentPayload = jwt.verifyEmployee(token);
    //     const subject: Subject = await ledger.getState(ctx, id, "SUBJECT");
    //     if (subject) {
    //         return JSON.stringify(subject);
    //     } else {
    //         throw new Error(`The subject ${id} does not exist`);
    //     }
    // }
}