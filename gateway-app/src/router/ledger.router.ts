import express, { Request, Response } from "express";
import { Contract } from "fabric-network";
import { StatusCodes } from "http-status-codes";
import * as transaction from "../fabric/transaction";
import { handleError, handleTransactionRes, handleUnknownError } from "../utils/result";
import multer from "multer";

export const ledgerRouter = express.Router();
const { OK } = StatusCodes;
const upload = multer();

ledgerRouter.get(
    "/export", async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        try {
            const result = await transaction.evaluate(
                contract, 'Ledger:ExportData', token
            );
            if (result.status === "SUCCESS") {
                res.setHeader(
                    'Content-Disposition',
                    'attachment; filename=data.json'
                );
                res.setHeader(
                    'Content-Type',
                    'application/json; charset=utf-16'
                );
                return res.write(
                    JSON.stringify(result.data),
                    () => res.status(OK).end()
                )
            } else {
                return handleTransactionRes(res, result);
            }
        } catch (err) {
            return handleUnknownError(res, err);
        }
    }
);

ledgerRouter.post(
    "/import", upload.single('file'), async (req: Request, res: Response) => {
        const contract: Contract = req.app.locals.contract;
        const token: string = req.headers.token as string;
        if (req.file && req.file.buffer) {
            const data = req.file.buffer.toString('utf-8');
            try {
                const result = await transaction.submit(
                    contract, 'Ledger:ImportData', token, data
                );
                return handleTransactionRes(res, result);
            } catch (err) {
                return handleUnknownError(res, err);
            }
        } else {
            return handleError(res, {
                code: "INVALID",
                param: "file",
                msg: "The file data is not valid",
            })
        }
    }
);