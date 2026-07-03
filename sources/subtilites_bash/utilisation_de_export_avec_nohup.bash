#!/bin/bash

function ___manipulate_test_of_local_var_from_main ()
{
  echo "Notre PID:${$}  est bien différent de notre shell de départ"
  echo "Notre constante de départ à bien été exporté, son contenue est: ${_constante_locale}"
  echo "Notre variable de  départ à bien été exporté, son contenue est: ${_variable_locale}"
  echo "MAIS les proprités de lecture seul n'ont pas été conservé"
  echo "On peut aussi bien modifier LOCALEMENT _constante_locale que _variable_locale"
  _constante_locale="Une constante modifié !!!!!!!"
  _variable_locale="Une variable modifié"
  echo "Constante: ${_constante_locale}"
  echo "Variable: ${_variable_locale}"
  sleep 3
}

function main ()
{
  local -r _constante_locale="Constante"
  local _variable_locale="Variable"

  echo -e "\\tPID:${$}\\n\\tBASHPID:${BASHPID}\\n\\Constante: ${_constante_locale}\\n\\Variable: ${_variable_locale}"
  
  echo "On exporte la fonction et les variables utilisé par la fonction"
  echo "Attention, l'export effectue une copie, les variables ne sont pas partagées entre le shell et ses sous shell"
  export -f ___manipulate_test_of_local_var_from_main
  export _constante_locale
  export _variable_locale

  nohup bash -c ___manipulate_test_of_local_var_from_main &
  
  echo -e "\\tPID:${$}\\n\\tBASHPID:${BASHPID}\\n\\Constante: ${_constante_locale}\\n\\Variable: ${_variable_locale}"

  return 0
}

main "${@}"
exit 0

