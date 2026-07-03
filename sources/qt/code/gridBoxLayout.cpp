#include <Qt/QtGui>
int main (int argc, char* argv[])
{
	QApplication app(argc, argv);
	QWidget w;
	QGridLayout *grid = new QGridLayout(&w);
	QPushButton *b1 = new QPushButton("Un", &w);
	QPushButton *b2 = new QPushButton("Deux", &w);
	QPushButton *b3 = new QPushButton("Trois", &w);
	grid->addWidget(b1,0,0);
	grid->addWidget(b2,0,1);
	grid->addWidget(b3,1,0,1,2);
	w.show();
	return app.exec();
}
