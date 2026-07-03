void uneFonction(double pi)
{cout<<"Fonction standard "<<pi<<endl;}

int main (int argc, char** argv)
{
	QApplication app(argc, argv);
	MaClasse monObjet;
	
	QObject::connect(&monObjet, &MaClasse::monSignal, 
		[=](int pi){cout<<"Lambda fonction "<<pi<<endl;});
	QObject::connect(&monObjet, &MaClasse::monSignal, 
		uneFonction);
	
	monObjet.emettreSignal();
	return app.exec();
}
