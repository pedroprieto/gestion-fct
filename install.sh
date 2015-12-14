#!/bin/bash

cd $TRAVIS_BUILD_DIR
r.js -o public/js/build.js
rm public/js/main.js
mv public/js/main-built.js public/js/main.js
