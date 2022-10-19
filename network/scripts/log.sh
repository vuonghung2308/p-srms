ORDERER_CONTAINER_ID=$(
    docker ps -a | grep orderer.example.com \
        | awk '{print $1}'
)

PEER0_CONTAINER_ID=$(
    docker ps -a | grep peer0.org1.example.com \
        | awk '{print $1}'
)

PEER1_CONTAINER_ID=$(
    docker ps -a | grep peer0.org2.example.com \
        | awk '{print $1}'
)

if [ $# -eq 0 ]; then
    exit 0
else
    if [ $1 = orderer ]; then
        docker logs -f $ORDERER_CONTAINER_ID
    elif [ $1 = peer0 ]; then
        docker logs -f $PEER0_CONTAINER_ID
    elif [ $1 = peer1 ]; then
        docker logs -f $PEER1_CONTAINER_ID
    else
        exit 0
    fi
fi