#!/bin/sh
# This first-stage Debian installer needs only /bin/sh and apt-get. It installs
# everything required to run install-iadmin-terminal.sh from the HTTPS site.
set -eu

if [ "$(id -u)" -eq 0 ]; then
  SUDO=""
elif command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
else
  printf '%s\n' "Run this script as root, or install sudo first." >&2
  exit 1
fi

$SUDO apt-get update
$SUDO apt-get install -y --no-install-recommends ca-certificates curl python3 mkcert
printf '%s\n' "Prerequisites installed. You can now run install-iadmin-terminal.sh --with-local-ca."
