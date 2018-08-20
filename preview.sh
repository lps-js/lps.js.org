#! /bin/sh
rm -rf build
git clone git@github.com:mauris/lps.js.org.git build
cd build
git checkout master
cd ..
node ./node_modules/pug-cli/index.js -o build src
cp -R src/assets build/assets