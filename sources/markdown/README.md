# Présentation du langage Markdown (rédigé en Markdown)

## Introduction au Markdown

Markdown est un langage de balisage léger qui permet de formater du texte en utilisant une syntaxe simple et lisible.
Il est couramment utilisé pour la documentation, les blogs, et les fichiers README sur GitHub.
L'objectif de Markdown est de rendre le texte aussi lisible que possible en format brut tout en permettant un formatage simple.
Le rendu sera différent en fonction du formatage choisit (github, html, pdf, ...).

[Lien vers la page wikipedia](https://fr.wikipedia.org/wiki/Markdown)

## Syntaxe de base

### Titres

Les titres sont créés en utilisant le symbole `#` suivi d'un espace. Le nombre de `#` détermine le niveau du titre.

```markdown
# Titre de niveau 1
## Titre de niveau 2
### Titre de niveau 3
#### Titre de niveau 4
##### Titre de niveau 5
###### Titre de niveau 6
```

## ***__Cela donne:__***

---

# Titre de niveau 1
## Titre de niveau 2
### Titre de niveau 3
#### Titre de niveau 4
##### Titre de niveau 5
###### Titre de niveau 6

---

### Texte en gras et en italique

Pour mettre du texte en **gras** ou en *italique*, vous pouvez utiliser des astérisques ou des underscores.

```markdown
**Ce texte est en gras**
__Ce texte est aussi en gras__

*Ce texte est en italique*
_Ce texte est aussi en italique_

***Ce texte est en gras et italique***
___Ce texte est aussi en gras et italique___
```

## ***__Cela donne:__***

---

**Ce texte est en gras**
__Ce texte est aussi en gras__

*Ce texte est en italique*
_Ce texte est aussi en italique_

***Ce texte est en gras et italique***
___Ce texte est aussi en gras et italique___

---

### Listes

#### Listes non ordonnées

Les listes non ordonnées sont créées en utilisant des tirets, des astérisques ou des plus.

```markdown
- Élément 1
- Élément 2
  - Sous-élément 1
  - Sous-élément 2

* Élément 1
* Élément 2
  * Sous-élément 1
  * Sous-élément 2

+ Élément 1
+ Élément 2
  + Sous-élément 1
  + Sous-élément 2
```

## ***__Cela donne:__***

---

- Élément 1
- Élément 2 
  - Sous-élément 1
  - Sous-élément 2


* Élément 1
* Élément 2 
  * Sous-élément 1
  * Sous-élément 2


+ Élément 1
+ Élément 2 
  + Sous-élément 1
  + Sous-élément 2

---

#### Listes ordonnées

Les listes ordonnées utilisent des nombres suivis d'un point.

```mardown
1. Premier élément
2. Deuxième élément
   1. Sous-élément 1
   2. Sous-élément 2
```

## ***__Cela donne:__***

---

1. Premier élément
2. Deuxième élément
   1. Sous-élément 1
   2. Sous-élément 2

---

### Liens

Les liens sont créés en utilisant des crochets pour le texte du lien et des parenthèses pour l'URL.

```mardown
[Lien vers wikipedia](https://wikipedia.fr)
```

## ***__Cela donne:__***

---

[Lien vers wikipedia](https://wikipedia.fr)

---

### Images

Les images sont insérées de manière similaire aux liens, mais en ajoutant un point d'exclamation au début.

```markdown
![Logo de wikipedia](https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png)
```

## ***__Cela donne:__***

---

![Logo de wikipedia](https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png)

---

### Citations

Les citations sont créées en utilisant le symbole `>`.

```markdown
> Ceci est une citation.
```

## ***__Cela donne:__***

---

> Ceci est une citation.

---

### Code

Pour inclure du code en ligne, utilisez des backticks. Pour des blocs de code, utilisez trois backticks.

#### Code en ligne

```markdown
Voici un exemple de code en ligne: `int a=2;`
```

## ***__Cela donne:__***

---

Voici un exemple de code en ligne: `int a=2;`

---

Blocs de code

````markdown
```bash
#!/bin/bash
echo "hello world !"
exit 0
```
````

***__Cela donne:__***

---

```bash
#!/bin/bash
echo "hello world !"
exit 0
```

---

### Tableaux

Les tableaux sont créés en utilisant des barres verticales et des tirets.

```markdown
| En-tête allignement à gauche | En-tête allignement milieu | En-tête allignement à droite |
|:------                       |:----:                      |-------:                      |
| C'est la ligne au            | dessus qui                 | gère l'allignement              |
| On n'est pas | obligé de bien placer  | les cellules ici |
| Elles seront tout | de même bien placé  | dans notre tableau de rendu |
```

## ***__Cela donne:__***

---

| En-tête allignement à gauche | En-tête allignement milieu | En-tête allignement à droite |
|:------                       |:----:                      |-------:                      |
| C'est la ligne au            | dessus qui                 | gère l'allignement              |
| On n'est pas | obligé de bien placer  | les cellules ici |
| Elles seront tout | de même bien placé  | dans notre tableau de rendu |

---

### Séparateurs

Les séparateurs sont créés en utilisant trois tirets, astérisques ou underscores.

```
---
***
___
```

***__Cela donne:__***

---
***
___
