#!/bin/bash

function ___fonction ()
{
  local -r _var_fonction="_var_fonction"
  echo "_var_fonction= \"${_var_fonction}\" from ${FUNCNAME[0]}"
  echo "_var_main= \"${_var_main}\" from ${FUNCNAME[0]}"
  return 0
}

function main ()
{
  local -r _var_main="_var_main"
  ___fonction
  echo
  echo "_var_fonction= \"${_var_fonction}\" from ${FUNCNAME[0]}"
  echo "_var_main= \"${_var_main}\" from ${FUNCNAME[0]}"
  return 0
}

main "${@}"
exit 0
