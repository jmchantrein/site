#pragma once
// A class with a custom signal: it inherits QObject, carries the Q_OBJECT
// macro (moc generates the signal's implementation — never write it
// yourself), and declares the signal in the `signals:` section.
#include <QObject>

class MaClasse : public QObject
{
    Q_OBJECT
public:
    void changerValeur(float valeur) { emit valeurChangee(valeur); }

signals:
    void valeurChangee(float nouvelle);
};
