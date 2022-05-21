#!/bin/bash

#######################################
# A script to run the API in watch mode
#######################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# On Linux ensure that you have first granted Node.js permissions to listen on port 443:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
#
npm start

#
# Prevent automatic terminal closure on Linux
#
if [ "$(uname -s)" == 'Linux' ]; then
  read -n 1
fi