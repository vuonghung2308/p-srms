#!/bin/bash
. ./env.sh

SOCK="${DOCKER_HOST:-/var/run/docker.sock}"
DOCKER_SOCK="${SOCK##unix://}"

docker-compose -p ca -f $COMPOSE_DIR/compose-ca.yaml \
    down --volumes &

DOCKER_SOCK=$DOCKER_SOCK docker-compose -p net -f \
    $COMPOSE_DIR/compose-net.yaml down --volumes &
wait

CHANINCODE_IMAGES=$(docker images | grep dev-peer0 | awk '{print $3}')
docker rmi -f $CHANINCODE_IMAGES 2>/dev/null
rm $NEWORK_DIR/basic.tar.gz 2>/dev/null
rm -rf $NEWORK_DIR/channel-artifacts 2>/dev/null
rm -rf $ORGANIZATIONS_DIR/ordererOrgs
rm -rf $ORGANIZATIONS_DIR/peerOrgs
sudo rm -rf $FABRIC_CA_DIR