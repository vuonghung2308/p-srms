import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Contract } from "fabric-network";
import { body, validationResult } from "express-validator";
import * as transaction from "../fabric/transaction";
import { handleTransactionRes, handleUnknownError } from "../utils/result";

export const examRouter = express.Router();
const { BAD_REQUEST } = StatusCodes

examRouter.get(
    '/get-exams/:roomId', async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        const roomId: string = req.params.roomId as string;
        try {
            const result = await transaction.evaluate(
                contract, 'Exam:GetExams', token, roomId
            );
            return handleTransactionRes(res, result);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
);

examRouter.post(
    '/set-point',
    body('examCode', 'must be a string').notEmpty(),
    body('point', 'must be a number').optional().isNumeric(),
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
        const examCode: string = req.body.examCode;
        const point: string = String(req.body.point);
        const token: string = req.headers.token as string;

        try {
            const result = await transaction.submit(
                contract, 'Exam:SetPoint',
                token, examCode, point
            );
            console.log(result);
            return handleTransactionRes(res, result);
        } catch (err) {
            console.log(err);
            return handleUnknownError(res, err);
        }
    }
);