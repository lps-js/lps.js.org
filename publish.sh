#! /bin/sh
./preview.sh
cd build
git add -A
git commit -m "Website automated build"
git push
cd ..
rm -rf build