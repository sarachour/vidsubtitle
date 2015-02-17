#!/bin/sh
# A pre-commit hook for git to lint JavaScript files with jshint
# @see https://github.com/jshint/jshint/
 
if git rev-parse --verify HEAD >/dev/null 2>&1
then
    against=HEAD
else
    # Initial commit: diff against an empty tree object
    against=4b825dc642cb6eb9a060e54bf8d69288fbee4904
fi
 
REPO=$(pwd)
JSHINT="${UI_PROJ_DIR}/env/node_modules/jshint/bin/jshint"
EXIT_CODE=0
for FILE in `git diff-index --name-only ${against} -- | grep *.js`; do
    # with jsc:
    echo $JSHINT ${REPO}/${FILE}
    $JSHINT ${REPO}/${FILE}
    
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
