#/bin/bash

######################################
# A script to get the API ready to run
######################################

#
# Download the API's dependencies
#
npm install

#
# Download SSL certificates from a central repo if needed
#
if [ ! -d 'certs' ]; then
    git clone https://github.com/gary-archer/oauth.developmentcertificates ./certs
fi