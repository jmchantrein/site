# The whole course builds with ONE modern CMake file — qmake and its .pro
# files were Qt's historical tool; CMake is the official build system since
# Qt 6. qt_standard_project_setup() turns on AUTOMOC: moc runs by itself on
# every header carrying Q_OBJECT, nobody invokes it by hand anymore.
cmake_minimum_required(VERSION 3.16)
project(solutions-qt LANGUAGES CXX)

find_package(Qt6 REQUIRED COMPONENTS Widgets)
qt_standard_project_setup()

add_compile_options(-Wall -Wextra)

# GUI examples
add_executable(hello hello/hello.cpp)
add_executable(layouts layouts/layouts.cpp)
add_executable(compteur compteur/compteur.cpp)
add_executable(evenements evenements/evenements.cpp)
add_executable(dessin dessin/dessin.cpp)

# Console examples (Qt without a single window)
add_executable(objet-verbeux objets/objet-verbeux.cpp)
add_executable(signaux signaux/signaux.cpp signaux/ma-classe.h)
add_executable(fichiers fichiers/fichiers.cpp)

foreach(cible hello layouts compteur evenements dessin
              objet-verbeux signaux fichiers)
  target_link_libraries(${cible} PRIVATE Qt6::Widgets)
endforeach()
