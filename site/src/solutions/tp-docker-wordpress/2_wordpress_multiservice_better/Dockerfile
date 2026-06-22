# Best practices: readability, cache management, one responsibility per instruction.
FROM debian:13

ENV VERSION=2
LABEL maintainer="Prénom Nom" \
      maintainer_email="prenom.nom@example.com" \
      version="${VERSION}"

# Single install block, sorted packages, apt cache purged (saves space)
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

# Download and deploy the sources in a single instruction
RUN cd /tmp && \
    wget https://wordpress.org/latest.zip && \
    unzip latest.zip && \
    rm -rf /var/www/html/* && \
    mv wordpress/* /var/www/html/ && \
    chown -R www-data:www-data /var/www/html && \
    rm latest.zip

# Variables placed just before use (preserves the lower layers' cache)
ENV MYSQL_PASSWORD=tempo \
    MYSQL_USER=admin \
    MYSQL_DB=wordpress

RUN /etc/init.d/mariadb start && \
    mysql -u root --execute="CREATE USER '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD'" && \
    mysql -u root --execute="GRANT ALL PRIVILEGES ON *.* TO '$MYSQL_USER'@'%' WITH GRANT OPTION" && \
    mysql -u root --execute="FLUSH PRIVILEGES" && \
    mysql --user=${MYSQL_USER} --password=${MYSQL_PASSWORD} --execute="CREATE DATABASE ${MYSQL_DB}" && \
    echo "ServerName localhost" >> /etc/apache2/conf-available/servername.conf && \
    a2enconf servername

# Foreground task. Use printf (not echo) so \n is interpreted; otherwise /run.sh
# would be a single line starting with #! (i.e. an inert comment).
RUN printf '#!/bin/bash\n/etc/init.d/apache2 start && mysqld_safe\n' > /run.sh && \
    chmod u+x /run.sh

CMD ["/bin/bash","-c","/run.sh"]

# docker build . -t mon_image_wordpress:v2
# docker run -it --name mon_conteneur_wordpress --rm -p 80:80 mon_image_wordpress:v2
