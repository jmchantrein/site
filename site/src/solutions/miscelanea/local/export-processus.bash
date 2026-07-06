#!/bin/bash
# A subshell ( … ) is a fork: it inherits EVERYTHING (locals included,
# readonly included). A NEW PROCESS (bash -c, nohup …) inherits nothing —
# unless you export. And export ships VALUES, not attributes: the
# readonly protection does NOT survive the trip.

# shellcheck disable=SC2317  # not unreachable: invoked via `bash -c` below
function ___dans_un_autre_processus ()
{
  echo "  nouveau processus : je vois « ${_constante} »"
  _constante="modifiée sans la moindre protestation"
  echo "  readonly perdu    : « ${_constante} »"
}

function main ()
{
  local -r _constante="en lecture seule ici"

  # Ship the function's text and the variable's VALUE to a child bash.
  export -f ___dans_un_autre_processus
  export _constante

  bash -c ___dans_un_autre_processus

  echo "main relit : « ${_constante} » (la copie d'origine, toujours readonly)"
  return 0
}

main "${@}"
exit 0
