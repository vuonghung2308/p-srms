import { Response } from "express";
import { StatusCodes } from "http-status-codes";

const { OK, UNAUTHORIZED, BAD_REQUEST } = StatusCodes

export const handleTransactionRes = (res: Response, result: any) => {
    if (result.status === "SUCCESS") {
        return res.status(OK).json(result);
    } else {
        if (result.error.code === "UNAUTHORIZED" ||
            result.error.code === "NOT_ALLOWED") {
            return res.status(UNAUTHORIZED).json(result);
        } else return res.status(BAD_REQUEST).json(result);
    }
}

export const handleUnknownError = (res: Response, err: any) => {
    return res.status(BAD_REQUEST).json({
        status: "FAILED",
        error: {
            code: "UNKNOWN",
            msg: err.message,
        },
        timestamp: new Date().toISOString(),
    });
}

export const handleError = (res: Response, err: any) => {
    return res.status(BAD_REQUEST).json({
        status: "FAILED",
        error: {
            code: err.code,
            param: err.param,
            msg: err.message,
        },
        timestamp: new Date().toISOString(),
    });
}