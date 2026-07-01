# CMD vs ENTRYPOINT: ENTRYPOINT fixes the executable (ping -c 2),
# CMD provides the default argument (localhost), which `docker run` can override.
FROM ubuntu:24.04
RUN DEBIAN_FRONTEND=noninteractive apt update && \
    apt install -yq iputils-ping && \
    apt clean
ENTRYPOINT ["ping", "-c", "2"]
CMD ["localhost"]
