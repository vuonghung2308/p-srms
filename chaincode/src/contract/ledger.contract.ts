import { Context, Info, Transaction } from "fabric-contract-api";
import * as jwt from "../auth/jwt";
import { BaseContract } from "./contract";
import { failed, success } from "../ledger/response";
import { initLedger } from "../data/data";
import * as utils from "../utils/utils";


@Info({ title: 'LedgerContract', description: 'Smart contract for Ledger' })
export class LegerContract extends BaseContract {
    public constructor() { super('Ledger'); }

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        await initLedger(ctx, this);
    }

    @Transaction()
    public async ImportData(
        ctx: Context, token: string, data: string
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
        try {
            const states = JSON.parse(data);
            if (!Array.isArray(states)) {
                throw new Error();
            }
            if (states.some(state => !state.key && !state.value)) {
                throw new Error();
            }
            for (const state of states) {
                this.pushCurrentKey(state.key);
                await ctx.stub.putState(
                    state.key,
                    utils.toBuffer(state.value)
                );
            }
            return success();
        } catch (err) {
            return failed({
                code: "INVALID",
                param: 'data',
                msg: 'The data import does not valid'
            });
        }
    }

    @Transaction(false)
    public async ExportData(
        ctx: Context, token: string
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
        const results = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(
                result.value.value
            ).toString('utf-8');
            let value;
            try {
                value = JSON.parse(strValue);
                if (value.docType === "TRANSACTION") {
                    result = await iterator.next();
                    continue;
                }
            } catch (err) {
                console.log(err);
            }
            results.push({
                key: result.value.key,
                value: value ? value : strValue,
                namespace: result.value.namespace
            });
            result = await iterator.next();
        }
        return success(results);
    }
}