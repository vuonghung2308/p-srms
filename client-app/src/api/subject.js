import { baseUrl } from "../common/constant"
import send from "./fetch"

export const searchSubject = (key) => {
    const url = new URL(`${baseUrl}/subject/search`);
    url.searchParams.append('key', key);
    return send(url, { method: 'GET' });
}