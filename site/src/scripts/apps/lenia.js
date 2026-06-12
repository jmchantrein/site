/* LENIA — automate cellulaire CONTINU (Bert Chan, 2019) : états réels [0,1],
   noyau de convolution annulaire, fonction de croissance gaussienne — des
   « formes de vie » lisses émergent (paramètres du monde Orbium :
   R=13, T=10, μ=0,15, σ=0,017). Tout est local : canvas 2D, zéro dépendance. */
export function mountLenia(body, T) {
  body.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "dockapp";
  wrap.innerHTML =
    '<div class="dockapp__bar">' +
    '<span class="score" data-t>t 0</span>' +
    '<button class="dockapp__btn" data-play aria-pressed="true" type="button">' + T("Pause", "Pause") + "</button>" +
    '<button class="dockapp__btn" data-step type="button">' + T("Pas", "Step") + "</button>" +
    '<button class="dockapp__btn" data-rand type="button">' + T("Réensemencer", "Reseed") + "</button>" +
    "</div>" +
    '<canvas width="384" height="384" aria-label="Lenia"></canvas>' +
    '<p class="dockapp__hint">' +
    T("Lenia — jeu de la vie continu (Bert Chan) : noyau annulaire + croissance gaussienne. Cliquez pour déposer de la matière.",
      "Lenia — continuous Game of Life (Bert Chan): ring kernel + Gaussian growth. Click to drop matter.") + "</p>";
  body.appendChild(wrap);
  const cv = wrap.querySelector("canvas"), ctx = cv.getContext("2d");
  const tEl = wrap.querySelector("[data-t]");

  const N = 96, SC = 4;             // monde 96×96 (torique), 4 px par cellule
  const R = 12, MU = 0.15, SIGMA = 0.017, DT = 0.1;
  let A = new Float32Array(N * N);
  let playing = true, t = 0, raf = 0, last = 0;

  // Noyau annulaire normalisé : K(r) = bell(r/R ; 0,5 ; 0,15), précalculé.
  const kern = [];
  let ksum = 0;
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    const r = Math.sqrt(dx * dx + dy * dy) / R;
    if (r === 0 || r > 1) continue;
    const w = Math.exp(-((r - 0.5) * (r - 0.5)) / (2 * 0.15 * 0.15));
    kern.push(dx, dy, w); ksum += w;
  }
  for (let i = 2; i < kern.length; i += 3) kern[i] /= ksum;

  const growth = (u) => 2 * Math.exp(-((u - MU) * (u - MU)) / (2 * SIGMA * SIGMA)) - 1;

  function blob(cx, cy, rad) {
    for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy) / rad;
      if (d > 1) continue;
      const x = (cx + dx + N) % N, y = (cy + dy + N) % N;
      A[y * N + x] = Math.min(1, A[y * N + x] + Math.random() * (1 - d));
    }
  }
  function reseed() {
    A.fill(0); t = 0;
    for (let i = 0; i < 6; i++) blob((Math.random() * N) | 0, (Math.random() * N) | 0, 6 + ((Math.random() * 6) | 0));
  }
  function step() {
    const B = new Float32Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let u = 0;
      for (let k = 0; k < kern.length; k += 3) {
        u += A[(((y + kern[k + 1] + N) % N) * N + ((x + kern[k] + N) % N))] * kern[k + 2];
      }
      const v = A[y * N + x] + DT * growth(u);
      B[y * N + x] = v < 0 ? 0 : v > 1 ? 1 : v;
    }
    A = B; t++;
  }
  // Dégradé : fond du terminal → accent → presque blanc.
  const img = ctx.createImageData(N, N);
  function draw() {
    const d = img.data;
    for (let i = 0; i < N * N; i++) {
      const v = A[i];
      d[i * 4] = 12 + v * 110;        // R
      d[i * 4 + 1] = 26 + v * 190;    // G
      d[i * 4 + 2] = 38 + v * 200;    // B
      d[i * 4 + 3] = 255;
    }
    createImageBitmap(img).then((bm) => {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(bm, 0, 0, N * SC, N * SC);
    });
    tEl.textContent = "t " + t;
  }
  function frame(ts) {
    raf = requestAnimationFrame(frame);
    if (!playing || ts - last < 90) return;
    last = ts; step(); draw();
  }
  cv.addEventListener("pointerdown", (e) => {
    const r = cv.getBoundingClientRect();
    blob((((e.clientX - r.left) / r.width) * N) | 0, (((e.clientY - r.top) / r.height) * N) | 0, 8);
    draw();
  });
  wrap.querySelector("[data-play]").addEventListener("click", function () {
    playing = !playing; this.setAttribute("aria-pressed", String(playing));
    this.textContent = playing ? T("Pause", "Pause") : T("Lecture", "Play");
  });
  wrap.querySelector("[data-step]").addEventListener("click", () => { step(); draw(); });
  wrap.querySelector("[data-rand]").addEventListener("click", () => { reseed(); draw(); });
  reseed(); draw(); raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
