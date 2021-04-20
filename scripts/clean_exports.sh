#!/usr/bin/env bash

cd "$(dirname "$0")"
cd ../public/assets

rm *.log

for bab in **/*.babylon; do
  prettier --write --parser json $bab
done
