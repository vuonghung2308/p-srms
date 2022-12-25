import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { Contract } from "fabric-network";
import { StatusCodes } from "http-status-codes";
import * as transaction from "../fabric/transaction";
import { handleTransactionRes, handleUnknownError } from "../utils/result";

export const claimRouter = express.Router();
const { BAD_REQUEST } = StatusCodes

claimRouter.put(
    "/create",
    body('type', 'must be a string').notEmpty(),
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
        const type: string = req.body.type;
        const id: string = req.body.id;
        const note: string = req.body.note;

        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        try {
            const data = await transaction.submit(
                contract, 'Claim:Create',
                token, type, id, note
            );
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)

claimRouter.post(
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
                contract, 'Claim:Cancel',
                token, id, note
            );
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)

claimRouter.post(
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
            const data = await transaction.submit(
                contract, 'Claim:Accept',
                token, id, note
            );
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)

claimRouter.post(
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
            const data = await transaction.submit(
                contract, 'Claim:Reject',
                token, id, note
            );
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)

claimRouter.post(
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
            const data = await transaction.submit(
                contract, 'Claim:Done',
                token, id, note
            );
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)

claimRouter.get(
    "/get-all", async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;

        try {
            const data = await transaction.evaluate(
                contract, 'Claim:GetClaims', token
            )
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)

claimRouter.get(
    "/:claimId", async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        const claimId = req.params.claimId as string;
        try {
            const data = await transaction.evaluate(
                contract, 'Claim:GetClaim', token, claimId
            );
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)