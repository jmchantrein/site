# Persist data via named volumes, and expose port 80 explicitly.
FROM debian:13

ENV VERSION=4
LABEL maintainer="Prénom Nom" \
      maintainer_email="prenom.nom@example.com" \
      version="${VERSION}"

RUN apt-get -yq update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -yq \
    apache2 \
    libapache2-mod-php \
    libjs-cropper \
    libjs-mediaelement \
    libphp-phpmailer \
    mariadb-client \
    mariadb-server \
    php \
    php-getid3 \
    php-gd \
    php-mysql \
    php-opcache \
    php-readline \
    unzip \
    vim \
    wget && \
    rm -rf /var/lib/apt/lists/*

RUN cd /tmp && \
    wget https://wordpress.org/latest.zip && \
    unzip latest.zip && \
    rm -rf /var/www/html/* && \
    mv wordpress/* /var/www/html/ && \
    chown -R www-data:www-data /var/www/html && \
    rm latest.zip

ENV MYSQL_PASSWORD=tempo \
    MYSQL_USER=admin \
    MYSQL_DB=wordpress

RUN /etc/init.d/mariadb start && \
    mysql -u root --execute="CREATE USER '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD'" && \
    mysql -u root --execute="GRANT ALL PRIVILEGES ON *.* TO '$MYSQL_USER'@'%' WITH GRANT OPTION" && \
    mysql -u root --execute="FLUSH PRIVILEGES" && \
    mysql --user=${MYSQL_USER} --password=${MYSQL_PASSWORD} --execute="CREATE DATABASE ${MYSQL_DB}" && \
    echo "ServerName localhost" >> /etc/apache2/conf-available/servername.conf && \
    a2enconf servername && \
    chmod u+s /usr/sbin/apache2

RUN printf '#!/bin/bash\n/etc/init.d/apache2 start && mysqld_safe\n' > /run.sh && \
    chmod +x /run.sh

USER mysql

# Explicit port (the database server itself is not exposed)
EXPOSE 80

# Persistent mount points
VOLUME ["/var/lib/mysql", "/var/www/html"]

CMD ["/bin/bash","-c","/run.sh"]

# docker build . -t mon_image_wordpress:v4
# Use NAMED volumes (an anonymous volume would be lost with --rm):
# docker run -d --name mon_conteneur_wordpress \
#   -v data_wordpress:/var/lib/mysql -v src_wordpress:/var/www/html \
#   -p 80:80 mon_image_wordpress:v4
