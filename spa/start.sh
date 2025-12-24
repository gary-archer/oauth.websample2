#!/bin/bash

#########################################
# A script to start the SPA in watch mode
#########################################

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

#
# Start the SPA
#
npm start
if [ $? -ne 0 ]; then
  echo 'Problem encountered running the SPA'
  read -n 1
  exit 1
fi

#
# Prevent automatic terminal closure
#
read -n 1
