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
    local PEER0_DIR=$NEWORK_DIR/organizations/peerOrgs/org1.example.com
    export FABRIC_CFG_PATH=$NEWORK_DIR/config/peer
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_DIR/ca-cert.pem
    export CORE_PEER_MSPCONFIGPATH=$PEER0_DIR/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051

    # peer channel join --blockpath $BLOCK_FILE
    
    peer channel list
}

# function setAnchorPeer() {
#     # export CORE_PEER_ADDRESS=peer0.org1.example.com:7051
# }

# createChannel
joinPeer0ToChannel
# peer channel list

docker exec cli ./scripts/set.sh 1 $CHANNEL_NAME
# docker exec cli setAnchorPeer 1 $CHANNEL_NAME

# peer channel getinfo -c mychannel
