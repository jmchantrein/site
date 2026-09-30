import { V86 } from "v86";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "public", "vm");
const emulator = new V86({
  wasm_path: path.join(root, "v86.wasm"), bios: { url: path.join(root, "seabios.bin") },
  vga_bios: { url: path.join(root, "vgabios.bin") },
  cdrom: { url: path.join(root, "alpine", "alpine-virt-3.21.3-x86.iso") },
  memory_size: 256 * 1024 * 1024, autostart: true,
});
let output = "";
let finished = false;
const timeout = setTimeout(() => { emulator.destroy(); throw new Error("Alpine did not expose its serial console within 90 seconds"); }, 90_000);
emulator.add_listener("serial0-output-byte", (byte) => {
  output += String.fromCharCode(byte);
  if (!finished && output.includes("Alpine Init")) {
    finished = true;
    clearTimeout(timeout); emulator.destroy();
    console.log("VM boot: Alpine kernel and initramfs reached the serial console.");
  }
});
setTimeout(() => emulator.serial0_send("\n"), 1_200);
