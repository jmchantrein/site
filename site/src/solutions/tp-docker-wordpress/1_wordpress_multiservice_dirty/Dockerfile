# "Dirty" Dockerfile: does not (yet) follow best practices (see next steps).
FROM debian:latest

# No upgrade (cf. Dockerfile best practices)
RUN apt-get -yq update

RUN DEBIAN_FRONTEND=noninteractive apt-get install -yq \
    apache2 libapache2-mod-php libjs-cropper libjs-mediaelement libphp-phpmailer \
    mariadb-server mariadb-client php-getid3 php php-gd php-mysql php-opcache php-readline

# Utility packages kept separate: reuses the build cache during development
RUN DEBIAN_FRONTEND=noninteractive apt-get -yq install vim wget unzip

# WordPress sources under /var/www/html
RUN cd /var/www/html && wget https://wordpress.org/latest.zip
RUN cd /var/www/html && unzip latest.zip

ENV MYSQL_PASSWORD=tempo \
    MYSQL_USER=admin \
    MYSQL_DB=wordpress

# MariaDB socket directory, owned by mysql
RUN mkdir /run/mysqld && chown -R mysql:root /run/mysqld

# The server must be (re)started in each RUN that queries it
RUN /etc/init.d/mariadb start && mysql -u root --execute="CREATE USER '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD'"
RUN /etc/init.d/mariadb start && mysql -u root --execute="GRANT ALL PRIVILEGES ON *.* TO '$MYSQL_USER'@'%' WITH GRANT OPTION" && mysql -u root --execute="FLUSH PRIVILEGES"
RUN /etc/init.d/mariadb start && mysql --user=${MYSQL_USER} --password=${MYSQL_PASSWORD} --execute="CREATE DATABASE ${MYSQL_DB}"

RUN chown -R www-data:www-data /var/www/html/wordpress

# A foreground task (sleep infinity) keeps the container alive
RUN echo "/etc/init.d/apache2 start && /etc/init.d/mariadb start && sleep infinity" > /run.sh
RUN chmod u+x /run.sh

CMD ["/bin/bash","-c","/run.sh"]

# Build / run:
# docker build . -t mon_image_wordpress:v1
# docker run -it --name mon_conteneur_wordpress --rm -p 80:80 mon_image_wordpress:v1
