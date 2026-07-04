#!/bin/bash
# Exercise solution: list the files of a directory asked interactively,
# with a personalized message per file and meaningful exit codes.

# Ask the user for the directory.
echo "Entrez le chemin du répertoire :"
read -r repertoire

# The directory must exist.
if [ -d "$repertoire" ]; then
    # Print each regular file with a message.
    for fichier in "$repertoire"/*; do
        if [ -f "$fichier" ]; then
            echo "Fichier : $fichier"
        fi
    done
else
    echo "Le répertoire $repertoire n'existe pas." >&2
    exit 1  # Non-zero exit code: an error occurred.
fi

exit 0  # Zero exit code: success.
