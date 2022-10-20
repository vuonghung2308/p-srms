#!/bin/bash

ORGS_DIR=/etc/hyperledger/organizations
ORG1_DIR=$ORGS_DIR/peerOrgs/org1.example.com
ORG2_DIR=$ORGS_DIR/peerOrgs/org2.example.com
ORDERER_CA=$ORGS_DIR/ordererOrgs/example.com/ca-cert.pem
CHANNEL=mychannel

function try() {
    local RETRY_TIME=${2:-20}
    local DURATION=${3:-0.1}
    while : ; do
        MESSAGE=$($1 2>&1)
        RESULT=$?
        if [ $RESULT -eq 0 ]; then
            break
        fi
        RETRY_TIME=$(($RETRY_TIME-1))
        sleep $DURATION
        if [ $RETRY_TIME -eq 0 ]; then
            break
        fi
    done
    echo $MESSAGE
}

function setAnchor1() {
    HOST=peer0.org1.example.com
    PORT=7051 && ORG=1

    export FABRIC_CFG_PATH=/etc/hyperledger/peer0cfg
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_ADDRESS=peer0.org1.example.com:7051
    export CORE_PEER_MSPCONFIGPATH=$ORG1_DIR/users/Admin@org1.example.com/msp
    export CORE_PEER_TLS_ROOTCERT_FILE=$ORG1_DIR/tlscacerts/ca-cert.pem

    peer channel fetch config config_block.pb -o orderer.example.com:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --channelID $CHANNEL --tls --cafile $ORDERER_CA
    
    [ $? -ne 0 ] && return 1
        
    configtxlator proto_decode --input config_block.pb --type common.Block \
        --output config_block.json

    jq .data.data[0].payload.data.config config_block.json \
         > ${CORE_PEER_LOCALMSPID}config.json
    jq '.channel_group.groups.Application.groups.'${CORE_PEER_LOCALMSPID}'.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "'$HOST'","port": '$PORT'}]},"version": "0"}}' \
        ${CORE_PEER_LOCALMSPID}config.json > ${CORE_PEER_LOCALMSPID}modified_config.json

    configtxlator proto_encode --input ${CORE_PEER_LOCALMSPID}config.json \
        --type common.Config --output original_config.pb
    configtxlator proto_encode --input  ${CORE_PEER_LOCALMSPID}modified_config.json \
        --type common.Config --output modified_config.pb
    configtxlator compute_update --channel_id ${CHANNEL} --original original_config.pb \
        --updated modified_config.pb --output config_update.pb
    configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate \
        --output config_update.json
    echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL'", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' |\
        jq . > config_update_in_envelope.json
    configtxlator proto_encode --input config_update_in_envelope.json \
        --type common.Envelope --output  ${CORE_PEER_LOCALMSPID}anchors.tx

    peer channel update -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL \
        -f ${CORE_PEER_LOCALMSPID}anchors.tx --tls --cafile $ORDERER_CA
}

function setAnchor2() {
    HOST=peer0.org2.example.com
    PORT=9051 && ORG=2

    export FABRIC_CFG_PATH=/etc/hyperledger/peer1cfg
    export CORE_PEER_LOCALMSPID="Org2MSP"
    export CORE_PEER_ADDRESS=peer0.org2.example.com:9051
    export CORE_PEER_MSPCONFIGPATH=$ORG2_DIR/users/Admin@org2.example.com/msp
    export CORE_PEER_TLS_ROOTCERT_FILE=$ORG2_DIR/tlscacerts/ca-cert.pem


    peer channel fetch config config_block.pb -o orderer.example.com:7050 \
        --ordererTLSHostnameOverride orderer.example.com\
        --channelID $CHANNEL --tls --cafile $ORDERER_CA
    
    [ $? -ne 0 ] && return 1
        
    configtxlator proto_decode --input config_block.pb --type common.Block \
        --output config_block.json

    jq .data.data[0].payload.data.config config_block.json > ${CORE_PEER_LOCALMSPID}config.json

    jq '.channel_group.groups.Application.groups.'${CORE_PEER_LOCALMSPID}'.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "'$HOST'","port": '$PORT'}]},"version": "0"}}' \
        ${CORE_PEER_LOCALMSPID}config.json > ${CORE_PEER_LOCALMSPID}modified_config.json

    configtxlator proto_encode --input ${CORE_PEER_LOCALMSPID}config.json \
        --type common.Config --output original_config.pb
    configtxlator proto_encode --input  ${CORE_PEER_LOCALMSPID}modified_config.json \
        --type common.Config --output modified_config.pb
    configtxlator compute_update --channel_id ${CHANNEL} --original original_config.pb \
        --updated modified_config.pb --output config_update.pb
    configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate \
        --output config_update.json

    echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL'", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' \
        | jq . > config_update_in_envelope.json
    configtxlator proto_encode --input config_update_in_envelope.json \
        --type common.Envelope --output  ${CORE_PEER_LOCALMSPID}anchors.tx

    peer channel update -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com \
        -c $CHANNEL -f ${CORE_PEER_LOCALMSPID}anchors.tx --tls --cafile $ORDERER_CA
}

if [ $# -eq 0 ]; then
    exit 0
else
    if [ $1 = 1 ]; then
        try setAnchor1
    elif [ $1 = 2 ]; then
        try setAnchor2
    else
        exit 0
    fi
fi