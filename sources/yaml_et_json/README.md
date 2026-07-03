# Présentation du langage YAML et du format de données JSON

Dans cette présentation, nous verrons une brève introduction sur le langage YAML et le format de données JSON, avec une attention particulière sur YAML.

## YAML en bref

Dans sa version initiale *YAML* signifie *Yet Another Markup Language* (*Encore un autre langage de balisage*).
Dans la version 1.1, l'acronyme devient récursif et signifie YAML Ain't Markup Language (YAML n'est pas un langage de balisage).

Cette évolution montre une contradiction apparente : YAML est un langage qui vise à avoir les propriétés d'un langage de balisage sans en être un.

**YAML est un langage** de sérialisation de données conçu pour être facilement lisible et modifiable par l'humain. Il est souvent utilisé pour les fichiers de configuration et des scripts de déploiement. YAML peut représenter des structures de données complexes.

Caractéristiques principales de YAML :

  - Syntaxe flexible : Utilise des indentations pour représenter la hiérarchie, des tirets - pour les listes, et des deux-points : pour les paires clé-valeur.
  - Commentaires : Supporte les commentaires avec le symbole #.
  - Alias et ancrages : Permet de réutiliser des blocs de données avec les ancrages (&) et les alias (*).
  - Usage principal : Fichiers de configuration, scripts DevOps, et autres scénarios nécessitant une configuration facile à lire et à écrire.

## JSON en bref

*JSON* est un acronyme qui signifie *JavaScript Object Notation*. JSON est un **format de données** basé sur un sous-ensemble de la notation d'objets du langage *JavaScript*.

Il est principalement utilisé pour échanger des données entre un serveur et une application web, et/ou pour stocker des informations de configuration ou des structures de données simples et complexes. JSON est apprécié pour sa simplicité et sa compatibilité avec de nombreux langages de programmation.

Caractéristiques principales de JSON :

  - Syntaxe stricte : Utilise des accolades {}, des crochets [], des guillemets doubles "" pour les chaînes de caractères, et des deux-points : pour séparer les clés et les valeurs.
  - Types de données : Supporte les chaînes, les nombres, les booléens, les tableaux, les objets et les valeurs nulles.
  - Usage principal : Échange de données entre applications web, APIs, et stockage de configurations simples.

## Langages vs format de données, peut-on vraiment les comparer ?

Il n'est pas habituel de comparer un langage avec un format de données puisqu'il s'agit de deux concepts différents. Toutefois, pour certains types de langages et formats de données, cette comparaison peut être pertinente car ils peuvent être utilisés de manière interchangeable dans certains contextes pratiques, par exemple :

  - la rédaction de fichiers de configurations
  - la sérialisation de données
  - le transfert de données

**Principales différences entre ces différentes notions:**

| Critère                    | Langage                           | Format de Données                    |
|----------------------------|-----------------------------------|--------------------------------------|
| **Définition**             | Ensemble de règles et de syntaxe pour écrire des instructions ou des descriptions compréhensibles par les machines | Structure spécifique pour organiser et stocker des informations afin qu'elles puissent être facilement lues, transmises et traitées |
| **Exemples**               | XML, YAML                         | JSON, CSV                            |
| **Utilisation principale** | Programmation, configuration, mise en page de documents, communication entre systèmes | Échange de données entre applications, stockage de configurations simples, sérialisation des objets |
| **Syntaxe et Grammaire**   | Définit des règles strictes sur la manière dont les données doivent être écrites et interprétées | Utilise des conventions simples pour organiser les données |
| **Lisibilité**             | Conçu pour être facilement compréhensible par les humains (ex. : YAML, XML) | Peut être moins lisible pour les humains, mais optimisé pour les machines (ex. : JSON, CSV) |
| **Fonctionnalités avancées** | Peut inclure des fonctionnalités telles que les alias, les références, les commentaires, et les déclarations de types | Généralement plus simple, sans fonctionnalités avancées comme les commentaires ou les références |
| **Flexibilité**            | Très flexible, permet des structures complexes et détaillées | Moins flexible, adapté à des structures de données plus simples |
| **Compatibilité et Portabilité** | Peut nécessiter des outils spécifiques pour l'analyse et la manipulation | Facilement lisible et manipulable par de nombreux langages de programmation et outils |
| **Exemples d'utilisation** | Fichiers de configuration complexes, scripts de déploiement, documents structurés | Échange de données rapide, stockage tabulaire, interopérabilité entre systèmes |

## Sérialisation

D'après [wikipedia](https://fr.wikipedia.org/wiki/S%C3%A9rialisation):

> "La sérialisation (de l'anglais américain serialization, aussi appelé marshalling) est le codage d'une information sous la forme d'une suite d'informations plus petites [...] pour, par exemple, sa sauvegarde (persistance) ou son transport sur le réseau (proxy, RPC…). L'activité réciproque, visant à décoder cette suite pour créer une copie conforme de l'information d'origine, s'appelle la désérialisation (ou unmarshalling)." 

On peut donc se servir de la sérialisation pour par exemple:

  - faire persister dans la mémoire de masse des objets d'un langage objet (comme C++)
    - cela est particulièrement utile pour conserver des états d'un programme lors de son arrêt et de pouvoir les récupérer au redémarrage.
  - Egalement, on peut échanger à travers le réseau des objets sérialisés entre différentes instances d'un même programme (par exemple, un jeu vidéo multijoueur en ligne).

A noter que dans le cas du C++, on pourra sérialiser nos objets en format binaire, ce qui permettra un excellent moyen de compression et permettra aussi donc d'échanger plus rapidemment les données sur un réseau. Cependant, l'inconvénient de mécanisme est que des données ainsi stockés sont illisible pour un être humain, et que seul le programme ou une personne ayant accès au code source du programme est en mesure de pouvoir redonner un caractère humainement lisible à ces informations.

YAML et JSON sont tous les deux considérés comme des langages de sérialisation (ils peuvent en faire, mais ils ne se limitent pas qu'à cela). Ils ont pour énorme avantage d'éviter l'éceuil décrit ci dessus. Avec un fichier texte simple, et une syntaxe de langage humainement lisible, il n' y a pas besoin du programme pour avoir accès aux données sérialisées. A noter qu'il est possible de chiffrer les fichiers ainsi obtenu s'il y a un besoin de confidentialité lors de la transmission sur le réseau.

## Qu'est ce qu'un langage de balisage ?

Un [langage de balisage](https://fr.wikipedia.org/wiki/Langage_de_balisage) est un langage qui permet d'enrichir des informations textuelles.
Par exemple, le HTML est un langage de balisage qui permet d'inclure la forme du document en plus du fond.

Le code html suivant:

```html
<h1>Titre de niveau 1</h1>
<p>Paragraphe 1</p>
```

aura un rendu similaire à celui-ci:

---

# Titre de niveau 1

Paragraphe 1

---

On voit donc que la balise:

  - *h1* représente la mise en forme de ce que doit être un titre de niveau 1
  - *p* représente la mise en forme de ce que doit être un paragraphe

Ici, les balises sont spécifiés par une ouverture et une fermeture de balise.
Mais ce n'est pas nécéssairement le cas, par exemple, le langage mardown n'utilise pas ce concept de basile ouvrante/fermante et l'exemple ci dessus en markdonw devient:

```markdown
# Titre de niveau 1

Paragrahe 1 
```

Dans ce cas, c'est le saut de ligne qui fait office de balise pour un nouveau paragraphe.

Il y a beaucoup de langage de balise ( d'où le "Encore un autre langage de balisage" ), on peut noter par exemple dans les plus connues:

  - HTML, XHTML
  - XML
  - Latex
  - SVG
  - Markdown
  - ...

Et voici quelques langages qui ne sont pas des langages de balisages: 

  - CSS
  - YAML
  - ... 

## Quelques éléments de comparaisons entre YAML, JSON, XML et CSV

YAML reprend des concepts du langage de balisage XML. YAML a pour objectif de représenter des données de manières plus complexes que ce que serait capable de faire le format de fichier CSV, qui n'est pas un langage.
JSON n'est pas un langage non plus, mais il est a considérer comme un format de données concurrent au langage YAML.

Voici un exemple qui permet d'illuster les différences de représentation de données entre CSV, XML, JSON et YAML

En CSV:

```csv
nom,age,rue,ville,hobby1,hobby2,hobby3
John Doe,30,123 Main St,Paris,lecture,course,voyage
```

En XML:

```xml
<personne>
  <nom>John Doe</nom>
  <age>30</age>
  <adresse>
    <rue>123 Main St</rue>
    <ville>Paris</ville>
  </adresse>
  <hobbies>
    <hobby>lecture</hobby>
    <hobby>course</hobby>
    <hobby>voyage</hobby>
  </hobbies>
</personne>
```

En JSON:

```json
{
  "personne": {
    "nom": "John Doe",
    "age": 30,
    "adresse": {
      "rue": "123 Main St",
      "ville": "Paris"
    },
    "hobbies": [
      "lecture",
      "course",
      "voyage"
    ]
  }
}
```

En YAML:

```yaml
personne:
  nom: John Doe
  age: 30
  adresse:
    rue: 123 Main St
    ville: Paris
  hobbies:
    - lecture
    - course
    - voyage
```

  - Il n'y a pas de notion de hiérarchie de l'information en CSV
    - on ne spécifie pas qu'une adresse doit être composé d'une rue et d'une ville
    - on doit prévoir un nombre prédéfinie de hobby (hobby1, hobby2, hobby3)
      - Quid de la personne qui aura un nombre de passion différent de 3 ?
  - Pour les 3 langages, il y a bien cette notion de hiérarchie
    - Le XML est verbeux (donc lourd en volumétrie) et peu lisible
    - le JSON est moins verbeux que le XML mais il n'est pas confortable à lire non plus
    - le YAML n'est pas verbeux, il est très lisible, c'est l'indentation qui structure la hiérarchie du document
      - 1 inconvénient à cela est que l'on ne peut pas transmettre la données sur 1 seule ligne, car on perdrait toute la notion de hiérarchie de l'information
      - alors que les exemples suivants sont toujours correct en XML et en JSON

En XML:

```xml
<personne><nom>John Doe</nom><age>30</age><adresse><rue>123 Main St</rue><ville>Paris</ville></adresse><hobbies><hobby>lecture</hobby><hobby>course</hobby><hobby>voyage</hobby></hobbies></personne>
```

En JSON:

```json
{"personne":{"nom":"John Doe","age":30,"adresse":{"rue":"123 Main St","ville":"Paris"},"hobbies":["lecture","course","voyage"]}}
```

## Tableau récapitulatif de comparaison

| Critère                     | JSON   | YAML   | XML    | CSV   |
|-----------------------------|--------|--------|--------|-------|
| **Lisibilité (déplié)**     | 4/5    | 5/5    | 3/5    | 2/5   |
| **Absence de verbosité**    | 3/5    | 5/5    | 2/5    | 4/5   |
| **Structure de données**    | Oui    | Oui    | Oui    | Non   |
| **Déclaration de types**    | Oui    | Oui    | Oui    | Non   |
| **Commentaire**             | Non    | Oui    | Oui    | Non   |
| **Indentation obligatoire** | Non    | Oui    | Non    | Non   |
| **Support des alias**       | Non    | Oui    | Non    | Non   |
| **Outils de validation**    | Oui    | Oui    | Oui    | Non   |

## YAML est il un sur-ensemble de JSON ?

Il est souvent considéré que YAML est un sur-ensemble de JSON. Ou bien que JSON est un sous ensemble du langage YAML, comme vous préférez.
Cela signifierait que:

  - tout ce qui est exprimé en JSON peut être traduit en langage YAML
  - une partie seulement de ce qui est exprimé en langage YAML peut-être traduit en JSON

Il apparait que les choses ne sont pas si simple et que l'on ne peut pas considéré stricto sensu que YAML soit un sur-ensemble de JSON, voir [cet article](https://metacpan.org/pod/JSON::XS#JSON-and-YAML) par exemple.

Mais en pratique, dans la plupart des cas, YAML se trouve être un sur-ensemble de JSON. Il existe d'ailleurs beaucoup de convertisseur de JSON vers YAML et inversement. Or une conversion YAML vers JSON ne devrait pas être systématiquement possible. En effet, prenez par exemple, la notion de commentaire qui existe en YAML mais qui n'existe pas en JSON. Comment pourrait-on donc traduire cette notion de YAML vers JSON ? Ces convertisseurs ne le font pas, ils traduisent ce qu'ils sont capables de traduire, et dans le cas des commentaires, cela n'a pas d'incidence puisque les commentaires ne sont ... que des commentaires. Dans la plupart des cas d'usage (commentaires mis à part), on peut obtenir une symétrie de ce qui exprimé en YAML en JSON.

Plus d'informations à propos de cette notion de sur-ensemble [ici](https://yaml.org/spec/1.2-old/spec.html#id2759572)

Un exemple de convertisseur [ici](https://onlineyamltools.com/convert-yaml-to-json)

## Cas d'usage

| Cas d'usage                      | YAML                           | JSON                |
|----------------------------      |--------------------------------|---------------------|
| **Fichiers de configuration**    | Oui (Très lisible, flexible)   | Oui (plus verbeux)  |
| **Configurations complexes**     | Oui                            | Non                 |
| **Échange de données**           | Oui mais lent                  | Oui, rapide         |
| **Déploiement d'infrastructure** | Oui                            | Non                 |
| **Sérialisation des objets**     | Oui                            | Oui                 |
| **Scripts DevOps**               | Oui                            | Non                 |
| **Interopérabilité**             | Oui                            | Oui                 |
| **Commentaires**                 | Oui                            | Non                 |

En résumé:

  - YAML est un langage permettant une interraction avec un être humain (Ansible, Docker-compose, Kubernetes, Traefik, ...)
  - JSON est un format de données qui est optimisé pour un traitement efficace par des machines (Sérialisation, transport, quasiment un standard pour les APIs web)

## Syntaxes

### Exemple globale en YAML et sa conversion en JSON

En yaml:

```yaml
---
# Voici un commentaire en Yaml, les --- ci dessus permettent de délimiter plusieurs "documents" dans un seul fichier
# Généralement, il y a toujours --- en début de fichier même si il n' y a pas besoin de délimiter d'autres "documents" dans le même fichier
# Notez que les commentaires n'apparaissent pas dans l'équivalent en json ci dessous
# car il n'y a pas de commentaire en json
# Les fichiers YAML sont composés de paires clé-valeur 
# séparées par un deux-points (:) suivi d'un espace
cle0: valeur zero
# Notez qu'il peut y avoir un espace dans la clé (mais je le déconseille) 
# et que la valeur peut être explicitemment mise entre guillemet
cle 1: "valeur un"
# L'indentation est utilisée pour représenter la hiérarchie.
# Il faut utiliser des espaces, jamais de tabulations.
# Ci dessous, un dictionnaire (ou tableau associatif, ou map), qui est une collection de paire de clé-valeur 
cle2:
  cle3: valeur3
  cle4: valeur4
# Ci dessous, une séquence (ou liste) qui est une collection ordonnée d'éléments
liste1:
  - o1
  - o2
  - o3
# Attention au Cas particulier de l'indention qui ne change rien entre liste1 et liste2
# Les 2 syntaxe sont valables (bien que je préconise la première avec l'indentation
liste2:
- o1
- o2
# On peut aussi déclarer une liste aussi comme cela, c'est ok
liste3: [o1, o3]
# On peut inclure des structures json directement dans du YAML
"du json dans du yaml": {"ok":"on peut faire ça"}

et reprendre en yaml: voilà
```

Voilà la conversion de l'exemple ci dessus en JSON:

```json
{
  "cle0": "valeur zero",
  "cle 1": "valeur un",
  "cle2": {
    "cle3": "valeur3",
    "cle4": "valeur4"
  },
  "liste1": [
    "o1",
    "o2",
    "o3"
  ],
  "liste2": [
    "o1",
    "o2"
  ],
  "liste3": [
    "o1",
    "o3"
  ],
  "du json dans du yaml": {
    "ok": "on peut faire ça"
  },
  "et reprendre en yaml": "voilà"
}
```

### Principales différences de syntaxe entre YAML et JSON

Voici les principales différences de syntaxe entre YAML et JSON :

1. **Clés et Valeurs** :
   - **YAML** : Les paires clé-valeur sont écrites en texte brut, séparées par des deux-points `:` et un espace. Il n'y a pas besoin de guillemets pour les clés ou les valeurs.
   - **JSON** : Les paires clé-valeur sont entourées d'accolades `{}`, et chaque clé et valeur est entourée de guillemets doubles `"`. Les paires sont séparées par des virgules.

2. **Espaces et Indentations** :
   - **YAML** : Utilise l'indentation pour délimiter les niveaux hiérarchiques. Les indentations sont significatives et doivent être cohérentes.
   - **JSON** : Utilise des accolades `{}` pour délimiter les objets et des crochets `[]` pour les tableaux. Les indentations ne sont pas significatives mais sont souvent utilisées pour améliorer la lisibilité.

3. **Listes** :
   - **YAML** : Les éléments de liste sont précédés par un tiret `-` et un espace, sans besoin de crochets ni de virgules.
   - **JSON** : Les éléments de liste sont entourés de crochets `[]` et séparés par des virgules.

4. **Dictionnaires** :
   - **YAML** : Les dictionnaires sont définis par des paires clé-valeur sans accolade, avec des indentations pour montrer les niveaux hiérarchiques.
   - **JSON** : Les dictionnaires sont entourés d'accolades `{}`, et chaque paire clé-valeur est séparée par une virgule.

5. **Listes** :
   - **YAML** : Utilise des tirets `-` pour définir des listes, avec une indentation pour les éléments imbriqués.
   - **JSON** : Utilise des crochets `[]` pour définir des séquences.

6. **Chaînes de Caractères sur Plusieurs Lignes** :
   - **YAML** : Les chaînes de caractères sur plusieurs lignes peuvent être écrites en utilisant un caractère spécial (`|` ou `>`) pour indiquer que le contenu continue sur la ligne suivante.
   - **JSON** : Les chaînes de caractères sur plusieurs lignes doivent utiliser des caractères d'échappement (`\n`) pour représenter les retours à la ligne.

7. **Commentaires** :
   - **YAML** : Supporte les commentaires, qui commencent par un symbole `#`.
   - **JSON** : Ne supporte pas les commentaires nativement.

8. **Ancrages et Alias** :
   - **YAML** : Supporte les ancrages (`&`) pour définir un bloc de données et les alias (`*`) pour réutiliser ce bloc de données ailleurs dans le document.
   - **JSON** : Ne supporte pas les ancrages et les alias nativement.

9. **Types de Données** :
   - **YAML** : Supporte les mêmes types de données que JSON, mais permet aussi des types personnalisés et implicites, offrant plus de flexibilité dans la déclaration des types.
   - **JSON** : Supporte les chaînes, les nombres, les booléens, les tableaux, les objets et les valeurs nulles.

## YAML dans le détail

```yaml
# Exemple de YAML sans type explicite

# Clés et valeurs
nom: Alice
age: 30

# Espaces et indentations
adresse:
  rue: 123 Main St
  ville: Paris

# Listes
fruits:
  - pomme
  - banane
  - orange

# Dictionnaire (ou map, ou tableau associatif)
personne:
  nom: Alice
  age: 30

# Listes (ou séquences)
couleurs:
  - rouge
  - vert
  - bleu

# Dictionnaire imbriqués
équipe:
  - nom: Alice
    role: développeuse
  - nom: Bob
    role: designer

# Ancrages et alias
par défaut: &defaut
  couleur: bleu
  taille: M

# Surcharge de la clé taille
objet1:
  <<: *defaut
  taille: L

# Pas de surcharge de clé
objet2:
  <<: *defaut

# Chaînes de caractères sur plusieurs lignes
message: |
  Ceci est une chaîne
  sur plusieurs lignes.

# Nombres
entier: 42
flottant: 3.14

# Booléens
# Fonctionne avec True, true, yes, on mais pas un entier positif pour le booléen VRAI
# Fonctionne avec False, false, no, off mais pas avec 0 pour le booléen FAUX
actif: true

# Valeur null
non_defini: null
ou_bien: ~

```
On peut reprendre ce même exemple en explicitant tous les types (mais on pourrait choisir d'en expliciter qu'une partie):

```yaml
# Exemple de YAML avec des types explicites

# Chaîne de caractères
nom: !!str "Alice"

# Nombre entier
age: !!int 30

# Nombre flottant
poids: !!float 72.5

# Booléen
actif: !!bool true

# Null
adresse: !!null null

# Liste (séquences) de chaînes de caractères
fruits: !!seq
  - !!str "pomme"
  - !!str "banane"
  - !!str "orange"

# Map
personne: !!map
  nom: !!str "John Doe"
  age: !!int 30

# Map imbriqué par des séquences
équipe: !!seq
  - !!map
    nom: !!str "Alice"
    role: !!str "développeuse"
  - !!map
    nom: !!str "Bob"
    role: !!str "designer"

# Ancrages et alias avec types explicites
par défaut: &defaut !!map
  couleur: !!str "bleu"
  taille: !!str "M"

objet1: !!map
  <<: *defaut
  taille: !!str "L"

objet2: !!map
  <<: *defaut

# Chaîne de caractères sur plusieurs lignes
message: !!str |
  Ceci est une chaîne
  sur plusieurs lignes.

# Liste d'éléments mixtes avec types explicites
divers: !!seq
  - !!int 123
  - !!float 45.67
  - !!str "texte"
  - !!bool false

```

## *yq* et *jq*: des outils de traitement des fichiers YAML et JSON


`yq` (Yaml Query) et `jq`(Json Query)  sont deux outils de ligne de commande puissants conçus pour manipuler des fichiers de données structurées, spécifiquement YAML pour `yq` et JSON pour `jq`. `yq` et `jq` permettent tous deux d'extraire, de filtrer et de modifier des données de manière déclarative, en utilisant des commandes CLI.
`yq` est une surcouche à `jq`. `yq` convertit un fichier yaml en json et utilise ensuite jq et sa syntaxe pour faire des traitements dessus.
La plupart des options de `jq` sont valables dans `yq`, autrement dit si on sait se servir de `jq`, on sait globalement se servir de `yq` et inversement.

### Exemples simples

Soit le fichier de configuration `config.yaml` suivant :

```yaml
application:
  nom: MonApplication
  version: 1.2.3
  environnements:
    production:
      url: https://production.monapplication.com
    developpement:
      url: http://dev.monapplication.local
```

Par défaut, un simple appel à `yq` affichera une conversion du fichier en json :

```sh
user@laptop:~$ yq . config.yaml
{
  "application": {
    "nom": "MonApplication",
    "version": "1.2.3",
    "environnements": {
      "production": {
        "url": "https://production.monapplication.com"
      },
      "developpement": {
        "url": "http://dev.monapplication.local"
      }
    }
  }
}
```
Si on veut la sortie en yaml, il suffit d'utiliser l'option -y de `yq`.

On va afficher l'URL de l'environnement de production:

```sh
user@laptop:~$ yq '.application.environnements.production.url' config.yaml
"https://production.monapplication.com"
```
Comme `yq` fait appel à `jq` par la suite, la commande suivante correspond exactement à la même chose:

```sh
user@laptop:~$ yq . config.yaml | jq '.application.environnements.production.url'
"https://production.monapplication.com"
```
Pour que les guillemets double n'apparaissent pas dans la sortie, on peut utiliser l'option -r de `yq` ou de `jq`

Si je veux maintenant modifier la valeur de la version de MonApplication, je peux procéder comme cela:

```sh
user@laptop:~$ yq '.application.version = "1.2.4"' config.yaml
{
  "application": {
    "nom": "MonApplication",
    "version": "1.2.4",
    "environnements": {
      "production": {
        "url": "https://production.monapplication.com"
      },
      "developpement": {
        "url": "http://dev.monapplication.local"
      }
    }
  }
}
```

Mais **attention**, seule la sortie contient la modification, pas le fichier `config.yaml` (fonctionnement similaire à sed).
Si je veux que la modification se fasse directement dans le fichier (inplace ), je dois utiliser l'option -i mais alors il faut aussi que j'active l'option -y puisque mon fichier de base est en yaml, et non pas en json.

```sh
user@laptop:~$ yq -yi '.application.version = "1.2.4"' config.yaml
user@laptop:~$ cat config.yaml
application:
  nom: MonApplication
  version: 1.2.4
  environnements:
    production:
      url: https://production.monapplication.com
    developpement:
      url: http://dev.monapplication.local
```

## Se servir de YAML pour faire du déploiement d'infrastructure

L'exemple suivant nous permet de comprendre que l'on pourrait se servir de YAML pour définir des configurations qui pourraient être déployés sur un ensemble de machine:

```yaml
---
command:
  - bash
  - c
  - |
  #!/bin/bash

  echo hello world

  exit 0
# Fin de l'exemple qui permettrait d'exécuter un script
```

Chacun pourrait faire des "scripts" YAML de ce type, chacun dans son coin pour gérer des infrastructure en tant que code (Infrastructure As A Code, IAAS), mais il se trouve qu'un outil dédié à cela a été créé, ce qui permet de normaliser et de ne pas réinventer la roue pour chacune des briques logicielles d'une infrastructure.
Cet outil doit faire l'objet d'un cours dédié, il s'agit d'Ansible.


## Ressources

<https://www.bairesdev.com/tools/json2yaml/>

<https://www.youtube.com/watch?v=1uFVr15xDGg>

<https://www.youtube.com/watch?v=7gmW6vxgsRQ>
