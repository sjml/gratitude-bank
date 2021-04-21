#!/usr/bin/env bash

shopt -s globstar

cd "$(dirname "$0")"
cd ../public/assets

rm -f *.log

prettier --write --parser json **/*.babylon
