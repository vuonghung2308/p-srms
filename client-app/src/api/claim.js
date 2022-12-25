import { baseUrl } from "../common/constant";
import send from "./fetch";

export async function createClaim(
    id, note, type
) {
    return send(`${baseUrl}/claim/create`, {
        body: JSON.stringify({
            id, note, type
        }),
        method: 'PUT',
    });
}

export async function cancelClaim(
    id, note
) {
    return send(`${baseUrl}/claim/cancel`, {
        body: JSON.stringify({
            id, note
        }),
        method: 'POST',
    });
}

export async function getClaims() {
    return send(`${baseUrl}/claim/get-all`, {
        method: 'GET',
    });
}