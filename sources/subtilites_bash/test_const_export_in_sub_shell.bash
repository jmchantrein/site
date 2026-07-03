#!/bin/bash

function ___manipulate_test_of_local_var_from_main ()
{
  echo
  echo "Debut de la fonction ${FUNCNAME[0]}"
  echo -e "\\tPID:${$}\\n\\tBASHPID:${BASHPID}\\n\\tConstante: ${_constante_locale}\\n\\tVariable: ${_variable_locale}"
  echo "Notre constante de départ à bien été exporté, son contenue est: ${_constante_locale}"
  echo "Notre variable de  départ à bien été exporté, son contenue est: ${_variable_locale}"
#  _constante_locale="Impossible de modifié le constante dans un sous shell"
  _variable_locale="Une variable modifié"
  echo "Constante: ${_constante_locale}"
  echo "Variable: ${_variable_locale}"
  echo "Fin de la fonction ${FUNCNAME[0]}"
  echo
  return 0
}

function main ()
{
  local -r _constante_locale="Constante"
  local _variable_locale="Variable"

  echo -e "\\tPID:${$}\\n\\tBASHPID:${BASHPID}\\n\\tConstante: ${_constante_locale}\\n\\tVariable: ${_variable_locale}"

  echo "Appel de la fonction dans le même shell"
  ___manipulate_test_of_local_var_from_main  
  echo "La variable _variable_locale a été mofifié GLOBALEMENT (variable partagé)"
  echo "Variable: ${_variable_locale}"
  echo "On reinitialise la variable _variable_locale"
  _variable_locale="Variable"
  echo "Variable: ${_variable_locale}"
  echo
  echo "Appel de la fonction dans un sous shell"
  (___manipulate_test_of_local_var_from_main)
  echo -e "\\tPID:${$}\\n\\tBASHPID:${BASHPID}\\n\\Constante: ${_constante_locale}\\n\\Variable: ${_variable_locale}"
  echo "La variable _variable_locale a été mofifié LOCALEMENT à la fonction (variable exporté(copie par valeur))"

  return 0
}

main "${@}"
exit 0

