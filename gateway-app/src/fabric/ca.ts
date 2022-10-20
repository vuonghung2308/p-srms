import FabricCAServices from "fabric-ca-client";
import { Wallet } from "fabric-network";

export const buildCAClient = (
    ccp: Record<string, any>, caHostName: string
): FabricCAServices => {

    const caInfo = ccp.certificateAuthorities[caHostName];
    const tlsCACerts = caInfo.tlsCACerts.pem;
    const caClient = new FabricCAServices(caInfo.url, {
        trustedRoots: tlsCACerts, verify: false
    }, caInfo.caName);

    console.log(`Built a CA Client named ${caInfo.caName}`);
    return caClient;
}

export const enrollIdentity = async (
    caClient: FabricCAServices, wallet: Wallet, userId: string,
    userSecret: string, orgMspId: string
) => {
    try {
        const identity = await wallet.get(userId);
        if (identity) {
            console.log(`An identity for user ${userId} already exists in the wallet`);
            return
        }

        const enrollment = await caClient.enroll({
            enrollmentID: userId,
            enrollmentSecret: userSecret
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes()
            },
            mspId: orgMspId,
            type: 'X.509'
        }
        await wallet.put(userId, x509Identity);
        console.log(`Successfully enrolled user ${userId} and imported it into the wallet`);
    } catch (error) {
        console.error(`Failed to enroll user : ${error}`);
    }
}

export const registerUser = async (
    caClient: FabricCAServices, wallet: Wallet, userId: string, secret: string,
    affiliation: string, adminUserId: string): Promise<string | null> => {
    try {
        const userIdentity = await wallet.get(userId);
        if (userIdentity) {
            console.log(`An identity for the user ${userId} already exists in the wallet`);
            return null;
        }

        const adminIdentity = await wallet.get(adminUserId);
        if (!adminIdentity) {
            console.log('An identity for the admin user does not exist in the wallet');
            console.log('Enroll the admin user before retrying');
            return null;
        }

        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, adminUserId);

        await caClient.register({
            affiliation: affiliation,
            enrollmentSecret: secret,
            enrollmentID: userId,
            role: 'client'
        }, adminUser);

        return secret;
    } catch (error) {
        console.error(`Failed to register user: ${error}`);
        await wallet.remove(adminUserId);
        return null;
    }

}