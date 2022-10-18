import { getPayload } from "../common/token";

export default function fetchJson(url, request, isJson = true) {
    const payload = getPayload()
    if (isJson) {
        request.headers = {
            ...request.headers,
            'Content-Type': 'application/json'
        }
    }
    if (payload && payload.token) {
        request.headers = {
            ...request.headers,
            'token': payload.token
        };
    }
    return fetch(url, request)
        .then(data => data.json());
}

export function fetchBlob(url, request) {
    const payload = getPayload()
    if (payload && payload.token) {
        request.headers = {
            ...request.headers,
            'token': payload.token
        };
    }
    return fetch(url, request)
        .then(data => data.blob());
}