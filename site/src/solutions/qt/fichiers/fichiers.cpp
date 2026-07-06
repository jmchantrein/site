// Files and streams, no GUI involved (Qt is not only graphical): QFile
// opens, QTextStream reads and writes text — same API whatever sits
// below (file, buffer, socket: any QIODevice).
#include <QDebug>
#include <QFile>
#include <QTemporaryDir>
#include <QTextStream>

int main()
{
    QTemporaryDir dossier; // cleaned up automatically at the end
    const QString chemin = dossier.filePath("pionnieres.txt");

    // Write…
    QFile sortie(chemin);
    if (!sortie.open(QIODevice::WriteOnly | QIODevice::Text)) {
        qWarning() << "Ouverture en écriture impossible";
        return 1;
    }
    QTextStream flux(&sortie);
    flux << "Ada Lovelace\n" << "Grace Hopper\n" << "Hedy Lamarr\n";
    sortie.close();

    // …read back.
    QFile entree(chemin);
    if (!entree.open(QIODevice::ReadOnly | QIODevice::Text)) {
        qWarning() << "Ouverture en lecture impossible";
        return 1;
    }
    QTextStream lecture(&entree);
    int numero = 1;
    while (!lecture.atEnd()) {
        qDebug().noquote() << numero++ << ":" << lecture.readLine();
    }
    return 0;
}
