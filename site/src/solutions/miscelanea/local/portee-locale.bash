#!/bin/bash
# `local` does NOT mean "local to the function": Bash uses DYNAMIC scoping —
# a local variable is visible (and writable!) in every function CALLED from
# the one that declared it, all the way down the call stack.

function ___visiteuse ()
{
  echo "  ___visiteuse voit : « ${_locale} »"
  _locale="modifiée par ___visiteuse"
}

function main ()
{
  local _locale="déclarée dans main"
  ___visiteuse
  echo "de retour dans main : « ${_locale} »"
  return 0
}

main "${@}"
exit 0
