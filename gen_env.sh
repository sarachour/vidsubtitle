#!/bin/bash

CURRDIR=$(pwd)

rm .git/hooks/pre-commit
cp env/jshint_precommit_hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

echo "#!/bin/bash" > env.sh
echo "export UI_PROJ_DIR='$CURRDIR'" >> env.sh

