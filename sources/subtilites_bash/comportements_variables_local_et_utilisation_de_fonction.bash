#!/bin/bash

function ___une_fonction_externe ()
{
  echo -e "\\tLa fonction ${FUNCNAME[0]} s'exécute dans un shell de PID: ${$} et de BASHPID: ${BASHPID}"
  echo -e "\\tAffichage de _ma_variable_locale_en_lecture_seul: ${_ma_variable_locale_en_lecture_seul}"
  echo -e "\\tLa variable _ma_variable_locale_en_lecture_seul s'affiche alors qu'elle était locale à la fonction main !!! C'est SURPRENANT."
  echo -e "\\tMais on ne peut quand même pas modifier _ma_variable_locale_en_lecture_seul ! Ça peut paraitre SURPRENANT."
#  _ma_variable_locale_en_lecture_seul="Tentative de modification"
  echo -e "\\tPar contre, on peut afficher et modifier GLOBALEMENT la variable _ma_variable_locale_standard !!! C'est TRES SURPRENANT."
  echo -e "\\tAffichage de _ma_variable_locale_standard avant modification: ${_ma_variable_locale_standard}"
  _ma_variable_locale_standard="Une modification dans ${FUNCNAME[0]}"
  echo -e "\\tAffichage de _ma_variable_locale_standard après modification: ${_ma_variable_locale_standard}"
  echo -e "\\tFin de la fonction ${FUNCNAME[0]}"
  return 0
}

function ___une_fonction_externe_dans_un_sous_shell ()
{
  echo -e "\\tLa fonction ${FUNCNAME[0]} s'exécute dans un shell de PID: ${$} et de BASHPID: ${BASHPID}"
  echo -e "\\tAffichage de _ma_variable_locale_en_lecture_seul: ${_ma_variable_locale_en_lecture_seul}"
  echo -e "\\tLa variable _ma_variable_locale_en_lecture_seul s'affiche alors qu'elle était locale à la fonction main !!! C'est SURPRENANT."
  echo -e "\\tMais on ne peut quand même pas modifier _ma_variable_locale_en_lecture_seul ! Ça peut paraitre SURPRENANT."
#  _ma_variable_locale_en_lecture_seul="Tentative de modification"
  echo -e "\\tPar contre, on peut afficher et modifier LOCALEMENT la variable _ma_variable_locale_standard !!! C'est TRES SURPRENANT."
  echo -e "\\tAffichage de _ma_variable_locale_standard avant modification: ${_ma_variable_locale_standard}"
  _ma_variable_locale_standard="Une modification dans ${FUNCNAME[0]}"
  echo -e "\\tAffichage de _ma_variable_locale_standard après modification: ${_ma_variable_locale_standard}"
  echo -e "\\tFin de la fonction ${FUNCNAME[0]}"
  return 0
}


function main()
{
  function ___une_fonction_imbrique ()
  {
    echo -e "\\tLa fonction ${FUNCNAME[1]} s'exécute dans un shell de PID: ${$} et de BASHPID: ${BASHPID}"
    echo -e "\\tAffichage de _ma_variable_locale_en_lecture_seul: ${_ma_variable_locale_en_lecture_seul}"
    echo -e "\\tLa variable _ma_variable_locale_en_lecture_seul s'affiche alors qu'elle était locale à la fonction main. C'est COHERENT"
    echo -e "\\tOn ne peut pas modifier _ma_variable_locale_en_lecture_seul alors car elle a été déclaré en read only (options -r). C'est NORMAL."
  #  _ma_variable_locale_en_lecture_seul="Tentative de modification"
    echo -e "\\tOn peut afficher et modifier la variable _ma_variable_locale_standard !!! C'est COHERENT."
    echo -e "\\tAffichage de _ma_variable_locale_standard avant modification: ${_ma_variable_locale_standard}"
    _ma_variable_locale_standard="Une modification dans ${FUNCNAME[0]}"
    echo -e "\\tAffichage de _ma_variable_locale_standard après modification: ${_ma_variable_locale_standard}"
    echo -e "\\tFin de la fonction ${FUNCNAME[0]}"
    return 0
  }

  function ___reset_ma_variable_locale_standard ()
  {
    echo
    echo "Nouvelle valeur pour la variable _ma_variable_locale_standard"
    _ma_variable_locale_standard="Nouvelle valeur"
    echo -e "Affichage de _ma_variable_locale_standard: ${_ma_variable_locale_standard}"
    echo
    return 0
  }

  echo "Dans tous les langages de programmation, il est déconseillé d'utiliser des variables globales: https://fr.wikipedia.org/wiki/Variable_globale#Avantages_et_inconv%C3%A9nients"
  echo "Mais en bash, il ne suffit pas de déclarer les variables localement pour qu'elles soient considérées comme tel !"
  echo "La preuve par l'exemple:"
  echo
  echo "La fonction ${FUNCNAME[0]} s'exécute dans un shell de PID: ${$} et de BASHPID: ${BASHPID}"
  local -r _ma_variable_locale_en_lecture_seul="C'est une constante"
  local _ma_variable_locale_standard="C'est une variable"
  echo "Affichage de _ma_variable_locale_en_lecture_seul: ${_ma_variable_locale_en_lecture_seul}"
  echo "Affichage de _ma_variable_locale_standard: ${_ma_variable_locale_standard}"
  echo
  echo "CAS 1: Appel de la fonction ___une_fonction_externe dans le même shell"
  ___une_fonction_externe
  echo "De retour dans la fonction ${FUNCNAME[0]}, voila le contenu de _ma_variable_locale_standard : ${_ma_variable_locale_standard}"
  echo "Les variables locales de la fonction ${FUNCNAME[0]} sont donc PARTAGÉ avec la fonction ___une_fonction_externe "

  ___reset_ma_variable_locale_standard

  echo "CAS 2: Appel de la fonction ___une_fonction_externe_dans_un_sous_shell"
  (___une_fonction_externe_dans_un_sous_shell)
  echo
  echo "De retour dans la fonction ${FUNCNAME[0]}, voila le contenu de _ma_variable_locale_standard : ${_ma_variable_locale_standard}"
  echo "Ce n'est pas le même comportement que dans le CAS1, les variables ont été EXPORTÉ IMPLICITEMENT (C'est une COPIE par valeur) mais les variables NE SONT PAS PARTAGÉ"
  echo "MAIS on CONSERVE la propriété de lecture seule des variables initialement déclarées en read only (l'export conserve les droits)"
  echo "Vous noterez aussi qu'il y a une difference entre la variable PID et la variable BASHPID"
  echo "En bash, c'est le cas lorsque l'on est dans un sous shell (et donc que les variables ne pas partagé)."
  echo "L'exécution d'un sous shell (PID identique avec le PID du shell appelant) est différent de l'exécution d'un autre script (nouveau PID différent du PID du shell appelant)."
  echo "Dans le premier cas, il y a un EXPORT IMPLICITE par copie de valeur des variables, MAIS PAS dans le second cas."
  echo "Dans le second cas, on peut exporter EXPLICITEMENT les variables avec le mot clé export, mais il faut éviter cela autant que l'usage des variables globales."
  
  ___reset_ma_variable_locale_standard

  echo "CAS 3: Le même exemple avec une fonction imbriquée (nested function) dans le même shell"
  ___une_fonction_imbrique
  echo
  echo "De retour dans la fonction ${FUNCNAME[0]}, voila le contenu de _ma_variable_locale_standard : ${_ma_variable_locale_standard}"
  echo "Avec une fonction imbriqué dans un sous shell, nous avons bien le comportement ambriqué, nested function) . Et la structure du code correspond à l'usage que l'on en fait."
  echo "N.B.: Si nous appelions la fonction imbriquée dans un sous shell, nous aurions le même problème que dans le cas 2, puisque les variables ne seraient PAS PARTAGÉ non plus"
  echo
  echo "Conclusions: Pour des fonctions qui doivent utiliser des variables déclarées localement à une fonction, il apparait préférable de déclarer \
ces fonctions LOCALEMENT à la fonction qui initialise les variables locales (fonction imbriqué, nested function). Cela permet une structure de code plus conforme au résultat attendu."
  echo "Dit autrement, il n'y a aucune raison que des fonctions externe manipulent des variables locale à une autre fonction."
  echo "Ce n'est pas parce que l'on peut le faire que l'on doit le faire"
  echo "Par contre, il apparait NECESSAIRE de connaître ce type de fonctionnement"
  return 0
}

main "${@}"
exit 0
