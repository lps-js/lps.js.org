#! /bin/sh
rm -rf build
git clone git@github.com:mauris/lps.js.org.git build
cd build
git checkout master
git rm -rf .
cd ..
cp CNAME build/
cp -R src/assets build/
cd build && node ../node_modules/static-server/bin/static-server.js &
node ./node_modules/pug-cli/index.js -w -o build src
