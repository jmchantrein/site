int main (int argc, char* argv[])
{
	QApplication app(argc, argv);
	MyWidget w;
	QScrollArea scrollArea;
	scrollArea.setWidget(\&w);
	scrollArea.resize(200, 200);
	scrollArea.show();
	return app.exec();
}
