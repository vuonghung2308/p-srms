import { Context } from "fabric-contract-api";
import { BaseContract } from "../contract/contract";
import * as utils from "../utils/utils";

export const getStates = async (
    ctx: Context, docType: string, removeDocType: boolean = true,
    filler: (record: any) => Promise<boolean> = null
): Promise<any> => {
    const results = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    while (!result.done) {
        const strValue = Buffer.from(
            result.value.value
        ).toString('utf-8');
        let record;
        try {
            record = JSON.parse(strValue);
            if (record.docType !== docType) {
                result = await iterator.next();
                continue;
            }
            if (removeDocType) {
                delete record.docType;
            }
        } catch (err) {
            console.log(err);
        }
        if (filler) {
            if (await filler(record)) {
                results.push(record);
            }
        } else {
            results.push(record);
        }
        result = await iterator.next();
    }
    return results;
}

export const getHistory = async (
    ctx: Context, id: string, docType: string
): Promise<any> => {
    const histories = [];
    const iterator = await ctx.stub.getHistoryForKey(`${docType}.${id}`);
    let result = await iterator.next();
    while (!result.done) {
        const buffer = result.value.value;
        const tx = await getState(ctx, result.value.txId, "TRANSACTION");

        const history = {
            txId: result.value.txId,
            creator: tx.creator,
            isDelete: result.value.isDelete,
            timestamp: result.value.timestamp,
            value: utils.fromBuffer(buffer)
        };
        histories.push(history);
        result = await iterator.next();
    }
    return histories;
};

export const getHistoryByKey = async (
    ctx: Context, key: string
): Promise<any> => {
    const histories = [];
    const iterator = await ctx.stub.getHistoryForKey(key);
    let result = await iterator.next();
    while (!result.done) {
        const buffer = result.value.value;
        const tx = await getState(ctx, result.value.txId, "TRANSACTION");

        const history = {
            txId: result.value.txId,
            creator: tx.creator,
            isDelete: result.value.isDelete,
            timestamp: result.value.timestamp,
            value: utils.fromBuffer(buffer)
        };
        histories.push(history);
        result = await iterator.next();
    }
    return histories;
};

export const getState = async (
    ctx: Context, id: string, docType: string,
    removeDocType: boolean = true
): Promise<any> => {
    const buffer = await ctx.stub.getState(`${docType}.${id}`);
    if (!buffer || buffer.length === 0) {
        return null;
    } else {
        const record = utils.fromBuffer(buffer);
        if (removeDocType) {
            delete record.docType;
        }
        return record;
    }
};

export const putState = async (
    ctx: Context, contract: BaseContract,
    id: string, value: any, docType: string
): Promise<any> => {
    await ctx.stub.putState(
        `${docType}.${id}`,
        utils.toBuffer(value)
    );
    contract.pushCurrentKey(
        `${docType}.${id}`
    );
};

export const isStateExists = async (
    ctx: Context, id: string, docType: string
): Promise<boolean> => {
    const buffer = await ctx.stub.getState(`${docType}.${id}`);
    return buffer && buffer.length > 0
};