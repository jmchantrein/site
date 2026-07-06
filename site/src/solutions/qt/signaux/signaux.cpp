// Modern signal/slot connections (pointer-to-member syntax): checked at
// COMPILE TIME, and open to lambdas, free functions and implicit
// conversions — everything the old SIGNAL()/SLOT() macros could not do.
#include <QDebug>

#include "ma-classe.h"

void fonctionLibre(double valeur)
{
    qDebug().noquote() << "Fonction libre (double) :" << valeur;
}

int main()
{
    MaClasse source;

    // A lambda taking an int: the float signal converts implicitly.
    QObject::connect(&source, &MaClasse::valeurChangee,
                     [](int valeur) { qDebug().noquote() << "Lambda (int)            :" << valeur; });

    // A plain free function taking a double: converts too.
    QObject::connect(&source, &MaClasse::valeurChangee, &fonctionLibre);

    source.changerValeur(3.14F);
    return 0;
}
