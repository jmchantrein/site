void myMessageOutput( QtMsgType type, const char *msg )
{ switch ( type ) {
	case QtDebugMsg:
		cerr << "Debug: " << msg << endl;
		break;
	case QtWarningMsg:
		cerr << "Warning: " << msg << endl;
		break;
	case QtFatalMsg:
		cerr << "Fatal: " << msg << endl;
		abort(); } // core dump délibéré
} // ...
qInstallMsgHandler( myMessageOutput );
qDebug("Teste déboggage !!");
