int main( int argc, char **argv )
{
	QApplication a( argc, argv );
	VerboseObject top( 0 );
	top.setObjectName("top");
	VerboseObject *x = new VerboseObject( &top );
	x->setObjectName("x");
	VerboseObject *y = new VerboseObject( &top );
	y->setObjectName("y");
	VerboseObject *z = new VerboseObject( x );
	z->setObjectName("z");
	top.doStuff();
	x->doStuff();
	y->doStuff();
	z->doStuff();
	return 0;
}
