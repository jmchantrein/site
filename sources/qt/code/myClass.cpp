class MyClass : public QObject
{
	Q_OBJECT // Macro nécéssaire
		signals: // Signaux définis manuellement
		void signal1( int, const char * );
	private slots: // Slots privés définis manuellement
		void slot1( QString &qStr );
	public slots: // Slots publics définis manuellement
		void slot2( );
	private: // Méthodes et attributs privés
	public: // Méthodes et attributs publiques
};
