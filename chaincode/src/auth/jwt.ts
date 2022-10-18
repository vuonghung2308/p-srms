import { Account } from "../vo/account";
import * as jwt from 'jsonwebtoken'
import { Payload } from "../vo/payload";

const secretKey = 'MY_SECET_KEY';

export const newToken = (account: Account): string => {
    const payload: Payload = { id: account.id, type: account.type };
    const token = jwt.sign(payload, secretKey, { expiresIn: '2 days' })
    return token;
}

export const verify = (token: string): any => {
    try {
        const payload: Payload = <any>jwt.verify(token, secretKey);
        return payload;
    } catch (err) {
        return {
            code: "UNAUTHORIZED",
            msg: "The token is not valid"
        };
    }
}

export const verifyEmployee = (token: string): any => {
    const data = verify(token);
    if (data.type && data.type !== "EMPLOYEE") {
        return {
            code: "NOT_ALLOWED",
            msg: "You do not have permission"
        };
    }
    return data;
}

export const verifyAdmin = (token: string): any => {
    const data = verify(token);
    if (data.type && data.type !== "ADMIN") {
        return {
            code: "NOT_ALLOWED",
            msg: "You do not have permission"
        };
    }
    return data;
}

export const verifyTeacher = (token: string): any => {
    const data = verify(token);
    if (data.type && data.type !== "TEACHER") {
        return {
            code: "NOT_ALLOWED",
            msg: "You do not have permission"
        };
    }
    return data;
}

export const verifyStudent = (token: string): any => {
    const data = verify(token);
    if (data.type && data.type !== "STUDENT") {
        return {
            code: "NOT_ALLOWED",
            msg: "You do not have permission"
        };
    }
    return data;
}