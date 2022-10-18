import { CA_HOSTNAME, CCP_PATH, WALLET_PATH } from "../common/constant";
import * as ca from "../fabric/ca";
import * as wl from "../fabric/wallet";
import * as fabric from "../fabric/fabric"
import { logger } from "../utils/logger";

async function main(userId: string, userSecret: string, mspOrg: string) {
    const cpp = fabric.buildCPP(CCP_PATH);
    const client = ca.buildCAClient(cpp, CA_HOSTNAME);
    const wallet = await wl.buildWallet(WALLET_PATH);
    await ca.enrollIdentity(client, wallet, userId, userSecret, mspOrg);
    const secret = await ca.registerUser(
        client, wallet, 'nodeApp',
        'org1.department1', userId
    );
    if (secret) {
        await ca.enrollIdentity(client, wallet, 'nodeApp', secret, mspOrg);
        await wallet.remove(userId);
    }
}

let adminUserId = process.argv[2];
let adminSecret = process.argv[3];
let mspOrg = process.argv[4];
if (!adminUserId) {
    logger.info('Admin user id is required');
} else if (!adminSecret) {
    logger.info('Admin user secret is required');
} else if (!mspOrg) {
    mspOrg = 'Org1MSP';
    main(adminUserId, adminSecret, mspOrg).catch(async (err) => {
        console.log(err);
    })
}