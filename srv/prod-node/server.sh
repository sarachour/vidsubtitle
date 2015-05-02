#!/bin/bash

kill -2 `ps aux | grep [m]ongo* | awk '{ print $2 }'`
# mongod --fork --dbpath $PWD/db --port 12345 --logpath $PWD/db/mongodb.log
node server.js
