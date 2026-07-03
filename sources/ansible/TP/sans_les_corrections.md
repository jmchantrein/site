

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

``` fstab
# Montage de starwars:~/ansible dans /etc/ansible
sshfs#j.chantrein@starwars:ansible /etc/ansible fuse defaults,_netdev,allow_other 0 0
```



# Prérequis managed_node

  - Ajouter la clé publique de control_node dans managed_node:~/.ssh/autorisez_keys

# Prérequis à la réalisation du tp

Pour la réalisation de ce tp, pour tout ce qui concerne ansible, vous irez chercher l'information directement à la source, c'est à dire dans la documentation officielle de ansible: https://docs.ansible.com/users.html

# Configuration de control_node

## Faire un fichier de configuration /etc/ansible/ansible.cfg

  - Faites un fichier de configuration /etc/ansible/ansible.cfg qui doit indiquer que le ou les fichiers d'inventaires se trouveront dans /etc/ansible/inventory
  - N'hésitez pas à ajouter en fin de /root/.bashrc des commandes vous facilitant le travail au quotidien (alias, fonction, positionnement dans le répertoire de travail /etc/ansible dès l'ouverture de session, ...).


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


## Faire un playbook

  - Dans le répertoire /etc/ansible, créer le fichier hello_world.yml qui a pour **tache (task)** de faire un ping sur **l'ensemble** des noeuds managé. (module *ping*)
  - Tester le playbook avec la commande `ansible-playbook hello_world.yml`
  - Ajouter une task qui affiche le message "hello world" avec le module *debug*
  - Tester le playbook


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


### Utiliser les faits ansible (*ansible-facts*)

  - Utiliser le module *setup* pour voir quelles sont les *ansible-facts* pour un noeud managé. 
  - Trouver un moyen pour convertir la sortie de la question ci dessus en *yaml*
  - Trouver le *ansible-facts* qui contient la distribution des noeuds managés
  - Ajouter une task à hello_world.yml permettant:
    - d'afficher le hostname des noeuds managés avec le module *debug*
    - d'afficher toute les variables *ansible-facts* des noeuds managés en utilisant le module *setup* et en enregistrant la sortie dans une variable *all_ansible_facts*
    - d'afficher la distribution des noeuds managés en utilisant le module *setup* et en enregistrant la sortie dans une variable *distribution_ansible_facts*


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


---

  - Toujours dans le même playbook, proposer une alternative qui utilise un autre module que *shell* et *cmd*. Vous ferez cette fois un fichier */hello_world* qui contiendra la chaine de caractère "Hello world !"
  - Exécuter le playbook.
  - Observer la sortie
  - Reexécuter le playbook une minute après, observer la sortie
  - Observer les dates de modifications des fichiers hello, world et hello_world
  - Que constatez vous ?


---

  - Linter le playbook et suivez les recommandations de ansible-lint qui vous permette de conserver l'idempotence de ansible.
  - Utiliser *git* de manière à ce qu'il n'y ait plus rien à ajouter ni à commiter sur votre branche principale. Vous devriez faire 2 commit (1 pour l'installation des paquets, 1 pour l'écriture des fichiers *hello*, *world*, et *hello_world*.


---

  - Ajouter *state: latest* à *install-common-software.yaml* pour l'installation des paquets
  - Linter le fichier
  - Pourquoi *package-latest: Package installs should not use latest.* ?
  - Si on est sur de ce que l'on fait, est-il possible d'outrepasser certaines règles d'*ansible-lint* ?
  - Même question pour *shellcheck* ?




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


### Ansible galaxy: installer un rôle externe

  - installer le rôle geerlingguy.docker avec *ansible-galaxy*
  - ou ce rôle est-il installé par défaut ?
  - naviguer dans le code du rôle *geerlingguy.docker*, observer l'arborescence, la structure du code, lire et essayer de comprendre le code ansible
  - faire un snapshot de *control_node*
  - installer docker sur *control_node* (en "local" donc) en utilisant le rôle *geerlingguy.docker* et via un playbook *site-local.yml*
  - vérifier que docker est bien installé sur *control-node*


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



 
## Ansible Vault

  - Allez voir à quoi sert Ansible Vault dans la documentation officiel.

