import { baseUrl } from "../common/constant"
import fetchJson, { fetchBlob } from "./fetch"

export const exportData = () => {
    return fetchBlob(
        `${baseUrl}/ledger/export`,
        { method: "GET" }
    );
}

export const importData = (file) => {
    const data = new FormData();
    data.append('file', file);
    return fetchJson(
        `${baseUrl}/ledger/import`, {
        method: "POST", body: data,
    }, false);
}