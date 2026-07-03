#include <Qt/QtGui>
class MyWidget : public QWidget
{ public:
	MyWidget(QWidget* parent = 0) : QWidget(parent)
	{ resize(1024,1024); }
	protected:
	void paintEvent(QPaintEvent*)
	{ QPainter p(this);
		p.setPen(Qt::NoPen);
		for (int i=0 ; i<256 ; i++)
			for (int j=0 ; j<256 ; j++)
			{ p.setBrush(QColor(255,i,j));
				p.drawRect(i*4,j*4,4,4);
			}
	}
};

