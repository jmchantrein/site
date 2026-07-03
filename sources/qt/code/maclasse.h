#include "QtWidgets/QtWidgets"

class MaClasse : public QObject{
Q_OBJECT
        public:
                MaClasse(){};
		void emettreSignal(){emit monSignal(3.14);};
        signals:
                void monSignal(float);
};

