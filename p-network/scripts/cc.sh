#!/bin/bash
. $PWD/env.sh

ORG1_DIR=$NEWORK_DIR/organizations/peerOrgs/org1.example.com
ORG2_DIR=$NEWORK_DIR/organizations/peerOrgs/org2.example.com
ORDERER_HOME=$NEWORK_DIR/organizations/ordererOrgs/example.com
ORDERER_NODE=$ORDERER_HOME/orderers/orderer.example.com
CA_FILE=$ORDERER_NODE/tls/ca-cert.pem

export CORE_PEER_TLS_ENABLED=true

function setOrg1() {
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$ORG1_DIR/ca-cert.pem
    export CORE_PEER_MSPCONFIGPATH=$ORG1_DIR/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
    export FABRIC_CFG_PATH=$NEWORK_DIR/config/peer/peer0
}

function setOrg2() {
    export CORE_PEER_LOCALMSPID="Org2MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$ORG2_DIR/ca-cert.pem
    export CORE_PEER_MSPCONFIGPATH=$ORG2_DIR/users/Admin@org2.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
    export FABRIC_CFG_PATH=$NEWORK_DIR/config/peer/peer1
}

function package() {
    pushd $WORKING_DIR/chaincode-typescript
    npm install
    npm run build
    popd
    peer lifecycle chaincode package $NEWORK_DIR/basic.tar.gz --path $WORKING_DIR/chaincode-typescript --lang node --label basic_1.0
}


function installOnPeer0() {
    setOrg1
    peer lifecycle chaincode install $NEWORK_DIR/basic.tar.gz
}

function installOnPeer1() {
    setOrg2
    peer lifecycle chaincode install $NEWORK_DIR/basic.tar.gz
}

function approveForOrg1() {
    setOrg1
    PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid $NEWORK_DIR/basic.tar.gz)
    peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $CA_FILE --channelID mychannel --name basic --version 1.0 --package-id $PACKAGE_ID --sequence 1
    peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name basic --version 1.0 --sequence 1 --tls --cafile $CA_FILE
}

function approveForOrg2() {
    setOrg2
    PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid $NEWORK_DIR/basic.tar.gz)
    peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $CA_FILE --channelID mychannel --name basic --version 1.0 --package-id $PACKAGE_ID --sequence 1
    peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name basic --version 1.0 --sequence 1 --tls --cafile $CA_FILE
}

function commitChaincode() {
    setOrg1
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name basic --version 1.0 --sequence 1 --tls --cafile $CA_FILE --peerAddresses localhost:7051 --tlsRootCertFiles $NEWORK_DIR/organizations/peerOrgs/org1.example.com/peers/peer0.org1.example.com/tls/ca-cert.pem --peerAddresses localhost:9051 --tlsRootCertFiles $NEWORK_DIR/organizations/peerOrgs/org2.example.com/peers/peer0.org2.example.com/tls/ca-cert.pem
    peer lifecycle chaincode querycommitted --channelID mychannel --name basic --cafile $CA_FILE
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $CA_FILE -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles $NEWORK_DIR/organizations/peerOrgs/org1.example.com/peers/peer0.org1.example.com/tls/ca-cert.pem --peerAddresses localhost:9051 --tlsRootCertFiles $NEWORK_DIR/organizations/peerOrgs/org2.example.com/peers/peer0.org2.example.com/tls/ca-cert.pem -c '{"function":"InitLedger","Args":[]}'
}

function invokeChaincode() {
    setOrg1
    peer chaincode query -C mychannel -n basic -c '{"Args":["GetAllAssets"]}'
}


if [ $# -eq 0 ]; then
    exit 0
else
    if [ $1 = package ]; then
        package
    elif [ $1 = install ]; then
        installOnPeer0
        installOnPeer1
    elif [ $1 = approve ]; then
        approveForOrg1
        approveForOrg2
    elif [ $1 = commit ]; then
        commitChaincode
    elif [ $1 = invoke ]; then
        invokeChaincode
    else
        exit 0
    fi
fi