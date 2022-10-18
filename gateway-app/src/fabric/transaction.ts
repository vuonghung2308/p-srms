import { Contract } from "fabric-network";

export const evaluate = async (
    contract: Contract,
    name: string,
    ...params: string[]
): Promise<any> => {
    const transaction = contract.createTransaction(name);
    const result = await transaction.evaluate(...params);
    const data = JSON.parse(result.toString('utf-8'));
    return data;
}

export const submit = async (
    contract: Contract,
    name: string,
    ...params: string[]
): Promise<any> => {
    const transaction = contract.createTransaction(name);
    const result = await transaction.submit(...params);
    const data = JSON.parse(result.toString('utf-8'));
    return data;
}