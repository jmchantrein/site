QFile file( "splash.dat" );
if ( file.open(QIODevice::WriteOnly) )
{
	QDataStream out( &file );
	out << QString( "SplashWidgetStyle" )
		<< QFont( "Times", 18, QFont::Bold ) 
		<< QColor( "skyblue" );
	file.close()
}
QString str;
QFont font;
QColor color;
QFile file2( "splash.dat" );
if ( file2.open(QIODevice::ReadOnly) )
{
	QDataStream in( &file2 );
	in >> str >> font >> color;
	file2.close()
}
