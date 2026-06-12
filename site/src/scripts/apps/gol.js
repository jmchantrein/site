/* JEU DE LA VIE — Conway B3/S23, grille dessinable au clic. */
export function mountGol(body, T) {
  body.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "dockapp";
  wrap.innerHTML =
    '<div class="dockapp__bar">' +
    '<span class="score" data-gen>gen 0</span>' +
    '<button class="dockapp__btn" data-play aria-pressed="true" type="button">' + T("Pause", "Pause") + "</button>" +
    '<button class="dockapp__btn" data-step type="button">' + T("Pas", "Step") + "</button>" +
    '<button class="dockapp__btn" data-rand type="button">' + T("Aléatoire", "Random") + "</button>" +
    '<button class="dockapp__btn" data-clear type="button">' + T("Vider", "Clear") + "</button>" +
    "</div>" +
    '<canvas width="448" height="336" aria-label="Jeu de la vie"></canvas>' +
    '<p class="dockapp__hint">' + T("Conway B3/S23 — cliquez la grille pour dessiner des cellules.", "Conway B3/S23 — click the grid to draw cells.") + "</p>";
  body.appendChild(wrap);
  const cv = wrap.querySelector("canvas"), ctx = cv.getContext("2d");
  const genEl = wrap.querySelector("[data-gen]");
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const W = 56, H = 42, S = 8;
  let grid = new Uint8Array(W * H), playing = true, gen = 0, timer;
  function rand() { grid = grid.map(() => (Math.random() < 0.22 ? 1 : 0)); gen = 0; }
  function step() {
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
  function draw() {
    ctx.fillStyle = css("--term-bg") || "#1a1a1a"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = css("--term-ok") || "#7ad08a";
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (grid[y * W + x]) ctx.fillRect(x * S + 1, y * S + 1, S - 2, S - 2);
    }
    genEl.textContent = "gen " + gen;
  }
  function tick() { step(); draw(); }
  function loop() { clearInterval(timer); if (playing) timer = setInterval(tick, 120); }
  cv.addEventListener("pointerdown", (e) => {
    const r = cv.getBoundingClientRect();
    const x = (((e.clientX - r.left) / r.width) * cv.width / S) | 0;
    const y = (((e.clientY - r.top) / r.height) * cv.height / S) | 0;
    if (x >= 0 && x < W && y >= 0 && y < H) { grid[y * W + x] ^= 1; draw(); }
  });
  wrap.querySelector("[data-play]").addEventListener("click", function () {
    playing = !playing; this.setAttribute("aria-pressed", String(playing));
    this.textContent = playing ? T("Pause", "Pause") : T("Lecture", "Play");
    loop();
  });
  wrap.querySelector("[data-step]").addEventListener("click", tick);
  wrap.querySelector("[data-rand]").addEventListener("click", () => { rand(); draw(); });
  wrap.querySelector("[data-clear]").addEventListener("click", () => { grid.fill(0); gen = 0; draw(); });
  rand(); draw(); loop();
  return () => clearInterval(timer);
}
