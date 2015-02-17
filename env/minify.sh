#!/bin/bash

ENV_DIR="$UI_PROJ_DIR/env"
ROOTDIR="$UI_PROJ_DIR/site"
LDIR="$ROOTDIR/lib"
CSSDIR="$ROOTDIR/css"
SRCDIR="$ROOTDIR/src"
BINDIR="$ROOTDIR/bin"

MINIFY="$ENV_DIR/node_modules/minify/bin/minify.js"

CSS="$ROOTDIR/css/jquery-ui-1.11.3.css"

SOURCE=""

echo "=== MINIFYING LIBS ==="
cd $LDIR
LIBLIST=`find *.js`
echo "$LIBLIST"
$MINIFY $LIBLIST > $BINDIR/js-libs.js
echo""
echo "=== MINIFYING CSS ==="
cd $CSSDIR
CSSLIST=`find *.css`
echo "$CSSLIST"
$MINIFY $CSSLIST > $BINDIR/css-data.css

echo""
echo "=== MINIFYING SOURCE =="
cd $SRCDIR
JSLIST=`find *.js`
echo "$JSLIST"
$MINIFY $JSLIST > $BINDIR/js-src.js

