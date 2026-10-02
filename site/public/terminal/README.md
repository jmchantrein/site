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

Install and run the companion **on the computer where the browser is open**.
Python 3 and either `curl` or `wget` are required there. For the public HTTPS
site, `mkcert` is also required during installation to create the trusted
localhost certificate.

### Local mode

Use local mode when the commands must act on the browser computer. The shell,
programs, files and permissions are all those of the current local user. The
remote machine needs nothing because no remote machine is involved.

```sh
iadmin-terminal local
```

### SSH mode

Use SSH mode when the commands must act on another computer. The companion and
the `ssh` client remain on the browser computer; the target computer only needs
an accessible SSH server and the intended user account. Authentication must
already work with the normal local `ssh` command (keys, agent, password,
`~/.ssh/config`, host keys and bastions all keep their usual behaviour).

```sh
iadmin-terminal ssh user@example.org
iadmin-terminal ssh -J bastion.example.org user@example.org
```

Paste the printed pairing address into **Terminal → Local or SSH
(companion)**. The companion never reads SSH keys itself; it executes the
system `ssh` client in a PTY. Do not install the companion on the SSH target:
the browser can only connect to the companion listening on its own localhost.

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
