char *alloc( int size )
{
	Q_ASSERT( size > 0 );
	char *p = new char[size];
	Q_CHECK_PTR( p );
	return p;
}
