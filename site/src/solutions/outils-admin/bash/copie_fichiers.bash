#!/bin/bash
# Exercise solution: copy the files of a source directory into a
# destination directory (both asked interactively), creating the
# destination when needed — with distinct exit codes per failure.

# Ask for the source directory.
echo "Entrez le répertoire source :"
read -r source
# Ask for the destination directory.
echo "Entrez le répertoire destination :"
read -r destination

# The source must exist.
if [ -d "$source" ]; then
    # Create the destination when missing.
    if [ ! -d "$destination" ]; then
        echo "Le répertoire destination n'existe pas. Création de $destination."
        mkdir -p "$destination" || { echo "Erreur lors de la création du répertoire destination." >&2; exit 2; }
    fi
    # Copy the files.
    cp -r "$source"/* "$destination"/ || { echo "Erreur lors de la copie des fichiers." >&2; exit 3; }
    echo "Les fichiers ont été copiés de $source vers $destination."
else
    echo "Le répertoire source $source n'existe pas." >&2
    exit 1
fi

exit 0
