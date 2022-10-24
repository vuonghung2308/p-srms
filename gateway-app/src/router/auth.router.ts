import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { body, validationResult } from "express-validator";
import { Contract } from "fabric-network";
import * as transaction from "../fabric/transaction";
import { handleTransactionRes, handleUnknownError } from "../utils/result";

export const authRouter = express.Router();
const { BAD_REQUEST, UNAUTHORIZED } = StatusCodes

authRouter.post(
    '/login',
    body('username', 'must be a string').notEmpty(),
    body('password', 'must be a string').notEmpty(),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(BAD_REQUEST).json({
                status: "FAILED",
                error: {
                    code: "INVALID",
                    msg: 'Invalid request body',
                    detail: errors.array(),
                },
                timestamp: new Date().toISOString(),
            });
        }
        const contract: Contract = req.app.locals.contract;
        const username: string = req.body.username;
        const password: string = req.body.password;

        try {
            const result = await transaction.evaluate(
                contract, 'Account:CheckAccount',
                username, password
            );
            return handleTransactionRes(res, result);
        } catch (error: any) {
            return handleUnknownError(res, error);
        }
    }
);

authRouter.post(
    '/change-password',
    body('oldPassword', 'must be a string').notEmpty(),
    body('newPassword', 'must be a string').notEmpty(),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(BAD_REQUEST).json({
                status: "FAILED",
                error: {
                    code: "INVALID",
                    msg: 'Invalid request body',
                    detail: errors.array(),
                },
                timestamp: new Date().toISOString(),
            });
        }

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
        }

        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        const oldPass: string = req.body.oldPassword;
        const newPass: string = req.body.newPassword;

        try {
            const result = await transaction.submit(
                contract, 'Account:ChangePassword',
                token, oldPass, newPass
            );
            return handleTransactionRes(res, result);
        } catch (error: any) {
            return handleUnknownError(res, error);
        }
    }
);