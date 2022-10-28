import { baseUrl } from "../common/constant";
import send from "./fetch";

export async function cancelConfirm(
    confirmId, note
) {
    return send(`${baseUrl}/confirm/cancel`, {
        body: JSON.stringify({
            id: confirmId, note
        }),
        method: 'POST',
    });
}

export async function acceptConfirm(
    confirmId, note
) {
    return send(`${baseUrl}/confirm/accept`, {
        body: JSON.stringify({
            id: confirmId, note
        }),
        method: 'POST',
    });
}

export async function doneConfirm(
    confirmId, note
) {
    return send(`${baseUrl}/confirm/done`, {
        body: JSON.stringify({
            id: confirmId, note
        }),
        method: 'POST',
    });
}

export async function rejectConfirm(
    confirmId, note
) {
    return send(`${baseUrl}/confirm/reject`, {
        body: JSON.stringify({
            id: confirmId, note
        }),
        method: 'POST',
    });
}

export async function createConfirm(
    id, censorId, note, type
) {
    return send(`${baseUrl}/confirm/create`, {
        body: JSON.stringify({
            id, censorId, note, type
        }),
        method: 'PUT',
    });
}