// The classic lab: a slider and a spin box that mirror each other, an LCD
// display following along — three widgets, zero glue code beyond connect.
// Every connection uses the modern (compile-checked) syntax.
#include <QApplication>
#include <QLCDNumber>
#include <QSlider>
#include <QSpinBox>
#include <QVBoxLayout>

#include "../harnais.h"

int main(int argc, char **argv)
{
    QApplication app(argc, argv);
    QWidget fenetre;
    fenetre.setWindowTitle("Compteur");

    auto *ecran = new QLCDNumber;
    auto *curseur = new QSlider(Qt::Horizontal);
    auto *boite = new QSpinBox;
    curseur->setRange(0, 130);
    boite->setRange(0, 130);

    auto *colonne = new QVBoxLayout(&fenetre);
    colonne->addWidget(ecran);
    colonne->addWidget(curseur);
    colonne->addWidget(boite);

    // Both inputs mirror each other (no infinite loop: setValue does not
    // re-emit when the value does not actually change)…
    QObject::connect(curseur, &QSlider::valueChanged, boite, &QSpinBox::setValue);
    QObject::connect(boite, &QSpinBox::valueChanged, curseur, &QSlider::setValue);
    // …and the display follows whichever moved.
    QObject::connect(curseur, &QSlider::valueChanged, ecran,
                     qOverload<int>(&QLCDNumber::display));

    boite->setValue(42);
    fenetre.resize(240, 220); // room for the LCD digits
    return lancer(app, fenetre);
}
