#!/bin/bash
# Demander à l'utilisateur le répertoire source
echo "Entrez le répertoire source :"
read -r source
# Demander à l'utilisateur le répertoire destination
echo "Entrez le répertoire destination :"
read -r destination
# Vérifier si le répertoire source existe
if [ -d "$source" ]; then
    # Vérifier si le répertoire destination existe, sinon le créer
    if [ ! -d "$destination" ]; then
        echo "Le répertoire destination n'existe pas. Création de $destination."
        mkdir -p "$destination" || { echo "Erreur lors de la création du répertoire destination." >&2; exit 2; }
    fi
