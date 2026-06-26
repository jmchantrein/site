# Multi-stage build: compile in a throwaway stage, ship only the binary.

# Stage 1 — build: the whole toolchain lives here and never ships.
FROM debian:13 AS builder
WORKDIR /src
COPY hello.c .
# Static linking: the binary needs no shared library at runtime
# (the scratch image contains none).
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -yq build-essential && \
    gcc -static -O2 -o hello hello.c

# Stage 2 — final: an EMPTY image, just the binary (a few hundred kB).
FROM scratch
COPY --from=builder /src/hello /hello
ENTRYPOINT ["/hello"]

# Build / run:
# docker build -t hello .
# docker run --rm hello
# Build only the compile stage, to compare sizes:
# docker build --target builder -t hello-builder .
