// Drawing: everything visible in Qt goes through QPainter, inside a
// paintEvent(). (0,0) is the TOP-LEFT corner; never paint outside a
// paintEvent; update() POSTS a repaint request rather than painting.
#include <QApplication>
#include <QPainter>
#include <QWidget>

#include "../harnais.h"

class Pastille : public QWidget
{
public:
    Pastille()
    {
        setWindowTitle("QPainter");
        resize(220, 160);
    }

protected:
    void paintEvent(QPaintEvent * /*evenement*/) override
    {
        QPainter pinceau(this);
        pinceau.setRenderHint(QPainter::Antialiasing);

        pinceau.setBrush(QColor("steelblue"));
        pinceau.setPen(Qt::NoPen);
        pinceau.drawEllipse(rect().center(), 50, 50);

        pinceau.setPen(Qt::white);
        pinceau.drawText(rect(), Qt::AlignCenter, "Qt");
    }
};

int main(int argc, char **argv)
{
    QApplication app(argc, argv);
    Pastille fenetre;
    return lancer(app, fenetre);
}
