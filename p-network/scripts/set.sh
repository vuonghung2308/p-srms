#!/bin/bash

ORG_DIR=/etc/hyperledger/organizations
PEER0_DIR=$ORG_DIR/peerOrgs/org1.example.com
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_DIR/ca-cert.pem
export CORE_PEER_MSPCONFIGPATH=$PEER0_DIR/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=peer0.org1.example.com:7051

echo $1
echo $2

peer channel list
echo $FABRIC_CFG_PATH
