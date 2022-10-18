import sortKeysRecursive from "sort-keys-recursive";

export const fromBuffer = (value: Uint8Array): any => {
    const strValue = Buffer.from(value).toString('utf-8');
    return JSON.parse(strValue);
}

export const toBuffer = (data: any): Uint8Array => {
    const json = JSON.stringify(sortKeysRecursive(data));
    return Buffer.from(json);
}