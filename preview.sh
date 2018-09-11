#! /bin/sh
rm -rf build
git clone git@github.com:mauris/lps.js.org.git build
cd build
git checkout master
git rm -rf .
cd ..
node ./node_modules/pug-cli/index.js -o build src
cp CNAME build/
cp -R src/assets build/
cd build
git add -A
