#!/bin/bash
# `local -r` (readonly) survives the call: the called function SEES the
# constant but cannot modify it. Careful: a bare failed assignment does not
# just "fail" — it ABORTS the whole call stack (main's remaining commands
# included). Hence the ( … ) below: the abort stays contained in a subshell.

function ___tente_de_modifier ()
{
  echo "  je vois : « ${_constante} »"
  ( _constante="tentative de modification" ) \
    || echo "  modification refusée (l'erreur a avorté le sous-shell)"
}

function main ()
{
  local -r _constante="gravée dans main"

  echo "— appel direct (même shell) :"
  ___tente_de_modifier

  echo "— appel en sous-shell ( … ) :"
  ( ___tente_de_modifier )

  echo "main relit : « ${_constante} »"
  return 0
}

main "${@}"
exit 0
