    # Copier les fichiers
    cp -r "$source"/* "$destination"/ || { echo "Erreur lors de la copie des fichiers." >&2; exit 3; }
    # Message de confirmation
    echo "Les fichiers ont été copiés de $source vers $destination."
else
    echo "Le répertoire source $source n'existe pas." >&2
    exit 1  # Code de retour 1 si le répertoire source n'existe pas
fi
exit 0  # Code de retour 0 pour un succès