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

# probably a snowpack option to copy hidden files but can't find it
cp $ROOT_DIR/public/.htaccess $ROOT_DIR/dist/.htaccess

for bab in $ROOT_DIR/dist/**/*.babylon; do
  inp=$(cat $bab)
  echo $inp | jq -c . > $bab
done

echo "Stamping version data..."
node ./scripts/stampVersion.js

echo "Generating asset list for service worker..."
node ./scripts/generateAssetList.js
