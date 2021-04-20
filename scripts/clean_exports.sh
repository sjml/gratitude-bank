#!/usr/bin/env bash

cd "$(dirname "$0")"
cd ../public/assets

rm -f *.log

for bab in **/*.babylon; do
  prettier --write --parser json $bab
done
