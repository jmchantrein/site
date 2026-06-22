# MySQL/MariaDB microservice (Compose version): identical to step 5.
FROM debian:13

ENV VERSION=1
LABEL maintainer="Prénom Nom" \
      maintainer_email="prenom.nom@example.com" \
      version="${VERSION}"

RUN apt-get -yq update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -yq \
    mariadb-server && \
    rm -rf /var/lib/apt/lists/*

ENV MYSQL_PASSWORD=tempo \
    MYSQL_USER=admin \
    MYSQL_DB=wordpress

RUN /etc/init.d/mariadb start && \
    mysql -u root --execute="CREATE USER '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD'" && \
    mysql -u root --execute="GRANT ALL PRIVILEGES ON *.* TO '$MYSQL_USER'@'%' WITH GRANT OPTION" && \
    mysql -u root --execute="FLUSH PRIVILEGES" && \
    mysql --user=${MYSQL_USER} --password=${MYSQL_PASSWORD} --execute="CREATE DATABASE ${MYSQL_DB}"

# Allow connections from the service network (not just localhost)
RUN sed -i "s/bind-address/#bind-address/g" /etc/mysql/mariadb.conf.d/50-server.cnf

USER mysql

# Exposed within the service network only, not published to the host
EXPOSE 3306

CMD ["/usr/bin/mysqld_safe"]
