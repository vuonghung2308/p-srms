#!/bin/bash
. $PWD/env.sh

SOCK="${DOCKER_HOST:-/var/run/docker.sock}"
DOCKER_SOCK="${SOCK##unix://}"

function start() {
    DOCKER_SOCK=$DOCKER_SOCK docker-compose -p net -f \
        $COMPOSE_DIR/compose-net.yaml up -d
}

function stop() {
    DOCKER_SOCK=$DOCKER_SOCK docker-compose -p net -f \
        $COMPOSE_DIR/compose-net.yaml down --volumes
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