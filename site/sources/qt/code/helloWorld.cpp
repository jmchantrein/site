#include <Qt/QtGui>
int main( int argc, char **argv )
{
	QApplication app( argc, argv );
	QLabel hello( "<font color=blue>Hello <i> \
			world!</i> </font>", 0 );
	hello.show();
	return app.exec();
}
