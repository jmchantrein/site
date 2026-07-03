bool MyWidget::event(QEvent *event)
{
	if (event->type() == QEvent::KeyPress) {
		QKeyEvent *ke = static_cast<QKeyEvent *>(event);
		if (ke->key() == Qt::Key_Tab) {
			// Ici, gestion particulière du tab
			return true;
		}
	} else if (event->type() == MyCustomEventType) {
		MyCustomEvent *myEvent=
			static_cast<MyCustomEvent *>(event);
			// Ici, gestion particulière d'un evenement
		return true;
	}
	return QWidget::event(event);
}
