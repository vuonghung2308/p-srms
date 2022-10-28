import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { Contract } from "fabric-network";
import { StatusCodes } from "http-status-codes";
import * as transaction from "../fabric/transaction";
import { handleTransactionRes, handleUnknownError } from "../utils/result";

export const confirmRouter = express.Router();
const { BAD_REQUEST } = StatusCodes

confirmRouter.put(
    "/create",
    body('type', 'must be a string').notEmpty(),
    body('id', 'must be a string').notEmpty(),
    body('censorId', 'must be a string').notEmpty(),
    body('note', 'must be a string').notEmpty(),
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
        const censorId: string = req.body.censorId;
        const type: string = req.body.type;
        const id: string = req.body.id;
        const note: string = req.body.note;

        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        try {
            const data = await transaction.submit(
                contract, 'Confirm:Create',
                token, type, id,censorId, note
            );
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)

confirmRouter.post(
    "/cancel",
    body('id', 'must be a string').notEmpty(),
    body('note', 'must be a string').notEmpty(),
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
        const id: string = req.body.id;
        const note: string = req.body.note;

        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        try {
            const data = await transaction.submit(
                contract, 'Confirm:Cancel',
                token, id, note
            );
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)

confirmRouter.post(
    "/accept",
    body('id', 'must be a string').notEmpty(),
    body('note', 'must be a string').notEmpty(),
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
        const id: string = req.body.id;
        const note: string = req.body.note;

        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        try {
            const data = await transaction.evaluate(
                contract, 'Confirm:Accept',
                token, id, note
            );
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)

confirmRouter.post(
    "/reject",
    body('id', 'must be a string').notEmpty(),
    body('note', 'must be a string').notEmpty(),
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
        const id: string = req.body.id;
        const note: string = req.body.note;

        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        try {
            const data = await transaction.evaluate(
                contract, 'Confirm:Reject',
                token, id, note
            );
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)

confirmRouter.post(
    "/done",
    body('id', 'must be a string').notEmpty(),
    body('note', 'must be a string').notEmpty(),
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
        const id: string = req.body.id;
        const note: string = req.body.note;

        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        try {
            const data = await transaction.evaluate(
                contract, 'Confirm:Done',
                token, id, note
            );
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)

confirmRouter.get(
    "/get-all", async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;

        try {
            const data = await transaction.evaluate(
                contract, 'Confirm:GetConfirms', token
            )
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)

confirmRouter.get(
    "/:confirmId", async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        const confirmId = req.params.confirmId as string;
        try {
            const data = await transaction.evaluate(
                contract, 'Confirm:GetConfirm', token, confirmId
            );
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)