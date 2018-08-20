#! /bin/sh
rm -rf build
git clone git@github.com:mauris/lps.js.org.git build
node ./node_modules/pug-cli/index.js -o build src