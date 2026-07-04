#!/bin/bash
# Structuring a script with functions and a main() entry point.

# Prints a welcome message.
afficher_bienvenue() {
    echo "Bienvenue dans ce script Bash!"
}

# Computes and prints the sum of two numbers.
calculer_somme() {
    local a=$1
    local b=$2
    echo "La somme de $a et $b est $((a + b))"
}

# Main entry point: the script's flow reads top to bottom here.
main() {
    afficher_bienvenue
    calculer_somme 5 10
}

main "$@"
exit 0
