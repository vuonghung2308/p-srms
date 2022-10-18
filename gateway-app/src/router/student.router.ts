import express, { Request, Response } from "express";
import { Contract } from "fabric-network";
import * as transaction from "../fabric/transaction";
import { handleTransactionRes, handleUnknownError } from "../utils/result";

export const studentRouter = express.Router();

studentRouter.get(
    '/search', async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        const key = req.query.key;
        try {
            if (key && typeof key === "string") {
                const result = await transaction.evaluate(
                    contract, 'Student:SearchStudent', token, key
                );
                return handleTransactionRes(res, result);
            } else {
                const result = await transaction.evaluate(
                    contract, 'Student:GetStudents', token
                );
                return handleTransactionRes(res, result);
            }
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
);