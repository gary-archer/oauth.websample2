#!/bin/bash

#######################################
# A script to run webpack in watch mode
#######################################

cd "$(dirname "${BASH_SOURCE[0]}")"
npm start

#
# Prevent automatic terminal closure on Linux
#
if [ "$(uname -s)" == 'Linux' ]; then
  read -n 1
fi