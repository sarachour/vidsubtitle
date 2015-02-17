#!/bin/bash
# A pre-commit hook for git to lint JavaScript files with jshint
# @see https://github.com/jshint/jshint/
 
if git rev-parse --verify HEAD >/dev/null 2>&1
then
    against=HEAD
else
    # Initial commit: diff against an empty tree object
    against=912c33f56c3f99a5be61722ed49403c39c14dfff
fi
 
REPO=$(pwd)
ENV_DIR="$UI_PROJ_DIR/env"
JSHINT="$ENV_DIR/node_modules/jshint/bin/jshint"
EXIT_CODE=0
for FILE in `git diff-index --name-only ${against} -- | grep .*.js`; do
    # with jsc:
    echo $JSHINT --config $ENV_DIR/config.txt ${REPO}/${FILE}
    $JSHINT --config $ENV_DIR/config.txt ${REPO}/${FILE} | 
    
    # could similarly wrap Rhino or Node...
    
    EXIT_CODE=$((${EXIT_CODE} + $?))
done

echo "JSHINT: JavaScript validation complete"

if [[ ${EXIT_CODE} -ne 0 ]]; then
    echo ""
    echo "JSHint detected syntax problems."
    echo "Commit aborted."
fi
 
exit $((${EXIT_CODE}))
