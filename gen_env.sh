#!/bin/bash

CURRDIR=$(pwd)
echo "#!/bin/bash" > env.sh
echo "export UI_PROJ_DIR='$CURRDIR'" >> env.sh
