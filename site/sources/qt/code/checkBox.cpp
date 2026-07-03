void MyCheckBox::mousePressEvent(QMouseEvent *event)
{
	if (event->button() == Qt::LeftButton) {
		// Gestion du  click gauche ici
	} else {
		// Gestion par la classe de base
		QCheckBox::mousePressEvent(event);
	}
}

