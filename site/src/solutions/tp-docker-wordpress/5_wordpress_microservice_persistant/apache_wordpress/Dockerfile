# Apache microservice: serves the WordPress sources, no database here.
FROM debian:13

ENV VERSION=1
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

# Variables expected by apache2ctl
ENV APACHE_RUN_USER=www-data \
    APACHE_RUN_GROUP=www-data \
    APACHE_LOG_DIR=/var/log/apache2

EXPOSE 80

RUN chmod u+s /usr/sbin/apache2ctl /usr/sbin/apache2

USER www-data

CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
