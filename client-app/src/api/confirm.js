import { baseUrl } from "../common/constant";
import send from "./fetch";

export async function confirm(classId) {
    return send(`${baseUrl}/class/confirm`, {
        body: JSON.stringify({
            classId
        }),
        method: 'POST',
    });
}

export async function request(id, censorId, note, type) {
    return send(`${baseUrl}/confirm/create`, {
        body: JSON.stringify({
            id, censorId, note, type
        }),
        method: 'PUT',
    });
}