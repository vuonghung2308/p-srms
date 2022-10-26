import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Contract } from "fabric-network";
import { body, validationResult } from "express-validator";
import * as transaction from "../fabric/transaction";
import { handleTransactionRes, handleUnknownError } from "../utils/result";

export const classRouter = express.Router();
const { BAD_REQUEST } = StatusCodes

classRouter.get(
    '/get-all', async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        try {
            let result = await transaction.evaluate(
                contract, 'Class:GetClasses', token
            );
            return handleTransactionRes(res, result);
        } catch (error: any) {
            return handleUnknownError(res, error);
        }
    }
);

classRouter.get(
    '/:classId', async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const classId = req.params.classId as string;
        const token: string = req.headers.token as string;

        try {
            const result = await transaction.submit(
                contract, 'Class:GetClass', token, classId
            );
            return handleTransactionRes(res, result);
        } catch (error: any) {
            return handleUnknownError(res, error);
        }
    }
);

classRouter.put(
    '/create',
    body('classId', 'must be a string').notEmpty(),
    body('subjectId', 'must be a string').notEmpty(),
    body('teacherId', 'must be a string').notEmpty(),
    body('year', 'must be a number').isNumeric(),
    body('semester', 'must be a string').notEmpty(),
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
        const classId: string = req.body.classId;
        const subjectId: string = req.body.subjectId;
        const teacherId: string = req.body.teacherId;
        const year: string = req.body.year.toString();
        const semester: string = req.body.semester;
        const token: string = req.headers.token as string;

        try {
            const result = await transaction.submit(
                contract, 'Class:CreateClass', token,
                classId, subjectId, year, semester, teacherId
            );
            return handleTransactionRes(res, result);
        } catch (error: any) {
            return handleUnknownError(res, error);
        }
    }
);

classRouter.put(
    '/add-student',
    body('classId', 'must be a string').notEmpty(),
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
        const classId: string = req.body.classId;
        const studentId: string = req.body.studentId;
        const token: string = req.headers.token as string;

        try {
            const result = await transaction.submit(
                contract, 'Class:AddStudent',
                token, classId, studentId
            );
            return handleTransactionRes(res, result);
        } catch (error: any) {
            return handleUnknownError(res, error);
        }
    }
);

classRouter.get(
    '/get-students/:classId', async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const classId = req.params.classId as string
        const token: string = req.headers.token as string;
        try {
            const result = await transaction.evaluate(
                contract, 'Class:GetStudents',
                token, classId
            );
            return handleTransactionRes(res, result);
        } catch (error: any) {
            return handleUnknownError(res, error);
        }
    }
);

classRouter.post(
    '/request',
    body('classId', 'must be a string').notEmpty(),
    body('teacherId', 'must be a string').notEmpty(),
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
        const classId: string = req.body.classId;
        const teacherId: string = req.body.teacherId;
        const token: string = req.headers.token as string;

        try {
            const result = await transaction.submit(
                contract, 'Class:RequestConfirm',
                token, classId, teacherId
            );
            return handleTransactionRes(res, result);
        } catch (error: any) {
            return handleUnknownError(res, error);
        }
    }
);

classRouter.post(
    '/confirm',
    body('classId', 'must be a string').notEmpty(),
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
        const classId: string = req.body.classId;
        const token: string = req.headers.token as string;

        try {
            const result = await transaction.submit(
                contract, 'Class:ConfirmRequest',
                token, classId
            );
            return handleTransactionRes(res, result);
        } catch (error: any) {
            return handleUnknownError(res, error);
        }
    }
);