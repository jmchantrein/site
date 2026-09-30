#!/usr/bin/env python3
"""Expose a local shell or the system SSH client to the IAdmin terminal.

The server only listens on the loopback interface, accepts one authenticated
WebSocket client and forwards raw PTY input/output. It has no third-party
Python dependency.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import pty
import secrets
import select
import signal
import socket
import ssl
import struct
import sys
import termios
from urllib.parse import parse_qs, urlsplit

DEFAULT_ORIGINS = (
    "https://jmchantrein.github.io",
    "http://localhost:4321",
    "http://127.0.0.1:4321",
)


MAX_FRAME = 1024 * 1024


def websocket_frame(payload: bytes, opcode: int = 1) -> bytes:
    size = len(payload)
    if size < 126:
        return bytes((0x80 | opcode, size)) + payload
    if size < 65536:
        return bytes((0x80 | opcode, 126)) + struct.pack("!H", size) + payload
    return bytes((0x80 | opcode, 127)) + struct.pack("!Q", size) + payload


def read_exact(conn: socket.socket, size: int) -> bytes | None:
    payload = bytearray()
    while len(payload) < size:
        block = conn.recv(size - len(payload))
        if not block:
            return None
        payload.extend(block)
    return bytes(payload)


def receive_frame(conn: socket.socket) -> tuple[int, bytes] | None:
    header = read_exact(conn, 2)
    if not header:
        return None
    opcode, size = header[0] & 0x0F, header[1] & 0x7F
    masked = bool(header[1] & 0x80)
    if size == 126:
        raw = read_exact(conn, 2)
        if raw is None:
            return None
        size = struct.unpack("!H", raw)[0]
    elif size == 127:
        raw = read_exact(conn, 8)
        if raw is None:
            return None
        size = struct.unpack("!Q", raw)[0]
    if not masked or size > MAX_FRAME:
        return None
    mask = read_exact(conn, 4)
    payload = bytearray(read_exact(conn, size) or b"")
    if len(payload) != size:
        return None
    if mask:
        for index in range(size):
            payload[index] ^= mask[index % 4]
    return opcode, bytes(payload)


def reject(conn: socket.socket, status: str) -> None:
    conn.sendall(f"HTTP/1.1 {status}\r\nConnection: close\r\n\r\n".encode())
    conn.close()


def handshake(conn: socket.socket, token: str, origins: set[str]) -> bool:
    request = b""
    while b"\r\n\r\n" not in request and len(request) < 16384:
        block = conn.recv(4096)
        if not block:
            return False
        request += block
    lines = request.decode("latin1").split("\r\n")
    try:
        method, target, _ = lines[0].split(" ", 2)
        headers = {key.lower(): value.strip() for key, value in (line.split(":", 1) for line in lines[1:] if ":" in line)}
    except ValueError:
        reject(conn, "400 Bad Request")
        return False
    supplied = parse_qs(urlsplit(target).query).get("token", [""])[0]
    if method != "GET" or not secrets.compare_digest(supplied, token):
        reject(conn, "401 Unauthorized")
        return False
    if headers.get("origin") not in origins:
        reject(conn, "403 Forbidden")
        return False
    key = headers.get("sec-websocket-key", "")
    accept = base64.b64encode(hashlib.sha1((key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").encode()).digest()).decode()
    conn.sendall((
        "HTTP/1.1 101 Switching Protocols\r\n"
        "Upgrade: websocket\r\nConnection: Upgrade\r\n"
        f"Sec-WebSocket-Accept: {accept}\r\n\r\n"
    ).encode())
    return True


def resize(fd: int, cols: int, rows: int) -> None:
    import fcntl
    fcntl.ioctl(fd, termios.TIOCSWINSZ, struct.pack("HHHH", rows, cols, 0, 0))


def session(conn: socket.socket, command: list[str]) -> None:
    pid, master = pty.fork()
    if pid == 0:
        os.execvp(command[0], command)
    try:
        resize(master, 100, 32)
        while True:
            readable, _, _ = select.select((conn, master), (), ())
            if master in readable:
                try:
                    output = os.read(master, 32768)
                except OSError:
                    break
                conn.sendall(websocket_frame(json.dumps({"type": "output", "data": output.decode("utf-8", "replace")}).encode()))
            if conn in readable:
                frame = receive_frame(conn)
                if frame is None or frame[0] == 8:
                    break
                if frame[0] == 9:
                    conn.sendall(websocket_frame(frame[1], opcode=10))
                    continue
                if frame[0] != 1:
                    continue
                try:
                    message = json.loads(frame[1].decode())
                except (UnicodeDecodeError, json.JSONDecodeError):
                    continue
                if message.get("type") == "input" and isinstance(message.get("data"), str):
                    os.write(master, message["data"].encode())
                elif message.get("type") == "resize":
                    cols = max(20, min(500, int(message.get("cols", 100))))
                    rows = max(5, min(200, int(message.get("rows", 32))))
                    resize(master, cols, rows)
    finally:
        try:
            os.kill(pid, signal.SIGHUP)
        except ProcessLookupError:
            pass
        os.close(master)


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Connect IAdmin to a local shell or SSH session")
    parser.add_argument("--port", type=int, default=0, help="loopback port (default: random)")
    parser.add_argument("--origin", action="append", default=[], help="additional allowed browser origin")
    parser.add_argument("--cert", help="TLS certificate for wss://")
    parser.add_argument("--key", help="TLS private key for wss://")
    modes = parser.add_subparsers(dest="mode", required=True)
    local = modes.add_parser("local")
    local.add_argument("--shell", default=os.environ.get("SHELL", "/bin/sh"))
    ssh = modes.add_parser("ssh")
    ssh.add_argument("ssh_args", nargs=argparse.REMAINDER)
    return parser.parse_args()


def main() -> int:
    args = arguments()
    config = os.path.join(os.environ.get("XDG_CONFIG_HOME", os.path.expanduser("~/.config")), "iadmin-terminal")
    default_cert, default_key = os.path.join(config, "localhost.pem"), os.path.join(config, "localhost-key.pem")
    if not args.cert and not args.key and os.path.isfile(default_cert) and os.path.isfile(default_key):
        args.cert, args.key = default_cert, default_key
    if bool(args.cert) != bool(args.key):
        raise SystemExit("--cert and --key must be provided together")
    command = [args.shell, "-l"] if args.mode == "local" else ["ssh", "-tt", *args.ssh_args]
    if args.mode == "ssh" and not args.ssh_args:
        raise SystemExit("an SSH destination is required")
    token = secrets.token_urlsafe(32)
    server = socket.create_server(("127.0.0.1", args.port), family=socket.AF_INET)
    port = server.getsockname()[1]
    scheme = "wss" if args.cert else "ws"
    print(f"IAdmin pairing address:\n{scheme}://localhost:{port}/?token={token}", flush=True)
    if not args.cert:
        print("Warning: an HTTPS site may reject ws://. Use --cert and --key for wss://.", file=sys.stderr)
    conn, _ = server.accept()
    if args.cert:
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(args.cert, args.key)
        conn = context.wrap_socket(conn, server_side=True)
    origins = set(DEFAULT_ORIGINS) | set(args.origin)
    if handshake(conn, token, origins):
        session(conn, command)
    conn.close()
    server.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
