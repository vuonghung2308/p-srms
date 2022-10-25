import { baseUrl } from "../common/constant";
import fetchJson from "./fetch";

export async function login(credentials) {
    return fetchJson(`${baseUrl}/auth/login`, {
        body: JSON.stringify(credentials),
        method: 'POST'
    });
}

export async function getInfo() {
    return fetchJson(`${baseUrl}/account/info`, {
        method: 'GET'
    });
}

export async function changePassword(oldPassword, newPassword) {
    return fetchJson(`${baseUrl}/auth/change-password`, {
        body:JSON.stringify({oldPassword, newPassword}),
        method: 'POST'
    });
}