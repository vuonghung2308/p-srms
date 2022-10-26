import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Contract } from "fabric-network";
import { body, validationResult } from "express-validator";
import * as transaction from "../fabric/transaction";
import { handleTransactionRes, handleUnknownError } from "../utils/result";

export const roomRouter = express.Router();
const { BAD_REQUEST } = StatusCodes

roomRouter.get(
    '/get-all', async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        try {
            let result = await transaction.evaluate(
                contract, 'Room:GetRooms', token
            );
            return handleTransactionRes(res, result);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
);
roomRouter.get(
    '/:roomId', async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        const roomId = req.params.roomId as string
        try {
            let result = await transaction.evaluate(
                contract, 'Room:GetRoom', token, roomId
            );
            return handleTransactionRes(res, result);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
);
roomRouter.put(
    '/create',
    body('roomName', 'must be a string').notEmpty(),
    body('subjectId', 'must be a string').notEmpty(),
    body('teacherId', 'must be a string').notEmpty(),
    body('year', 'must be a number').isNumeric(),
    body('semester', 'must be a string').notEmpty(),
    body('timeStart', 'must be a number').isNumeric(),
    body('duration', 'must be a number').isNumeric(),
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
        const roomName: string = req.body.roomName;
        const subjectId: string = req.body.subjectId;
        const teacherId: string = req.body.teacherId;
        const year: string = req.body.year.toString();
        const semester: string = req.body.semester;
        const timeStart: string = req.body.timeStart.toString();
        const duration: string = req.body.duration.toString();
        const token: string = req.headers.token as string;

        try {
            const result = await transaction.submit(
                contract, 'Room:CreateRoom',
                token, roomName, subjectId, teacherId,
                year, semester, timeStart, duration
            );
            return handleTransactionRes(res, result);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
);

roomRouter.put(
    '/add-exam',
    body('roomId', 'must be a string').notEmpty(),
    body('studentId', 'must be a string').notEmpty(),
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
        const roomId: string = req.body.roomId;
        const studentId: string = req.body.studentId;
        const token: string = req.headers.token as string;

        try {
            const result = await transaction.submit(
                contract, 'Exam:AddExam',
                token, roomId, studentId
            );
            return handleTransactionRes(res, result);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
);