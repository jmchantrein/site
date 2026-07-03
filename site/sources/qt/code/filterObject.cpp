bool FilterObject::eventFilter(QObject *object, QEvent *event)
{
	if (object == target && event->type() == QEvent::KeyPress) {
		QKeyEvent *keyEvent = static_cast<QKeyEvent *>(event);
		if (keyEvent->key() == Qt::Key_Tab) {
			// Cas particulier du tab
			return true;
		} else
			return false;
		}
	return false;
}
