#!/bin/bash

#######################
# Build and run the SPA
#######################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download dependencies on the first build
#
npm ci
if [ $? -ne 0 ]; then
  echo 'Problem encountered installing SPA dependencies'
  read -n 1
  exit 1
fi

#
# Run code quality checks
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'Problem encountered running SPA code quality checks'
  read -n 1
  exit 1
fi

#
# Ensure that live reload calls from rollup trust the Express static content server's SSL certificate
#
if [ "$NODE_EXTRA_CA_CERTS" == '' ]; then
  export NODE_EXTRA_CA_CERTS='../certs/authsamples-dev.ca.crt'
fi

#
# Start the SPA
#
npm start
if [ $? -ne 0 ]; then
  echo 'Problem encountered running the SPA'
  read -n 1
  exit 1
fi
