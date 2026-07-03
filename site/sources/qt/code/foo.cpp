void Foo::setValue(int v)
{
	if ( v != val ) {
		val = v;
		emit valueChanged(v);
	}
}
