#!/bin/bash

######################################
# A script to get the API ready to run
######################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download the API's dependencies
#
if [ ! -d 'node_modules' ]; then
  npm install
fi

#
# Download SSL certificates from a central repo if needed
#
if [ ! -d 'certs' ]; then
  rm -rf ./resources
  git clone https://github.com/gary-archer/oauth.developmentcertificates ./resources
  rm -rf certs
  mv ./resources/mycompany ./certs
  rm -rf ./resources
fi

#
# Run code quality checks
#
npm run lint