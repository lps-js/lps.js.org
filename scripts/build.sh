#! /bin/sh
git stash --include-untracked >/dev/null
rm -rf build
git clone git@github.com:mauris/lps.js.org.git build
cd build
git checkout master
git rm -rf . >/dev/null
cd ..
node ./node_modules/pug-cli/index.js -o build src
cp CNAME build/
cp -R src/assets build/
cd build
git add -A
cd ..
git stash pop >/dev/null
exit 0
