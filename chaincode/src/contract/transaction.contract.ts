import { Context, Info, Transaction } from "fabric-contract-api";
import * as jwt from "../auth/jwt";
import { BaseContract } from "./contract";
import * as ledger from "../ledger/common";
import { failed, success } from "../ledger/response";


@Info({ title: 'TransactionContract', description: 'Smart contract for Transaction' })
export class TransactionContract extends BaseContract {
    public constructor() { super('Transaction'); }

    @Transaction(false)
    public async GetTransactions(ctx: Context, token: string): Promise<string> {
        const status = this.setCurrentPayload(
            jwt.verifyAdmin(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }
        const transactions = await ledger.getStates(ctx, "TRANSACTION");
        return success(transactions);
    }

    @Transaction(false)
    public async GetHistory(
        ctx: Context, token: string, key: string
    ): Promise<string> {
        const status = this.setCurrentPayload(
            jwt.verifyAdmin(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }
        const history = await ledger.getHistory(ctx, key);
        if (history.length === 0) {
            return failed({
                code: "NOT_EXISTED",
                param: 'key',
                msg: `The key ${key} does not exist`
            });
        }
        return success(history);
    }

    @Transaction(false)
    public async GetDetail(
        ctx: Context, token: string, txId: string
    ): Promise<string> {
        const status = this.setCurrentPayload(
            jwt.verifyAdmin(token)
        );
        if (status.code !== "OKE") {
            return failed({
                code: status.code,
                param: 'token',
                msg: status.msg
            });
        }
        const transaction = await ledger.getState(
            ctx, txId, "TRANSACTION"
        );
        if (!transaction) {
            return failed({
                code: "NOT_EXISTED",
                param: 'txId',
                msg: `The transaction ${txId} does not exist`
            });
        }
        const values = [];
        for (const key of transaction.keys) {
            const histories = await ledger.getHistory(ctx, key);
            const history = histories.find((value: any) =>
                value.txId === transaction.txId
            );
            values.push({
                key: key,
                isDelete: history.isDelete,
                value: history.value
            });
        }
        delete transaction.keys;
        transaction.values = values;
        return success(transaction);
    }
}