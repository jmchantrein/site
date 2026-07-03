# Exercices basés sur le cours sur YAML et JSON

## Données nécéssaires pour les exercices :

- **Livre 1 :**
    - Titre : "1984"
    - Auteur : "George Orwell"
    - Année de publication : 1949
    - Genre : "Dystopie"
    - Mots-clés : ["dystopie", "politique", "science-fiction"]
- **Livre 2 :**
    - Titre : "Le meilleur des mondes"
    - Auteur : "Aldous Huxley"
    - Année de publication : 1932
    - Genre : "Dystopie"
    - Mots-clés : ["dystopie", "politique", "science-fiction"]
- **Livre 3 :**
    - Titre : "Les portes de la perception"
    - Auteur : "Aldous Huxley"
    - Année de publication : 1954
    - Genre : "Essai"
    - Mots-clés : ["philosophie", "perception", "science"]

- Données à utiliser seulement à partir de l'exercice 4:
  - Aldous Huxley est né en 1894
  - George Orwell est né en 1903
  - Ils sont tous les deux de nationalité britannique

## Consignes globales

  - Vos fichiers YAML doivent être validés avec *yamllint*.
  - Vous installerez `yq` et `yamllint` avec la commande `sudo apt update && sudo apt install yamllint yq`

## Exercice 1 : comprendre les bases de YAML

1. **Objectif :** Familiarisez-vous avec la syntaxe de base de YAML.
2. **Consigne :** Écrivez un fichier livre.yaml pour décrire le livre 1 avec les champs suivants : titre, auteur, année de publication, genre, et une liste de mots-clés.

## Exercice 2 : comprendre les bases de YAML

1. **Objectif :** Familiarisez-vous avec la syntaxe de base de YAML.
2. **Consigne :** Écrivez un fichier livres.yaml pour décrire les 3 livres avec les champs suivants : titre, auteur, année de publication, genre, et une liste de mots-clés.

## Exercice 3 : convertir YAML en JSON

1. **Objectif :** Pratiquez la conversion entre YAML et JSON.
2. **Consigne :** Convertissez le fichier YAML de l'exercice 2 en JSON.

## Exercice 4 : utilisation des types, des ancrages et alias en YAML

1. **Objectif :** Apprenez à utiliser les ancrages et les alias dans YAML.
2. **Consigne :** Le fichier livres.yaml que vous avez produit lors de l'exercice 2 contient de la redondance pour le champ *Auteur*, ainsi que pour le champ Mots-clés. 
Modifiez ce fichier de manière à éliminer la redondance en utilisant des ancrages et des alias.
Comme notre ensemble de livre contient majoritairement des livres de Aldous Huxley, vous partirez du principe que par défaut un auteur se nomme Aldous Huxley, née en 1894 et de nationalité britannique. La date de naissance sera typé explicitemment comme un entier.
Si nécéssaire, vous ferez une surcharge des informations non redondante si l'auteur d'un livre est différent.
Vous pouvez laisser la redondance sur les mots-clés.

## Exercice 5 : manipulation de fichiers avec `yq` et `jq`

1. **Objectif :** Pratiquez l'utilisation des outils `yq` et `jq` pour manipuler des fichiers YAML et JSON.
2. **Consigne :**
    - Utilisez `yq` pour extraire le titre du deuxième livre à partir de votre fichier YAML.
    - Utilisez `yq` pour extraire **uniquement le titre** des livres écrit par Aldous Huxley.
    - Utilisez `yq` pour modifier "in-place" le titre du livre 1984 en 2024.

