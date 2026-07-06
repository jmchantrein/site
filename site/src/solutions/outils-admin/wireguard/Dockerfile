# Minimal WireGuard peer image for the local lab: userspace tools only —
# the wireguard kernel module comes from the HOST kernel (hence NET_ADMIN).
FROM alpine:3.20
RUN apk add --no-cache wireguard-tools iproute2 iputils
# The container just stays alive; the lab script drives it with docker exec.
CMD ["sleep", "infinity"]
