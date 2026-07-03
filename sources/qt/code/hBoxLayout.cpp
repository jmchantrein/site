#include <Qt/QtGui>
int main (int argc, char* argv[])
{
	QApplication app(argc, argv);
	QWidget w;
	QHBoxLayout * hbox_1 = new QHBoxLayout(&w);
	QPushButton *b1 = new QPushButton("Un", &w);
	QPushButton *b2 = new QPushButton("Deux", &w);
	hbox_1->addWidget(b1);
	hbox_1->addWidget(b2);
	w.show();
	return app.exec();
}
