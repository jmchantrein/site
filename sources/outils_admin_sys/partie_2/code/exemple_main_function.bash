#!/bin/bash
# Fonction qui affiche un message de bienvenue
afficher_bienvenue() {
    echo "Bienvenue dans ce script Bash!"
}
# Fonction qui calcule la somme de deux nombres
calculer_somme() {
    local a=$1
    local b=$2
    echo "La somme de $a et $b est $((a + b))"
}
# Fonction principale
main() {
    afficher_bienvenue
    calculer_somme 5 10
}
# Appel de la fonction main
main