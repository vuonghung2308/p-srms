import express, { Request, Response } from "express";
import { Contract } from "fabric-network";
import * as transaction from "../fabric/transaction";
import { handleTransactionRes, handleUnknownError } from "../utils/result";

export const accountRouter = express.Router();

accountRouter.get("/info", async (req: Request, res: Response) => {
    const contract: Contract = req.app.locals.contract;
    const token: string = req.headers.token as string;
    try {
        const result = await transaction.evaluate(
            contract, `Account:GetInfo`, token
        );
        return handleTransactionRes(res, result);
    } catch (err: any) {
        return handleUnknownError(res, err);
    }
})