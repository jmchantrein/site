# Notes pour le cours de virtualisation

# Concepts de base de la virtualisation

## Introduction à la virtualisation

La virtualisation permet de créer plusieurs machines virtuelles (VM) sur un seul serveur physique. Chaque VM agit comme une machine indépendante avec son propre système d'exploitation et ses applications, tout en partageant les ressources matérielles de l'hôte physique.

##  Hyperviseurs

### Type 1 (Bare Metal)

Les hyperviseurs de type 1 fonctionnent directement sur le matériel de l'hôte sans système d'exploitation intermédiaire. Exemple : KVM. Ils offrent des performances optimales et une gestion efficace des ressources.

### Type 2 (Hosted)

Les hyperviseurs de Type 2 fonctionnent au-dessus d'un système d'exploitation hôte. Exemple :  VirtualBox. Ils sont plus faciles à installer et à utiliser, mais peuvent affecter légèrement les performances.

## Avantages de la virtualisation

### Efficacité des ressources

La virtualisation maximise l'utilisation des ressources matérielles en exécutant plusieurs VMs sur une seule machine physique, réduisant ainsi les coûts d'infrastructure.

### Isolation

Chaque VM est isolée des autres, offrant une sécurité et une stabilité accrues. Les problèmes dans une VM n'affectent pas les autres.

### Flexibilité et portabilité

La virtualisation facilite la création, le déploiement et la migration des environnements informatiques. Les VMs peuvent être déplacées d'un serveur à un autre avec peu ou pas d'interruption de service.

### Facilité de gestion

Les outils de virtualisation permettent une gestion centralisée des ressources informatiques. Les administrateurs peuvent facilement créer, supprimer et configurer des VMs, ainsi que surveiller l'utilisation des ressources.

## Inconvénients de la virtualisation

### Performance

La virtualisation peut introduire une légère surcharge par rapport à une installation directe sur le matériel, en raison de l'émulation et de la gestion des ressources par l'hyperviseur.

### Complexité

La configuration et la gestion des hyperviseurs et des VMs peuvent être complexes, nécessitant des compétences techniques spécifiques. La maintenance et la sécurité des environnements virtualisés peuvent également être plus exigeantes.

### Compatibilité

Certaines applications nécessitant un accès direct au matériel peuvent ne pas fonctionner correctement dans des environnements virtualisés. Il peut être nécessaire de tester et de valider les applications avant de les déployer sur des VMs.

## Fonctionnement 

Interractions via:
  - noyau: utilisation de  KVM (Kernel Based Virtual Machine via activation d'un module du noyau Linux)
  - userspace: faire communiquer l'utilisateur avec le noyau via libvirt(utilisation de virsh) et QEMU(Quick EMUlator)

En réalité KVM est basé sur un fork du projet QEMU, et le projet QEMU a lui même récupéré du code source de KVM, ces 2 projets sont interdépendants, et il faudrait donc plutôt parler de QEMU/KVM.
La spécifité de QEMU est de gérer la partie émulation (si besoin, car si le système hôte a la même architecture que le système invité, il y a un mécanisme de bypass qui permet de traiter directement avec la partie KVM.)

Emulation d'architecture: par exemple emuler un  processeur ARM sur l'invité alors que l'on a un processeur x86_64 sur l'hôte.

Libvirt est une bibliothèque (library) de virtualisation dévellopé initialement par RedHat, elle permet d'autres types de virtualisations que QEMU/KVM:
  - Xen
  - OpenVz
  - VMWare

## Installation

Sur les machines récentes, les processeurs peuvent supporter l'activation de KVM.
Sur des machines plus anciennes, il faut s'assurer que les processeurs supporte cette activation.

`grep -c vmx /proc/cpuinfo` >0 pour un processeur intel
`grep -c svm /proc/cpuinfo` >0 pour un processeur amd

`sudo apt update && sudo apt install virt-manager`

L'installation de *virt-manager* va installer d'office tous les paquets insdipensables pour la virtualisation (notamment les paquets `qemu-*`).



Vérifier que libvirtd est bien actif:

`sudo systemctl status libvirtd`

Et pour être sur que le démon soit bien actif dès le démmarage de la machine:

`sudo systemctl enable libvirtd`

## Utilisation

### Prérequis

#### Réseau
Pour que les VM puisse communiquer, il faut qu'elles soient dans un réseau.
On peut définir plusieurs types de réseaux, mais pour l'instant, nous allons nous contenter d'utiliser le réseau par défaut en mode NAT.

sudo virsh net-list # doit renvoyer tous les réseaux actifs
sudo virsh net-list --all # doit renvoyer tous les réseaux actifs et inactifs

Il doit y a avoir un réseau par défaut nommé *default*
Pour le démarrer:

sudo virsh net-start default

Si vous souhaitez qu'il soit démarrer automatiquement au démarrage de l'hôte:

sudo virsh net-autostart default

Vous verrez à ce moment apparaitre ce réseau dans la sortie de la commande

ip addr

Pour information, la définition de ce réseau par défaut doit certainement se trouver dans */usr/share/libvirt/networks/default.xml* sous Debian.

#### ISO

Vous devez télécharger la dernière image [amd64](https://fr.wikipedia.org/wiki/AMD64) de [Debian stable en netinstall](https://www.debian.org/CD/netinst/).

Assurez vous que la [somme de contrôle](https://fr.wikipedia.org/wiki/Somme_de_contr%C3%B4le) sha256sum du fichier corresponde bien à l'image que vous avez téléchargé, voir [les sommes de contrôles sha256sum](https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/SHA256SUMS) de la dernière version stable amd64

#### Localisation des données

Les données sont dans:
  - ~/.local/share/libvirt/* pour les usages en tant qu'utilisateur classique
  - /var/lib/libvirt/* pour les usages en tant que root

### En CLI via *virsh*

#### La première machine virtuelle en CLI

``` bash
sudo virt-install --osinfo debian11 --name NOM_VM --memory 2048 --vcpus 1 --disk path=/var/lib/libvirt/images/MON_DISQUE.qcow2,bus=virtio,size=20 --network bridge=virbr0 --location ~/Téléchargements/debian-12.6.0-amd64-netinst.iso 
Début d’installation…
Retrieving 'vmlinuz'
Retrieving 'initrd.gz'
Allocating 'MON_DISQUE.qcow2'
Création du domaine…
Exécution de la commande de console graphique : virt-viewer --connect qemu:///system --wait NOM_VM

#[INSTALLATION DANS LA FENÊTRE GRAPHIQUE]
# NE PAS INSTALLER DE GUI
# INSTALLER UN SERVEUR SSH

#Démarrage de la VM
sudo virsh start NOM_VM

#Reprendre la fenetre graphique
sudo virt-viewer NOM_VM

# Se connecter au serveur ssh
# Montrer que l'on est bien dans la VM en montrant la capacité disque, cpu, RAM, ...
```

#### La deuxième machine virtuelle via un fichier xml

```
# Récupérér le fichier xml correspondant à la machine précédente
sudo virsh dumpxml NOM_VM
```

#### Memo de commandes
virsh -> libvirtd -> QEMU -> KVM -> Hardware

virsh list # Liste toutes les VM en run
virsh list --all # Liste toutes les VM y compris celles à l'arrêt

virsh nodeinfo # Donnes des informations sur l'hôte

virsh dominfo NOM_VM # Donnes des informations sur la VM NOM_VM

virsh start NOM_VM # Démarre la VM NOM_VM
virsh autostart NOM_VM # Démarre automatiquement la VM NOM_VM au démarrage de l'hôte
virsh autostart --disable NOM_VM # Ne démarre plus automatiquement la VM NOM_VM au démarrage de l'hôte

virsh shutdown NOM_VM # Eteint la VM NOM_VM

virsh destroy NOM_VM # Détruit l'instance de la VM NOM_VM, mais pas ce qui définit cette instance
virsh undefined --remove-all-storage NOM_VM

### En GUI via *virtual-manager*

#### La troisième machine virtuelle via *virt-manager*

virtual-manager -> virsh -> libvirtd -> QEMU -> KVM -> Hardware

## Ressources

xavki KVM https://www.youtube.com/playlist?list=PLn6POgpklwWovnqec6vXcGqZbWgdlxuNC
