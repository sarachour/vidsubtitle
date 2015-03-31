#!/bin/bash

ROOTDIR=$UI_PROJ_DIR
SRVDIR=$ROOTDIR/srv/dummy
WEBDIR=$ROOTDIR/site

pkill -f "dummy_server.*" && echo "killed any lingering server processes"
cd "$WEBDIR"
nohup python "$SRVDIR/dummy_server.py" &> "$SRVDIR/log.txt" 2>&1&

