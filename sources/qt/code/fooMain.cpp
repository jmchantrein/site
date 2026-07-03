#include "foo.h"

int main (int argc, char** argv)
{
	QApplication app;
	Foo a, b;
	connect(&a, SIGNAL(valueChanged(int)),
		       	&b, SLOT(setValue(int)));
	b.setValue( 11 ); // a == indéfini b == 11
	a.setValue( 79 ); // a == 79 b == 79
	b.value(); // renvoie 79
	return app.exec();
}
