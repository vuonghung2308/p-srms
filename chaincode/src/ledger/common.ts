import { Context } from "fabric-contract-api";
import { BaseContract } from "../contract/contract";
import * as utils from "../utils/utils";


export const getFirstState = async (
    ctx: Context, docType: string,
    filter: (record: any) => Promise<boolean>,
    removeDocType: boolean = true
): Promise<any> => {
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    while (!result.done) {
        const strValue = Buffer.from(
            result.value.value
        ).toString('utf-8');
        try {
            const record = JSON.parse(strValue);
            if (record.docType !== docType) {
                result = await iterator.next();
                continue;
            }
            if (removeDocType) {
                delete record.docType;
            }
            if (await filter(record)) {
                return record;
            }
        } catch (err) {
            console.log(err);
        }
        result = await iterator.next();
    }
    return null;
}

export const getStates = async (
    ctx: Context, docType: string,
    filer: (record: any) => Promise<boolean> = null,
    removeDocType: boolean = true
): Promise<any> => {
    const results = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    while (!result.done) {
        const strValue = Buffer.from(
            result.value.value
        ).toString('utf-8');
        let record: any;
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
        if (filer) {
            if (await filer(record)) {
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
    console.log(`${docType}.${id}`);
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