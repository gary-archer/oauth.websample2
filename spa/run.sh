#!/bin/bash

#######################################
# A script to run webpack in watch mode
#######################################

cd "$(dirname "${BASH_SOURCE[0]}")"
npm start

#
# Prevent automatic terminal closure
#
read -n 1
