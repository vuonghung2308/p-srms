#!/bin/bash
. $PWD/env.sh

CHANNEL_NAME=mychannel
CONFIG_FILE=$NEWORK_DIR/config/channel
BLOCK_FILE=$NEWORK_DIR/channel-artifacts/$CHANNEL_NAME.block

function createChannel() {
    local ORDERER_HOME=$NEWORK_DIR/organizations/ordererOrgs/example.com
    local ORDERER_NODE=$ORDERER_HOME/orderers/orderer.example.com
    local CA_FILE=$ORDERER_NODE/tls/ca-cert.pem
    local KEY_FILE=$ORDERER_NODE/tls/pr-key.pem
    local CERT_FILE=$ORDERER_NODE/tls/sign-cert.pem

    configtxgen -profile TwoOrgsApplicationGenesis -outputBlock $BLOCK_FILE \
        -channelID $CHANNEL_NAME -configPath $CONFIG_FILE

    osnadmin channel join --channelID $CHANNEL_NAME --config-block $BLOCK_FILE \
        -o localhost:7053 --ca-file $CA_FILE --client-cert $CERT_FILE \
        --client-key $KEY_FILE
}

function joinPeer0ToChannel() {
    local ORG1_DIR=$NEWORK_DIR/organizations/peerOrgs/org1.example.com
    export FABRIC_CFG_PATH=$NEWORK_DIR/config/peer/peer0
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$ORG1_DIR/ca-cert.pem
    export CORE_PEER_MSPCONFIGPATH=$ORG1_DIR/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
    peer channel join --blockpath $BLOCK_FILE
}

function joinPeer1ToChannel() {
    local ORG2_DIR=$NEWORK_DIR/organizations/peerOrgs/org2.example.com
    export FABRIC_CFG_PATH=$NEWORK_DIR/config/peer/peer1
    export CORE_PEER_LOCALMSPID="Org2MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$ORG2_DIR/ca-cert.pem
    export CORE_PEER_MSPCONFIGPATH=$ORG2_DIR/users/Admin@org2.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
    peer channel join --blockpath $BLOCK_FILE
}

if [ $# -eq 0 ]; then
    exit 0
else
    if [ $1 = create ]; then
        createChannel
    elif [ $1 = join ]; then
        joinPeer0ToChannel
        joinPeer1ToChannel
    elif [ $1 = setAnchor ]; then
        docker exec cli ./scripts/set.sh 1
        docker exec cli ./scripts/set.sh 2
    else
        exit 0
    fi
fi