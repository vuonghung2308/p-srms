import path from "path";

let ccpPath = path.resolve(__dirname, '..', '..', '..', 'network', 'organizations')
ccpPath = path.resolve(ccpPath, 'peerOrgs', 'org1.example.com', 'connection.json')
export const WALLET_PATH = path.resolve(__dirname, '..', '..', 'wallet');
export const CA_HOSTNAME = "ca.org1.example.com";
export const CHANNEL_NAME = "mychannel";
export const CHAINCODE_NAME = "basic";
export const CCP_PATH = ccpPath;