import { Contract, Gateway, GatewayOptions, Network, Wallet } from "fabric-network";
import * as fs from "fs"


export const buildCPP = (ccpPath: string): Record<string, any> => {
    const fileExits = fs.existsSync(ccpPath);
    if (fileExits) {
        const content = fs.readFileSync(ccpPath, 'utf-8');
        const ccp = JSON.parse(content);
        console.log(`Loaded the network configuration located at ${ccpPath}`);
        return ccp;
    } else {
        throw new Error(`No such file or directory: ${ccpPath}`);
    }
}

export const createGateway = async (
    connectionProfile: Record<string, unknown>,
    identity: string, wallet: Wallet
): Promise<Gateway> => {
    const gateway = new Gateway();
    const options: GatewayOptions = {
        wallet,
        identity: identity,
        discovery: { enabled: true, asLocalhost: true },
        eventHandlerOptions: { strategy: null }
    };

    await gateway.connect(connectionProfile, options);
    return gateway
}

export const getNetwork = async (
    gateway: Gateway, channelName: string
): Promise<Network> => {
    const network = await gateway.getNetwork(channelName);
    return network;
};


export const getContract = async (
    network: Network, chaincodeName: string
): Promise<Contract> => {
    const contract = network.getContract(chaincodeName);
    return contract;
};