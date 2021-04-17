#!/usr/bin/env bash

set -e

cd "$(dirname "$0")"
cd ..
ROOT_DIR=$(pwd)

rm -rf $ROOT_DIR/dist

npm run build

cp README.md $ROOT_DIR/dist
cp LICENSE $ROOT_DIR/dist

node ./scripts/generateAssetList.js
