#include <Qt/QtGui>
int main (int argc, char* argv[])
{
	QApplication app(argc, argv);
	QPushButton bouton("Fermer", 0);
	QObject::connect( &bouton, SIGNAL( clicked() ), 
			&app, SLOT( quit() ));
	bouton.show();
	return app.exec();
}
