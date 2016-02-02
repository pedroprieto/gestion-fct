#!/bin/bash

r.js -o public/js/build.js
rm public/js/main.js
cp public/js/main-built.js public/js/main.js
