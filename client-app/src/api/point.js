import { baseUrl } from "../common/constant";
import fetchJson, { fetchBlob } from "./fetch";

export const getPoints = async () => {
    return fetchJson(
        `${baseUrl}/point/get-point`,
        { method: 'GET' }
    );
}

export const getFileExcel = () => {
    return fetchBlob(
        `${baseUrl}/point/export`,
        { method: "GET" }
    )
}