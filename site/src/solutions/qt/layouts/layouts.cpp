// Layout managers: the grid places widgets by (row, column), a nested
// horizontal box shares one cell, and a stretch absorbs the extra space
// when the window grows — nobody computes a single pixel by hand.
#include <QApplication>
#include <QGridLayout>
#include <QHBoxLayout>
#include <QLabel>
#include <QLineEdit>
#include <QPushButton>

#include "../harnais.h"

int main(int argc, char **argv)
{
    QApplication app(argc, argv);
    QWidget fenetre;
    fenetre.setWindowTitle("Layouts");

    auto *grille = new QGridLayout(&fenetre);

    grille->addWidget(new QLabel("Nom :"), 0, 0);
    grille->addWidget(new QLineEdit, 0, 1);
    grille->addWidget(new QLabel("Domaine :"), 1, 0);
    grille->addWidget(new QLineEdit, 1, 1);

    // One nested layout in one cell, spanning the two columns:
    // stretch first, so the buttons hug the right edge.
    auto *boutons = new QHBoxLayout;
    boutons->addStretch(1);
    boutons->addWidget(new QPushButton("Annuler"));
    boutons->addWidget(new QPushButton("Valider"));
    grille->addLayout(boutons, 2, 0, 1, 2);

    return lancer(app, fenetre);
}
