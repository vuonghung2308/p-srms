import { Context, Info, Transaction } from "fabric-contract-api";
import { Account } from "../vo/account";
import { BaseContract } from "./contract";
import * as jwt from "../auth/jwt";
import * as hash from "../auth/hash"
import * as ledger from "../ledger/common";
import { initLedger } from "../data/data";
import { failed, success } from "../ledger/response";


@Info({ title: 'AccountContract', description: 'Smart contract for Account' })
export class AccountContract extends BaseContract {
    public constructor() { super('Account'); }

    @Transaction(false)
    public async CheckAccount(ctx: Context, id: string, password: string): Promise<string> {
        const account: Account = await ledger.getState(ctx, id, "ACCOUNT");
        const hashValue = await hash.sha256(password);
        if (!account || account.password !== hashValue) {
            return failed({
                code: "INCORRECT", param: "username|password",
                msg: "The username or password is not correct"
            });
        } else {
            const info = await ledger.getState(
                ctx, account.id, account.type
            );
            const token = jwt.newToken(account);
            const data = {
                id: account.id, name: info.name,
                type: account.type, token: token
            };
            return success(data);
        }
    }

    @Transaction(false)
    public async GetInfo(ctx: Context, token: string): Promise<string> {
        const status = this.setCurrentPayload(jwt.verify(token));
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }
        const info = await ledger.getState(
            ctx, this.currentPayload.id,
            this.currentPayload.type
        );
        return success(info);
    }
}