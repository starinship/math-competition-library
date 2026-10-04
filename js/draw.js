/* ============================================================
   練習頁畫筆（離線、無外部資源）
   - 每一題（ol.questions > li.problem-card）各有一張透明畫布，
     畫作跟題目一起捲動；題卡因「檢查／答案」展開而變高時自動重繪。
   - 筆畫以向量（CSS px，相對題卡左上角）保存，可復原；
     同一分頁內存於 sessionStorage（重新整理仍在，關閉分頁即清除）。
   - 畫筆關閉時畫布不攔截點擊，輸入框及按鈕照常使用。
   - 列印時畫布、工具列、草稿區全部隱藏（空白卷保持空白）。
   ============================================================ */
(function () {
  "use strict";
  if (typeof window === "undefined" || !document.querySelector || !window.HTMLCanvasElement) return;

  var CARD_SEL = "ol.questions > li.problem-card";
  var COLORS = [
    { c: "#111111", n: "黑色" },
    { c: "#d32f2f", n: "紅色" },
    { c: "#1565c0", n: "藍色" },
    { c: "#2e7d32", n: "綠色" }
  ];
  var WIDTHS = [
    { w: 3, n: "細" },
    { w: 7, n: "粗" }
  ];
  var ERASER_W = 28;
  var MAX_DPR = 2; /* iPhone 為 3x；2x 已足夠清晰並省記憶體 */
  var MAX_PIXELS = 4000000; /* 每張畫布上限（約 16MB） */
  var STORE_KEY = "mcl-draw:v1:" + location.pathname;

  var state = { active: false, tool: "pen", color: COLORS[0].c, width: WIDTHS[0].w, penSeen: false };
  var hosts = [];
  var history = [];
  var seq = 0;
  var pointers = {}; /* pointerId -> { host, stroke } */
  var touches = {}; /* touch pointerId -> {x,y} */
  var pan = null; /* {x,y} 雙指捲動 */
  var penDown = 0;
  var ui = {};
  var saveTimer = null;

  /* ---------- 題卡畫布 ---------- */
  function setupHosts() {
    var cards = document.querySelectorAll(CARD_SEL);
    for (var i = 0; i < cards.length; i++) {
      var el = cards[i];
      var cv = document.createElement("canvas");
      cv.className = "draw-canvas";
      cv.width = 0;
      cv.height = 0;
      cv.setAttribute("aria-hidden", "true");
      var scratch = document.createElement("div");
      scratch.className = "draw-scratch";
      scratch.setAttribute("aria-hidden", "true");
      /* 標籤用 CSS ::before，避免錯題本擷取題幹時混入文字 */
      el.classList.add("draw-host");
      el.appendChild(scratch);
      el.appendChild(cv);
      var h = { el: el, id: el.getAttribute("data-unit") || "c" + i, canvas: cv, ctx: null, strokes: [], w: 0, h: 0, scale: 0 };
      hosts.push(h);
      bindCanvas(h);
    }
    if (typeof ResizeObserver === "function") {
      var ro = new ResizeObserver(function (entries) {
        for (var j = 0; j < entries.length; j++) {
          var hh = hostOf(entries[j].target);
          if (hh) sizeHost(hh);
        }
      });
      hosts.forEach(function (h) { ro.observe(h.el); });
    }
    var rt = null;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { hosts.forEach(sizeHost); }, 120);
    });
    window.addEventListener("orientationchange", function () {
      setTimeout(function () { hosts.forEach(sizeHost); }, 300);
    });
  }

  function hostOf(el) {
    for (var i = 0; i < hosts.length; i++) if (hosts[i].el === el) return hosts[i];
    return null;
  }

  function hasInk(h) {
    for (var i = 0; i < h.strokes.length; i++) if (h.strokes[i].t === "p") return true;
    return false;
  }

  function needsBacking(h) {
    return state.active || h.strokes.length > 0;
  }

  function sizeHost(h) {
    var cv = h.canvas;
    if (!needsBacking(h)) {
      if (cv.width || cv.height) {
        cv.width = 0;
        cv.height = 0;
        h.w = h.h = h.scale = 0;
      }
      return;
    }
    var w = h.el.clientWidth, ht = h.el.clientHeight;
    if (!w || !ht) return;
    var scale = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    if (w * ht * scale * scale > MAX_PIXELS) scale = Math.sqrt(MAX_PIXELS / (w * ht));
    if (w === h.w && ht === h.h && scale === h.scale && cv.width) return;
    h.w = w;
    h.h = ht;
    h.scale = scale;
    cv.width = Math.max(1, Math.round(w * scale));
    cv.height = Math.max(1, Math.round(ht * scale));
    h.ctx = cv.getContext("2d");
    redraw(h);
  }

  function redraw(h) {
    if (!h.ctx || !h.canvas.width) return;
    var ctx = h.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, h.canvas.width, h.canvas.height);
    ctx.setTransform(h.scale, 0, 0, h.scale, 0, 0);
    for (var i = 0; i < h.strokes.length; i++) drawStroke(ctx, h.strokes[i], 0);
  }

  function prep(ctx, s) {
    ctx.globalCompositeOperation = s.t === "e" ? "destination-out" : "source-over";
    ctx.strokeStyle = s.c;
    ctx.fillStyle = s.c;
    ctx.lineWidth = s.w;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  /* 由第 from 個點起畫（from=0 畫整條） */
  function drawStroke(ctx, s, from) {
    var p = s.p, n = p.length / 2;
    if (!n) return;
    ctx.save();
    prep(ctx, s);
    if (n === 1) {
      ctx.beginPath();
      ctx.arc(p[0], p[1], s.w / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      var start = Math.max(1, from);
      ctx.beginPath();
      ctx.moveTo(p[(start - 1) * 2], p[(start - 1) * 2 + 1]);
      for (var i = start; i < n; i++) ctx.lineTo(p[i * 2], p[i * 2 + 1]);
      ctx.stroke();
    }
    ctx.restore();
  }

  function updateInk(h) {
    h.el.classList.toggle("has-ink", hasInk(h));
  }

  /* ---------- 指標事件 ---------- */
  function bindCanvas(h) {
    var cv = h.canvas;
    cv.addEventListener("pointerdown", function (e) { onDown(h, e); });
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);
    cv.addEventListener("lostpointercapture", onUp);
    /* 舊版 iOS 後備：畫筆開啟時阻止捲動／放大鏡 */
    var stop = function (e) { if (state.active && e.cancelable) e.preventDefault(); };
    cv.addEventListener("touchstart", stop, { passive: false });
    cv.addEventListener("touchmove", stop, { passive: false });
    cv.addEventListener("contextmenu", function (e) { if (state.active) e.preventDefault(); });
  }

  function localPt(h, e) {
    var r = h.canvas.getBoundingClientRect();
    return [Math.round((e.clientX - r.left) * 10) / 10, Math.round((e.clientY - r.top) * 10) / 10];
  }

  function touchCount() {
    return Object.keys(touches).length;
  }

  function touchAvg() {
    var k = Object.keys(touches), x = 0, y = 0;
    for (var i = 0; i < k.length; i++) { x += touches[k[i]].x; y += touches[k[i]].y; }
    return { x: x / (k.length || 1), y: y / (k.length || 1) };
  }

  function abortTouchStrokes() {
    Object.keys(pointers).forEach(function (id) {
      var d = pointers[id];
      if (d.type !== "touch") return;
      var idx = d.host.strokes.indexOf(d.stroke);
      if (idx >= 0) d.host.strokes.splice(idx, 1);
      for (var i = history.length - 1; i >= 0; i--) {
        if (history[i].stroke === d.stroke) { history.splice(i, 1); break; }
      }
      redraw(d.host);
      updateInk(d.host);
      delete pointers[id];
    });
    refreshButtons();
  }

  function onDown(h, e) {
    if (!state.active) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    if (e.pointerType === "pen") { state.penSeen = true; penDown++; }
    try { h.canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    if (e.pointerType === "touch") {
      touches[e.pointerId] = { x: e.clientX, y: e.clientY };
      /* 雙指＝捲動；用過 Apple Pencil 後，手指一律捲動（防手掌誤觸） */
      if (touchCount() >= 2 || state.penSeen) {
        if (state.penSeen && penDown > 0 && touchCount() < 2) return; /* 筆在畫時忽略手掌 */
        abortTouchStrokes();
        pan = touchAvg();
        return;
      }
    }
    if (pan) return;
    if (!h.ctx || !h.canvas.width) sizeHost(h);
    var pt = localPt(h, e);
    var s = state.tool === "eraser"
      ? { t: "e", c: "#000", w: ERASER_W, p: pt, s: ++seq }
      : { t: "p", c: state.color, w: state.width, p: pt, s: ++seq };
    h.strokes.push(s);
    history.push({ type: "stroke", host: h, stroke: s });
    pointers[e.pointerId] = { host: h, stroke: s, type: e.pointerType };
    if (h.ctx) drawStroke(h.ctx, s, 0);
    refreshButtons();
  }

  function onMove(e) {
    if (!state.active) return;
    if (e.pointerType === "touch" && touches[e.pointerId]) {
      touches[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (pan) {
        var a = touchAvg();
        var dx = a.x - pan.x, dy = a.y - pan.y;
        pan = a;
        if (dx || dy) window.scrollBy(-dx, -dy);
        return;
      }
    }
    var d = pointers[e.pointerId];
    if (!d) return;
    e.preventDefault();
    var h = d.host, s = d.stroke;
    var list = (typeof e.getCoalescedEvents === "function" && e.getCoalescedEvents()) || [];
    if (!list.length) list = [e];
    var before = s.p.length / 2;
    for (var i = 0; i < list.length; i++) {
      var pt = localPt(h, list[i]);
      var n = s.p.length;
      if (n >= 2 && Math.abs(s.p[n - 2] - pt[0]) < 0.6 && Math.abs(s.p[n - 1] - pt[1]) < 0.6) continue;
      s.p.push(pt[0], pt[1]);
    }
    if (h.ctx && s.p.length / 2 > before) drawStroke(h.ctx, s, before);
  }

  function onUp(e) {
    if (e.pointerType === "pen" && penDown > 0 && (e.type === "pointerup" || e.type === "pointercancel")) penDown--;
    if (e.pointerType === "touch" && touches[e.pointerId]) {
      delete touches[e.pointerId];
      if (pan) {
        if (touchCount() === 0) pan = null;
        else pan = touchAvg();
      }
    }
    var d = pointers[e.pointerId];
    if (!d) return;
    delete pointers[e.pointerId];
    updateInk(d.host);
    scheduleSave();
  }

  /* ---------- 復原／清除 ---------- */
  function undo() {
    var it = history.pop();
    if (!it) return;
    if (it.type === "stroke") {
      var idx = it.host.strokes.indexOf(it.stroke);
      if (idx >= 0) it.host.strokes.splice(idx, 1);
      redraw(it.host);
      updateInk(it.host);
      if (!state.active) sizeHost(it.host);
    } else if (it.type === "clear") {
      it.saved.forEach(function (x) {
        x.host.strokes = x.strokes;
        sizeHost(x.host);
        redraw(x.host);
        updateInk(x.host);
      });
    }
    refreshButtons();
    scheduleSave();
  }

  function clearAll() {
    var saved = [];
    hosts.forEach(function (h) {
      if (h.strokes.length) {
        saved.push({ host: h, strokes: h.strokes });
        h.strokes = [];
        redraw(h);
        updateInk(h);
      }
    });
    if (saved.length) history.push({ type: "clear", saved: saved });
    refreshButtons();
    scheduleSave();
  }

  function totalStrokes() {
    var n = 0;
    hosts.forEach(function (h) { n += h.strokes.length; });
    return n;
  }

  /* ---------- sessionStorage（同一分頁內暫存） ---------- */
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 300);
  }

  function save() {
    try {
      var data = { cards: {} }, any = false;
      hosts.forEach(function (h) {
        if (h.strokes.length) { data.cards[h.id] = h.strokes; any = true; }
      });
      if (any) sessionStorage.setItem(STORE_KEY, JSON.stringify(data));
      else sessionStorage.removeItem(STORE_KEY);
    } catch (err) { /* 私密瀏覽或容量不足：只是不保存 */ }
  }

  function load() {
    var data;
    try { data = JSON.parse(sessionStorage.getItem(STORE_KEY) || "null"); } catch (err) { data = null; }
    if (!data || !data.cards) return;
    var all = [];
    hosts.forEach(function (h) {
      var arr = data.cards[h.id];
      if (!Array.isArray(arr)) return;
      h.strokes = arr.filter(function (s) { return s && Array.isArray(s.p) && s.p.length >= 2; });
      h.strokes.forEach(function (s) {
        all.push({ type: "stroke", host: h, stroke: s });
        if (s.s > seq) seq = s.s;
      });
      updateInk(h);
    });
    all.sort(function (a, b) { return (a.stroke.s || 0) - (b.stroke.s || 0); });
    history = all;
  }

  /* ---------- 工具列 ---------- */
  function btn(cls, html, label, onClick) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "draw-btn " + cls;
    b.innerHTML = html;
    if (label) { b.setAttribute("aria-label", label); b.title = label; }
    b.addEventListener("click", onClick);
    return b;
  }

  function buildUI() {
    var wrap = document.createElement("div");
    wrap.className = "draw-ui no-print";
    wrap.id = "draw-ui";

    var fab = btn("draw-fab", '<span aria-hidden="true">✏️</span> 畫筆', "開啟畫筆", function () { setActive(true); });
    fab.setAttribute("aria-pressed", "false");
    fab.removeAttribute("title");

    var bar = document.createElement("div");
    bar.className = "draw-bar";
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", "畫筆工具");
    bar.hidden = true;

    var row1 = document.createElement("div");
    row1.className = "draw-row";
    ui.colorBtns = COLORS.map(function (c) {
      var b = btn("draw-color", '<span class="draw-swatch" style="background:' + c.c + '"></span>', c.n, function () {
        state.tool = "pen";
        state.color = c.c;
        refreshButtons();
      });
      b.setAttribute("data-color", c.c);
      row1.appendChild(b);
      return b;
    });
    var sep = document.createElement("span");
    sep.className = "draw-sep";
    row1.appendChild(sep);
    ui.widthBtns = WIDTHS.map(function (w) {
      var b = btn("draw-width", '<span class="draw-line" style="height:' + w.w + 'px"></span>' + w.n, w.n + "筆", function () {
        if (state.tool === "eraser") state.tool = "pen";
        state.width = w.w;
        refreshButtons();
      });
      b.setAttribute("data-width", String(w.w));
      row1.appendChild(b);
      return b;
    });

    var row2 = document.createElement("div");
    row2.className = "draw-row";
    ui.eraser = btn("draw-eraser", '<span aria-hidden="true">🧽</span>橡皮', "橡皮擦", function () {
      state.tool = state.tool === "eraser" ? "pen" : "eraser";
      refreshButtons();
    });
    ui.undo = btn("draw-undo", '<span aria-hidden="true">↶</span>復原', "復原上一筆", undo);
    ui.clear = btn("draw-clear", '<span aria-hidden="true">🗑️</span>清除全部', "清除全部", clearAll);
    ui.close = btn("draw-close", '<span aria-hidden="true">✕</span>關閉', "關閉畫筆", function () { setActive(false); });
    [ui.eraser, ui.undo, ui.clear, ui.close].forEach(function (b) { row2.appendChild(b); });

    var tip = document.createElement("div");
    tip.className = "draw-tip";
    tip.textContent = "在題目上直接畫・雙指捲動・要作答請按「關閉」";

    bar.appendChild(row1);
    bar.appendChild(row2);
    bar.appendChild(tip);
    wrap.appendChild(fab);
    wrap.appendChild(bar);
    document.body.appendChild(wrap);
    ui.fab = fab;
    ui.bar = bar;
    refreshButtons();
  }

  function refreshButtons() {
    if (!ui.bar) return;
    ui.colorBtns.forEach(function (b) {
      var on = state.tool === "pen" && b.getAttribute("data-color") === state.color;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    ui.widthBtns.forEach(function (b) {
      var on = state.tool === "pen" && Number(b.getAttribute("data-width")) === state.width;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    ui.eraser.classList.toggle("is-on", state.tool === "eraser");
    ui.eraser.setAttribute("aria-pressed", state.tool === "eraser" ? "true" : "false");
    ui.undo.disabled = history.length === 0;
    ui.clear.disabled = totalStrokes() === 0;
    ui.fab.classList.toggle("has-ink", totalStrokes() > 0);
    document.body.classList.toggle("draw-tool-eraser", state.tool === "eraser");
  }

  /* 開關時題卡多出草稿區：以畫面中第一張可見題卡為錨，避免頁面跳動 */
  function keepAnchor(fn) {
    var anchor = null, top = 0;
    for (var i = 0; i < hosts.length; i++) {
      var r = hosts[i].el.getBoundingClientRect();
      if (r.bottom > 0) { anchor = hosts[i].el; top = r.top; break; }
    }
    fn();
    if (anchor) {
      var diff = anchor.getBoundingClientRect().top - top;
      if (Math.abs(diff) > 0.5) window.scrollBy(0, diff);
    }
  }

  function setActive(on) {
    on = !!on;
    if (on === state.active) return;
    keepAnchor(function () {
      state.active = on;
      document.body.classList.toggle("draw-active", on);
      ui.bar.hidden = !on;
      ui.fab.hidden = on;
      ui.fab.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (!on) {
      pointers = {};
      touches = {};
      pan = null;
      penDown = 0;
      if (document.activeElement && document.activeElement.blur && ui.bar.contains(document.activeElement)) document.activeElement.blur();
    } else if (document.activeElement && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      document.activeElement.blur(); /* 收起 iPhone 鍵盤 */
    }
    hosts.forEach(sizeHost);
    refreshButtons();
  }

  function onKey(e) {
    if (!state.active) return;
    var tag = (e.target && e.target.tagName) || "";
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
    if (e.key === "Escape") { setActive(false); e.preventDefault(); }
    else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "z" || e.key === "Z")) { undo(); e.preventDefault(); }
  }

  function init() {
    if (!document.querySelector(CARD_SEL) || document.getElementById("draw-ui")) return;
    setupHosts();
    load();
    buildUI();
    hosts.forEach(sizeHost);
    document.addEventListener("keydown", onKey);
    window.addEventListener("pagehide", save);
    window.MathDraw = {
      setActive: setActive,
      isActive: function () { return state.active; },
      undo: undo,
      clearAll: clearAll,
      strokeCount: totalStrokes
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
