import { V86 } from "v86";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "public", "vm");
const emulator = new V86({
  wasm_path: path.join(root, "v86.wasm"), bios: { url: path.join(root, "seabios.bin") },
  vga_bios: { url: path.join(root, "vgabios.bin") },
  bzimage: { url: path.join(root, "alpine", "bzImage") },
  initrd: { url: path.join(root, "alpine", "initrd.gz") },
  cmdline: "console=ttyS0,115200 rdinit=/init",
  memory_size: 512 * 1024 * 1024, autostart: true,
});
let output = "";
let finished = false;
let shellReady = false;
const timeout = setTimeout(() => { emulator.destroy(); throw new Error("Alpine did not expose its serial console within 90 seconds"); }, 90_000);
emulator.add_listener("serial0-output-byte", (byte) => {
  output += String.fromCharCode(byte);
  if (!shellReady && output.includes("IADMIN_ALPINE_READY")) {
    shellReady = true;
    setTimeout(() => emulator.serial0_send("command -v bash git jq yq yamllint tmux tmuxp >/dev/null && ls --version >/dev/null && echo IADMIN_TOOLS_READY\n"), 250);
  }
  if (!finished && output.includes("IADMIN_TOOLS_READY")) {
    finished = true;
    clearTimeout(timeout); emulator.destroy();
    console.log("VM boot: Alpine reached its offline teaching shell.");
  }
});
