// Qt's parent/child memory management, made audible: every construction
// and destruction speaks. The root lives ON THE STACK; every other object
// is new-ed WITH A PARENT — and nobody calls delete: when a parent dies,
// it deletes its children (recursively).
#include <QDebug>
#include <QObject>

class ObjetVerbeux : public QObject
{
public:
    explicit ObjetVerbeux(const QString &nom, QObject *parent = nullptr)
        : QObject(parent)
    {
        setObjectName(nom);
        qDebug().noquote() << "Créé    :" << nom;
    }
    ~ObjetVerbeux() override
    {
        qDebug().noquote() << "Détruit :" << objectName();
    }
};

int main()
{
    ObjetVerbeux racine("racine");
    auto *x = new ObjetVerbeux("x", &racine);
    new ObjetVerbeux("y", &racine);
    new ObjetVerbeux("z", x);

    qDebug().noquote() << "— fin de main : destruction en cascade —";
    return 0;
}
