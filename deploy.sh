#/bin/bash

#########################################################################################################
# A script to spin up the code sample, to be run from a macOS terminal or a Windows Git bash shell
# Open source libraries are sued by the SPA and API, with AWS Cognito as the default Authorization Server
#########################################################################################################

#
# Get the platform
#
case "$(uname -s)" in

  Darwin)
    PLATFORM="MACOS"
 	;;

  MINGW64*)
    PLATFORM="WINDOWS"
	;;
esac

#
# Run the SPA and API
#
if [ "$PLATFORM" == 'MACOS' ]; then
    open -a Terminal ./spa/deploy.sh
    open -a Terminal ./api/deploy.sh
else
    GIT_BASH="C:\Program Files\Git\git-bash.exe"
    "$GIT_BASH" -c ./spa/deploy.sh &
    "$GIT_BASH" -c ./api/deploy.sh &
fi

#
# Get URLs to wait for
#
SPA_URL='https://web.mycompany.com/spa'
API_URL='https://api.mycompany.com/api'

#
# Wait for the API to come up
#
echo "Waiting for API to become available ..."
while [ "$(curl -k -s -o /dev/null -w ''%{http_code}'' "$API_URL/companies")" != "401" ]; do
    sleep 2s
done

#
# Wait for the SPA's Javascript bundles to be built
#
echo "Waiting for SPA to become available ..."
SPA_BUNDLE='./spa/dist/app.bundle.js'
while [ ! -f "$SPA_BUNDLE" ]; do
    sleep 2s
done

#
# Run the SPA in the default browser, then sign in with these credentials:
#  standarduser@mycompany.com
#  Password1
#
if [ "$PLATFORM" == 'MACOS' ]; then
    open $SPA_URL
fi
if [ "$PLATFORM" == 'WINDOWS' ]; then
    start $SPA_URL
fi
