#!/bin/bash

########################################
# A script to get the SPA's dependencies
########################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download the first time
#
npm install
if [ $? -ne 0 ]; then
  echo 'Problem encountered installing SPA dependencies'
  exit 1
fi

#
# Run code quality checks
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'Problem encountered running SPA code quality checks'
  exit 1
fi