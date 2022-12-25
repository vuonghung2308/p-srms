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

export async function cancelClaim(claimId, note) {
    return send(`${baseUrl}/claim/cancel`, {
        body: JSON.stringify({
            id: claimId, note
        }),
        method: 'POST',
    });
}

export async function getClaims() {
    return send(`${baseUrl}/claim/get-all`, {
        method: 'GET',
    });
}

export async function getClaim(claimId) {
    return send(`${baseUrl}/claim/${claimId}`, {
        method: 'GET',
    });
}

export async function acceptClaim(claimId, note) {
    return send(`${baseUrl}/claim/accept`, {
        body: JSON.stringify({
            id: claimId, note
        }),
        method: 'POST',
    });
}

export async function rejectClaim(claimId, note) {
    return send(`${baseUrl}/claim/reject`, {
        body: JSON.stringify({
            id: claimId, note
        }),
        method: 'POST',
    });
}