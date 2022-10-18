import { baseUrl } from "../common/constant"
import send from "./fetch"

export const searchStudent = (key) => {
    const url = new URL(`${baseUrl}/student/search`);
    url.searchParams.append('key', key);
    return send(url, { method: 'GET' });
}