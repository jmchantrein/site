/**
 * GLOSSAIRE ↔ WIKIPÉDIA — correspondances externes des entrées.
 *
 * Séparé de glossaire.mjs (source du maillage) pour garder chaque fichier
 * lisible. `fr` / `en` : titre de l'article Wikipédia dans chaque langue
 * (omis si aucun article fiable) ; `img` : nom du fichier Wikimedia Commons
 * du portrait (personnages), affiché via Special:FilePath.
 *
 * ⚠ EXCEPTION ASSUMÉE à la règle « aucune ressource externe au runtime »
 * (décision auteur, juillet 2026) : les portraits sont AFFICHÉS DEPUIS
 * Commons (pas de téléchargement dans le dépôt — licences et poids gérés
 * chez eux). Repli propre : si l'image ne charge pas (hors-ligne, fichier
 * renommé), la figure disparaît sans casser la page (gestion onerror).
 */

export const WIKI_IMG_BASE = "https://commons.wikimedia.org/wiki/Special:FilePath/";

/** @type {Record<string, {fr?: string, en?: string, img?: string}>} */
export const WIKI = {
  // Matériel & fondations
  bit: { fr: "Bit", en: "Bit" },
  octet: { fr: "Octet", en: "Byte" },
  binaire: { fr: "Système binaire", en: "Binary number" },
  processeur: { fr: "Processeur", en: "Central processing unit" },
  gpu: { fr: "Processeur graphique", en: "Graphics processing unit" },
  "memoire-vive": { fr: "Mémoire vive", en: "Random-access memory" },
  "memoire-morte": { fr: "Mémoire morte", en: "Read-only memory" },
  firmware: { fr: "Micrologiciel", en: "Firmware" },
  "carte-mere": { fr: "Carte mère", en: "Motherboard" },
  bus: { fr: "Bus informatique", en: "Bus (computing)" },
  "registre-cpu": { fr: "Registre de processeur", en: "Processor register" },
  cache: { fr: "Mémoire cache", en: "CPU cache" },
  peripherique: { fr: "Périphérique informatique", en: "Peripheral" },
  "architecture-von-neumann": { fr: "Architecture de von Neumann", en: "Von Neumann architecture" },
  supercalculateur: { fr: "Superordinateur", en: "Supercomputer" },
  vlsi: { fr: "Very Large Scale Integration", en: "Very-large-scale integration" },
  eniac: { fr: "ENIAC", en: "ENIAC" },
  arpanet: { fr: "ARPANET", en: "ARPANET" },
  // Système
  "systeme-exploitation": { fr: "Système d'exploitation", en: "Operating system" },
  noyau: { fr: "Noyau de système d'exploitation", en: "Kernel (operating system)" },
  pilote: { fr: "Pilote informatique", en: "Device driver" },
  "appel-systeme": { fr: "Appel système", en: "System call" },
  processus: { fr: "Processus (informatique)", en: "Process (computing)" },
  pid: { en: "Process identifier" },
  multitache: { fr: "Multitâche", en: "Computer multitasking" },
  chemin: { fr: "Chemin d'accès", en: "Path (computing)" },
  "repertoire-personnel": { fr: "Répertoire utilisateur", en: "Home directory" },
  root: { fr: "Superutilisateur", en: "Superuser" },
  droits: { fr: "Permissions UNIX", en: "File-system permissions" },
  shell: { fr: "Shell Unix", en: "Unix shell" },
  terminal: { fr: "Terminal (informatique)", en: "Computer terminal" },
  prompt: { fr: "Invite de commande", en: "Command-line interface" },
  script: { fr: "Langage de script", en: "Scripting language" },
  "variable-environnement": { fr: "Variable d'environnement", en: "Environment variable" },
  "lien-symbolique": { fr: "Lien symbolique", en: "Symbolic link" },
  joker: { en: "Glob (programming)" },
  "flux-standard": { fr: "Flux standard", en: "Standard streams" },
  pipe: { fr: "Tube (shell)", en: "Pipeline (Unix)" },
  shebang: { fr: "Shebang", en: "Shebang (Unix)" },
  cron: { fr: "Cron", en: "Cron" },
  montage: { fr: "Montage (informatique)", en: "Mount (computing)" },
  partition: { en: "Disk partitioning" },
  "systeme-fichiers": { fr: "Système de fichiers", en: "File system" },
  inode: { fr: "Inode", en: "Inode" },
  "gestionnaire-paquets": { fr: "Gestionnaire de paquets", en: "Package manager" },
  distribution: { fr: "Distribution Linux", en: "Linux distribution" },
  "logiciel-libre": { fr: "Logiciel libre", en: "Free software" },
  "open-source": { fr: "Open source", en: "Open source" },
  gnu: { fr: "GNU", en: "GNU" },
  unix: { fr: "Unix", en: "Unix" },
  linux: { fr: "Noyau Linux", en: "Linux kernel" },
  debian: { fr: "Debian", en: "Debian" },
  compilateur: { fr: "Compilateur", en: "Compiler" },
  assembleur: { fr: "Assembleur", en: "Assembly language" },
  bug: { fr: "Bug (informatique)", en: "Software bug" },
  snapshot: { fr: "Instantané (informatique)", en: "Snapshot (computer storage)" },
  // Virtualisation & conteneurs
  "machine-virtuelle": { fr: "Machine virtuelle", en: "Virtual machine" },
  hyperviseur: { fr: "Hyperviseur", en: "Hypervisor" },
  virtualisation: { fr: "Virtualisation", en: "Virtualization" },
  emulation: { fr: "Émulation", en: "Emulator" },
  conteneurisation: { en: "Containerization (computing)" },
  daemon: { fr: "Daemon (informatique)", en: "Daemon (computing)" },
  cgroups: { fr: "Cgroups", en: "Cgroups" },
  namespaces: { en: "Linux namespaces" },
  chroot: { fr: "Chroot", en: "Chroot" },
  oci: { en: "Open Container Initiative" },
  docker: { fr: "Docker (logiciel)", en: "Docker (software)" },
  podman: { en: "Podman" },
  lxc: { fr: "LXC", en: "LXC" },
  orchestrateur: { fr: "Orchestration (informatique)", en: "Orchestration (computing)" },
  kubernetes: { fr: "Kubernetes", en: "Kubernetes" },
  microservices: { fr: "Microservices", en: "Microservices" },
  cluster: { fr: "Grappe de serveurs", en: "Computer cluster" },
  kvm: { fr: "Kernel-based Virtual Machine", en: "Kernel-based Virtual Machine" },
  qemu: { fr: "QEMU", en: "QEMU" },
  libvirt: { fr: "Libvirt", en: "Libvirt" },
  // Réseau & accès distants
  ssh: { fr: "Secure Shell", en: "Secure Shell" },
  "cryptographie-asymetrique": { fr: "Cryptographie asymétrique", en: "Public-key cryptography" },
  vpn: { fr: "Réseau privé virtuel", en: "Virtual private network" },
  wireguard: { fr: "WireGuard", en: "WireGuard" },
  tunnel: { en: "Tunneling protocol" },
  "pare-feu": { fr: "Pare-feu (informatique)", en: "Firewall (computing)" },
  port: { fr: "Port (logiciel)", en: "Port (computer networking)" },
  "adresse-ip": { fr: "Adresse IP", en: "IP address" },
  nat: { fr: "Network address translation", en: "Network address translation" },
  dns: { fr: "Domain Name System", en: "Domain Name System" },
  protocole: { fr: "Protocole de communication", en: "Communication protocol" },
  "force-brute": { fr: "Attaque par force brute", en: "Brute-force attack" },
  "2fa": { fr: "Double authentification", en: "Multi-factor authentication" },
  hachage: { fr: "Fonction de hachage", en: "Hash function" },
  tmux: { fr: "Tmux", en: "Tmux" },
  // Données, versionnage, IaC
  markdown: { fr: "Markdown", en: "Markdown" },
  "langage-balisage": { fr: "Langage de balisage", en: "Markup language" },
  yaml: { fr: "YAML", en: "YAML" },
  json: { fr: "JavaScript Object Notation", en: "JSON" },
  xml: { fr: "Extensible Markup Language", en: "XML" },
  csv: { fr: "Comma-separated values", en: "Comma-separated values" },
  serialisation: { fr: "Sérialisation", en: "Serialization" },
  git: { fr: "Git", en: "Git" },
  branche: { en: "Branching (version control)" },
  depot: { en: "Repository (version control)" },
  merge: { en: "Merge (version control)" },
  ci: { fr: "Intégration continue", en: "Continuous integration" },
  ansible: { fr: "Ansible (logiciel)", en: "Ansible (software)" },
  idempotence: { fr: "Idempotence", en: "Idempotence" },
  iac: { fr: "Infrastructure as code", en: "Infrastructure as code" },
  linter: { en: "Lint (software)" },
  "test-unitaire": { fr: "Test unitaire", en: "Unit testing" },
  "expression-reguliere": { fr: "Expression régulière", en: "Regular expression" },
  bash: { fr: "Bash", en: "Bash (Unix shell)" },
  vim: { fr: "Vim", en: "Vim (text editor)" },
  sed: { fr: "Sed", en: "Sed" },
  awk: { fr: "Awk", en: "AWK" },
  devops: { fr: "DevOps", en: "DevOps" },
  jq: { en: "Jq (programming language)" },
  pandoc: { fr: "Pandoc", en: "Pandoc" },
  cloud: { fr: "Cloud computing", en: "Cloud computing" },
  // Personnages (portraits Commons — repli silencieux si absent)
  "ada-lovelace": { fr: "Ada Lovelace", en: "Ada Lovelace", img: "Ada_Lovelace_portrait.jpg" },
  "charles-babbage": { fr: "Charles Babbage", en: "Charles Babbage", img: "Charles_Babbage_-_1860.jpg" },
  "grace-hopper": { fr: "Grace Hopper", en: "Grace Hopper", img: "Commodore_Grace_M._Hopper,_USN_(covered).jpg" },
  "kathleen-booth": { fr: "Kathleen Booth", en: "Kathleen Booth" },
  "jean-bartik": { fr: "Jean Bartik", en: "Jean Bartik", img: "Jean_Bartik.jpg" },
  "betty-holberton": { fr: "Betty Holberton", en: "Betty Holberton", img: "Betty_Holberton.jpg" },
  "katherine-johnson": { fr: "Katherine Johnson", en: "Katherine Johnson", img: "Katherine_Johnson_1983.jpg" },
  "margaret-hamilton": { fr: "Margaret Hamilton (scientifique)", en: "Margaret Hamilton (software engineer)", img: "Margaret_Hamilton_-_restoration.jpg" },
  "lynn-conway": { fr: "Lynn Conway", en: "Lynn Conway", img: "Lynn_Conway_July_2006.jpg" },
  "radia-perlman": { fr: "Radia Perlman", en: "Radia Perlman", img: "Radia_Perlman_2009.jpg" },
  "elizabeth-feinler": { fr: "Elizabeth Feinler", en: "Elizabeth J. Feinler" },
  "alan-turing": { fr: "Alan Turing", en: "Alan Turing", img: "Alan_Turing_Aged_16.jpg" },
  "john-von-neumann": { fr: "John von Neumann", en: "John von Neumann", img: "JohnvonNeumann-LosAlamos.gif" },
  "linus-torvalds": { fr: "Linus Torvalds", en: "Linus Torvalds", img: "LinuxCon_Europe_Linus_Torvalds_03_(cropped).jpg" },
  "richard-stallman": { fr: "Richard Stallman", en: "Richard Stallman", img: "Richard_Stallman_-_Fête_de_l'Humanité_2014_-_010.jpg" },
  "dennis-ritchie": { fr: "Dennis Ritchie", en: "Dennis Ritchie", img: "Dennis_Ritchie_2011.jpg" },
  "ken-thompson": { fr: "Ken Thompson", en: "Ken Thompson", img: "Ken_Thompson_02.jpg" },
  "sophie-wilson": { fr: "Sophie Wilson", en: "Sophie Wilson", img: "Sophie_Wilson_(cropped).jpg" },
  "frances-allen": { fr: "Frances E. Allen", en: "Frances E. Allen", img: "Allen_mg_2528-3750K-b.jpg" },
  "solomon-hykes": { fr: "Solomon Hykes", en: "Solomon Hykes" },
};

/** URL de l'article Wikipédia d'une entrée, dans la locale demandée
    (repli sur l'autre langue si une seule existe). */
export function wikiUrl(slug, locale) {
  const w = WIKI[slug];
  if (!w) return undefined;
  const title = locale === "en" ? (w.en ?? w.fr) : (w.fr ?? w.en);
  if (!title) return undefined;
  const lang = locale === "en" ? (w.en ? "en" : "fr") : (w.fr ? "fr" : "en");
  return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
}

/** URL de la miniature Commons (portraits) — largeur bornée côté serveur. */
export function wikiImg(slug, width = 320) {
  const w = WIKI[slug];
  if (!w?.img) return undefined;
  return `${WIKI_IMG_BASE}${encodeURIComponent(w.img)}?width=${width}`;
}
