#!/bin/bash
. $PWD/env.sh

function start() {
    docker-compose -p ca -f $COMPOSE_DIR/compose-ca.yaml up -d
}

function stop() {
    docker-compose -p ca -f $COMPOSE_DIR/compose-ca.yaml \
        down --volumes
    rm -rf $ORGANIZATIONS_DIR/ordererOrgs
    rm -rf $ORGANIZATIONS_DIR/peerOrgs
    sudo rm -rf $FABRIC_CA_DIR
}

function generateOrderOrgIdentities() {
    local ORDERER_HOME=$ORGANIZATIONS_DIR/ordererOrgs/example.com
    local ORDERER_NODE=$ORDERER_HOME/orderers/orderer.example.com
    local CERT_FILE=$ORDERER_HOME/ca-cert.pem
    mkdir $ORDERER_HOME/msp/tlscacerts -p
    cp $FABRIC_CA_DIR/ordererOrg/ca-cert.pem $CERT_FILE
    cp $CERT_FILE $ORDERER_HOME/msp/tlscacerts/ca-cert.pem

    fabric-ca-client enroll -u https://admin:adminpw@localhost:9054 \
        --caname ca-orderer --tls.certfiles $CERT_FILE --home $ORDERER_HOME

    fabric-ca-client register -u https://admin:adminpw@localhost:9054 \
        --caname ca-orderer --tls.certfiles $CERT_FILE --home $ORDERER_HOME \
        --id.name orderer --id.secret ordererpw --id.type orderer

    fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 \
        --caname ca-orderer --tls.certfiles $CERT_FILE --home $ORDERER_HOME \
        --csr.hosts orderer.example.com --csr.hosts localhost \
        --mspdir $ORDERER_NODE/msp
    
    fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 \
        --caname ca-orderer --tls.certfiles $CERT_FILE --home $ORDERER_HOME \
        --mspdir $ORDERER_NODE/tls --enrollment.profile tls \
        --csr.hosts orderer.example.com --csr.hosts localhost

    cp $ORDERER_NODE/tls/tlscacerts/* $ORDERER_NODE/tls/ca-cert.pem
    cp $ORDERER_NODE/tls/signcerts/* $ORDERER_NODE/tls/sign-cert.pem
    cp $ORDERER_NODE/tls/keystore/* $ORDERER_NODE/tls/pr-key.pem

    MSP_CONFIG_FILE=$ORDERER_NODE/msp/config.yaml
    echo 'NodeOUs:
    Enable: true
    ClientOUIdentifier:
        Certificate: cacerts/localhost-9054-ca-orderer.pem
        OrganizationalUnitIdentifier: client
    PeerOUIdentifier:
        Certificate: cacerts/localhost-9054-ca-orderer.pem
        OrganizationalUnitIdentifier: peer
    AdminOUIdentifier:
        Certificate: cacerts/localhost-9054-ca-orderer.pem
        OrganizationalUnitIdentifier: admin
    OrdererOUIdentifier:
        Certificate: cacerts/localhost-9054-ca-orderer.pem
        OrganizationalUnitIdentifier: orderer' > $MSP_CONFIG_FILE
    cp $MSP_CONFIG_FILE $ORDERER_HOME/msp/config.yaml
}

function generateOrg1Identities() {
    local ORG1_HOME=$ORGANIZATIONS_DIR/peerOrgs/org1.example.com
    local ORG1_NODE=$ORG1_HOME/peers/peer0.org1.example.com
    local CERT_FILE=$ORG1_HOME/ca-cert.pem
    mkdir $ORG1_HOME/msp/tlscacerts -p
    cp $FABRIC_CA_DIR/peerOrgs/org1/ca-cert.pem $CERT_FILE
    cp $CERT_FILE $ORG1_HOME/msp/tlscacerts/ca-cert.pem

    fabric-ca-client enroll -u https://admin:adminpw@localhost:7054 \
        --caname ca-org1 --tls.certfiles $CERT_FILE --home $ORG1_HOME

    fabric-ca-client register --id.name peer0 --id.secret peer0pw --id.type peer \
        --caname ca-org1 --tls.certfiles $CERT_FILE --home $ORG1_HOME
        
    fabric-ca-client register --id.name org1admin --id.secret org1adminpw --id.type admin \
        --caname ca-org1 --tls.certfiles $CERT_FILE --home $ORG1_HOME

    fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 \
        --caname ca-org1 --tls.certfiles $CERT_FILE --home $ORG1_HOME \
        --csr.hosts peer0.org1.example.com --csr.hosts localhost \
        --mspdir $ORG1_NODE/msp
    
    fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 \
        --caname ca-org1 --tls.certfiles $CERT_FILE --home $ORG1_HOME \
        --mspdir $ORG1_NODE/tls --enrollment.profile tls \
        --csr.hosts peer0.org1.example.com --csr.hosts localhost

    fabric-ca-client enroll -u https://org1admin:org1adminpw@localhost:7054 \
        --caname ca-org1 -M $ORG1_HOME/users/Admin@org1.example.com/msp \
        --tls.certfiles $CERT_FILE --home $ORG1_HOME

    cp $ORG1_NODE/tls/tlscacerts/* $ORG1_NODE/tls/ca-cert.pem
    cp $ORG1_NODE/tls/signcerts/* $ORG1_NODE/tls/sign-cert.pem
    cp $ORG1_NODE/tls/keystore/* $ORG1_NODE/tls/pr-key.pem

    MSP_CONFIG_FILE=$ORG1_NODE/msp/config.yaml
    echo 'NodeOUs:
    Enable: true
    ClientOUIdentifier:
        Certificate: cacerts/localhost-7054-ca-org1.pem
        OrganizationalUnitIdentifier: client
    PeerOUIdentifier:
        Certificate: cacerts/localhost-7054-ca-org1.pem
        OrganizationalUnitIdentifier: peer
    AdminOUIdentifier:
        Certificate: cacerts/localhost-7054-ca-org1.pem
        OrganizationalUnitIdentifier: admin
    OrdererOUIdentifier:
        Certificate: cacerts/localhost-7054-ca-org1.pem
        OrganizationalUnitIdentifier: orderer' > $MSP_CONFIG_FILE
    cp $MSP_CONFIG_FILE $ORG1_HOME/users/Admin@org1.example.com/msp
    cp $MSP_CONFIG_FILE $ORG1_HOME/msp/config.yaml
    
    CCP_FILE=$ORG1_HOME/connection.json
    echo "$(json_ccp 1 7051 7054 $CERT_FILE $CERT_FILE)" > $CCP_FILE
}

function generateOrg2Identities() {
    local ORG2_HOME=$ORGANIZATIONS_DIR/peerOrgs/org2.example.com
    local ORG2_NODE=$ORG2_HOME/peers/peer0.org2.example.com
    local CERT_FILE=$ORG2_HOME/ca-cert.pem
    mkdir $ORG2_HOME/msp/tlscacerts -p
    cp $FABRIC_CA_DIR/peerOrgs/org2/ca-cert.pem $CERT_FILE
    cp $CERT_FILE $ORG2_HOME/msp/tlscacerts/ca-cert.pem

    fabric-ca-client enroll -u https://admin:adminpw@localhost:8054 \
        --caname ca-org2 --tls.certfiles $CERT_FILE --home $ORG2_HOME

    fabric-ca-client register --id.name peer0 --id.secret peer0pw --id.type peer \
        --caname ca-org2 --tls.certfiles $CERT_FILE --home $ORG2_HOME \

    fabric-ca-client register --id.name org2admin --id.secret org2adminpw --id.type admin \
        --caname ca-org2 --tls.certfiles $CERT_FILE --home $ORG2_HOME

    fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 \
        --caname ca-org2 --tls.certfiles $CERT_FILE --home $ORG2_HOME \
        --csr.hosts peer0.org2.example.com --csr.hosts localhost \
        --mspdir $ORG2_NODE/msp
    
    fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 \
        --caname ca-org2 --tls.certfiles $CERT_FILE --home $ORG2_HOME \
        --mspdir $ORG2_NODE/tls --enrollment.profile tls \
        --csr.hosts peer0.org2.example.com --csr.hosts localhost

    fabric-ca-client enroll -u https://org2admin:org2adminpw@localhost:8054 \
        --caname ca-org2 -M $ORG2_HOME/users/Admin@org2.example.com/msp \
        --tls.certfiles $CERT_FILE --home $ORG2_HOME

    cp $ORG2_NODE/tls/tlscacerts/* $ORG2_NODE/tls/ca-cert.pem
    cp $ORG2_NODE/tls/signcerts/* $ORG2_NODE/tls/sign-cert.pem
    cp $ORG2_NODE/tls/keystore/* $ORG2_NODE/tls/pr-key.pem

    MSP_CONFIG_FILE=$ORG2_NODE/msp/config.yaml
    echo 'NodeOUs:
    Enable: true
    ClientOUIdentifier:
        Certificate: cacerts/localhost-8054-ca-org2.pem
        OrganizationalUnitIdentifier: client
    PeerOUIdentifier:
        Certificate: cacerts/localhost-8054-ca-org2.pem
        OrganizationalUnitIdentifier: peer
    AdminOUIdentifier:
        Certificate: cacerts/localhost-8054-ca-org2.pem
        OrganizationalUnitIdentifier: admin
    OrdererOUIdentifier:
        Certificate: cacerts/localhost-8054-ca-org2.pem
        OrganizationalUnitIdentifier: orderer' > $MSP_CONFIG_FILE
    cp $MSP_CONFIG_FILE $ORG2_HOME/users/Admin@org2.example.com/msp
    cp $MSP_CONFIG_FILE $ORG2_HOME/msp/config.yaml
    
    CCP_FILE=$ORG2_HOME/connection.json
    echo "$(json_ccp 2 9051 8054 $CERT_FILE $CERT_FILE)" > $CCP_FILE
}

function generate() {
    generateOrderOrgIdentities
    generateOrg1Identities
    generateOrg2Identities
}

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        $ORGANIZATIONS_DIR/ccp-tmp.json
}

if [ $# -eq 0 ]; then
    exit 0
else
    if [ $1 = start ]; then
        start
    elif [ $1 = stop ]; then
        stop
    elif [ $1 = generate ]; then
        generate
    else
        exit 0
    fi
fi