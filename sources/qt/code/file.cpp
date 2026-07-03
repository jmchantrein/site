#include <Qt/QtGui>
#include <iostream>
int main( int argc, char **argv )
{
	QApplication a( argc, argv );
	QFile f( "f.txt" );
	if( !f.exists() )
	{ std::cout << "Le fichier n'existe pas." << std::endl;
		return 0;
	}
	if( !f.open( QIODevice::ReadOnly ) )
	{ std::cout << "Échec lors de l'ouverture." << std::endl;
		return 0;
	}
	std::cout << "Ca marche." << std::endl;
	f.close();
	return 0;
}
