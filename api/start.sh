#!/bin/bash

#######################
# Build and run the API
#######################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download dependencies on the first build
#
npm ci
if [ $? -ne 0 ]; then
  echo 'Problem encountered installing API dependencies'
  read -n 1
  exit 1
fi

#
# Run code quality checks
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'Problem encountered running API code quality checks'
  read -n 1
  exit 1
fi

#
# Start the API
#
npm start
if [ $? -ne 0 ]; then
  echo 'Problem encountered running the SPA'
  read -n 1
  exit 1
fi
