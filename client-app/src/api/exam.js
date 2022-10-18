import { baseUrl } from "../common/constant";
import send from "./fetch";

export async function getExams(roomId) {
    return send(`${baseUrl}/exam/get-exams/${roomId}`, {
        method: 'GET',
    });
}

export async function updatePoint(examCode, point) {
    return send(`${baseUrl}/exam/set-point`, {
        method: 'POST',
        body: JSON.stringify({
            examCode, point
        })
    });
}