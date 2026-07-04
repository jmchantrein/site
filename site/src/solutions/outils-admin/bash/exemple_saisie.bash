#!/bin/bash
# Interactive input: read -r stores the user's answer in a variable
# (-r keeps backslashes literal — always use it).
echo "Entrez votre nom :"
read -r nom
echo "Bonjour, $nom!"
