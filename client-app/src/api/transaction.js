import { baseUrl } from "../common/constant";
import send from "./fetch";

export const getTxDetail = (txId) => {
    return send(`${baseUrl}/transaction/detail/${txId}`, {
        method: 'GET',
    });
}

export const getHistory = (key) => {
    return send(`${baseUrl}/transaction/get-history/${key}`, {
        method: 'GET',
    });
}