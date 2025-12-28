#!/bin/bash

###################################################################################
# Run the OAuth-secured SPA and API, which use tokens from the authorization server
###################################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

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
# Create SSL development certificates if required
#
./certs/create.sh
if [ $? -ne 0 ]; then
  exit 1
fi

#
# Run the SPA and API
#
if [ "$PLATFORM" == 'MACOS' ]; then

  open -a Terminal ./spa/start.sh
  open -a Terminal ./api/start.sh

elif [ "$PLATFORM" == 'WINDOWS' ]; then

  GIT_BASH="C:\Program Files\Git\git-bash.exe"
  "$GIT_BASH" -c ./spa/start.sh &
  "$GIT_BASH" -c ./api/start.sh &

elif [ "$PLATFORM" == 'LINUX' ]; then

  gnome-terminal -- ./spa/start.sh
  gnome-terminal -- ./api/start.sh
fi
