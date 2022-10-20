#!/bin/bash

$PWD/ca.sh up
$PWD/network.sh start && \
    $PWD/channel.sh up && \
    $PWD/chaincode.sh deploy