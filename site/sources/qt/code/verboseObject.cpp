class VerboseObject : public QObject
{
public:
    VerboseObject(QObject *parent=0): QObject(parent)
     { std::cout << "Created" << std::endl; }
    ~VerboseObject()
     { std::cout << "Deleted: " << 
     objectName().toStdString() << std::endl; }
    void doStuff()
     { std::cout << "Do stuff: " << 
     objectName().toStdString() << std::endl; }
};
