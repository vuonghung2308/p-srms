import { baseUrl } from "../common/constant";
import send from "./fetch";

export async function addStudent(studentId, classId) {
    return send(`${baseUrl}/class/add-student`, {
        method: 'PUT',
        body: JSON.stringify({ studentId, classId })
    });
}

export async function createClass(
    classId, subjectId, year,
    semester, teacherId
) {
    return send(`${baseUrl}/class/create`, {
        method: 'PUT',
        body: JSON.stringify({
            classId, subjectId, year,
            semester, teacherId
        })
    })
}

export async function getStudents(classId) {
    return send(`${baseUrl}/class/get-students/${classId}`,
        { method: 'GET' }
    );
}

export async function getClasses() {
    return send(`${baseUrl}/class/get-all`, {
        method: 'GET',
    });
}

export async function getClass(classId) {
    return send(`${baseUrl}/class/${classId}`, {
        method: 'GET',
    });
}

export async function confirm(classId) {
    return send(`${baseUrl}/class/confirm`, {
        body: JSON.stringify({
            classId
        }),
        method: 'POST',
    });
}

export async function request(classId, teacherId) {
    return send(`${baseUrl}/class/request`, {
        body: JSON.stringify({
            classId, teacherId
        }),
        method: 'POST',
    });
}

export async function updatePoint(
    studentId, classId,
    attendancePoint, exercisePoint,
    midtermExamPoint, practicePoint
) {
    return send(`${baseUrl}/point/set-point`, {
        method: 'POST',
        body: JSON.stringify({
            studentId, classId,
            attendancePoint, exercisePoint,
            midtermExamPoint, practicePoint
        })
    });
}
