#pragma once
// Harness hooks shared by every GUI example of the course.
// A GUI program normally never returns from app.exec() — fine for a human,
// useless for a CI. Two flags make the examples testable and reproducible:
//   --smoke          quit as soon as the event loop starts (offscreen CI run)
//   --capture FILE   save a real screenshot of the window, then quit — the
//                    course's images are generated from THE displayed code.
#include <QApplication>
#include <QTimer>
#include <QWidget>

inline int lancer(QApplication &app, QWidget &fenetre)
{
    fenetre.show();
    const QStringList args = app.arguments();
    const qsizetype i = args.indexOf("--capture");
    if (i != -1 && i + 1 < args.size()) {
        const QString chemin = args.at(i + 1);
        QTimer::singleShot(0, &app, [&fenetre, &app, chemin] {
            fenetre.grab().save(chemin);
            app.quit();
        });
    } else if (args.contains("--smoke")) {
        QTimer::singleShot(0, &app, &QCoreApplication::quit);
    }
    return app.exec();
}
