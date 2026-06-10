/* =============================================================================
   ANNOTATE.JS — surlignage + post-it personnels, persistés par page.
   Autonome (aucune dépendance). S'active sur le conteneur [data-annotatable].

   Ancrage robuste (modèle W3C Web Annotation) :
   - TextPositionSelector : offset caractère du début dans le texte « propre »
     du conteneur (hors KaTeX / terminal / diaporama / contrôles).
   - TextQuoteSelector : citation exacte + contexte avant/après (désambiguïse
     si le texte a bougé). Au chargement on re-localise puis on ré-enveloppe.
   ============================================================================= */
(function () {
  "use strict";

  var COLORS = ["amber", "green", "blue", "pink"];
  var EXCLUDE = ".katex, .terminal, .slides, .pane-grip, .exercise__answer, .site-header, .site-footer, .annot-rail, .annot-bar, .a11y-panel, [data-settings-panel], .ds-toc, script, style, .annot-skip";
  // Annotation possible PARTOUT : racine = conteneur explicite [data-annotatable]
  // sinon le <main> de la page. Les zones dynamiques/chrome sont exclues ci-dessus.
  var root = document.querySelector("[data-annotatable]") || document.querySelector("main") || document.body;
  if (!root) return;

  var KEY = "annot:" + location.pathname.split("/").pop();
  var lastColor = "amber";

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
  var items = load();

  /* ---- Identité du lecteur (globale au navigateur) + client-id anonyme ---
     Préparé pour un futur backend : chaque annotation est stampée de l'auteur,
     et un identifiant client stable (anonyme) permettra de dédupliquer/relier
     les envois sans authentification. */
  var IDENTITY_KEY = "annot:identity";
  function loadIdentity() { try { return JSON.parse(localStorage.getItem(IDENTITY_KEY) || "{}"); } catch (e) { return {}; } }
  function saveIdentity(obj) { try { localStorage.setItem(IDENTITY_KEY, JSON.stringify(obj)); } catch (e) {} }
  var identity = loadIdentity();
  if (!identity.clientId) { identity.clientId = "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); saveIdentity(identity); }
  function authorName() { return (identity.name || "").trim(); }

  /* ---- Adaptateur d'envoi (backend) — enfichable, no-op par défaut --------
     Un futur module appellera SiteAnnotate.setBackend(fn) où fn(payload) renvoie
     une Promise. Tant qu'aucun backend n'est branché, le bouton « Envoyer »
     reste masqué et seul l'export local (copier/télécharger) est proposé. */
  var backend = null; // function(payload) -> Promise
  function buildPayload() {
    return {
      schema: "site-astro/annotations@1",
      client: identity.clientId,
      author: authorName() || null,
      page: KEY,
      url: location.href,
      title: document.title.replace(/\s+\u2014.*$/, ""),
      lang: lang(),
      sentAt: new Date().toISOString(),
      annotations: items.map(function (it) {
        return { id: it.id, quote: it.quote, prefix: it.prefix, suffix: it.suffix,
          start: it.start, color: it.color, note: (it.note || ""), ts: it.ts,
          author: it.author || authorName() || null };
      })
    };
  }

  function lang() { return document.documentElement.getAttribute("lang") === "en" ? "en" : "fr"; }
  function T(fr, en) { return lang() === "en" ? en : fr; }
  function uid() { return "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---- Parcours du texte « propre » (offsets cohérents) ------------------ */
  function textNodes() {
    var out = [];
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue.length) return NodeFilter.FILTER_REJECT;
        if (n.parentNode && n.parentNode.closest(EXCLUDE)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n; while ((n = w.nextNode())) out.push(n);
    return out;
  }
  function cleanText() { return textNodes().map(function (n) { return n.nodeValue; }).join(""); }

  // Offset (dans le texte propre) d'une position (node, offset) de sélection
  function offsetOf(node, off) {
    var nodes = textNodes(), pos = 0;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i] === node) return pos + off;
      pos += nodes[i].nodeValue.length;
    }
    // node n'est pas un nœud texte direct (ex. sélection englobant un élément) :
    // on retombe sur la position du conteneur le plus proche
    return -1;
  }

  /* ---- Enveloppement par offset (sans nesting : on dé-enveloppe d'abord) - */
  function unwrapAll() {
    root.querySelectorAll("mark.annot").forEach(function (m) {
      var p = m.parentNode;
      while (m.firstChild) p.insertBefore(m.firstChild, m);
      p.removeChild(m); p.normalize();
    });
  }
  function wrapByOffset(start, len, id, color, hasNote) {
    if (len <= 0) return false;
    var nodes = textNodes(), pos = 0, targets = [];
    for (var i = 0; i < nodes.length; i++) {
      var nlen = nodes[i].nodeValue.length, ns = pos, ne = pos + nlen; pos = ne;
      var from = Math.max(start, ns), to = Math.min(start + len, ne);
      if (from < to) targets.push({ node: nodes[i], a: from - ns, b: to - ns });
      if (ns >= start + len) break;
    }
    if (!targets.length) return false;
    // de droite à gauche : couper un nœud n'invalide pas les précédents
    for (var j = targets.length - 1; j >= 0; j--) {
      var t = targets[j], r = document.createRange();
      try {
        r.setStart(t.node, t.a); r.setEnd(t.node, t.b);
        var mk = document.createElement("mark");
        mk.className = "annot"; mk.setAttribute("data-annot-id", id); mk.setAttribute("data-color", color);
        if (hasNote) mk.setAttribute("data-note", "true");
        r.surroundContents(mk);
      } catch (e) {}
    }
    return true;
  }

  /* ---- Ré-ancrage : retrouve l'offset d'une annotation ------------------- */
  function reanchor(it) {
    var txt = cleanText();
    if (it.prefix != null && it.suffix != null) {
      var probe = it.prefix + it.quote + it.suffix;
      var k = txt.indexOf(probe);
      if (k !== -1) return k + it.prefix.length;
    }
    // sinon : occurrence de la citation la plus proche de l'offset mémorisé
    if (it.quote) {
      var best = -1, bestd = Infinity, from = 0, idx;
      while ((idx = txt.indexOf(it.quote, from)) !== -1) {
        var d = Math.abs(idx - (it.start || 0));
        if (d < bestd) { bestd = d; best = idx; }
        from = idx + 1;
      }
      if (best !== -1) return best;
    }
    return -1;
  }

  /* ---- Rendu de toutes les marques --------------------------------------- */
  function renderMarks() {
    unwrapAll();
    items.slice().sort(function (a, b) { return (a._pos || 0) - (b._pos || 0); }).forEach(function (it) {
      var pos = reanchor(it);
      it._pos = pos; it._orphan = pos === -1;
      if (pos !== -1) wrapByOffset(pos, it.quote.length, it.id, it.color, !!(it.note && it.note.trim()));
    });
  }

  /* ---- Barre flottante de sélection -------------------------------------- */
  var bar = document.createElement("div");
  bar.className = "annot-bar"; bar.setAttribute("role", "toolbar"); bar.setAttribute("aria-label", "Annoter la sélection");
  bar.innerHTML =
    COLORS.map(function (c) { return '<button class="annot-bar__sw" data-c="' + c + '" type="button" aria-label="Surligner ' + c + '"></button>'; }).join("") +
    '<span class="annot-bar__div"></span>' +
    '<button class="annot-bar__note" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg><span>' + T("Noter", "Note") + '</span></button>';
  document.body.appendChild(bar);

  var pending = null; // sélection capturée {start, quote, prefix, suffix}

  function captureSelection() {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
    var rng = sel.getRangeAt(0);
    if (!root.contains(rng.startContainer) || !root.contains(rng.endContainer)) return null;
    if ((rng.startContainer.parentNode && rng.startContainer.parentNode.closest(EXCLUDE))) return null;
    var quote = sel.toString().replace(/\s+/g, " ").trim();
    if (quote.length < 2) return null;
    var start = offsetOf(rng.startContainer, rng.startOffset);
    if (start < 0) {
      // sélection non alignée sur un nœud texte : retrouve via citation
      var t = cleanText(); start = t.indexOf(quote); if (start < 0) start = 0;
    }
    var full = cleanText();
    // réaligne la citation sur le texte propre (espaces normalisés peuvent différer)
    var realIdx = full.indexOf(quote, Math.max(0, start - 4));
    if (realIdx !== -1) start = realIdx;
    return {
      quote: quote, start: start,
      prefix: full.slice(Math.max(0, start - 24), start),
      suffix: full.slice(start + quote.length, start + quote.length + 24)
    };
  }

  function positionBar() {
    var sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    var r = sel.getRangeAt(0).getBoundingClientRect();
    if (!r.width && !r.height) return;
    bar.style.left = Math.min(window.innerWidth - 20, Math.max(20, r.left + r.width / 2)) + "px";
    bar.style.top = Math.max(46, r.top - 8) + "px";
  }
  function showBar() {
    pending = captureSelection();
    if (!pending) { hideBar(); return; }
    positionBar(); bar.setAttribute("data-open", "true");
  }
  function hideBar() { bar.removeAttribute("data-open"); }

  document.addEventListener("mouseup", function (e) {
    if (bar.contains(e.target)) return;
    setTimeout(showBar, 10);
  });
  document.addEventListener("keyup", function (e) {
    if (e.shiftKey || e.key === "Shift") setTimeout(showBar, 10);
  });
  document.addEventListener("mousedown", function (e) { if (!bar.contains(e.target)) hideBar(); });
  window.addEventListener("scroll", hideBar, { passive: true });

  function createFromPending(color, withNote) {
    if (!pending) return;
    lastColor = color;
    var it = {
      id: uid(), quote: pending.quote, start: pending.start,
      prefix: pending.prefix, suffix: pending.suffix,
      color: color, note: "", ts: Date.now(), author: authorName() || null
    };
    items.push(it); save(items);
    window.getSelection().removeAllRanges();
    hideBar(); renderMarks(); refreshRail(); updateCount();
    if (withNote) { openRail(); setTimeout(function () { focusNote(it.id); }, 60); }
  }

  bar.querySelectorAll(".annot-bar__sw").forEach(function (b) {
    b.addEventListener("click", function () { createFromPending(b.getAttribute("data-c"), false); });
  });
  bar.querySelector(".annot-bar__note").addEventListener("click", function () { createFromPending(lastColor, true); });

  /* ---- Rail de post-it --------------------------------------------------- */
  var rail = document.createElement("aside");
  rail.className = "annot-rail"; rail.setAttribute("aria-label", T("Mes notes", "My notes"));
  rail.innerHTML =
    '<div class="annot-rail__head"><div><h2>' + T("Mes notes", "My notes") + '</h2>' +
    '<span class="sub">' + T("surlignages & questions", "highlights & questions") + '</span></div>' +
    '<button class="annot-rail__close" type="button" aria-label="' + T("Fermer", "Close") + '">✕</button></div>' +
    '<div class="annot-rail__id">' +
    '<label for="annot-id-name">' + T("Votre nom ou pseudonyme", "Your name or pseudonym") + '</label>' +
    '<input id="annot-id-name" type="text" data-annot-id-name autocomplete="name" placeholder="' + T("ex. Camille D. — attaché à vos notes", "e.g. Camille D. — attached to your notes") + '">' +
    '</div>' +
    '<div class="annot-rail__body" data-rail-body></div>' +
    '<div class="annot-rail__foot">' +
    '<button class="annot-btn annot-btn--send" data-rail-send type="button" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/></svg>' + T("Envoyer", "Send") + '</button>' +
    '<button class="annot-btn" data-rail-export type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>' + T("Exporter", "Export") + '</button>' +
    '<button class="annot-btn" data-rail-import type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>' + T("Importer", "Import") + '</button>' +
    '<button class="annot-btn annot-btn--danger" data-rail-clear type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>' + T("Tout effacer", "Clear all") + '</button>' +
    '</div>';
  document.body.appendChild(rail);
  var railBody = rail.querySelector("[data-rail-body]");
  rail.querySelector(".annot-rail__close").addEventListener("click", closeRail);

  // Bandeau de message transitoire (import, etc.)
  var railMsgEl = document.createElement("div");
  railMsgEl.className = "annot-rail__msg"; railMsgEl.setAttribute("role", "status"); railMsgEl.hidden = true;
  rail.querySelector(".annot-rail__id").insertAdjacentElement("afterend", railMsgEl);
  var railMsgTimer = null;
  function railMsg(text, kind) {
    railMsgEl.textContent = text; railMsgEl.setAttribute("data-kind", kind || "info"); railMsgEl.hidden = false;
    if (railMsgTimer) clearTimeout(railMsgTimer);
    railMsgTimer = setTimeout(function () { railMsgEl.hidden = true; }, kind === "warn" ? 8000 : 4000);
  }

  // Champ identité : pré-rempli, persiste à la saisie, propagé aux annotations sans auteur
  var nameInput = rail.querySelector("[data-annot-id-name]");
  nameInput.value = identity.name || "";
  nameInput.addEventListener("input", function () {
    identity.name = nameInput.value; saveIdentity(identity);
    items.forEach(function (it) { if (!it.author) it.author = authorName() || null; });
  });

  function openRail() { rail.setAttribute("data-open", "true"); document.querySelectorAll("[data-annot-trigger]").forEach(function (t) { t.setAttribute("aria-expanded", "true"); }); }
  function closeRail() { rail.removeAttribute("data-open"); document.querySelectorAll("[data-annot-trigger]").forEach(function (t) { t.setAttribute("aria-expanded", "false"); }); }
  function toggleRail() { rail.getAttribute("data-open") === "true" ? closeRail() : openRail(); }

  function focusNote(id) {
    var card = railBody.querySelector('[data-card="' + id + '"] .postit__note');
    if (card) { card.focus(); }
  }

  function refreshRail() {
    railBody.innerHTML = "";
    var sorted = items.slice().sort(function (a, b) {
      if (a._orphan !== b._orphan) return a._orphan ? 1 : -1;
      return (a._pos || 0) - (b._pos || 0);
    });
    if (!sorted.length) {
      railBody.innerHTML = '<div class="annot-rail__empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>' +
        T("Sélectionnez un passage du cours pour le surligner et y attacher une question.", "Select a passage to highlight it and attach a question.") + '</div>';
      return;
    }
    sorted.forEach(function (it) {
      var card = document.createElement("div");
      card.className = "postit" + (it._orphan ? " is-orphan" : "");
      card.setAttribute("data-color", it.color); card.setAttribute("data-card", it.id);
      var colorBtns = COLORS.map(function (c) {
        return '<button class="postit__dot" data-c="' + c + '" type="button" aria-label="' + c + '" aria-pressed="' + (c === it.color) + '"></button>';
      }).join("");
      card.innerHTML =
        (it._orphan ? '<span class="postit__orphan-tag">' + T("passage introuvable", "passage not found") + '</span>' : "") +
        '<div class="postit__quote" data-goto>' + escapeHTML(it.quote) + '</div>' +
        '<textarea class="postit__note" data-note placeholder="' + T("Votre question ou remarque…", "Your question or remark…") + '">' + escapeHTML(it.note || "") + '</textarea>' +
        '<div class="postit__foot"><span class="postit__colors">' + colorBtns + '</span>' +
        '<button class="postit__del" data-del type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>' + T("Supprimer", "Delete") + '</button></div>';
      railBody.appendChild(card);

      var ta = card.querySelector("[data-note]");
      ta.addEventListener("input", function () {
        it.note = ta.value; save(items);
        var mk = root.querySelector('mark.annot[data-annot-id="' + it.id + '"]');
        if (mk) { if (it.note.trim()) mk.setAttribute("data-note", "true"); else mk.removeAttribute("data-note"); }
        updateCount();
      });
      card.querySelector("[data-goto]").addEventListener("click", function () { if (!it._orphan) gotoMark(it.id); });
      card.querySelectorAll(".postit__dot").forEach(function (d) {
        d.addEventListener("click", function () {
          it.color = d.getAttribute("data-c"); save(items); renderMarks(); refreshRail();
        });
      });
      card.querySelector("[data-del]").addEventListener("click", function () {
        items = items.filter(function (x) { return x.id !== it.id; }); save(items);
        renderMarks(); refreshRail(); updateCount();
      });
    });
  }

  function gotoMark(id) {
    var mk = root.querySelector('mark.annot[data-annot-id="' + id + '"]');
    if (!mk) return;
    var y = mk.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: y, behavior: document.documentElement.getAttribute("data-motion") === "off" ? "auto" : "smooth" });
    root.querySelectorAll("mark.annot.is-active").forEach(function (m) { m.classList.remove("is-active"); });
    mk.classList.add("is-active");
    setTimeout(function () { mk.classList.remove("is-active"); }, 1800);
  }

  // clic sur une marque → ouvre le rail et focalise sa note
  root.addEventListener("click", function (e) {
    var mk = e.target.closest("mark.annot");
    if (!mk) return;
    openRail();
    var id = mk.getAttribute("data-annot-id");
    var card = railBody.querySelector('[data-card="' + id + '"]');
    if (card) { card.scrollIntoView({ block: "nearest" }); focusNote(id); }
  });

  /* ---- Export des notes (questions prêtes pour l'enseignant) ------------- */
  function exportNotes() {
    if (!items.length) return;
    var title = document.title.replace(/\s+—.*$/, "");
    var who = authorName();
    var lines = ["# " + T("Mes notes", "My notes") + " — " + title];
    if (who) lines.push(T("Auteur", "Author") + " : " + who);
    lines.push(new Date().toLocaleString(), "");
    items.slice().sort(function (a, b) { return (a._pos || 0) - (b._pos || 0); }).forEach(function (it, i) {
      lines.push((i + 1) + ". « " + it.quote + " »");
      if (it.note && it.note.trim()) lines.push("   → " + it.note.trim());
      lines.push("");
    });
    var text = lines.join("\n");
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
    // Fichier téléchargé = JSON complet, réimportable sans perte (le presse-papier
    // garde la version texte lisible pour l'enseignant).
    var data = {
      schema: "site-astro/annotations@1",
      page: KEY, url: location.href, title: title,
      author: authorName() || null, client: identity.clientId,
      exportedAt: new Date().toISOString(),
      annotations: items.map(function (it) {
        return { id: it.id, quote: it.quote, prefix: it.prefix, suffix: it.suffix,
          start: it.start, color: it.color, note: (it.note || ""), ts: it.ts,
          author: it.author || authorName() || null };
      })
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "notes-" + KEY.replace(/[^a-z0-9]+/gi, "-") + ".json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    var btn = rail.querySelector("[data-rail-export]");
    var old = btn.innerHTML; btn.textContent = T("Copié ✓", "Copied ✓");
    setTimeout(function () { btn.innerHTML = old; }, 1600);
  }
  rail.querySelector("[data-rail-export]").addEventListener("click", exportNotes);

  /* ---- Import : relit un fichier JSON exporté (fusion par id) -------------
     Tolère aussi un export d'une AUTRE page : les annotations dont la citation
     n'est pas retrouvée ici s'affichent comme « introuvables » dans le rail. */
  function importData(obj) {
    if (!obj || !Array.isArray(obj.annotations)) return 0;
    if (obj.author && !identity.name) { identity.name = obj.author; saveIdentity(identity); if (nameInput) nameInput.value = identity.name; }
    var byId = {}; items.forEach(function (it) { byId[it.id] = true; });
    var added = 0;
    obj.annotations.forEach(function (a) {
      if (!a || !a.quote) return;
      var id = a.id && !byId[a.id] ? a.id : uid();
      byId[id] = true;
      items.push({ id: id, quote: a.quote, prefix: a.prefix || "", suffix: a.suffix || "",
        start: a.start || 0, color: COLORS.indexOf(a.color) >= 0 ? a.color : "amber",
        note: a.note || "", ts: a.ts || Date.now(), author: a.author || obj.author || null });
      added++;
    });
    if (added) { save(items); renderMarks(); refreshRail(); updateCount(); }
    return added;
  }
  var importInput = document.createElement("input");
  importInput.type = "file"; importInput.accept = "application/json,.json"; importInput.hidden = true;
  document.body.appendChild(importInput);
  importInput.addEventListener("change", function () {
    var f = importInput.files && importInput.files[0]; if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      var n = 0;
      try { n = importData(JSON.parse(String(rd.result))); } catch (e) { n = -1; }
      if (n < 0) { railMsg(T("Fichier illisible — JSON invalide.", "Unreadable file — invalid JSON."), "warn"); return; }
      if (n === 0) { railMsg(T("Aucune note nouvelle à importer.", "No new notes to import."), "info"); return; }
      // Certaines notes peuvent viser un passage modifié ou supprimé : on les
      // conserve (affichées « introuvables ») au lieu d'échouer, et on prévient.
      var orphan = items.filter(function (it) { return it._orphan; }).length;
      var msg = T(n + " note(s) importée(s).", n + " note(s) imported.");
      if (orphan) msg += " " + T(orphan + " passage(s) introuvable(s) — texte modifié ou supprimé. Conservés dans la liste, sans surlignage.", orphan + " passage(s) not found — text changed or removed. Kept in the list, without highlight.");
      railMsg(msg, orphan ? "warn" : "ok");
      openRail();
    };
    rd.readAsText(f); importInput.value = "";
  });
  rail.querySelector("[data-rail-import]").addEventListener("click", function () { importInput.click(); });

  /* ---- Envoi vers un backend (si configuré via setBackend) ---------------- */
  var sendBtn = rail.querySelector("[data-rail-send]");
  function refreshSendButton() { sendBtn.hidden = !backend; }
  function sendNotes() {
    if (!backend || !items.length) return;
    var prev = sendBtn.innerHTML; sendBtn.disabled = true; sendBtn.textContent = T("Envoi…", "Sending…");
    Promise.resolve(backend(buildPayload())).then(function () {
      sendBtn.textContent = T("Envoyé ✓", "Sent ✓");
    }).catch(function () {
      sendBtn.textContent = T("Échec — réessayer", "Failed — retry");
    }).then(function () {
      setTimeout(function () { sendBtn.innerHTML = prev; sendBtn.disabled = false; }, 1800);
    });
  }
  sendBtn.addEventListener("click", sendNotes);
  refreshSendButton();
  rail.querySelector("[data-rail-clear]").addEventListener("click", function () {
    if (!items.length) return;
    if (!window.confirm(T("Effacer toutes vos notes de cette page ?", "Clear all your notes on this page?"))) return;
    items = []; save(items); renderMarks(); refreshRail(); updateCount();
  });

  /* ---- Bouton d'en-tête + compteur --------------------------------------- */
  function updateCount() {
    document.querySelectorAll("[data-annot-count]").forEach(function (el) { el.setAttribute("data-n", String(items.length)); el.textContent = items.length; });
  }
  document.querySelectorAll("[data-annot-trigger]").forEach(function (t) { t.addEventListener("click", toggleRail); });

  function escapeHTML(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* ---- Réagit aux changements de langue (re-rendu du rail) --------------- */
  var lastLang = lang();
  new MutationObserver(function () {
    if (lang() !== lastLang) { lastLang = lang(); /* libellés statiques via data-lang ; ici on garde le contenu */ }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  /* ---- Init -------------------------------------------------------------- */
  function init() { renderMarks(); refreshRail(); updateCount(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  // re-rendu après KaTeX (les offsets excluent .katex, donc stable, mais on
  // attend que la mise en page soit posée pour le positionnement)
  window.addEventListener("load", function () { renderMarks(); });

  window.SiteAnnotate = {
    open: openRail, close: closeRail, export: exportNotes,
    /* Backend enfichable : SiteAnnotate.setBackend(payload => fetch(...)) ;
       fait apparaître le bouton « Envoyer ». payload = schéma documenté ci-dessus. */
    setBackend: function (fn) { backend = (typeof fn === "function") ? fn : null; refreshSendButton(); },
    getPayload: buildPayload,
    setIdentity: function (name) { identity.name = name || ""; saveIdentity(identity); if (nameInput) nameInput.value = identity.name; },
    getIdentity: function () { return { name: identity.name || "", clientId: identity.clientId }; }
  };
})();
