import express, { Request, Response } from "express";
import { Contract } from "fabric-network";
import * as transaction from "../fabric/transaction";
import { handleTransactionRes, handleUnknownError } from "../utils/result";

export const transactionRouter = express.Router();

transactionRouter.get(
    "/detail/:txId", async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        const txId = req.params.txId as string;
        try {
            const data = await transaction.evaluate(
                contract, 'Transaction:GetDetail', token, txId
            );
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)

transactionRouter.get(
    "/get-all", async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;

        try {
            const data = await transaction.evaluate(
                contract, 'Transaction:GetTransactions', token
            )
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)

transactionRouter.get(
    "/get-history/:key", async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        const key = req.params.key as string;
        try {
            const data = await transaction.evaluate(
                contract, 'Transaction:GetHistory', token, key
            );
            return handleTransactionRes(res, data);
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
)