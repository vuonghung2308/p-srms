import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Contract } from "fabric-network";
import * as transaction from "../fabric/transaction";
import { body, validationResult } from "express-validator";
import { handleTransactionRes, handleUnknownError } from "../utils/result";
import { getWorkbook } from "../utils/excel";

export const pointRouter = express.Router();
const { BAD_REQUEST, OK } = StatusCodes

pointRouter.post(
    '/set-point',
    body('studentId', 'must be a string').notEmpty(),
    body('classId', 'must be a string').notEmpty(),
    body('attendancePoint', 'must be a number').isNumeric(),
    body('practicePoint', 'must be a number').isNumeric(),
    body('midtermExamPoint', 'must be a number').isNumeric(),
    body('exercisePoint', 'must be a number').isNumeric(),
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
        const studentId: string = req.body.studentId;
        const classId: string = req.body.classId;
        const attendancePoint = req.body.attendancePoint.toString();
        const practicePoint = req.body.practicePoint.toString();
        const midtermExamPoint = req.body.midtermExamPoint.toString();
        const exercisePoint = req.body.exercisePoint.toString();
        const token: string = req.headers.token as string;
        try {
            const result = await transaction.submit(
                contract, 'Point:SetPoint', token,
                studentId, classId, attendancePoint,
                practicePoint, midtermExamPoint, exercisePoint
            );
            return handleTransactionRes(res, result);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
);

pointRouter.get(
    '/get-points', async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        try {
            const result = await transaction.evaluate(
                contract, 'Point:GetPoints', token
            );
            return handleTransactionRes(res, result);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
);

pointRouter.get(
    '/:pointId', async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        const pointId = req.params.pointId as string;
        try {
            const result = await transaction.evaluate(
                contract, 'Point:GetPoint', token, pointId
            );
            return handleTransactionRes(res, result);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
);

pointRouter.get(
    '/export', async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        try {
            const result = await transaction.evaluate(
                contract, 'Point:ExportData', token
            );

            if (result.status === "SUCCESS") {
                res.setHeader(
                    'Content-Disposition',
                    'attachment; filename=BangDiem.xlsx'
                );
                res.setHeader(
                    'Content-Type',
                    'application/ms-excel; charset=utf-16'
                );
                const workbook = getWorkbook(result.data);
                return workbook.xlsx.write(res).then(() =>
                    res.status(OK).end()
                );
            } else {
                return handleTransactionRes(res, result);
            }
        } catch (err) {
            return handleUnknownError(res, err);
        }

    }
);