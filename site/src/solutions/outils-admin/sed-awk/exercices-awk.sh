#!/bin/bash
# awk exercise solutions — data/pionnieres.csv uses ";" as separator:
# -F';' sets the input field separator.
set -euo pipefail
cd "$(dirname "$0")"

# 1) Print name and year only (columns 1 and 2), without the header.
awk -F';' 'NR > 1 { print $1, $2 }' data/pionnieres.csv

# 2) Numeric filter: contributions strictly before 1970.
#    NOTE the comparison against the NUMBER 1970 — quoting it ("1970")
#    would trigger a string comparison and wrong results.
awk -F';' 'NR > 1 && $2 < 1970 { print $1, $2 }' data/pionnieres.csv

# 3) Sum a column: total of the years (a checksum-style exercise).
awk -F';' 'NR > 1 { somme += $2 } END { print "Total :", somme }' data/pionnieres.csv

# 4) Group and count with an associative array: entries per domain.
awk -F';' 'NR > 1 { n[$3]++ } END { for (d in n) print d, n[d] }' data/pionnieres.csv \
  | sort

# 5) Regex filter: lines whose contribution mentions a "premier ...".
awk -F';' '$4 ~ /premier/ { print $1, "—", $4 }' data/pionnieres.csv

# 6) Reformat with OFS: a tab-separated name/domain extract.
awk -F';' -v OFS='\t' 'NR > 1 { print $1, $3 }' data/pionnieres.csv
