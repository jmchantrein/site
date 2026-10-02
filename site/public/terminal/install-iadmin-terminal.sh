#!/bin/sh
# Install the dependency-free Python companion on the computer running the
# web browser. Even in SSH mode, nothing from IAdmin is installed remotely:
# this local companion starts the already-installed `ssh` client, which then
# connects to the remote machine in the usual way.
set -eu

VERSION="1"
BASE_URL="${IADMIN_BASE_URL:-https://jmchantrein.github.io/site/terminal}"
DEST="${IADMIN_INSTALL_DIR:-$HOME/.local/bin}"
TARGET="$DEST/iadmin-terminal"
WITH_CA="${1:-}"

printf '%s\n' "IAdmin terminal companion installer v$VERSION"
printf '%s\n' "Source: $BASE_URL/iadmin-terminal.py"
printf '%s\n' "Destination: $TARGET"
mkdir -p "$DEST"
# Download to a temporary file first: a failed or interrupted transfer must
# never replace a previously working installation.
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT HUP INT TERM

# Prefer curl, but keep wget as a dependency-light fallback. HTTPS is forced
# here because this file is executable code that will run under the user.
if command -v curl >/dev/null 2>&1; then
  curl --fail --location --proto '=https' --tlsv1.2 "$BASE_URL/iadmin-terminal.py" --output "$tmp"
elif command -v wget >/dev/null 2>&1; then
  wget --https-only "$BASE_URL/iadmin-terminal.py" --output-document="$tmp"
else
  printf '%s\n' "curl or wget is required" >&2
  exit 1
fi

# Compilation catches truncated downloads and Python syntax errors before the
# file is copied into PATH. `install` also applies the executable mode in one
# atomic destination update.
python3 -m py_compile "$tmp"
install -m 0755 "$tmp" "$TARGET"
if [ "$WITH_CA" = "--with-local-ca" ]; then
  if ! command -v mkcert >/dev/null 2>&1; then
    printf '%s\n' "mkcert is required for --with-local-ca; install it, then rerun this installer." >&2
    exit 1
  fi
# Browsers refuse an insecure ws:// connection initiated by the public HTTPS
# site. mkcert creates a certificate for loopback names only and registers its
# local CA in this computer's trust store; the private key stays mode 0600.
  config="${XDG_CONFIG_HOME:-$HOME/.config}/iadmin-terminal"
  mkdir -p "$config"
  printf '%s\n' "mkcert will now install/trust its local CA and create a localhost certificate."
  mkcert -install
  mkcert -cert-file "$config/localhost.pem" -key-file "$config/localhost-key.pem" localhost 127.0.0.1 ::1
  chmod 0600 "$config/localhost-key.pem"
fi
printf '%s\n' "Installed: $TARGET"
printf '%s\n' "Local shell:  iadmin-terminal local"
printf '%s\n' "Remote shell: iadmin-terminal ssh user@example.org"
printf '%s\n' "HTTPS site:   rerun with --with-local-ca (requires mkcert)"
