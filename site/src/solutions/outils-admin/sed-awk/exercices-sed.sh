#!/bin/bash
# sed exercise solutions — every command reads data/pionnieres.csv or
# data/services.conf and writes to standard output (no file changed),
# except the in-place exercise which works on a COPY.
set -euo pipefail
cd "$(dirname "$0")"

# 1) Substitution: write the domain "materiel" with its accent.
sed 's/materiel/matériel/' data/pionnieres.csv

# 2) Deletion: print the file without its header line.
sed '1d' data/pionnieres.csv

# 3) Insertion: add a title line before line 1.
sed '1i # Pionnières de l'"'"'informatique' data/pionnieres.csv

# 4) In-place edit (on a copy!): silence every autostart.
cp data/services.conf /tmp/services.conf
sed -i 's/autostart = yes/autostart = no/' /tmp/services.conf
grep -c 'autostart = no' /tmp/services.conf   # expect: 3

# 5) Capture groups: swap "Nom Prénom" into "Prénom Nom".
#    \1 = family name, \2 = first name, kept through the substitution.
sed -E 's/^([^ ;]+) ([^;]+);/\2 \1;/' data/pionnieres.csv

# 6) Alternative separator: no escaping needed for paths with ",".
sed 's,^port = 0,port = disabled,' data/services.conf
