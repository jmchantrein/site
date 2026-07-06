// The Qt hello world, Qt 6 flavour: one include per class (QtWidgets
// module), a label as top-level widget ON THE STACK (never `new` the
// top-level!), and the event loop in app.exec().
#include <QApplication>
#include <QLabel>

#include "../harnais.h"

int main(int argc, char **argv)
{
    QApplication app(argc, argv);
    QLabel hello("<font color=\"steelblue\">Hello <i>world!</i></font>");
    hello.setAlignment(Qt::AlignCenter);
    hello.resize(220, 90); // a label sizes to its text: widen the window
    return lancer(app, hello);
}
