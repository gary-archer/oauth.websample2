#/bin/bash

#########################################################################################################
# A script to spin up the code sample, to be run from a macOS terminal or a Windows Git bash shell
# Open source libraries are sued by the SPA and API, with AWS Cognito as the default Authorization Server
#########################################################################################################

#
# Build the SPA
#
cd spa 
./build.sh

#
# Then build the API
#
cd ../api
./build.sh
