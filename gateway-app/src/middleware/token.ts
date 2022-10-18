import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const { UNAUTHORIZED } = StatusCodes

export const checkToken = (
    req: Request, res: Response,
    next: NextFunction
) => {
    if (!req.headers.token) {
        return res.status(UNAUTHORIZED).json({
            status: "FAILED",
            error: {
                code: "MISSING",
                param: "token",
                msg: 'Missing field token in headers',
            },
            timestamp: new Date().toISOString()
        });
    } else { next(); }
}