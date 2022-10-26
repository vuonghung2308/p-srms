import express, { Application, Response, Request, NextFunction } from "express";
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { CCP_PATH, CHAINCODE_NAME, CHANNEL_NAME, WALLET_PATH } from "./common/constant";
import * as fabric from "./fabric/fabric"
import * as wl from "./fabric/wallet"
import { checkToken } from "./middleware/token";
import { authRouter } from "./router/auth.router";
import { classRouter } from "./router/class.router";
import { examRouter } from "./router/exam.router";
import { pointRouter } from "./router/point.router";
import { roomRouter } from "./router/room.router";
import { subjectRouter } from "./router/subject.router";
import { logger } from "./utils/logger";
import cors from "cors";
import { accountRouter } from "./router/account.router";
import { transactionRouter } from "./router/transaction.router";
import { teacherRouter } from "./router/teacher.router";
import { studentRouter } from "./router/student.router";
import { ledgerRouter } from "./router/ledger.router";
import bodyParser from "body-parser";
import { claimRouter } from "./router/claim.router";

const { NOT_FOUND } = StatusCodes;

async function createServer(): Promise<Application> {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded(
        { extended: true }
    ));

    await createRoutes(app);

    const msg = getReasonPhrase(NOT_FOUND).toLowerCase();
    app.use((req, res) =>
        res.status(NOT_FOUND).json({
            status: "FAILED",
            error: {
                code: "NOT_FOUND", param: "path",
                msg: msg.charAt(0).toUpperCase() + msg.slice(1),
            },
            timestamp: new Date().toISOString(),
        })
    );
    return app;
}


async function createRoutes(app: Application): Promise<void> {
    app.use(cors())
    app.use('/api/auth', authRouter);
    app.use('/api/account', checkToken, accountRouter);
    app.use('/api/class', checkToken, classRouter);
    app.use('/api/subject', checkToken, subjectRouter);
    app.use('/api/teacher', checkToken, teacherRouter);
    app.use('/api/student', checkToken, studentRouter);
    app.use('/api/ledger', checkToken, ledgerRouter);
    app.use('/api/point', checkToken, pointRouter);
    app.use('/api/room', checkToken, roomRouter);
    app.use('/api/exam', checkToken, examRouter);
    app.use('/api/transaction', checkToken, transactionRouter);
    app.use('/api/claim', checkToken, claimRouter);
}

async function main() {
    const app = await createServer();
    const connectionProfile = fabric.buildCPP(CCP_PATH);
    const wallet = await wl.buildWallet(WALLET_PATH);
    const gateway = await fabric.createGateway(connectionProfile, 'nodeApp', wallet);
    const network = await fabric.getNetwork(gateway, CHANNEL_NAME);
    const contract = await fabric.getContract(network, CHAINCODE_NAME);

    app.locals.contract = contract;

    logger.info('Starting REST server');
    app.listen(8000, () => {
        logger.info('REST server started on port: %d', 8000);
    });
}

main().catch(async (err) => {
    logger.error({ err }, 'Unxepected error');
});