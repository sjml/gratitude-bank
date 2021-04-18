#!/usr/bin/env bash

set -e
shopt -s globstar

cd "$(dirname "$0")"
cd ..
ROOT_DIR=$(pwd)

rm -rf $ROOT_DIR/dist

npm run build

cp README.md $ROOT_DIR/dist
cp LICENSE $ROOT_DIR/dist

for bab in $ROOT_DIR/dist/**/*.babylon; do
  inp=$(cat $bab)
  echo $inp | jq -c . > $bab
done

node ./scripts/generateAssetList.js
