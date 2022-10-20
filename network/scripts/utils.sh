#!/bin/bash

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