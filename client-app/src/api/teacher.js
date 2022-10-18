import { baseUrl } from "../common/constant"
import send from "./fetch"

export const searchTeacher = (key) => {
    const url = new URL(`${baseUrl}/teacher/search`);
    url.searchParams.append('key', key);
    return send(url, { method: 'GET' });
}