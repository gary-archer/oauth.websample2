#!/bin/bash

########################################
# A script to get the SPA's dependencies
########################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download the first time
#
if [ ! -d 'node_modules' ]; then
  npm install
fi

#
# Run code quality checks
#
npm run lint