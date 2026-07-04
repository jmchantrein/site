# Artefacts de l'auteur

Déposez ici vos créations interactives fabriquées ailleurs (Claude
Design/artifacts, D3, export HTML autonome…) :

    public/artefacts/<nom>/index.html   (+ assets éventuels à côté)

Le fichier doit être AUTONOME (styles et scripts inlinés — idéalement
sans CDN). Intégration d'une ligne dans un cours MDX :

    <Artefact file="<nom>/index.html" title="Titre affiché" height={480} />

L'artefact tourne dans une iframe sandboxée : il n'accède ni à la page,
ni au localStorage du site.
