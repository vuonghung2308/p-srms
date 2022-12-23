import { Context, Contract } from "fabric-contract-api";
import * as ledger from "../ledger/common";
import { Transaction } from "../vo/transaction";

export class BaseContract extends Contract {

    protected currentPayload: any;
    private currentKeys: string[];

    public setCurrentPayload(data: any): any {
        if (data.type && data.id) {
            this.currentPayload = data;
            return { code: "OKE" };
        } else { return data; }
    }

    public pushCurrentKey(...keys: string[]) {
        this.currentKeys.push(...keys);
    }

    beforeTransaction(_ctx: Context): Promise<void> {
        this.currentKeys = [];
        return;
    }

    async afterTransaction(ctx: Context, result: any): Promise<void> {
        super.afterTransaction(ctx, result);
        const txId = ctx.stub.getTxID();
        const time = ctx.stub.getTxTimestamp();
        let creator: any
        if (this.currentPayload && this.currentPayload.id) {
            creator = this.currentPayload.id;
        } else { creator = ctx.stub.getCreator().mspid }
        const transaction: Transaction = {
            docType: 'TRANSACTION', txId: txId,
            creator: creator, keys: this.currentKeys,
            timestamp: { nanos: time.nanos, seconds: Number(time.seconds) }
        };
        await ledger.putState(
            ctx, this, transaction.txId,
            transaction, transaction.docType
        );
    }
}