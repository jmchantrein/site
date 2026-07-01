# Image from ubuntu:24.04 that ships iputils-ping,
# with "ping localhost" as the default (overridable) command.
FROM ubuntu:24.04
RUN DEBIAN_FRONTEND=noninteractive apt update && \
    apt install -yq iputils-ping && \
    apt clean
CMD ["ping", "localhost"]
