/* 2048 — passe-temps du dock (grille DOM 4×4, flèches ou ZQSD/WASD). */
export function mount2048(body, T) {
  body.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "dockapp";
  wrap.innerHTML =
    '<div class="dockapp__bar"><span class="score">0</span>' +
    '<button class="dockapp__btn" data-restart type="button">' + T("Rejouer", "Restart") + "</button></div>" +
    '<div class="g2048" tabindex="0" role="application" aria-label="2048"></div>' +
    '<p class="dockapp__hint">' + T("Flèches ou ZQSD pour fusionner les tuiles — atteignez 2048.", "Arrow keys or WASD to merge tiles — reach 2048.") + "</p>";
  body.appendChild(wrap);
  const grid = wrap.querySelector(".g2048"), scoreEl = wrap.querySelector(".score");
  let g, score;
  const cells = Array.from({ length: 16 }, () => {
    const c = document.createElement("div"); c.className = "c"; grid.appendChild(c); return c;
  });
  function reset() { g = Array.from({ length: 4 }, () => [0, 0, 0, 0]); score = 0; add(); add(); paint(); }
  function add() {
    const free = [];
    g.forEach((row, y) => row.forEach((v, x) => { if (!v) free.push([x, y]); }));
    if (!free.length) return;
    const [x, y] = free[(Math.random() * free.length) | 0];
    g[y][x] = Math.random() < 0.9 ? 2 : 4;
  }
  function paint() {
    g.flat().forEach((v, i) => {
      cells[i].textContent = v || "";
      cells[i].setAttribute("data-v", v ? String(v) : "");
      cells[i].setAttribute("data-big", v >= 128 ? "true" : "false");
    });
    scoreEl.textContent = String(score);
  }
  function slide(row) {
    const a = row.filter(Boolean);
    for (let i = 0; i < a.length - 1; i++) {
      if (a[i] === a[i + 1]) { a[i] *= 2; score += a[i]; a.splice(i + 1, 1); }
    }
    while (a.length < 4) a.push(0);
    return a;
  }
  function move(dx, dy) {
    const before = JSON.stringify(g);
    if (dx) {
      g = g.map((row) => (dx === -1 ? slide(row) : slide([...row].reverse()).reverse()));
    } else {
      for (let x = 0; x < 4; x++) {
        let col = [g[0][x], g[1][x], g[2][x], g[3][x]];
        col = dy === -1 ? slide(col) : slide(col.reverse()).reverse();
        for (let y = 0; y < 4; y++) g[y][x] = col[y];
      }
    }
    if (JSON.stringify(g) !== before) { add(); paint(); }
  }
  grid.addEventListener("keydown", (e) => {
    // Flèches + ZQSD/WASD (mêmes touches que Snake).
    const m = {
      ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
      q: [-1, 0], a: [-1, 0], d: [1, 0], z: [0, -1], w: [0, -1], s: [0, 1],
    }[e.key.length === 1 ? e.key.toLowerCase() : e.key];
    if (m) { move(m[0], m[1]); e.preventDefault(); }
  });
  wrap.querySelector("[data-restart]").addEventListener("click", () => { reset(); grid.focus(); });
  reset();
  setTimeout(() => grid.focus(), 50);
  return () => {};
}
