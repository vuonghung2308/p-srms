#!/bin/bash
. $PWD/env.sh
. $PWD/utils.sh

ORG1_DIR=$ORGANIZATIONS_DIR/peerOrgs/org1.example.com
ORG2_DIR=$ORGANIZATIONS_DIR/peerOrgs/org2.example.com
ORDERER_HOME=$ORGANIZATIONS_DIR/ordererOrgs/example.com
ORDERER_NODE=$ORDERER_HOME/orderers/orderer.example.com
CA_FILE=$ORDERER_NODE/tls/ca-cert.pem
CHAINCODE_PATH=$WORKING_DIR/chaincode
DELAY=0.2
RETRY=10

SEQUENCE=1
CHANNEL_ID=mychannel
CHAINCODE_VERSION=1.$(($SEQUENCE-1))
CHAINCODE_NAME=basic

export CORE_PEER_TLS_ENABLED=true

function setOrganization1() {
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$ORG1_DIR/ca-cert.pem
    export CORE_PEER_MSPCONFIGPATH=$ORG1_DIR/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
    export FABRIC_CFG_PATH=$NEWORK_DIR/config/peer/peer0
}

function setOrganization2() {
    export CORE_PEER_LOCALMSPID="Org2MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$ORG2_DIR/ca-cert.pem
    export CORE_PEER_MSPCONFIGPATH=$ORG2_DIR/users/Admin@org2.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
    export FABRIC_CFG_PATH=$NEWORK_DIR/config/peer/peer1
}

function package() {
    export FABRIC_CFG_PATH=$NEWORK_DIR/config/peer
    pushd $CHAINCODE_PATH
    npm install && npm run build
    popd
    LABEL=${CHAINCODE_NAME}_${CHAINCODE_VERSION}
    peer lifecycle chaincode package $NEWORK_DIR/basic.tar.gz \
        --path $CHAINCODE_PATH --lang node --label $LABEL
}


function installOnPeer0() {
    setOrganization1
    peer lifecycle chaincode install $NEWORK_DIR/basic.tar.gz
}

function installOnPeer1() {
    setOrganization2
    peer lifecycle chaincode install $NEWORK_DIR/basic.tar.gz
}

function approveForOrg1() {
    setOrganization1
    PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid $NEWORK_DIR/basic.tar.gz)
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls \
        --cafile $CA_FILE --channelID $CHANNEL_ID --name $CHAINCODE_NAME \
        --version $CHAINCODE_VERSION --package-id $PACKAGE_ID --sequence $SEQUENCE

    RESULT=$?

    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_ID \
        --name $CHAINCODE_NAME --version $CHAINCODE_VERSION --sequence $SEQUENCE --tls --cafile $CA_FILE
    return $RESULT
}

function approveForOrg2() {
    setOrganization2
    PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid $NEWORK_DIR/basic.tar.gz)
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls \
        --cafile $CA_FILE --channelID $CHANNEL_ID --name $CHAINCODE_NAME \
        --version $CHAINCODE_VERSION --package-id $PACKAGE_ID --sequence $SEQUENCE

    peer lifecycle chaincode querycommitted --channelID mychannel \
        --name basic --cafile $CA_FILE

}

function commitChaincode() {
    setOrganization1
    ORG1_CERT_FILE=$ORG1_DIR/peers/peer0.org1.example.com/tls/ca-cert.pem
    ORG2_CERT_FILE=$ORG2_DIR/peers/peer0.org2.example.com/tls/ca-cert.pem
    peer lifecycle chaincode commit -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --channelID $CHANNEL_ID --name $CHAINCODE_NAME --version $CHAINCODE_VERSION \
        --sequence $SEQUENCE --tls --cafile $CA_FILE \
        --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_CERT_FILE \
        # --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_CERT_FILE
}

function initLedger() {
    setOrganization1
    ORG1_CERT_FILE=$ORG1_DIR/peers/peer0.org1.example.com/tls/ca-cert.pem
    # ORG2_CERT_FILE=$ORG2_DIR/peers/peer0.org2.example.com/tls/ca-cert.pem
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls --cafile $CA_FILE -C $CHANNEL_ID -n $CHAINCODE_NAME --peerAddresses localhost:7051 \
        --tlsRootCertFiles $ORG1_CERT_FILE \
        -c '{"Function":"Ledger:InitLedger","Args":[]}'
        # --peerAddresses localhost:9051 \
        #--tlsRootCertFiles $ORG2_CERT_FILE 
}

function upgradeChaincode() {
    setOrganization1
    SEQUENCE=$(peer lifecycle chaincode querycommitted \
        --channelID $CHANNEL_ID --name $CHAINCODE_NAME \
        --cafile $CA_FILE --output json | jq ".sequence"
    )
    SEQUENCE=$(($SEQUENCE + 1))
    CHAINCODE_VERSION=1.$(($SEQUENCE-1))
    deployChaincode
}

function deployChaincode() {
    package
    installOnPeer0
    # installOnPeer1
    try approveForOrg1
    # approveForOrg2
    commitChaincode
}

function invokeChaincode() {
    TMP=$1$2
    setOrganization1
    [ -z "$1$2" ] && ARGS='["Account:CheckAccount","S1", "1"]'
    peer chaincode query -C $CHANNEL_ID -n $CHAINCODE_NAME \
        -c "{\"Args\":$ARGS}"
}

function invokeChaincode1() {
    TMP=$1$2
    setOrganization2
    [ -z "$1$2" ] && ARGS='["Account:CheckAccount","S1", "1"]'
    peer chaincode query -C $CHANNEL_ID -n $CHAINCODE_NAME \
        -c "{\"Args\":$ARGS}"
}

if [ $# -eq 0 ]; then
    exit 0
else
    NUM_CA_CONTAINER=$(docker ps | grep "example.com" | wc -l)
    if [ $NUM_CA_CONTAINER -ge 1 ]; then
        if [ $1 = package ]; then
            package
        elif [ $1 = install ]; then
            if [ -f $NEWORK_DIR/basic.tar.gz ]; then
                installOnPeer0
                # installOnPeer1
            else
                echo "Chaincode package not found"
            fi
        elif [ $1 = approve ]; then
            if [ -f $NEWORK_DIR/basic.tar.gz ]; then
                approveForOrg1
                # approveForOrg2
            else
                echo "Chaincode package not found"
            fi
        elif [ $1 = commit ]; then
            commitChaincode
        elif [ $1 = install1 ]; then
            installOnPeer1
        elif [ $1 = approve1 ]; then
            approveForOrg2
        elif [ $1 = invoke ]; then
            invokeChaincode $2
        elif [ $1 = invoke1 ]; then
            invokeChaincode1 $2
        elif [ $1 = upgrade ]; then
            upgradeChaincode
        elif [ $1 = init ]; then
            initLedger
        elif [ $1 = deploy ]; then
            deployChaincode
            initLedger
        else
            exit 0
        fi
    else
        echo "Network nodes are not running" 
    fi
fi