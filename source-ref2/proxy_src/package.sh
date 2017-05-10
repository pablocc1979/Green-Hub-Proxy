#!/bin/bash

mkdir proxxy
cp manifest.json *.js *.css *.png *.html proxxy
cp -R _locales proxxy
zip -r proxxy.zip proxxy proxxy/*
rm -r proxxy
