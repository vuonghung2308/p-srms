#!/bin/bash
. $PWD/env.sh
. $PWD/utils.sh


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

function updateConfig() {
    NUM_PEER_CONTAINER=$(docker ps | grep -e 'org2.example.com' | wc -l)
    if [ $NUM_PEER_CONTAINER -eq 0 ]; then 
        echo "Peers of Organization 2 is not running"
        return 0
    fi

    local ORG2_DIR=$NEWORK_DIR/organizations/peerOrgs/org2.example.com
    local ORG1_DIR=$NEWORK_DIR/organizations/peerOrgs/org1.example.com
    local ORDERER_HOME=$NEWORK_DIR/organizations/ordererOrgs/example.com
    local ORDERER_NODE=$ORDERER_HOME/orderers/orderer.example.com
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$ORG1_DIR/ca-cert.pem
    export CORE_PEER_MSPCONFIGPATH=$ORG1_DIR/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
    local CA_FILE=$ORDERER_NODE/tls/ca-cert.pem

    export FABRIC_CFG_PATH=$NEWORK_DIR/config/org2
    configtxgen -printOrg Org2MSP > $ORG2_DIR/org.json

    export FABRIC_CFG_PATH=$NEWORK_DIR/config/peer/peer1
    ARTIFACTS=$NEWORK_DIR/channel-artifacts

    peer channel fetch config $BLOCK_FILE -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        -c $CHANNEL_NAME --tls --cafile $CA_FILE
    
    configtxlator proto_decode --input $BLOCK_FILE --type common.Block \
        --output $ARTIFACTS/config_block.json
    jq .data.data[0].payload.data.config $ARTIFACTS/config_block.json \
        > $ARTIFACTS/config.json
    
    jq -s '.[0] * {"channel_group":{"groups":{"Application":{"groups": {"Org2MSP":.[1]}}}}}' \
        $ARTIFACTS/config.json $ORG2_DIR/org.json > $ARTIFACTS/modified_config.json

    configtxlator proto_encode --input $ARTIFACTS/config.json \
        --type common.Config --output $ARTIFACTS/config.pb
    
    configtxlator proto_encode --input $ARTIFACTS/modified_config.json \
        --type common.Config --output $ARTIFACTS/modified_config.pb

    configtxlator compute_update --channel_id $CHANNEL_NAME \
        --original $ARTIFACTS/config.pb --updated $ARTIFACTS/modified_config.pb \
        --output $ARTIFACTS/org2_update.pb

    configtxlator proto_decode --input $ARTIFACTS/org2_update.pb \
        --type common.ConfigUpdate --output $ARTIFACTS/org2_update.json

    echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'",
        "type":2}},"data":{"config_update":'$(cat $ARTIFACTS/org2_update.json)'}}}' \
        | jq . > $ARTIFACTS/org2_update_in_envelope.json

    configtxlator proto_encode --input $ARTIFACTS/org2_update_in_envelope.json \
        --type common.Envelope --output $ARTIFACTS/org2_update_in_envelope.pb


    peer channel signconfigtx -f $ARTIFACTS/org2_update_in_envelope.pb

    peer channel update -f $ARTIFACTS/org2_update_in_envelope.pb -c $CHANNEL_NAME \
        -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls --cafile $CA_FILE
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
    NUM_PEER_CONTAINER=$(docker ps | grep -e 'org2.example.com' | wc -l)
    if [ $NUM_PEER_CONTAINER -eq 0 ]; then 
        echo "Peers of Organization 2 is not running"
        return 0
    fi

    local ORG2_DIR=$NEWORK_DIR/organizations/peerOrgs/org2.example.com
    local ORDERER_HOME=$NEWORK_DIR/organizations/ordererOrgs/example.com
    local ORDERER_NODE=$ORDERER_HOME/orderers/orderer.example.com
    local CA_FILE=$ORDERER_NODE/tls/ca-cert.pem
    export FABRIC_CFG_PATH=$NEWORK_DIR/config/peer/peer1
    export CORE_PEER_LOCALMSPID="Org2MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$ORG2_DIR/ca-cert.pem
    export CORE_PEER_MSPCONFIGPATH=$ORG2_DIR/users/Admin@org2.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051

    peer channel fetch 0 $BLOCK_FILE -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        -c $CHANNEL_NAME --tls --cafile $CA_FILE
    peer channel join -b $BLOCK_FILE
}

if [ $# -eq 0 ]; then
    exit 0
else
    NUM_CA_CONTAINER=$(docker ps | grep -e 'example.com\|cli' |wc -l)
    if [ $NUM_CA_CONTAINER -ge 1 ]; then
        if [ $1 = create ]; then
            createChannel
        elif [ $1 = join ]; then
            ORG=${2:-1}
            [ $ORG -eq 1 ] \
                && joinPeer0ToChannel \
                || joinPeer1ToChannel
        elif [ $1 = setAnchor ]; then
            ORG=${2:-1}
            NUM_PEER_CONTAINER=$(docker ps | grep -e "org${ORG}.example.com" | wc -l)
            if [ $NUM_PEER_CONTAINER -eq 0 ]; then 
                echo "Peers of Organization 2 is not running"
                return 0
            fi
            docker exec cli ./scripts/set.sh $ORG
        elif [ $1 = update ]; then
            updateConfig
        elif [ $1 = up ]; then
            createChannel
            joinPeer0ToChannel
            docker exec cli ./scripts/set.sh 1
        else 
            exit 0 
        fi
    else 
        echo "Network nodes are not running" 
    fi
fi