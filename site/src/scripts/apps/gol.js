/* JEU DE LA VIE — passe-temps du dock. Deux modèles :
   - 2D : Conway classique (B3/S23), grille cliquable ;
   - 3D : règle de Bays 5766 (survie 5–7 voisins, naissance 6), grille 14³
     rendue en projection isométrique (canvas 2D — aucun moteur externe). */
export function mountGol(body, T) {
  body.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "dockapp";
  wrap.innerHTML =
    '<div class="dockapp__bar">' +
    '<span class="score" data-gen>gen 0</span>' +
    '<button class="dockapp__btn" data-mode aria-pressed="false" type="button">3D</button>' +
    '<button class="dockapp__btn" data-play aria-pressed="true" type="button">' + T("Pause", "Pause") + "</button>" +
    '<button class="dockapp__btn" data-step type="button">' + T("Pas", "Step") + "</button>" +
    '<button class="dockapp__btn" data-rand type="button">' + T("Aléatoire", "Random") + "</button>" +
    '<button class="dockapp__btn" data-clear type="button">' + T("Vider", "Clear") + "</button>" +
    "</div>" +
    '<canvas width="448" height="336" aria-label="Jeu de la vie"></canvas>' +
    '<p class="dockapp__hint" data-hint></p>';
  body.appendChild(wrap);
  const cv = wrap.querySelector("canvas"), ctx = cv.getContext("2d");
  const genEl = wrap.querySelector("[data-gen]"), hint = wrap.querySelector("[data-hint]");
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  let mode3d = false, playing = true, gen = 0, timer;

  /* ---- 2D : Conway B3/S23 ---- */
  const W = 56, H = 42, S = 8;
  let grid = new Uint8Array(W * H);
  function rand2d() { grid = grid.map(() => (Math.random() < 0.22 ? 1 : 0)); gen = 0; }
  function step2d() {
    const next = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (dx || dy) n += grid[((y + dy + H) % H) * W + ((x + dx + W) % W)];
      }
      const a = grid[y * W + x];
      next[y * W + x] = a ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
    }
    grid = next; gen++;
  }
  function draw2d() {
    ctx.fillStyle = css("--term-bg") || "#1a1a1a"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = css("--term-ok") || "#7ad08a";
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (grid[y * W + x]) ctx.fillRect(x * S + 1, y * S + 1, S - 2, S - 2);
    }
  }

  /* ---- 3D : Bays 5766, 14³, iso ---- */
  const D = 14;
  let vox = new Uint8Array(D * D * D);
  const idx = (x, y, z) => (z * D + y) * D + x;
  function rand3d() {
    vox = vox.map(() => 0);
    // amas central : plus stable visuellement qu'un bruit uniforme
    for (let z = 4; z < 10; z++) for (let y = 4; y < 10; y++) for (let x = 4; x < 10; x++) {
      if (Math.random() < 0.35) vox[idx(x, y, z)] = 1;
    }
    gen = 0;
  }
  function step3d() {
    const next = new Uint8Array(D * D * D);
    for (let z = 0; z < D; z++) for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
      let n = 0;
      for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy && !dz) continue;
        const X = x + dx, Y = y + dy, Z = z + dz;
        if (X >= 0 && X < D && Y >= 0 && Y < D && Z >= 0 && Z < D) n += vox[idx(X, Y, Z)];
      }
      const a = vox[idx(x, y, z)];
      next[idx(x, y, z)] = a ? (n >= 5 && n <= 7 ? 1 : 0) : n === 6 ? 1 : 0;
    }
    vox = next; gen++;
  }
  function draw3d() {
    ctx.fillStyle = css("--term-bg") || "#1a1a1a"; ctx.fillRect(0, 0, cv.width, cv.height);
    const s = 11, ox = cv.width / 2, oy = 54;
    const top = css("--term-ok") || "#7ad08a", left = css("--term-prompt") || "#7fb2ff", right = css("--term-dim") || "#9aa3ad";
    // tri peintre : x+y+z croissant (du fond vers l'avant)
    for (let z = 0; z < D; z++) for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
      if (!vox[idx(x, y, z)]) continue;
      const px = ox + (x - y) * s * 0.92;
      const py = oy + (x + y) * s * 0.46 + (D - z) * s * 0.9;
      ctx.fillStyle = top;
      ctx.beginPath(); ctx.moveTo(px, py - s * 0.45); ctx.lineTo(px + s * 0.92, py); ctx.lineTo(px, py + s * 0.45); ctx.lineTo(px - s * 0.92, py); ctx.closePath(); ctx.fill();
      ctx.fillStyle = left;
      ctx.beginPath(); ctx.moveTo(px - s * 0.92, py); ctx.lineTo(px, py + s * 0.45); ctx.lineTo(px, py + s * 1.25); ctx.lineTo(px - s * 0.92, py + s * 0.8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = right;
      ctx.beginPath(); ctx.moveTo(px + s * 0.92, py); ctx.lineTo(px, py + s * 0.45); ctx.lineTo(px, py + s * 1.25); ctx.lineTo(px + s * 0.92, py + s * 0.8); ctx.closePath(); ctx.fill();
    }
  }

  function draw() { (mode3d ? draw3d : draw2d)(); genEl.textContent = "gen " + gen; }
  function tick() { (mode3d ? step3d : step2d)(); draw(); }
  function loop() { clearInterval(timer); if (playing) timer = setInterval(tick, mode3d ? 420 : 120); }
  function setHint() {
    hint.textContent = mode3d
      ? T("Règle de Bays 5766 (survie 5–7 voisins, naissance 6) sur une grille 14³.", "Bays' 5766 rule (survive with 5–7 neighbours, born with 6) on a 14³ grid.")
      : T("Conway B3/S23 — cliquez la grille pour dessiner des cellules.", "Conway B3/S23 — click the grid to draw cells.");
  }
  cv.addEventListener("pointerdown", (e) => {
    if (mode3d) return;
    const r = cv.getBoundingClientRect();
    const x = (((e.clientX - r.left) / r.width) * cv.width / S) | 0;
    const y = (((e.clientY - r.top) / r.height) * cv.height / S) | 0;
    if (x >= 0 && x < W && y >= 0 && y < H) { grid[y * W + x] ^= 1; draw(); }
  });
  wrap.querySelector("[data-mode]").addEventListener("click", function () {
    mode3d = !mode3d; this.setAttribute("aria-pressed", String(mode3d));
    this.textContent = mode3d ? "2D" : "3D";
    (mode3d ? rand3d : rand2d)(); setHint(); draw(); loop();
  });
  wrap.querySelector("[data-play]").addEventListener("click", function () {
    playing = !playing; this.setAttribute("aria-pressed", String(playing));
    this.textContent = playing ? T("Pause", "Pause") : T("Lecture", "Play");
    loop();
  });
  wrap.querySelector("[data-step]").addEventListener("click", tick);
  wrap.querySelector("[data-rand]").addEventListener("click", () => { (mode3d ? rand3d : rand2d)(); draw(); });
  wrap.querySelector("[data-clear]").addEventListener("click", () => { grid.fill(0); vox.fill(0); gen = 0; draw(); });
  rand2d(); setHint(); draw(); loop();
  return () => clearInterval(timer);
}
