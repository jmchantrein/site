[comment]: <> (DEBUT CORRECTION)

[comment]: <> ( Notes d'utilisation du fichier: )
[comment]: <> (   - Les corrections sont faites entre 2 "balises" de "commentaires" DEBUT CORRECTION et FIN CORRECTION )
[comment]: <> (   - On peut générer les énoncés sans donner les corrections en faisant la commande suivante: ) 
[comment]: <> ( ) 
[comment]: <> ( cat notes.md | sed "/.*(DEBUT CORRECTION)$/,/.*(FIN CORRECTION)$/d" ) 
[comment]: <> ( ) 
[comment]: <> (   - On peut générer les corrections sans les énoncés en faisant la commande suivante: ) 
[comment]: <> ( ) 
[comment]: <> ( cat notes.md | sed -n "/.*(DEBUT CORRECTION)$/,/.*(FIN CORRECTION)$/p" ) 

[comment]: <> (FIN CORRECTION)


# Prérequis control_node

  - Faire une paire de clé ssh sur son vps de type KVM
  - Ajouter la clé publique du KVM dans starwars:/home/loginENT/.ssh/autorized_keys
  - tester une connexion ssh depuis KVM vers starwars
  - renommer le hostname kvm en control_node
  - Installer les paquets ansible, ansible-lint, python3-pip, vim, sshfs, shellcheck
  - Faire un répertoire starwars:~/ansible et control_node:/etc/ansible
  - Faire un montage sshfs de starwars:~/ansible dans control_node:/etc/ansible
  - Faire persister le montage au démarrage du VPS de type KVM avec /etc/fstab
  - Editer le fichier /root/.vimrc de manière à avoir les numéro de ligne, la coloration syntaxique et une indentation automatique de 2 espaces sans tabultation
  - Faire un snapshot de la VM: kvm.snapshot

``` bash
# A faire dans le fichier /etc/fstab pour faire persister le montage
# Montage de starwars:~/ansible dans /etc/ansible
sshfs#loginEnt@starwars:ansible /etc/ansible fuse defaults,_netdev,allow_other 0 0
```

[comment]: <> (DEBUT CORRECTION)
``` vimrc
" tabstop permet de définir qu'une tabulation doit correspondre à 2 espaces
set ts=2

" softtabstop donne l'impression que les espaces sont des tabulations
set sts=2

" Sets the shift width to 2, making shift operations (<< or >>)
set sw=2

" La touche TAB remplacera \t par ts espace
set expandtab

" Coloration syntaxique
syntax on

" Active l'indentation automatique
filetype indent plugin on

" Affiche les numéros de lignes
set number
```
[comment]: <> (FIN CORRECTION)


# Prérequis managed_node

  - Ajouter la clé publique de control_node dans managed_node:~/.ssh/autorisez_keys
  - N'essayez pas de changer son hostname, vous ne pouvez pas le faire

# Prérequis à la réalisation du tp

Pour la réalisation de ce tp, pour tout ce qui concerne ansible, vous irez chercher l'information directement à la source, c'est à dire dans la documentation officielle de ansible: https://docs.ansible.com/users.html

# Configuration de control_node

## Faire un fichier de configuration /etc/ansible/ansible.cfg

  - Faites un fichier de configuration /etc/ansible/ansible.cfg qui doit indiquer que le ou les fichiers d'inventaires se trouveront dans /etc/ansible/inventory
  - N'hésitez pas à ajouter en fin de /root/.bashrc des commandes vous facilitant le travail au quotidien (alias, fonction, positionnement dans le répertoire de travail /etc/ansible dès l'ouverture de session, ...).

[comment]: <> (DEBUT CORRECTION)
```ini
[defaults]
inventory=/etc/ansible/inventory
```

``` bash
cd /etc/ansible # Pour être dans le répertoire de travail dès la connexion
alias ansible='cd /etc/ansible; ansible'`
alias ansible-playbooks='cd /etc/ansible; ansible-playbooks'`
```
[comment]: <> (FIN CORRECTION)

## Faire un inventaire

``` bash
cd /etc/ansible
mkdir group_vars host_vars inventory roles
cd inventory
vim hosts.yaml
```

``` yaml
all:
  hosts:
    managed_node:
      ansible_host: 10.20.CC.DD
```
  - Tester que l'on arrive bien à joindre managed_node avec `ansible managed_node -m ping`
  - Ajouter un groupe mon_groupe dans lequel il y aura managed_node et starwars
    - /!\ Pour starwars, il faudra surcharger la variable ansible_user qui est par défaut à root, or vous n'êtes pas root sur starwars 
  - Tester que l'on arrive bien à joindre **toutes** les machines de *mon_groupe* avec 
`ansible mon_groupe -m ping`

[comment]: <> (DEBUT CORRECTION)
``` yaml
all:
  hosts:
    managed_node:
      ansible_host: 10.20.250.1

mon_groupe:
  hosts:
    managed_node:
    starwars:
      ansible_host: 10.20.0.1
      ansible_user: loginENT
```
[comment]: <> (FIN CORRECTION)


## Se faire un environement de travail avec tmux

  - sur *starwars*, ouvrir une session *tmux*
    - renommer la fenêtre courante en CONTROL_NODE
      - splitter la fenêtre courante en 2 panneaux verticaux (panel) dans lesquels il faut:
        - se connecter en ssh sur le VPS KVM Control-node
        - se placer dans le répertoire de travail /etc/ansible
        - faire une commande clear pour avoir le panneau complètement vide à l'initialisation
    - créer une nouvelle fenêtre, la renommer en *MANAGED_NODE* et procéder de la même manière que pour la fenêtre *CONTROL_NODE* mais placer vous par défaut à la racine du système de fichier
    - créer une troisième fenêtre, la renommer *STARWARS:NOTES.MD*
      - splitter la fenêtre courante en 2 panneaux verticaux (panel) dans lesquels il faut:
        - Se placer dans le répertoire ~/ansible
      - Dans le panneau de gauche uniquement et avec *Vim* ouvrir un fichier *notes.md* dans lequel vous prendrez des notes et vous écrirez les réponses des exercices de ce TP. 

### "Péréniser" son environnement de travail avec *tmuxp*

  - Déclarez l'environnement de travail ci dessus avec *tmuxp* (on part du principe que KVM et LXC seront déjà démarrés et joignables)
  - Grâce à cela vous pourrez retrouver votre environnement de travail lorsque *starwars* sera rédémarré ou lorsque vous supprimez de manière non intentionel votre session *tmux*
  - Tuez la session tmux en cours et vérifier que vous pouvez "récupérer" une session équivalente via *tmuxp*

[comment]: <> (DEBUT CORRECTION)
``` bash 
cd
mkdir .tmuxp
cat .tmuxp/admin.yaml
```

``` yaml
session_name: ADMIN
windows:
- window_name: CONTROL_NODE
  layout: even-horizontal
  shell_command_before:
      - cd
      - kvm.connect
  panes:
    - focus: true
      shell_command:
      - cd /etc/ansible
      - clear
    - shell_command:
      - cd /etc/ansible
      - clear
- window_name: MANAGED_NODE
  layout: even-horizontal
  shell_command_before:
      - cd 
      - lxc.connect
  panes:
    - focus: true
      shell_command:
      - cd /
      - clear
    - shell_command:
      - cd /
      - clear
- window_name: STARWARS:NOTES.MD
  layout: even-horizontal
  start_directory: ~/ansible
  panes:
    - focus: true
      shell_command:
      - clear
      - vim notes.md
    - shell_command:
      - clear
```

``` bash
tmux list-sessions
ADMIN: 3 windows (created Wed Oct  9 10:27:51 2024) (attached)
tmux kill-session -t ADMIN
tmuxp load admin
```
[comment]: <> (FIN CORRECTION)

## Faire un playbook

  - Dans le répertoire /etc/ansible, créer le fichier hello_world.yml qui a pour **tache (task)** de faire un ping sur **l'ensemble** des noeuds managé. (module *ping*)
  - Tester le playbook avec la commande `ansible-playbook hello_world.yml`
  - Ajouter une task qui affiche le message "hello world" avec le module *debug*
  - Tester le playbook

[comment]: <> (DEBUT CORRECTION)
``` yaml
- name: My first play
  hosts: all
  tasks:
   - name: Ping my hosts
     ansible.builtin.ping:
```
[comment]: <> (FIN CORRECTION)

## Manipuler des variables

  - Déclarer une variable *welcome_msg* dans:
    - host_vars/managed_node
    - group_vars/all.yaml
    - la variable doit contenir:
      - "Bonjour le monde from host_vars"  dans host_vars 
      - "Bonjour le monde from group_vars" dans group_vars 
  - Modifier hello_world.yaml de manière à afficher le contenu de la variable welcome_msg
  - Que constatez vous ? Voir [https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#understanding-variable-precedence](comment sont gérées les variables dans ansible)
  - Faire en sorte que ce soit la variable *welcome_msg* de group_vars qui prennent le dessus ?

[comment]: <> (DEBUT CORRECTION)
``` yaml
   - name: Print message
     ansible.builtin.debug:
       msg: "{{ welcome }}"
```
[comment]: <> (FIN CORRECTION)

### Utiliser les faits ansible (*ansible-facts*)

  - Utiliser le module *setup* pour voir quelles sont les *ansible-facts* pour un noeud managé. 
  - Trouver un moyen pour convertir la sortie de la question ci dessus en *yaml*
  - Trouver le *ansible-facts* qui contient la distribution des noeuds managés
  - Ajouter une task à hello_world.yml permettant:
    - d'afficher le hostname des noeuds managés avec le module *debug*
    - d'afficher toute les variables *ansible-facts* des noeuds managés en utilisant le module *setup* et en enregistrant la sortie dans une variable *all_ansible_facts*
    - d'afficher la distribution des noeuds managés en utilisant le module *setup* et en enregistrant la sortie dans une variable *distribution_ansible_facts*

[comment]: <> (DEBUT CORRECTION)
``` yaml
   - name: Affiche le hostname
     ansible.builtin.debug:
       msg: {{ ansible_hostname }}"

   - name: Recupérer tout les facts
     ansible.builtin.setup:
       gather_subset:
         - 'all'
     register: all_ansible_facts

   - name: Récupérer les distributions
     ansible.builtin.setup:
       filter:
         - 'ansible_distribution'
     register: distribution_ansible_facts
   
   - name: Afficher tout les facts
     ansible.builtin.debug:
       msg: "{{ all_ansible_facts }}"
   
   - name: Afficher uniquement les distributions
     ansible.builtin.debug:
       msg: "{{ distribution_ansible_facts.ansible_facts.ansible_distribution }}"
```
[comment]: <> (FIN CORRECTION)

## Utiliser un linter (ansible-lint), un shellchecker (shellcheck) et un outil de versionning (git)

  - Faire la commande `ansible-lint hello-world.yaml`
  - Editer avec *Vim* un fichier 'mes_fonctions.bash' qui sera sourcé automatiquement à l'initialisation de votre terminal
  - Placez y une fonction `___remove_trailing_space` qui prendra un ficher comme argument et qui supprimera les espaces non nécéssaires
  - Ne pas hésiter à placer d'autres fonctions dans ce fichier au fur et à mesure de l'avancé du tp:
    - si vous devez faire une action régulièrement, cela mérite certainement d'écrire une fonction
    - le fait de préfixé vos fonctions par *___* permet de voir l'ensemble de vos fonctions lorsque vous faites *___[TAB]*
  - Respecter l'indentation préconisé par ansible-lint
  - Faire en sorte de ne plus avoir de message d'erreur ni de warning
  - initialiser un dépôt git dans /etc/ansible
    - Ajoutez vos fichiers à l'index
    - Faire un premier commit de tous vos fichiers (vous ferez ensuite régulièrement des commits au fur et à mesure de l'avancement du tp)
    - Ajouter un hook pour obliger l'usage de shellcheck de tous les fichiers \*.bash avant un commit
    - Ajouter un hook pour obliger l'usage de ansible-lint pour tous les fichiers ansible avant un commit

[comment]: <> (DEBUT CORRECTION)
*mes_fonctions.bash*
``` bash
function ___remove_trailing_space ()
{
  local fichier="${1}"
  if [[ ! -f "${fichier}" ]]; then
    echo "Le fichier \"${fichier}\" n'existe pas" >&2
    return 1
  fi

  sed -i 's/[ \t]*$//' "${fichier}"

  return 0
}
```

*.git/hooks/pre-commit:*
``` bash
#!/bin/bash

# Ce script n'est pas adapté pour des projets conséquents qui contiendraient
# de nombreux fichiers bash et yaml. je vous laisse d'abord réfléchir à pourquoi
# en lisant le script. Vous trouverez l'explication en commentaire en fin de script

# Fonction pour vérifier le résultat d'une commande de linting
function check_result () {
  local result="${1}"
  local outil="${2}"

  if [[ "${result}" -gt 0 ]]; then
    echo "Il y a un ou plusieurs fichiers qui ne sont pas validés par ${outil}"
    echo "Corrigez ces fichiers avant de faire ce commit"
    return 1  # Retourne 1 si une erreur est détectée
  fi

  return 0  # Retourne 0 si pas d'erreurs
}

# Fonction principale (main)
function main() {
  local project_root
  local exit_status=0  # Variable locale pour accumuler les erreurs

  # Permet d'obtenir la racine du répertoire de travail de git
  # Le script est donc en mesure de s'adapter à d'autres environnement
  # Ce qui n'aurait pas été le cas si nous avions mis le chemin en dur
  project_root=$(git rev-parse --show-toplevel)

  # Vérification des fichiers bash et shell
  find "$project_root" -type f \( -name "*.bash" -o -name "*.sh" \) -exec shellcheck {} \;
  check_result $? "shellcheck" || exit_status=1

  # Vérification des fichiers Ansible
  find "$project_root" -type f \( -name "*.yaml" -o -name "*.yml" \) -exec ansible-lint {} \;
  check_result $? "ansible-lint" || exit_status=1

  # Retourne le statut final (0 si tout est OK, 1 s'il y a des erreurs)
  return $exit_status
}

# Exécute la fonction main et sort avec le code de retour approprié
main
exit $?

# Explication à la question posé en commentaire en début de script
# Il vaudrait mieux faire un script utilisant la commande 
# git diff --cached --name-only --diff-filter=ACM
# plutôt que la commande find. En effet, la commande git  ne nous renverra
# que les fichiers ayant été modifiés et les linters ne travailleront donc que 
# sur ceux-ci plutôt que sur tous les fichiers comme le fait la commande find.
# Je vous laisse le soin de rédiger un tel script.
```
[comment]: <> (FIN CORRECTION)

## Idempotence

**Pour cette section, exceptionnellement, vous n'utiliserez pas ansible-lint tant que cela ne sera pas explicitement demandé.**

L'idempotence est une propriété d'une action qui peut être répétée plusieurs fois sans changer le résultat après la première exécution. Si vous exécutez une tâche idempotente plusieurs fois, elle doit toujours produire le même effet, même si elle a déjà été effectuée auparavant.

Dans le cadre d'Ansible, cela signifie que si vous appliquez un playbook plusieurs fois, l'état final de votre système sera (devrait être) toujours le même, que le playbook ait été exécuté une seule fois ou plusieurs fois.

  - Avec *Vim*, écrire un nouveau playbook nommé *install-common-software.yaml*
	- Celui-ci doit installé une liste de paquet commun à tous vos noeuds managé, il y aura donc au moins les packages *htop*, *ncdu* et *vim*. L'installation se fera via le module apt.
  - Exécuter le playbook.
  - Observer la sortie
  - Reexécuter le playbook, observer la sortie
  - Que constatez vous ?


[comment]: <> (DEBUT CORRECTION)
``` yaml
---
- name: Install-common-software
  hosts: managed_node
  tasks:
    - name: Installation des paquets communs
      ansible.builtin.apt:
        name:
          - htop
          - ncdu
          - vim
```

L'installation ne se fait qu'une seule fois. Ansible ne réinstalle pas les paquets si ceux ci ont déjà étaient installées.

[comment]: <> (FIN CORRECTION)

---

  - Avec *Vim*, écrire un nouveau playbook nommé *write_hello_world.yaml*
	- Celui-ci doit: 
		- permettre de créer le fichier */hello* et d'écrire la chaine de caractère "hello" dans le fichier et dans vos noeuds managé. Vous utiliserez le module *shell* pour cela.
	  - permettre de créer le fichier */world* et d'écrire la chaine de caractère "world" dans le fichier et dans vos noeuds managé. Vous utiliserez le module *command* pour cela.
  - Exécuter le playbook.
  - Observer la sortie
  - Reexécuter le playbook, observer la sortie
  - Que constatez vous ?
  - Imaginez que vous ayez utilisé par erreur ">>" dans vos commandes, pourrait-on donc alors considérer que ansible est idempotent dans ce cas précis ?

[comment]: <> (DEBUT CORRECTION)

``` yaml
---
- name: Write hello-world
  hosts: managed_node
  tasks:
    - name: Shell module write hello world
      ansible.builtin.shell: |
        echo hello > /hello
    - name: Command module write hello world
      ansible.builtin.command: "python3 -c \"with open('/world', 'w') as f: f.write('world\\n')\""
```

Le playbook est reexécuter à chaque lancement, alors qu'il ne devrait pas puisqu'il n'y a pas de changements entre chaque lancement. Même si le résultat est identique, cela casse l'idempotence, ne serait ce parce que cela change la date de dernière modification du fichier alors qu'il n'y a pas eu de modification en réalité.

Aussi, au premier lancement il y a création d'un fichier, et dans les lancements ultérieurs, il y a modification d'un fichier existant.

On s'apercoit que l'utilisation du module command n'est pas du tout approprié et que l'on est obligé de trouver une solution de contournement en passant par python (ou autres) puisque l'on ne peut pas utiliser les outils classique de redirections de flux.

Pour le module shell, si on fait une erreur de syntaxe et que l'on utilise '>>', le fichier contiendra autant d'occurence de hello que de lancement du playbook. L'idempotence est cassé dans ce cas là.

Qu'il s'agisse du module shell ou cmd, il faut proscrire l'utilisation de ces modules autant que possible, il y a bien souvent un module qui permet de réaliser les tâches de manière bien plus efficace et en ayant la garantie de conserver l'idempotence.

[comment]: <> (FIN CORRECTION)

---

  - Toujours dans le même playbook, proposer une alternative qui utilise un autre module que *shell* et *cmd*. Vous ferez cette fois un fichier */hello_world* qui contiendra la chaine de caractère "Hello world !"
  - Exécuter le playbook.
  - Observer la sortie
  - Reexécuter le playbook une minute après, observer la sortie
  - Observer les dates de modifications des fichiers hello, world et hello_world
  - Que constatez vous ?

[comment]: <> (DEBUT CORRECTION)

``` yaml
    - name: Lineinfile module write hello world
      ansible.builtin.lineinfile:
        path: /hello_world
        line: "Hello world !"
        state: present
        create: yes
```

On utilise le module lineinfile qui est approprié dans notre cas.
On voit que la réexécution du playbook ne modifie pas le fichier s'il n'y a pas besoin de le modifier. Aucune action n'est donc faite s'il n'y a pas nécéssité d'en faire et l'idempotence est garantie: le noeud managé est dans l'état décrit par le playbook. On doit indiquer explicitemment s'il faut créer le fichier s'il n'existe pas, ce qui est une vérification supplémentaire que ce que l'on fait est bien ce que l'on veut faire (et aussi que l'on se trompe pas de fichier (par exemple /ect/sshdconfig n'existe pas et il n'y a pas de raison de le créer, c'est juste une erreur, il s'agit en réalité du fichier /etc/ssh/sshd_config qui lui existe bien)

[comment]: <> (FIN CORRECTION)

---

  - Linter le playbook et suivez les recommandations de ansible-lint qui vous permette de conserver l'idempotence de ansible.
  - Utiliser *git* de manière à ce qu'il n'y ait plus rien à ajouter ni à commiter sur votre branche principale. Vous devriez faire 2 commit (1 pour l'installation des paquets, 1 pour l'écriture des fichiers *hello*, *world*, et *hello_world*.

[comment]: <> (DEBUT CORRECTION)

no-changed-when: Commands should not change things if nothing needs doing.
Les commandes ne doivent pas modifier les choses si rien n'est à faire.

Cela fait référence au nombre d'action *changed* en synthèse de sortie de *ansible-playbook*. Il faut donc se prémunir de faire des changements en modifiant le code, par exemple, en disant que l'on ne doit faire l'action que si le fichier n'existe pas. Mais cela va être limitant si vous devez modifier la ligne dans le fichier, ce qui ne sera pas le cas avec l'utilisation du module *lineinfile*.


``` yaml
---
- name: Write hello-world
  hosts: managed_node
  tasks:
    - name: Vérifie si le fichier /hello existe
      ansible.builtin.stat:
        path: /hello
      register: hello_file
    - name: Shell module write hello world
      ansible.builtin.shell: |
        echo hello > /hello
      when: not hello_file.stat.exists
      changed_when: not hello_file.stat.exists
    - name: Vérifie si le fichier /world existe
      ansible.builtin.stat:
        path: /world
      register: world_file
    - name: Command module write hello world
      ansible.builtin.command: "python3 -c \"with open('/world', 'w') as f: f.write('world\\n')\""
      when: not world_file.stat.exists
      changed_when: not world_file.stat.exists
    - name: Lineinfile module write hello world
      ansible.builtin.lineinfile:
        path: /hello_world
        line: "Hello world !"
        state: present
        create: true
        mode: "0644"
```
[comment]: <> (FIN CORRECTION)

---

  - Ajouter *state: latest* à *install-common-software.yaml* pour l'installation des paquets
  - Linter le fichier
  - Pourquoi *package-latest: Package installs should not use latest.* ?
  - Si on est sur de ce que l'on fait, est-il possible d'outrepasser certaines règles d'*ansible-lint* ?
  - Même question pour *shellcheck* ?

[comment]: <> (DEBUT CORRECTION)

Latest pose problème a ansible-lint puisque cela remet en cause l'idempotence.
En effet, l'installation de la dernière version paquet nécéssite la mise à jour de l'index de tous les paquets (*apt update*).
Aussi, il est considéré comme une bonne pratique d'indiquer en dur (via une variable) la version du paquet que l'on souhaite utiliser, et de mettre à jour cette information au moment voulu.
Toutefois, dans certaines situations, il est légitime de préciser latest, et dans ce cas, il est possible d'ignorer certaines erreurs ansible-lint en les mettant dans un fichier *.ansible-lint* et en mettant le numéro des erreurs que vous souhaitez ignorer.

``` yaml
skip_list:
  - '403'
```

Pour shellcheck, on peut procéder de la manière suivante:

```
#!/bin/bash

PHRASE="Hello world this is a test"

# Désactiver l'avertissement SC2048 car on veut itérer sur chaque mot de la phrase
# shellcheck disable=SC2048
for WORD in ${PHRASE}; do
  echo "${WORD}"
done
```
[comment]: <> (FIN CORRECTION)



##  Rôles ansible

### Ecrire un rôle *nginx_hello_world*

 En respectant les **bonnes pratiques Ansible**, vous devez écrire un rôle qui: 
  - installe nginx
  - permet d'afficher le message "Hello world !" à la racine de l'arborescence du site web (vous utiliserez le module *copy* pour cela)

  - invoquez ce rôle depuis un playbook nommé *site-web.yml*
  - exécutez ce playbook sur un groupe *web_server* qui contiendra *managed_node*
  - vérifiez que la page web s'affiche correctement
  - Définissez une variable *nginx_hello_world_port* par défaut qui utilisera maintenant le port 8080 pour nginx (au lieu du port 80), cela sera définit dans le répertoire *default* du rôle
  - Modifiez le fichier de configuration de nginx qui utilisera la variable *nginx_hello_world_port* (vous utiliserez la notion de *handlers*et de *template* pour cela
    - Dans le template, vous utilisez en début de fichier le commentaire *# {{ ansible_managed }}* 
  - Repassez votre playbook
    - Allez voir par quoi a été remplacé la variable *{{ ansible_managed}}*
    - Faites en sorte de modifier le message par défaut par "Ce fichier est géré par ansible, ne le modifiez pas localement car vos modifications seront perdues"
  - Repassez votre playbook
    - Vérifiez que le message de *ansible_managed* a bien été remplacé
    - Vérifiez que votre site n'est plus accessible depuis l'URL externe
    - Vérifiez que votre site est accessible via http://AAA.BBB.CCC.DDD:8080 avec *wget* ou *curl* (vous remplacerez AAA.BBB.CCC.DDD par l'adresse IP de votre noeud managé (LXC)
  - Surchargez la variable *nginx_hello_world_port* en lui affectant de nouveau le port 80
  - Relancez le playbook et vérifier que votre site est de nouveau accessible depuis l'URL externe
  - Quel est l'intérêt de *notify* et des *handlers* ?

[comment]: <> (DEBUT CORRECTION)
```bash
mkdir -p /etc/ansible/roles/nginx_hello_world/{tasks,files,handlers,templates,defaults}
touch /etc/ansible/roles/nginx_hello_world/{tasks,files,handlers,templates,defaults}/main.yml
```

roles/nginx_hello_world/files/index.html:
```html
<h1>Hello World!</h1>
```

roles/nginx_hello_world/tasks/main.yml:
```yaml
---
- name: Installation du paquet nginx
  ansible.builtin.apt:
    name: nginx
    state: present

- name: Affichez la page Hello World!
  ansible.builtin.copy:
    src: index.html
    dest: /var/www/html
    owner: www-data
    group: www-data
    mode: "0744"

- name: Utilisez le port nginx_hello_world_port
  ansible.builtin.template:
    src: etc_nginx_sites_available_default.j2
    dest: /etc/nginx/sites-available/default
    mode: "0644"
  notify: "Redemarrer nginx"
```

roles/nginx_hello_world/handlers/main.yml:
```yaml
---
- name: "Redemarrer nginx"
  ansible.builtin.service:
    name: nginx
    state: restarted
```

roles/nginx_hello_world/default/main.yml:
```yaml
---
nginx_hello_world_port: 8080
```

roles/nginx_hello_world/templates/etc_nginx_sites_available_default.j2:
```jinja
# {{ ansible_managed }}

server {
        listen {{ nginx_hello_world_port }} default_server;
        listen [::]:{{ nginx_hello_world_port }} default_server;

        root /var/www/html;

        index index.html index.htm index.nginx-debian.html;

        server_name _;

        location / {
                try_files $uri $uri/ =404;
        }
}

```

  - Notez le comportement de la variable *ansible_managed* sur *managed_node*. Comment faire pour changer le message ?
  - `wget AAA.BBB.CCC.DDD:8080` permet de récupérer le fichier *index.html*

/etc/ansible/site-web.yml:
```yaml
---
- name: Installation des serveurs web de l'infrastructure
  hosts: web_server
  tasks:
    - name: Déployer le rôle nginx_hello_world
      ansible.builtin.import_role:
        name: nginx_hello_world
#      vars:
#        - nginx_hello_world_port: 80
```
- Dans *ansible.cfg*, il suffit d'ajouter la ligne suivante:
`ansible_managed=Ce fichier est géré par ansible, ne le modifier pas localement car vos modifications seront perdues`

- L'intérêt de *notify* et des *handlers* est de ne faire certaines actions que lorsqu'elles nécéssitent d'être réalisées.
[comment]: <> (FIN CORRECTION)

### Ansible galaxy: installer un rôle externe

  - installer le rôle geerlingguy.docker avec *ansible-galaxy*
  - ou ce rôle est-il installé par défaut ?
  - naviguer dans le code du rôle *geerlingguy.docker*, observer l'arborescence, la structure du code, lire et essayer de comprendre le code ansible
  - faire un snapshot de *control_node*
  - installer docker sur *control_node* (en "local" donc) en utilisant le rôle *geerlingguy.docker* et via un playbook *site-local.yml*
  - vérifier que docker est bien installé sur *control-node*

[comment]: <> (DEBUT CORRECTION)

`ansible-galaxy install geerlinguy.docker`
Le rôle est installé par défaut dans /root/.ansible/roles

site-local.yml
```yaml
---
- name: Installation local sur control-node
  hosts: localhost
  tasks:
    - name: Déployer le rôle geerlingguy.docker
      ansible.builtin.import_role:
        name: geerlingguy.docker
```

On peut vérifier que docker est bien installé avec la commande *docker run hello-world*

[comment]: <> (FIN CORRECTION)

### Ansible galaxy: Avoir la structure d'un nouveau rôle en une ligne de commande

  - dans le répertoire *roles*, créez un nouveau rôle *molecule_nginx_hello_world* en utilisant la commande *ansible-galaxy role init*
  - inspecter l'arborescence de ce nouveau rôle qui correspond aux bonnes pratiques d'arborescences d'un rôle
  - reconstituer le fonctionnement du rôle *nginx_hello_world* dans *molecule_nginx_hello_world*

### Ansible galaxy et les collections

Jusqu'à maintenant nous avons manipulé des rôles. Les rôles permettent de gérer l'installation d'un logiciel, d'un service. Ils sont **historiquement** la manière de dévelloper et de distribuer des **parties** d'une *IaC*, mais cette organisation posait certaines limites. C'est pour s'affranchir de ces limites que les *collections* sont devenues un format de distribution standard des contenues *Ansible*(roles, playbook, module, plugins, ...).

Nous ne nous attarderons pas trop sur cette notion de collection qui n'est finalement rien d'autres qu'un regroupement de roles ansible qui peuvent partager des caractéristiques communes. Sachez tout de même que vous pouvez faire appel à du code contenu dans des collections externe dans vos rôles ansible, mais il faudra alors penser à le spécifier dans un fichier *requirement.yml* (idem pour des rôles externe), vous pouvez ensuite installer ces "dépendances" en effectuant la commande:

`ansible-galaxy install -r requirements.yml`

  - Installez la collection *debops.debops* et allez observer la structure de cette collection
  - Initier une nouvelle collection *ma_collection* avec *ansible-galaxy*

[comment]: <> (DEBUT CORRECTION)
```bash
ansible-galaxy collection install debops.debops
ansible-galaxy collection init ma_collection
```
[comment]: <> (FIN CORRECTION)


### Utilisez *molecule* pour tester et développer vos rôles ansible

  - Voir https://ansible.readthedocs.io/projects/molecule/
  - Installez *pipx* avec *apt*
  - Installez *molecule* avec *pipx*
  - Ajoutez */root/.local/bin* au PATH en ajoutant la ligne suivante dans */root/.bashrc*

`PATH=$PATH:/root/.local/bin`

  - Pensez à sourcer votre fichier */root/.bashrc*
  - Placez vous dans le rôle *molecule_nginx_hello_world*
  - Initiez un nouveau scénario avec *molecule*
    - Observez qu'il s'agit simplement de l'exécution d'un playbook *Ansible* sur localhost
    - Observez la création des répertoires molecule/default et des fichiers {destroy,molecule,converge,create}.yml
  - Projet: individuellement, ou par groupe de 2 à 4 maximum, préparez un cours/tutoriel en markdown et une démonstration permettant:
    - d'expliquer comment fonctionne molecule
    - de faire des tests avec *molecule* qui utilisera des conteneurs *docker* pour effectuer les tests, par exemple:
      - s'assurer que le package nginx est bien installé
      - s'assurer que le conteneur expose bien le port 80
      - s'assurer que une erreur 404 est bien renvoyé lorsque une mauvaise URL est saisie dans le navigateur
      - ...
  - Vous m'enverrez votre rôle et votre cours/tutoriel sous la forme d'une archive nommée nom1_nom2_nom3.tar.gz  

[comment]: <> (DEBUT CORRECTION)
```bash
cd /etc/ansible/roles/molecule_nginx_hello_world
molecule init scenario
```
[comment]: <> (FIN CORRECTION)


 
## Ansible Vault

  - Allez voir à quoi sert Ansible Vault dans la documentation officiel.

[comment]: <> (DEBUT CORRECTION)

[comment]: <> (FIN CORRECTION)
