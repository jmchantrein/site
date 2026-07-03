#include <Qt/QtGui>
int main( int argc, char **argv )
{ QApplication app( argc, argv );
	QTranslator translator( 0 );
	translator.load( "tt1_la", "." );
	app.installTranslator( &translator );
	QPushButton hello( QPushButton::tr("Hello world!"), 0 );
	hello.show();
	return app.exec();
}
