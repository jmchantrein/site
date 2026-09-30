#!/usr/bin/env python3
"""End-to-end protocol check for the dependency-free terminal companion."""

import base64
import json
import os
import re
import socket
import struct
import subprocess
import time
from pathlib import Path

COMPANION = Path(__file__).parents[1] / "public/terminal/iadmin-terminal.py"


def masked_message(message):
    data = json.dumps(message).encode()
    mask = os.urandom(4)
    payload = bytes(byte ^ mask[index % 4] for index, byte in enumerate(data))
    assert len(data) < 126
    return bytes((0x81, 0x80 | len(data))) + mask + payload


def receive(sock):
    header = sock.recv(2)
    size = header[1] & 0x7F
    if size == 126:
        size = struct.unpack("!H", sock.recv(2))[0]
    elif size == 127:
        size = struct.unpack("!Q", sock.recv(8))[0]
    payload = b""
    while len(payload) < size:
        payload += sock.recv(size - len(payload))
    return json.loads(payload)


process = subprocess.Popen(
    ["python3", str(COMPANION), "local", "--shell", "/bin/sh"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
)
assert process.stdout.readline().strip() == "IAdmin pairing address:"
address = process.stdout.readline().strip()
match = re.fullmatch(r"ws://localhost:(\d+)/\?token=(.+)", address)
assert match
port, token = int(match.group(1)), match.group(2)

client = socket.create_connection(("127.0.0.1", port))
key = base64.b64encode(os.urandom(16)).decode()
client.sendall((
    f"GET /?token={token} HTTP/1.1\r\nHost: localhost:{port}\r\n"
    "Origin: https://jmchantrein.github.io\r\nUpgrade: websocket\r\n"
    f"Connection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
).encode())
assert client.recv(4096).startswith(b"HTTP/1.1 101 Switching Protocols")
client.sendall(masked_message({"type": "resize", "cols": 90, "rows": 24}))
client.sendall(masked_message({"type": "input", "data": "printf IADMIN_COMPANION_OK\\n\n"}))

output = ""
deadline = time.monotonic() + 5
while "IADMIN_COMPANION_OK" not in output and time.monotonic() < deadline:
    output += receive(client).get("data", "")
assert "IADMIN_COMPANION_OK" in output
client.close()
process.wait(timeout=5)
print("Terminal companion: handshake, resize, input and PTY output are coherent.")
