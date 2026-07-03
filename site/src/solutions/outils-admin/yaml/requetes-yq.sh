#!/usr/bin/env bash
# Exercise 5 solution: query and edit livres.yaml with yq.
# NB: these commands use the PYTHON yq (the jq wrapper installed by
# `apt install yq` on Debian/Ubuntu) — see the course note about the
# two incompatible tools named "yq".
set -euo pipefail

# 1) Title of the second book (lists are 0-indexed: [1] is the 2nd).
yq -r '.livres[1].titre' livres.yaml

# 2) Titles ONLY of the books written by Aldous Huxley.
yq -r '.livres[] | select(.auteur == "Aldous Huxley") | .titre' livres.yaml

# 3) In-place edit: retitle "1984" to "2024" (-i edits the file, -y keeps
#    the output in YAML — without -y, -i would rewrite the file as JSON).
yq -yi '(.livres[] | select(.titre == "1984") | .titre) = "2024"' livres.yaml
