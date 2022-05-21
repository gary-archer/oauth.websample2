#/bin/bash

################################################################
# A script to spin up the code sample, to be run from a terminal
# Open source libraries are used by the SPA and API
# AWS Cognito is used as the default Authorization Server
################################################################

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

  Linux)
    PLATFORM="LINUX"
	;;
esac

#
# Run the SPA and API
#
if [ "$PLATFORM" == 'MACOS' ]; then

    open -a Terminal ./spa/deploy.sh
    open -a Terminal ./api/deploy.sh

elif [ "$PLATFORM" == 'WINDOWS' ]; then

    GIT_BASH="C:\Program Files\Git\git-bash.exe"
    "$GIT_BASH" -c ./spa/deploy.sh &
    "$GIT_BASH" -c ./api/deploy.sh &

elif [ "$PLATFORM" == 'LINUX' ]; then

    gnome-terminal -- ./spa/deploy.sh
    gnome-terminal -- ./api/deploy.sh
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
if [ "$PLATFORM" == 'LINUX' ]; then
    xdg-open $SPA_URL
fi