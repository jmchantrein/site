/* SNAKE — passe-temps du dock (canvas, flèches/ZQSD, vitesse croissante). */
export function mountSnake(body, T) {
  body.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "dockapp";
  wrap.innerHTML =
    '<div class="dockapp__bar"><span class="score">0</span>' +
    '<button class="dockapp__btn" data-restart type="button">' + T("Rejouer", "Restart") + "</button></div>" +
    '<canvas width="336" height="336" tabindex="0" aria-label="Snake"></canvas>' +
    '<p class="dockapp__hint">' + T("Flèches pour diriger — Espace : pause.", "Arrow keys to steer — Space: pause.") + "</p>";
  body.appendChild(wrap);
  const cv = wrap.querySelector("canvas"), ctx = cv.getContext("2d");
  const scoreEl = wrap.querySelector(".score");
  const N = 21, S = 16; // grille 21×21, cases 16px
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  let snake, dir, nextDir, food, score, dead, paused, timer, delay;

  function reset() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir = { x: 1, y: 0 }; nextDir = dir; score = 0; dead = false; paused = false; delay = 140;
    placeFood(); scoreEl.textContent = "0"; loop();
  }
  function placeFood() {
    do { food = { x: (Math.random() * N) | 0, y: (Math.random() * N) | 0 }; }
    while (snake.some((s) => s.x === food.x && s.y === food.y));
  }
  function step() {
    dir = nextDir;
    const h = { x: (snake[0].x + dir.x + N) % N, y: (snake[0].y + dir.y + N) % N };
    if (snake.some((s) => s.x === h.x && s.y === h.y)) { dead = true; draw(); return; }
    snake.unshift(h);
    if (h.x === food.x && h.y === food.y) {
      score += 10; scoreEl.textContent = String(score);
      delay = Math.max(60, delay - 3); placeFood();
    } else snake.pop();
    draw(); loop();
  }
  function loop() { clearTimeout(timer); if (!dead && !paused) timer = setTimeout(step, delay); }
  function draw() {
    ctx.fillStyle = css("--term-bg") || "#1a1a1a";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = css("--term-warn") || "#e3b341";
    ctx.fillRect(food.x * S + 3, food.y * S + 3, S - 6, S - 6);
    ctx.fillStyle = css("--term-ok") || "#7ad08a";
    snake.forEach((s, i) => ctx.fillRect(s.x * S + (i ? 1 : 0), s.y * S + (i ? 1 : 0), S - (i ? 2 : 0), S - (i ? 2 : 0)));
    if (dead || paused) {
      ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = css("--term-fg") || "#e0e0e0";
      ctx.font = "700 18px " + (css("--font-mono") || "monospace");
      ctx.textAlign = "center";
      ctx.fillText(dead ? T("Perdu — Rejouer ?", "Game over — Restart?") : T("Pause", "Paused"), cv.width / 2, cv.height / 2);
    }
  }
  function onKey(e) {
    const k = e.key;
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], z: [0, -1], s: [0, 1], q: [-1, 0], d: [1, 0] }[k];
    if (d) { if (d[0] !== -dir.x || d[1] !== -dir.y) nextDir = { x: d[0], y: d[1] }; e.preventDefault(); }
    else if (k === " ") { paused = !paused; draw(); loop(); e.preventDefault(); }
  }
  cv.addEventListener("keydown", onKey);
  cv.addEventListener("click", () => cv.focus());
  wrap.querySelector("[data-restart]").addEventListener("click", () => { reset(); cv.focus(); });
  reset(); draw();
  setTimeout(() => cv.focus(), 50);
  return () => clearTimeout(timer);
}
