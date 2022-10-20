#!/bin/bash
. $PWD/env.sh

SOCK="${DOCKER_HOST:-/var/run/docker.sock}"
DOCKER_SOCK="${SOCK##unix://}"

function start() { 
    if [ \
        -d $ORGANIZATIONS_DIR/ordererOrgs \
        -a -d $ORGANIZATIONS_DIR/peerOrgs \
    ]; then
        NUM_CA_CONTAINER=$(docker ps | grep "example.com" | wc -l)
        if [ $NUM_CA_CONTAINER -ge 5 ]; then
            echo "Network nodes have been already started"
        else
            DOCKER_SOCK=$DOCKER_SOCK docker-compose -p net -f \
                $COMPOSE_DIR/compose-net.yaml up -d
        fi
    else
        echo "Certificates not found"
    fi
}

function stop() {
    DOCKER_SOCK=$DOCKER_SOCK docker-compose -p net -f \
        $COMPOSE_DIR/compose-net.yaml down --volumes
    
    CHANINCODE_IMAGES=$(docker images | grep dev-peer0 | awk '{print $3}')
    docker rmi -f $CHANINCODE_IMAGES 2>/dev/null
    rm -rf $NEWORK_DIR/channel-artifacts 2>/dev/null
    rm $NEWORK_DIR/basic.tar.gz 2>/dev/null
}

if [ $# -eq 0 ]; then
    exit 0
else
    if [ $1 = start ]; then
        start
    elif [ $1 = stop ]; then
        stop
    else
        exit 0
    fi
fi