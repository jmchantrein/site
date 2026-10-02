import { V86 } from "v86";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "public", "vm");
const emulator = new V86({
  wasm_path: path.join(root, "v86.wasm"), bios: { url: path.join(root, "seabios.bin") },
  vga_bios: { url: path.join(root, "vgabios.bin") },
  bzimage: { url: path.join(root, "debian", "bzImage") },
  initrd: { url: path.join(root, "debian", "initrd.gz") },
  cmdline: "console=ttyS0,115200 rdinit=/init",
  memory_size: 512 * 1024 * 1024, autostart: true,
});
let output = "";
const timeout = setTimeout(() => {
  emulator.destroy();
  throw new Error(`Debian did not expose its teaching shell within 90 seconds. Last serial output:\n${output || "(none)"}`);
}, 90_000);
emulator.add_listener("serial0-output-byte", (byte) => {
  output = (output + String.fromCharCode(byte)).slice(-4096);
  if (output.includes("IADMIN_DEBIAN_READY")) {
    clearTimeout(timeout); emulator.destroy();
    console.log("VM boot: Debian reached its real serial teaching shell.");
  }
});
