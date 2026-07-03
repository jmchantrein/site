#!/bin/bash

# Demande du répertoire à l'utilisateur
echo "Entrez le chemin du répertoire :"
read -r repertoire

# Vérifier si le répertoire existe
if [ -d "$repertoire" ]; then
    # Boucle pour afficher chaque fichier du répertoire
    for fichier in "$repertoire"/*; do
        if [ -f "$fichier" ]; then
            echo "Fichier : $fichier"
        fi
    done
else
    echo "Le répertoire $repertoire n'existe pas." >&2
    exit 1  # Code de retour 1 pour une erreur
fi

exit 0  # Code de retour 0 pour un succès