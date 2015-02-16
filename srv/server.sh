#!/bin/bash

if [ -z "$UI_PROJ_DIR" ]; then
   echo "ERROR:"
   echo "   UI_PROJ_DIR is not defined. did you:"
   echo "      source env.sh"
   exit 1;
fi

ROOTDIR=$UI_PROJ_DIR
SRVDIR=$ROOTDIR/srv
#Spawn dummy server
SERVER_CMD="$SRVDIR/dummy/dummy_server.sh"

echo $SERVER_CMD
$SERVER_CMD
