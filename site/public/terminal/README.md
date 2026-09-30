# IAdmin terminal companion

The companion exposes either a local login shell or the system SSH client to
the IAdmin website. It listens on the loopback interface, accepts one client,
checks the website origin and uses a single-use random pairing token.

## Recommended installation

```sh
curl -fLO https://jmchantrein.github.io/site/terminal/install-iadmin-terminal.sh
less install-iadmin-terminal.sh
sh install-iadmin-terminal.sh
```

For direct use from the published HTTPS site, install a trusted localhost
certificate explicitly (this invokes `mkcert -install`):

```sh
sh install-iadmin-terminal.sh --with-local-ca
```

The shorter form below works, but reviewing a script before executing it is
safer:

```sh
curl -fsSL https://jmchantrein.github.io/site/terminal/install-iadmin-terminal.sh | sh
```

## Usage

Local shell:

```sh
iadmin-terminal local
```

Existing SSH configuration and agent:

```sh
iadmin-terminal ssh user@example.org
iadmin-terminal ssh -J bastion.example.org user@example.org
```

Paste the printed pairing address into **Terminal → Local or SSH
(companion)**. The companion never reads SSH keys itself; it executes the
system `ssh` client in a PTY.

An HTTPS website normally requires a trusted local certificate for WebSocket
connections. Generate one for `localhost` with your preferred local CA tool,
then run:

```sh
iadmin-terminal --cert localhost.pem --key localhost-key.pem local
```

Additional development origins must be explicitly allowed:

```sh
iadmin-terminal --origin http://localhost:3000 local
```
