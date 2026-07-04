#!/bin/bash
# Conditional test on a file: -d is true when the path is a directory.
if [ -d "/backup" ]; then
    echo "Le répertoire /backup existe"
else
    echo "Le répertoire /backup n'existe pas"
fi
