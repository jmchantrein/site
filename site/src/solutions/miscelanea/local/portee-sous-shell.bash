#!/bin/bash
# Same function, two execution contexts. Called directly, it SHARES the
# caller's locals (dynamic scoping). Called in a subshell ( … ), it works
# on a COPY: same PID ($$ is inherited), new BASHPID — the fork boundary
# is where sharing stops.

function ___visiteuse ()
{
  echo "  BASHPID=${BASHPID} : je vois « ${_locale} »"
  _locale="modifiée par ___visiteuse"
}

function main ()
{
  local _locale="déclarée dans main"
  echo "main : PID=${$}, BASHPID=${BASHPID}"

  echo "— appel direct (même shell) :"
  ___visiteuse
  echo "main relit : « ${_locale} »"

  _locale="déclarée dans main"

  echo "— appel en sous-shell ( … ) :"
  ( ___visiteuse )
  echo "main relit : « ${_locale} »"
  return 0
}

main "${@}"
exit 0
