#!/usr/bin/env bash

set -e

cd "$(dirname "$0")"
cd ..
ROOT_DIR=$(pwd)

rm -rf $ROOT_DIR/dist
mkdir $ROOT_DIR/dist

rm -rf $ROOT_DIR/public/build

npm run build

cp -R $ROOT_DIR/public/* $ROOT_DIR/dist
cp README.md $ROOT_DIR/dist
cp LICENSE $ROOT_DIR/dist
