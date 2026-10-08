/* 圖解解法（看看怎樣做）：小二「圖→式→答→驗」・K3 大圖少字＋家長讀
 * 只用 inline SVG／HTML，離線可用。資料在 js/explain-data.js（window.MathExplainData）。
 * key 格式：單元|來源|題號，例如 "w02|practice|q1"、"k3-w01|quiz|q3"。
 */
(function (global) {
  "use strict";

  var PLUS = "＋";
  var MINUS = "−";
  var TIMES = "×";
  var EQ = "＝";
  var CN = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function data() {
    return global.MathExplainData || {};
  }

  function clone(o) {
    return o == null ? o : JSON.parse(JSON.stringify(o));
  }

  function key(unit, source, qid) {
    return [unit, source, qid].join("|");
  }

  /** get("w02|practice|q1") 或 get("w02","practice","q1") */
  function get(a, b, c) {
    var k = b === undefined ? a : key(a, b, c);
    var s = data()[k];
    if (!s) return null;
    s = clone(s);
    s.key = k;
    return s;
  }

  function trackOf(spec) {
    if (!spec) return "p2";
    if (spec.track) return spec.track;
    if (spec.key && spec.key.indexOf("k3-") === 0) return "k3";
    return "p2";
  }

  function expr(a, op, b, c) {
    return a + " " + op + " " + b + " " + EQ + " " + c;
  }

  /* ============================================================
     解題（由圖上的數字計算，確保圖、式、答一致）
     ============================================================ */
  /* 兩部分或多部分（第 3 週：例如 50 − 18 − 7 ＝ 25）；兩部分的輸出與第 2 週相同 */
  function chain(nums, op, result) {
    return nums.join(" " + op + " ") + " " + EQ + " " + result;
  }
  function solvePartWhole(spec) {
    var parts = spec.parts.map(function (p) { return p.v; });
    var T = spec.total.v;
    var r = { kind: "partWhole" };
    if (T == null) {
      T = parts.reduce(function (a, b) { return a + b; }, 0);
      r.answer = T;
      r.formula = chain(parts, PLUS, T);
      r.check = chain([T].concat(parts.slice(0, -1)), MINUS, parts[parts.length - 1]);
      r.op = "加法";
    } else {
      var u = parts.indexOf(null);
      var known = parts.filter(function (v, i) { return i !== u; });
      var x = T - known.reduce(function (a, b) { return a + b; }, 0);
      parts[u] = x;
      r.answer = x;
      r.formula = chain([T].concat(known), MINUS, x);
      r.check = chain([x].concat(known), PLUS, T);
      r.op = "減法";
    }
    r.total = T;
    r.parts = parts;
    r.answers = [String(r.answer)];
    return r;
  }

  function solveCompare(spec) {
    var big = null, small = null;
    spec.rows.forEach(function (row) {
      if (row.role === "big") big = row.v;
      else small = row.v;
    });
    var d = spec.diff.v;
    var r = { kind: "compare" };
    if (big == null) {
      big = small + d;
      r.answer = big;
      r.unknown = "big";
      r.formula = expr(small, PLUS, d, big);
      r.check = expr(big, MINUS, small, d);
      r.op = "加法";
    } else if (small == null) {
      small = big - d;
      r.answer = small;
      r.unknown = "small";
      r.formula = expr(big, MINUS, d, small);
      r.check = expr(small, PLUS, d, big);
      r.op = "減法";
    } else {
      d = big - small;
      r.answer = d;
      r.unknown = "diff";
      r.formula = expr(big, MINUS, small, d);
      r.check = expr(small, PLUS, d, big);
      r.op = "減法";
    }
    r.big = big;
    r.small = small;
    r.diff = d;
    r.answers = [String(r.answer)];
    return r;
  }

  function fillSeq(terms, step, mult) {
    var t = terms.slice();
    var first = -1;
    for (var i = 0; i < t.length; i++) {
      if (t[i] != null) { first = i; break; }
    }
    var full = t.slice();
    for (var j = first + 1; j < t.length; j++) {
      full[j] = mult ? full[j - 1] * mult : full[j - 1] + step;
    }
    for (var k = first - 1; k >= 0; k--) {
      full[k] = mult ? full[k + 1] / mult : full[k + 1] - step;
    }
    var consistent = t.every(function (v, idx) {
      return v == null || v === full[idx];
    });
    return { full: full, consistent: consistent };
  }

  function ruleText(step, mult) {
    if (mult) return "每次變成兩倍（" + TIMES + mult + "）";
    return step > 0 ? "每次多 " + step : "每次少 " + Math.abs(step);
  }

  function solveSeq(spec) {
    var f = fillSeq(spec.terms, spec.step, spec.mult);
    var full = f.full;
    var forms = [];
    var checks = [];
    var answers = [];
    var n = spec.mult || Math.abs(spec.step);
    var op = spec.mult ? TIMES : spec.step > 0 ? PLUS : MINUS;
    var inv = spec.step > 0 ? MINUS : PLUS;
    spec.terms.forEach(function (v, i) {
      if (v != null) return;
      answers.push(String(full[i]));
      if (i > 0) forms.push(expr(full[i - 1], op, n, full[i]));
      var nextKnown = i + 1 < spec.terms.length && spec.terms[i + 1] != null;
      if (spec.mult) {
        checks.push(expr(full[i - 1], PLUS, full[i - 1], full[i]) + "（" + full[i - 1] + " 的兩倍）");
      } else if (nextKnown) {
        checks.push(expr(full[i], op, n, full[i + 1]) + "（和後面的數接得上）");
      } else {
        checks.push(expr(full[i], inv, n, full[i - 1]) + "（倒回去等於前一個數）");
      }
    });
    return {
      kind: "seq",
      full: full,
      consistent: f.consistent,
      answers: answers,
      formula: forms.join("，"),
      check: checks.join("；"),
      rule: ruleText(spec.step, spec.mult),
      n: n,
      op: op
    };
  }

  function solveShapes(spec) {
    var g = spec.group;
    var items = spec.items;
    var consistent = items.every(function (s, i) {
      return s === items[i % g];
    });
    var next = items[items.length % g];
    return {
      kind: "shapes",
      consistent: consistent,
      answer: next,
      answers: [next],
      unit: items.slice(0, g),
      pos: (items.length % g) + 1
    };
  }

  function diffsOf(terms) {
    var d = [];
    for (var i = 1; i < terms.length; i++) d.push(terms[i] - terms[i - 1]);
    return d;
  }

  function solveChoiceSeq(spec) {
    var correct = null;
    var rows = spec.rows.map(function (row) {
      var d = diffsOf(row.terms);
      var same = d.every(function (x) { return x === d[0]; });
      var ok = same && d[0] === spec.target;
      if (ok) correct = row.label;
      return { label: row.label, terms: row.terms, diffs: d, same: same, step: d[0], ok: ok };
    });
    return { kind: "choiceSeq", rows: rows, answer: correct, answers: [correct] };
  }

  function solveCount(spec) {
    return { kind: "count", answer: spec.n, answers: [String(spec.n)] };
  }

  /* ask："more"（哪邊多，預設）／"less"（哪邊少）／"diff"（多幾個）／"toEqual"（少的一邊再加幾個才一樣多） */
  function solveMatch(spec) {
    var L = spec.left.n, R = spec.right.n;
    var labels = spec.answerLabels || {};
    var ask = spec.ask || "more";
    var more = L > R ? "left" : R > L ? "right" : "equal";
    var less = L < R ? "left" : R < L ? "right" : "equal";
    var ans;
    if (ask === "diff" || ask === "toEqual") {
      ans = String(Math.abs(L - R));
    } else {
      var target = ask === "less" ? less : more;
      if (target === "left") ans = labels.left || spec.left.label;
      else if (target === "right") ans = labels.right || spec.right.label;
      else ans = labels.equal || "一樣多";
    }
    return { kind: "match", ask: ask, answer: ans, answers: [ans], more: more, less: less, extra: Math.abs(L - R) };
  }

  function solveNumeral(spec) {
    return { kind: "numeral", answer: spec.n, answers: [String(spec.n)], ones: spec.n - 10 };
  }

  function solveNumberLine(spec) {
    var ans;
    if (spec.dir === "after") ans = spec.ref + 1;
    else if (spec.dir === "before") ans = spec.ref - 1;
    else ans = (spec.known[0] + spec.known[1]) / 2;
    return { kind: "numberLine", answer: ans, answers: [String(ans)] };
  }

  /* 小二第 3 週：數量變化（例如 35 人 → 下車 12 → 上車 8）；答案由圖上數字逐步計算 */
  function solveSteps(spec) {
    var vals = [spec.start.v];
    var forms = [], checks = [];
    spec.ops.forEach(function (o) {
      var prev = vals[vals.length - 1];
      var nx = o.op === "+" ? prev + o.v : prev - o.v;
      vals.push(nx);
      forms.push(expr(prev, o.op === "+" ? PLUS : MINUS, o.v, nx));
    });
    for (var i = spec.ops.length - 1; i >= 0; i--) {
      var o = spec.ops[i];
      checks.push(expr(vals[i + 1], o.op === "+" ? MINUS : PLUS, o.v, vals[i]));
    }
    var ans = vals[vals.length - 1];
    return {
      kind: "steps", vals: vals, answer: ans, answers: [String(ans)],
      formula: forms.join("，"),
      check: "倒推：" + checks.join("，") + "（回到" + (spec.start.label || "原有") + "的 " + spec.start.v + "）"
    };
  }

  /* 兩步應用題：第二步用 "$1" 代表第一步的答案 */
  function resolveStep2(step, val) {
    var s = clone(step);
    (function walk(o) {
      if (!o || typeof o !== "object") return;
      Object.keys(o).forEach(function (k) {
        if (o[k] === "$1") { o[k] = val; o.derived = true; }
        else if (typeof o[k] === "object") walk(o[k]);
      });
    })(s);
    return s;
  }
  function solveTwoStep(spec) {
    var r1 = solve(spec.steps[0]);
    var s2 = resolveStep2(spec.steps[1], r1.answer);
    var r2 = solve(s2);
    return {
      kind: "twoStep", r1: r1, r2: r2, s2: s2, answer: r2.answer, answers: [String(r2.answer)],
      formula: "第一步：" + r1.formula + "；第二步：" + r2.formula,
      check: "第二步：" + r2.check + "；第一步：" + r1.check
    };
  }

  function solve(spec) {
    switch (spec.type) {
      case "steps": return solveSteps(spec);
      case "twoStep": return solveTwoStep(spec);
      case "partWhole": return solvePartWhole(spec);
      case "compare": return solveCompare(spec);
      case "seq": return solveSeq(spec);
      case "shapes": return solveShapes(spec);
      case "choiceSeq": return solveChoiceSeq(spec);
      case "count": return solveCount(spec);
      case "match": return solveMatch(spec);
      case "numeral": return solveNumeral(spec);
      case "numberLine": return solveNumberLine(spec);
      case "multi": {
        var subs = spec.parts.map(solve);
        var all = [];
        subs.forEach(function (s) { all = all.concat(s.answers); });
        return { kind: "multi", parts: subs, answers: all };
      }
    }
    return { answers: [] };
  }

  /* ============================================================
     SVG 小工具
     ============================================================ */
  function svgOpen(w, h, label, cls) {
    return '<svg class="sol-svg ' + (cls || "") + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + " " + h +
      '" width="' + w + '" height="' + h + '" role="img" aria-label="' + esc(label) + '">';
  }
  function txt(x, y, s, cls, extra) {
    return '<text x="' + x + '" y="' + y + '" class="' + (cls || "") + '"' + (extra || "") + ">" + esc(s) + "</text>";
  }
  function rect(x, y, w, h, cls, rx) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx == null ? 4 : rx) + '" class="' + (cls || "") + '"/>';
  }
  function line(x1, y1, x2, y2, cls) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="' + (cls || "") + '"/>';
  }
  /* 弧形箭咀（不用 marker，避免多個 SVG 的 id 衝突） */
  function arcArrow(x1, x2, yBase, lift, cls) {
    var mx = (x1 + x2) / 2;
    var top = yBase - lift;
    var p = '<path d="M ' + x1 + " " + yBase + " Q " + mx + " " + top + " " + x2 + " " + yBase + '" class="sol-arc ' + (cls || "") + '"/>';
    var dir = x2 > x1 ? -1 : 1;
    p += '<path d="M ' + x2 + " " + yBase + " l " + (dir * 7) + " -6 l " + (dir * 1) + ' 8 z" class="sol-arrowhead ' + (cls || "") + '"/>';
    return p;
  }

  /* 各段寬度：按比例，但每段至少 min px（字放得下） */
  function fitWidths(vals, BW, min) {
    var total = vals.reduce(function (a, b) { return a + b; }, 0);
    var w = vals.map(function (v) { return (v / total) * BW; });
    var fixed = 0, freeTotal = 0;
    w.forEach(function (x, i) {
      if (x < min) { w[i] = min; fixed += min; } else freeTotal += vals[i];
    });
    if (fixed > 0) {
      w = w.map(function (x, i) {
        return x === min && (vals[i] / total) * BW < min ? min : (vals[i] / freeTotal) * (BW - fixed);
      });
    }
    return w;
  }

  /* ---------- 小二：線段圖（已知總數與部分） ---------- */
  function svgPartWhole(spec, r) {
    var W = 520, x0 = 20, BW = 480, H = 116;
    var widths = fitWidths(r.parts, BW, 70);
    var s = svgOpen(W, H, "線段圖：總數 " + r.total + "，分成 " + r.parts.join(" 和 "), "sol-bar");
    /* 總數括號 */
    var x1 = x0, x2 = x0 + BW, mid = x0 + BW / 2;
    s += '<path class="sol-brace" d="M ' + x1 + " 42 Q " + x1 + " 32 " + (x1 + 10) + " 32 L " + (mid - 10) + " 32 Q " + mid + " 32 " + mid + " 24 Q " + mid + " 32 " + (mid + 10) + " 32 L " + (x2 - 10) + " 32 Q " + x2 + " 32 " + x2 + ' 42"/>';
    if (spec.total.v == null) {
      s += '<text x="' + mid + '" y="16" class="sol-t-c sol-t-unknown">' + esc(spec.total.label) + ' ？ <tspan class="sol-t-ans">' + EQ + " " + r.total + "</tspan></text>";
    } else {
      s += txt(mid, 16, spec.total.label + " " + r.total, "sol-t-c sol-t-strong");
    }
    var x = x0;
    spec.parts.forEach(function (p, i) {
      var w = widths[i];
      var unknown = p.v == null;
      s += rect(x, 46, w, 40, unknown ? "sol-seg-unknown" : p.derived ? "sol-seg-derived" : "sol-seg-known", 0);
      s += txt(x + w / 2, 72, (p.label ? p.label + " " : "") + (unknown ? "？" : p.v), "sol-t-c" + (unknown ? " sol-t-unknown" : ""));
      if (unknown) s += txt(x + w / 2, 108, "？ " + EQ + " " + r.parts[i], "sol-t-c sol-t-ans");
      x += w;
    });
    s += "</svg>";
    return s;
  }

  /* ---------- 小二：比較線段圖（誰大誰小、差） ---------- */
  function svgCompare(spec, r) {
    var W = 560, x0 = 78, BW = 360, rowH = 36;
    var Lbig = BW;
    var Lsmall = Math.round((r.small / r.big) * BW);
    if (BW - Lsmall < 56) Lsmall = BW - 56;
    var ys = [26, 92];
    var H = 150;
    var s = svgOpen(W, H, "比較線段圖：大數 " + r.big + "，小數 " + r.small + "，相差 " + r.diff, "sol-bar");
    /* 對齊虛線 */
    s += line(x0 + Lsmall, 14, x0 + Lsmall, ys[1] + rowH + 8, "sol-guide");
    spec.rows.forEach(function (row, i) {
      var y = ys[i];
      var isBig = row.role === "big";
      var val = isBig ? r.big : r.small;
      var unknown = row.v == null;
      var L = isBig ? Lbig : Lsmall;
      s += txt(x0 - 10, y + 24, row.label, "sol-t-r sol-t-strong");
      s += rect(x0, y, L, rowH, unknown ? "sol-seg-unknown" : row.derived ? "sol-seg-derived" : "sol-seg-known", 0);
      s += txt(x0 + L / 2, y + 24, unknown ? "？" : String(val), "sol-t-c" + (unknown ? " sol-t-unknown" : ""));
      if (!isBig) {
        var dUnknown = spec.diff.v == null;
        s += rect(x0 + Lsmall, y, Lbig - Lsmall, rowH, "sol-seg-diff", 0);
        s += txt(x0 + (Lsmall + Lbig) / 2, y + 24, (spec.diff.word || "差") + " " + (dUnknown ? "？" : r.diff), "sol-t-c sol-t-diff" + (dUnknown ? " sol-t-unknown" : ""));
        s += txt(x0 + (Lsmall + Lbig) / 2, y + rowH + 14, "（相差的部分）", "sol-t-c sol-t-note");
      }
      if (unknown) s += txt(x0 + BW + 10, y + 24, row.label + " " + EQ + " " + val, "sol-t-l sol-t-ans");
      if (!isBig && spec.diff.v == null) s += txt(x0 + BW + 10, y + 24, "相差 " + EQ + " " + r.diff, "sol-t-l sol-t-ans");
    });
    s += "</svg>";
    return s;
  }

  /* ---------- 小二：數量變化流程（原有 → 第一步 → 現在） ---------- */
  function svgSteps(spec, r) {
    var bw = 72, gap = 118, x0 = 14;
    var n = r.vals.length;
    var W = x0 * 2 + n * bw + (n - 1) * gap;
    var H = 118;
    var s = svgOpen(W, H, "數量變化：" + r.vals.join(" → "), "sol-steps-fig");
    for (var i = 0; i < n; i++) {
      var x = x0 + i * (bw + gap);
      var last = i === n - 1;
      s += rect(x, 44, bw, 40, i === 0 ? "sol-box" : last ? "sol-box-ans" : "sol-box-mid", 6);
      s += txt(x + bw / 2, 71, String(r.vals[i]), "sol-t-c sol-t-num" + (i === 0 ? "" : " sol-t-ans"));
      var cap = i === 0 ? (spec.start.label || "原有") : last ? (spec.endLabel || "現在") + "？" : "第" + CN[i] + "步後";
      s += txt(x + bw / 2, 104, cap, "sol-t-c sol-t-note");
      if (i < n - 1) {
        var o = spec.ops[i];
        var xa = x + bw / 2 + 8, xb = x + bw + gap + bw / 2 - 8;
        s += arcArrow(xa, xb, 42, 26, "is-hot");
        s += txt((xa + xb) / 2, 20, (o.label ? o.label + " " : "") + (o.op === "+" ? PLUS : MINUS) + o.v, "sol-t-c sol-t-step");
      }
    }
    s += "</svg>";
    return s;
  }

  /* ---------- 小二：兩步應用題（兩張圖，第二張用第一步的答案） ---------- */
  function svgTwoStep(spec, r) {
    var s1 = spec.steps[0];
    return '<div class="sol-twostep">' +
      '<div class="sol-twostep-item"><p class="sol-fig-cap">' + esc(s1.cap || "第一步") + "</p>" + figure(s1, r.r1) + "</div>" +
      '<div class="sol-twostep-item"><p class="sol-fig-cap">' + esc(spec.steps[1].cap || "第二步") + "</p>" + figure(r.s2, r.r2) + "</div>" +
      "</div>";
  }

  /* ---------- 數列：方格＋箭咀（每次多／少幾） ---------- */
  function svgSeq(spec, r, opt) {
    opt = opt || {};
    var terms = spec.terms;
    var bw = 58, gap = 36, x0 = 10;
    var n = terms.length;
    var W = x0 * 2 + n * bw + (n - 1) * gap;
    var H = spec.showIndex ? 108 : 92;
    var s = svgOpen(W, H, "數列：" + r.full.join("、") + "，" + r.rule, "sol-seq");
    var label = r.op + r.n;
    for (var i = 0; i < n; i++) {
      var x = x0 + i * (bw + gap);
      var blank = terms[i] == null;
      s += rect(x, 44, bw, 38, blank ? "sol-box-ans" : "sol-box", 6);
      s += txt(x + bw / 2, 70, String(r.full[i]), "sol-t-c sol-t-num" + (blank ? " sol-t-ans" : ""));
      if (spec.showIndex) s += txt(x + bw / 2, 100, "第" + (i + 1) + "個", "sol-t-c sol-t-note");
      if (i < n - 1) {
        var xa = x + bw / 2 + 6, xb = x + bw + gap + bw / 2 - 6;
        s += arcArrow(xa, xb, 42, 26, blank || terms[i + 1] == null ? "is-hot" : "");
        s += txt((xa + xb) / 2, 22, label, "sol-t-c sol-t-step");
      }
    }
    s += "</svg>";
    return s;
  }

  /* ---------- 圖形重複：圈出「一組」 ---------- */
  function svgShapes(spec, r, k3) {
    var cw = k3 ? 54 : 46, x0 = 10, g = spec.group;
    var items = spec.items.concat([r.answer]);
    var n = items.length;
    var W = x0 * 2 + n * cw + 8;
    var H = k3 ? 100 : 88;
    var cy = k3 ? 46 : 40;
    var s = svgOpen(W, H, "圖形規律：一組是 " + r.unit.join(" ") + "，下一個是 " + r.answer, "sol-shapes" + (k3 ? " sol-k3fig" : ""));
    for (var gi = 0; gi * g < n; gi++) {
      var start = gi * g;
      var cnt = Math.min(g, n - start);
      var gx = x0 + start * cw + 2;
      s += rect(gx, cy - 28, cnt * cw - 4, 56, gi % 2 ? "sol-group-b" : "sol-group-a", 10);
      if (gi === 0) s += txt(gx + (cnt * cw - 4) / 2, cy + 46, "一組", "sol-t-c sol-t-note");
    }
    for (var i = 0; i < n; i++) {
      var x = x0 + i * cw + cw / 2;
      var isAns = i === n - 1;
      if (isAns) s += rect(x - cw / 2 + 5, cy - 23, cw - 10, 46, "sol-box-ans", 8);
      s += txt(x, cy + (k3 ? 11 : 9), items[i], "sol-t-c sol-t-shape" + (k3 ? " sol-t-k3shape" : "") + (isAns ? " sol-t-ans" : ""));
    }
    s += "</svg>";
    return s;
  }

  /* ---------- 選擇題：三條數列逐條看 ---------- */
  function svgChoiceSeq(spec, r) {
    var bw = 44, gap = 34, x0 = 40;
    var maxN = 0;
    r.rows.forEach(function (row) { maxN = Math.max(maxN, row.terms.length); });
    var W = x0 + maxN * bw + (maxN - 1) * gap + 150;
    var rowH = 70;
    var H = r.rows.length * rowH + 6;
    var s = svgOpen(W, H, "逐條數列看每次多少", "sol-seq");
    r.rows.forEach(function (row, ri) {
      var y = ri * rowH + 30;
      if (row.ok) s += rect(4, y - 28, W - 8, rowH - 4, "sol-row-ok", 10);
      s += txt(18, y + 22, row.label, "sol-t-c sol-t-strong");
      row.terms.forEach(function (v, i) {
        var x = x0 + i * (bw + gap);
        s += rect(x, y, bw, 32, "sol-box", 6);
        s += txt(x + bw / 2, y + 22, String(v), "sol-t-c sol-t-num");
        if (i < row.terms.length - 1) {
          var xa = x + bw / 2 + 5, xb = x + bw + gap + bw / 2 - 5;
          s += arcArrow(xa, xb, y - 2, 18, "");
          var d = row.diffs[i];
          s += txt((xa + xb) / 2, y - 12, (d > 0 ? PLUS : MINUS) + Math.abs(d), "sol-t-c sol-t-step sol-t-small");
        }
      });
      var tx = x0 + maxN * bw + (maxN - 1) * gap + 12;
      var verdict = (row.ok ? "✓ " : "✗ ") + (row.step > 0 ? "每次多 " + row.step : "每次少 " + Math.abs(row.step));
      s += txt(tx, y + 22, verdict, "sol-t-l " + (row.ok ? "sol-t-ans" : "sol-t-wrong"));
    });
    s += "</svg>";
    return s;
  }

  /* ---------- K3：十格框（按順序標 1、2、3…） ---------- */
  var ICON_COLORS = {
    "●": "#2d6a4f", "⭐": "#f2c94c", "🍎": "#e57373", "🌸": "#f4a7c0", "🍓": "#e57373",
    "🐱": "#f6c177", "🐶": "#c8a27a", "🔵": "#5b8def", "🔺": "#e57373", "⬛": "#555", "🟡": "#f2c94c", "🟢": "#5bbf7a",
    "🐟": "#5b8def", "🐰": "#c9c9d6", "🥕": "#f39c4a", "🚗": "#e57373", "🚌": "#f2c94c", "🥣": "#8fb3d9", "🥄": "#b0b0b0", "🍌": "#f2d64c"
  };
  function iconAt(icon, cx, cy, rr) {
    var col = ICON_COLORS[icon] || "#2d6a4f";
    if (icon === "●") return '<circle cx="' + cx + '" cy="' + cy + '" r="' + rr + '" fill="' + col + '"/>';
    /* 底圈＋emoji（電腦沒有 emoji 字型時仍看到圓圈，可數） */
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + rr + '" fill="' + col + '" fill-opacity="0.35"/>' +
      '<text x="' + cx + '" y="' + (cy + rr * 0.62) + '" class="sol-t-c sol-t-emoji" style="font-size:' + Math.round(rr * 1.7) + 'px">' + esc(icon) + "</text>";
  }

  function tenFrame(x, y, count, startNo, icon, cell, numbered) {
    var s = rect(x, y, cell * 5, cell * 2, "sol-frame", 4);
    for (var c = 1; c < 5; c++) s += line(x + c * cell, y, x + c * cell, y + cell * 2, "sol-frame-line");
    s += line(x, y + cell, x + cell * 5, y + cell, "sol-frame-line");
    for (var i = 0; i < count; i++) {
      var col = i % 5, row = Math.floor(i / 5);
      var cx = x + col * cell + cell / 2, cy = y + row * cell + cell / 2;
      s += iconAt(icon, cx, cy, cell * 0.33);
      if (numbered) s += txt(x + col * cell + 4, y + row * cell + 13, String(startNo + i), "sol-t-l sol-t-order");
    }
    return s;
  }

  function svgCount(spec) {
    var n = spec.n, cell = 50;
    var frames = n > 10 ? 2 : 1;
    var W = frames * cell * 5 + (frames - 1) * 30 + 20;
    var H = cell * 2 + 44;
    var s = svgOpen(W, H, "十格框：共 " + n + " 個", "sol-k3fig");
    s += tenFrame(10, 10, Math.min(n, 10), 1, spec.icon, cell, true);
    if (frames === 2) {
      s += tenFrame(10 + cell * 5 + 30, 10, n - 10, 11, spec.icon, cell, true);
      s += txt(10 + cell * 2.5, cell * 2 + 36, "滿 10", "sol-t-c sol-t-k3cap");
      s += txt(10 + cell * 5 + 30 + cell * 2.5, cell * 2 + 36, "11 … " + n, "sol-t-c sol-t-k3cap");
    } else {
      s += txt(10 + cell * 2.5, cell * 2 + 36, "1 … " + n, "sol-t-c sol-t-k3cap");
    }
    s += "</svg>";
    return s;
  }

  /* ---------- K3：一一配對（比多少） ---------- */
  function svgMatch(spec, r) {
    var L = spec.left.n, R = spec.right.n, m = Math.max(L, R), mn = Math.min(L, R);
    var step = 54, x0 = 78;
    var W = x0 + m * step + 110;
    var H = 176;
    var y1 = 42, y2 = 134, rr = 17;
    var s = svgOpen(W, H, spec.left.label + " " + L + " 個，" + spec.right.label + " " + R + " 個，一個配一個", "sol-k3fig");
    s += txt(30, y1 + 9, spec.left.label, "sol-t-c sol-t-k3label");
    s += txt(30, y2 + 9, spec.right.label, "sol-t-c sol-t-k3label");
    for (var i = 0; i < mn; i++) {
      var x = x0 + i * step + step / 2;
      s += line(x, y1 + rr + 3, x, y2 - rr - 3, "sol-match-line");
    }
    if (r.more !== "equal") {
      var ey = r.more === "left" ? y1 : y2;
      var ex = x0 + mn * step + 4;
      s += rect(ex, ey - 27, (m - mn) * step - 8, 54, "sol-extra", 14);
      s += txt(ex + ((m - mn) * step - 8) / 2, r.more === "left" ? ey + 46 : ey - 34, "多出來", "sol-t-c sol-t-extra");
    }
    for (var a = 0; a < L; a++) s += iconAt(spec.left.icon, x0 + a * step + step / 2, y1, rr);
    for (var b = 0; b < R; b++) s += iconAt(spec.right.icon, x0 + b * step + step / 2, y2, rr);
    if (r.more === "equal") s += txt(x0 + m * step + 14, (y1 + y2) / 2 + 7, "✓ 全部配對", "sol-t-l sol-t-ans");
    else {
      var fy = r.less === "left" ? y1 : y2;
      var my = r.more === "left" ? y1 : y2;
      if (r.ask === "less") s += txt(x0 + mn * step + 12, fy + 7, "← 比較少", "sol-t-l sol-t-ans");
      if (r.ask === "diff") {
        var ny = r.more === "left" ? y1 - 24 : y2 + 36;
        for (var e = 0; e < m - mn; e++) s += txt(x0 + (mn + e) * step + step / 2, ny, String(e + 1), "sol-t-c sol-t-count");
        s += txt(x0 + m * step + 10, my + 7, "多 " + r.extra + " 個", "sol-t-l sol-t-ans");
      }
      if (r.ask === "toEqual") {
        for (var g = mn; g < m; g++) {
          s += '<circle cx="' + (x0 + g * step + step / 2) + '" cy="' + fy + '" r="' + rr + '" class="sol-ghost"/>';
          s += txt(x0 + g * step + step / 2, fy + 6, PLUS, "sol-t-c sol-t-ans");
        }
        s += txt(x0 + m * step + 10, fy + 7, "再加 " + r.extra + " 個", "sol-t-l sol-t-ans");
      }
    }
    s += "</svg>";
    return s;
  }

  /* ---------- K3：讀數（十幾 = 一個十＋幾） ---------- */
  function svgNumeral(spec, r) {
    var cell = 40, ones = r.ones;
    var W = cell * 10 + 30 + 20;
    var H = cell * 2 + 50;
    var s = svgOpen(W, H, spec.word + " 是 " + spec.n + "：一個十和 " + ones, "sol-k3fig");
    s += tenFrame(10, 10, 10, 1, "●", cell, false);
    s += tenFrame(10 + cell * 5 + 30, 10, ones, 11, "🔵", cell, false);
    s += txt(10 + cell * 2.5, cell * 2 + 40, "十 → 1", "sol-t-c sol-t-k3cap");
    s += txt(10 + cell * 5 + 30 + cell * 2.5, cell * 2 + 40, CN[ones] + " → " + ones, "sol-t-c sol-t-k3cap");
    s += "</svg>";
    return s;
  }

  /* ---------- K3：數線（前一個少 1、後一個多 1） ---------- */
  function svgNumberLine(spec, r) {
    var nums = spec.known.concat([r.answer]);
    var lo = Math.max(0, Math.min.apply(null, nums) - 2);
    var hi = Math.min(20, Math.max.apply(null, nums) + 2);
    while (hi - lo < 5 && lo > 0) lo--;
    while (hi - lo < 5 && hi < 20) hi++;
    var sp = 62, x0 = 34;
    var W = x0 * 2 + (hi - lo) * sp;
    var H = 150, yl = 96;
    var s = svgOpen(W, H, "數線 " + lo + " 到 " + hi + "，答案 " + r.answer, "sol-k3fig sol-nl");
    s += line(x0 - 20, yl, x0 + (hi - lo) * sp + 20, yl, "sol-nl-axis");
    function X(v) { return x0 + (v - lo) * sp; }
    for (var v = lo; v <= hi; v++) {
      var isAns = v === r.answer;
      var isKnown = spec.known.indexOf(v) >= 0;
      s += line(X(v), yl - 8, X(v), yl + 8, "sol-nl-tick");
      if (isAns) s += '<circle cx="' + X(v) + '" cy="' + (yl + 30) + '" r="21" class="sol-nl-ans"/>';
      else if (isKnown) s += '<circle cx="' + X(v) + '" cy="' + (yl + 30) + '" r="19" class="sol-nl-known"/>';
      s += txt(X(v), yl + 38, String(v), "sol-t-c sol-t-nl" + (isAns ? " sol-t-ans" : isKnown ? " sol-t-strong" : ""));
    }
    var hops = [];
    if (spec.dir === "after") hops.push([spec.ref, r.answer, "多 1"]);
    else if (spec.dir === "before") hops.push([spec.ref, r.answer, "少 1"]);
    else { hops.push([spec.known[0], r.answer, "多 1"]); hops.push([r.answer, spec.known[1], "多 1"]); }
    hops.forEach(function (h) {
      var xa = X(h[0]) + (h[1] > h[0] ? 6 : -6), xb = X(h[1]) + (h[1] > h[0] ? -6 : 6);
      s += arcArrow(xa, xb, yl - 10, 44, "is-hot");
      s += txt((xa + xb) / 2, yl - 46, h[2], "sol-t-c sol-t-step");
    });
    s += "</svg>";
    return s;
  }

  function figure(spec, r) {
    var k3 = trackOf(spec) === "k3";
    switch (spec.type) {
      case "partWhole": return svgPartWhole(spec, r);
      case "compare": return svgCompare(spec, r);
      case "steps": return svgSteps(spec, r);
      case "twoStep": return svgTwoStep(spec, r);
      case "seq": return svgSeq(spec, r);
      case "shapes": return svgShapes(spec, r, k3);
      case "choiceSeq": return svgChoiceSeq(spec, r);
      case "count": return svgCount(spec, r);
      case "match": return svgMatch(spec, r);
      case "numeral": return svgNumeral(spec, r);
      case "numberLine": return svgNumberLine(spec, r);
    }
    return "";
  }

  /* ============================================================
     文字（步驟）
     ============================================================ */
  function p2Steps(spec, r) {
    var formula = spec.formula || r.formula;
    var check = spec.check || r.check;
    if (spec.type === "shapes") {
      formula = formula || ("一組是「" + r.unit.join(" ") + "」，一直重複；下一個是一組裏的第 " + r.pos + " 個");
      check = check || ("把圖形一組一組圈起來，最後一組補上 " + r.answer + " 剛好完整");
    }
    if (spec.type === "choiceSeq") {
      var ok = r.rows.filter(function (x) { return x.ok; })[0];
      formula = formula || (ok.label + "：" + ok.terms.slice(0, -1).map(function (v, i) {
        return expr(v, MINUS, Math.abs(ok.step), ok.terms[i + 1]);
      }).join("，"));
      check = check || r.rows.filter(function (x) { return !x.ok; }).map(function (x) {
        return x.label + " 是" + (x.step > 0 ? "每次多 " + x.step : "每次少 " + Math.abs(x.step));
      }).join("；") + "，都不是「每次少 " + Math.abs(spec.target) + "」";
    }
    return { formula: formula, check: check };
  }

  function p2Block(spec, r, opts) {
    var st = p2Steps(spec, r);
    var h = "";
    if (spec.sub) h += '<p class="sol-sub">' + esc(spec.sub) + "</p>";
    h += '<ol class="sol-steps">';
    h += '<li class="sol-step sol-step-pic"><span class="sol-tag">① 圖</span>' +
      (spec.think ? '<span class="sol-think">' + esc(spec.think) + "</span>" : "") +
      '<div class="sol-fig">' + figure(spec, r) + "</div></li>";
    h += '<li class="sol-step"><span class="sol-tag">② 式</span><span class="sol-math">' + esc(st.formula) + "</span></li>";
    h += '<li class="sol-step"><span class="sol-tag">③ 答</span><strong>' + esc(spec.say) + "</strong></li>";
    h += '<li class="sol-step"><span class="sol-tag">④ 驗</span><span class="sol-math">' + esc(st.check) + " ✓</span></li>";
    h += "</ol>";
    return h;
  }

  function k3Kid(spec, r) {
    if (spec.kid) return spec.kid;
    switch (spec.type) {
      case "count":
        if (spec.n <= 10) {
          var seq = [];
          for (var i = 1; i <= spec.n; i++) seq.push(i);
          return "一個一個點：" + seq.join("、");
        }
        var rest = [];
        for (var j = 11; j <= spec.n; j++) rest.push(j);
        return "滿格是 10，再數 " + rest.join("、");
      case "match": {
        var moreL = r.more === "left" ? spec.left.label : spec.right.label;
        var lessL = r.less === "left" ? spec.left.label : spec.right.label;
        if (r.more === "equal") return "一個配一個，沒有多出來 → 一樣多";
        if (r.ask === "less") return "一個配一個，" + lessL + " 先配完 → " + lessL + " 比較少";
        if (r.ask === "diff") return "一個配一個，" + moreL + " 多出來 " + r.extra + " 個";
        if (r.ask === "toEqual") return lessL + " 再加 " + r.extra + " 個，就一樣多";
        return "一個配一個，" + moreL + " 有多出來";
      }
      case "numberLine":
        return spec.dir === "after" ? spec.ref + " 後面 → " + r.answer : spec.dir === "before" ? r.answer + " ← " + spec.ref + " 前面" : spec.known[0] + "、" + r.answer + "、" + spec.known[1];
      case "numeral":
        return spec.word + " → " + spec.n;
      case "shapes":
        return "一組：" + r.unit.join(" ") + "，再一組…";
    }
    return "";
  }

  function k3Block(spec, r) {
    var h = '<p class="sol-k3-answer">答案 <span class="sol-big">' + esc(spec.answer) + "</span></p>";
    h += '<div class="sol-fig sol-fig-k3">' + figure(spec, r) + "</div>";
    h += '<p class="sol-k3-kid">👉 ' + esc(k3Kid(spec, r)) + "</p>";
    if (spec.parent) h += '<p class="sol-parent"><span class="sol-parent-tag">家長讀</span>' + esc(spec.parent) + "</p>";
    return h;
  }

  /** 完整解法 HTML（不含摺疊外框）。opts.figureOnly：答案頁只放圖 */
  function renderBody(spec, opts) {
    opts = opts || {};
    if (!spec) return "";
    var k3 = trackOf(spec) === "k3";
    var r = solve(spec);
    if (opts.figureOnly) {
      if (spec.type === "multi") {
        return '<div class="sol-figs">' + spec.parts.map(function (p, i) {
          p.track = trackOf(spec);
          return '<div class="sol-fig-item"><span class="sol-fig-cap">' + esc(p.sub || "") + '</span><div class="sol-fig">' + figure(p, r.parts[i]) + "</div></div>";
        }).join("") + "</div>";
      }
      return '<div class="sol-figs ' + (k3 ? "sol-figs-k3" : "") + '"><div class="sol-fig' + (k3 ? " sol-fig-k3" : "") + '">' + figure(spec, r) + "</div></div>";
    }
    var h = '<div class="sol-body ' + (k3 ? "sol-k3" : "sol-p2") + '">';
    if (k3) {
      h += k3Block(spec, r);
    } else {
      h += '<p class="sol-answer">正確答案：<strong>' + esc(spec.answer) + "</strong></p>";
      if (spec.type === "multi") {
        spec.parts.forEach(function (p, i) {
          p.track = "p2";
          h += '<div class="sol-part">' + p2Block(p, r.parts[i], opts) + "</div>";
        });
      } else {
        h += p2Block(spec, r, opts);
      }
      if (spec.tip) h += '<p class="sol-tip">' + esc(spec.tip) + "</p>";
    }
    h += "</div>";
    return h;
  }

  /* ============================================================
     DOM：摺疊面板
     ============================================================ */
  function buildPanel(spec, opts) {
    opts = opts || {};
    var wrap = document.createElement("div");
    wrap.className = "sol-panel " + (opts.answer ? "is-answer" : opts.wrong ? "is-wrong" : "is-right") + (opts.screenOnly ? " screen-only" : "") +
      (trackOf(spec) === "k3" ? " sol-panel-k3" : "");
    var d = document.createElement("details");
    d.className = "sol-details";
    if (opts.open != null ? opts.open : opts.wrong) d.open = true;
    var sum = document.createElement("summary");
    sum.className = "sol-summary";
    sum.textContent = opts.answer ? "🔑 答案與圖解（家長用）" : opts.wrong ? "💡 看看怎樣做（圖解）" : "📖 看解法（圖解）";
    d.appendChild(sum);
    var body = document.createElement("div");
    body.innerHTML = renderBody(spec, opts);
    while (body.firstChild) d.appendChild(body.firstChild);
    wrap.appendChild(d);
    return wrap;
  }

  function detach(container) {
    if (!container) return;
    var old = container.querySelectorAll(".sol-panel");
    for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
  }

  /** 在題目卡（或任何容器）加上解法面板；k 可以是 key 字串或 spec 物件 */
  function attach(container, k, opts) {
    if (!container) return null;
    var spec = typeof k === "string" ? get(k) : k;
    detach(container);
    if (!spec) return null;
    opts = opts || {};
    if (opts.screenOnly == null) opts.screenOnly = true;
    var panel = buildPanel(spec, opts);
    place(container, panel);
    return panel;
  }

  function place(container, panel) {
    var fb = container.querySelector(":scope > .feedback");
    if (fb && fb.nextSibling) container.insertBefore(panel, fb.nextSibling);
    else container.appendChild(panel);
  }

  /** 練習頁「答案」按鈕：放在該題「檢查」右邊，按一下顯示答案＋圖解，再按收起。
   *  已有檢查後的解法面板時，改為開／合那個面板（不重複顯示）。
   *  opts.fallback：沒有圖解資料時顯示的答案文字；opts.onReveal()：每次打開時通知（由練習頁決定是否計分）。 */
  function answerButton(card, k, opts) {
    opts = opts || {};
    if (!card) return null;
    var checkBtn = card.querySelector("[data-check-unit]");
    if (!checkBtn) return null;
    var btn = document.createElement("button");
    btn.type = "button";
    /* 與「檢查」同一套尺寸（例如 btn-sm），外觀用次要樣式區分 */
    btn.className = (checkBtn.className || "btn") + " btn-secondary btn-answer";
    btn.textContent = "答案";
    btn.setAttribute("aria-pressed", "false");
    btn.title = "家長用：隨時看答案與圖解（在孩子檢查前打開，這題不計分）";
    checkBtn.insertAdjacentElement("afterend", btn);

    function panel() { return card.querySelector(".sol-panel"); }
    function details() { var p = panel(); return p ? p.querySelector("details") : null; }
    function shown() { var d = details(); return !!(d && d.open); }
    function sync() {
      var on = shown();
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-active", on);
    }
    function buildAnswerPanel() {
      var spec = typeof k === "string" ? get(k) : k;
      if (spec) return buildPanel(spec, { answer: true, open: true, screenOnly: true });
      var wrap = document.createElement("div");
      wrap.className = "sol-panel is-answer screen-only";
      wrap.innerHTML = '<details class="sol-details" open><summary class="sol-summary">🔑 答案（家長用）</summary>' +
        '<div class="sol-body"><p class="sol-answer">正確答案：<strong>' + esc(opts.fallback || "—") + "</strong></p></div></details>";
      return wrap;
    }
    btn.addEventListener("click", function () {
      var p = panel();
      var d = details();
      if (p && d && d.open) {
        if (p.classList.contains("is-answer")) p.parentNode.removeChild(p);
        else d.open = false;
      } else {
        if (p && d) d.open = true;
        else place(card, buildAnswerPanel());
        if (opts.onReveal) opts.onReveal();
      }
      sync();
    });
    /* 直接點面板標題開合時，同步按鈕狀態（toggle 不冒泡，用 capture） */
    card.addEventListener("toggle", function (e) {
      if (e.target && e.target.classList && e.target.classList.contains("sol-details")) {
        sync();
        if (e.target.open && opts.onReveal) opts.onReveal();
      }
    }, true);
    /* 「答案」面板（未檢查前由按鈕打開的那個）是否開著 */
    function answerShown() { var p = panel(); return !!(p && p.classList.contains("is-answer") && shown()); }
    return { button: btn, sync: sync, shown: shown, answerShown: answerShown };
  }

  /** 錯題本項目 → 解法（先以題號查最新資料；舊項目沒有存解法也查得到；最後用項目內存的副本） */
  function forItem(item) {
    if (!item) return null;
    var k = item.explainKey || (item.unit && item.source && item.questionId ? key(item.unit, item.source, item.questionId) : "");
    var s = k ? get(k) : null;
    if (!s && item.explain && item.explain.type) {
      s = clone(item.explain);
      if (!s.key) s.key = k;
    }
    return s;
  }

  /** 答案頁：把 [data-explain] 填上圖解 */
  function fillAnswers(root) {
    root = root || document;
    var els = root.querySelectorAll("[data-explain]");
    for (var i = 0; i < els.length; i++) {
      var spec = get(els[i].getAttribute("data-explain"));
      if (!spec) continue;
      els[i].innerHTML = renderBody(spec, { figureOnly: true });
      els[i].classList.add("sol-static");
    }
    return els.length;
  }

  /** 測試用：圖上「題目已給」的數字（要在題幹出現） */
  function knownNumbers(spec) {
    var out = [];
    function add(v) { if (typeof v === "number") out.push(v); }
    switch (spec.type) {
      case "partWhole": add(spec.total.v); spec.parts.forEach(function (p) { add(p.v); }); break;
      case "compare": spec.rows.forEach(function (r) { add(r.v); }); add(spec.diff.v); break;
      case "seq": spec.terms.forEach(add); break;
      case "choiceSeq": spec.rows.forEach(function (r) { r.terms.forEach(add); }); break;
      case "numberLine": spec.known.forEach(add); break;
      case "multi": spec.parts.forEach(function (p) { out = out.concat(knownNumbers(p)); }); break;
      case "steps": add(spec.start.v); spec.ops.forEach(function (o) { add(o.v); }); break;
      case "twoStep": spec.steps.forEach(function (p) { out = out.concat(knownNumbers(p)); }); break;
    }
    return out;
  }

  global.MathExplain = {
    key: key,
    get: get,
    solve: solve,
    renderBody: renderBody,
    buildPanel: buildPanel,
    attach: attach,
    detach: detach,
    answerButton: answerButton,
    forItem: forItem,
    fillAnswers: fillAnswers,
    knownNumbers: knownNumbers,
    trackOf: trackOf
  };
})(typeof window !== "undefined" ? window : this);
