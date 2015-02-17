#!/bin/bash

CURRDIR=$(pwd)
ln -s "env/jshint_precommit_hook.sh" .git/hooks/pre-commit
echo "#!/bin/bash" > env.sh
echo "export UI_PROJ_DIR='$CURRDIR'" >> env.sh

