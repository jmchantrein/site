// Under the signals: events. This widget REDEFINES two entry points —
// keyPressEvent() for ordinary keys, and event() itself for Tab, which
// the focus system normally swallows before keyPressEvent ever runs.
// Unhandled cases are passed to the base class: never break the chain.
#include <QApplication>
#include <QKeyEvent>
#include <QLabel>
#include <QVBoxLayout>

#include "../harnais.h"

class ZoneClavier : public QWidget
{
public:
    ZoneClavier()
    {
        auto *colonne = new QVBoxLayout(this);
        m_affichage = new QLabel("Tapez une touche (Tab compris)…");
        colonne->addWidget(m_affichage);
        setFocusPolicy(Qt::StrongFocus);
        setWindowTitle("Évènements");
        resize(320, 110);
    }

protected:
    // The ordinary route: called by QWidget::event() for most keys.
    void keyPressEvent(QKeyEvent *evenement) override
    {
        m_affichage->setText("keyPressEvent : « " + evenement->text() + " »");
        QWidget::keyPressEvent(evenement);
    }

    // The interception route: Tab is consumed by focus handling BEFORE
    // keyPressEvent — redefining event() lets us see it pass.
    bool event(QEvent *evenement) override
    {
        if (evenement->type() == QEvent::KeyPress) {
            auto *touche = static_cast<QKeyEvent *>(evenement);
            if (touche->key() == Qt::Key_Tab) {
                m_affichage->setText("event() : Tab intercepté !");
                return true; // handled: it stops here
            }
        }
        return QWidget::event(evenement); // everything else: normal route
    }

private:
    QLabel *m_affichage = nullptr;
};

int main(int argc, char **argv)
{
    QApplication app(argc, argv);
    ZoneClavier fenetre;
    return lancer(app, fenetre);
}
