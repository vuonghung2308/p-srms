import { baseUrl } from "../common/constant";
import fetchJson, { fetchBlob } from "./fetch";

export const getPoints = async () => {
    return fetchJson(
        `${baseUrl}/point/get-points`,
        { method: 'GET' }
    );
}

export const getPoint = async (pointId) => {
    return fetchJson(
        `${baseUrl}/point/${pointId}`,
        { method: 'GET' }
    );
}

export const getFileExcel = () => {
    return fetchBlob(
        `${baseUrl}/point/export`,
        { method: "GET" }
    )
}