import { baseUrl } from "../common/constant";
import send from "./fetch";

export const getRooms = () => {
    return send(`${baseUrl}/room/get-all`, {
        method: 'GET'
    })
}

export const getRoom = (roomId) => {
    return send(`${baseUrl}/room/${roomId}`, {
        method: 'GET'
    })
}

export const addExam = (roomId, studentId) => {
    return send(`${baseUrl}/room/add-exam`, {
        method: 'PUT',
        body: JSON.stringify({ roomId, studentId })
    })
}

export const createRoom = (
    roomName, subjectId, teacherId,
    year, semester, timeStart, duration
) => {
    return send(`${baseUrl}/room/create`, {
        method: 'PUT',
        body: JSON.stringify({
            roomName, subjectId, teacherId,
            year, semester, timeStart, duration
        })
    })
}