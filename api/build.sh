#/bin/bash

######################################
# A script to get the API ready to run
######################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download the API's dependencies
#
npm install

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
