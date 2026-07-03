# Sources — « les subtilités de bash »

Scripts d'exploration de Jean-Mathieu Chantrein : portée dynamique de
`local` (visibilité/modification des locales dans les fonctions
appelées, `local -r`), sous-shell vs nouveau processus (`$$` vs
`BASHPID`, héritage par fork), `export -f` + `nohup` (perte de
l'attribut readonly), et mémo quoting/expansions.

Destination : deux articles Miscelánea (voir
`../../docs/plan-integration-outils-admin-sys.md`, § 10.3). Attention :
`memo_expansion_variable.sh` reprend une table issue de StackOverflow
(CC BY-SA 4.0, incompatible avec le BY-NC-SA du site) — à réécrire avec
des exemples originaux avant publication. `nohup.out` est un artefact
de sortie conservé pour référence.
