/* K3 第1週練習：數一數・比多少（大按鈕、少題量） */
(function () {
  "use strict";

  var CTX = {
    unit: "k3-w01",
    week: 1,
    unitTitle: "數一數・比多少",
    source: "practice",
    href: "tracks/k3/w01-count-compare/practice.html",
    track: "k3"
  };

  var KEYS = {
    q1: ["4"],
    q2: ["7"],
    q3: ["10"],
    q4: ["B", "b"],
    q5: ["一樣多", "一样多", "相同", "一樣"],
    q6: ["⬛", "黑方", "方塊", "■"]
  };

  var UNITS = [
    { id: "q1", keys: ["q1"], label: "第 1 題", skills: ["數數1-20", "一一對應"], answerType: "choice", choices: ["3", "4", "5"] },
    { id: "q2", keys: ["q2"], label: "第 2 題", skills: ["數數1-20", "一一對應"], answerType: "choice", choices: ["6", "7", "8"] },
    { id: "q3", keys: ["q3"], label: "第 3 題", skills: ["數數1-20", "一一對應"], answerType: "choice", choices: ["9", "10", "11"] },
    { id: "q4", keys: ["q4"], label: "第 4 題", skills: ["比較多少"], answerType: "choice", choices: ["A", "B", "一樣多"] },
    { id: "q5", keys: ["q5"], label: "第 5 題", skills: ["比較多少", "一一對應"], answerType: "choice", choices: ["貓", "狗", "一樣多"] },
    { id: "q6", keys: ["q6"], label: "第 6 題", skills: ["簡單規律"], answerType: "choice", choices: ["🔺", "⬛", "⬤"] }
  ];

  var checked = {};
  /* 看過解法（答錯後顯示）的題，之後答對不計入錯題本 streak；每題每次開頁最多計一次 */
  var revealed = {};
  var counted = {};
  /* 「答案」按鈕（家長用）：孩子第一次檢查前就打開答案 → 這題標記「先看答案」：
     答對不計分、不計入錯題本進度；答錯照樣記入錯題本 */
  var attempted = {};
  var viewed = {};
  var answerCtl = {};

  function viewedCount() {
    return UNITS.filter(function (u) {
      return viewed[u.id];
    }).length;
  }

  function markViewed(unit) {
    if (attempted[unit.id] || viewed[unit.id]) return;
    viewed[unit.id] = true;
    revealed[unit.id] = true;
    var ctl = answerCtl[unit.id];
    var card = document.querySelector('[data-unit="' + unit.id + '"]');
    if (ctl && card && !card.querySelector(".ans-viewed-note")) {
      var note = document.createElement("span");
      note.className = "ans-viewed-note";
      note.textContent = "👀 已先看答案・這題不計分";
      ctl.button.insertAdjacentElement("afterend", note);
    }
    updateProgress(); /* 進度列顯示「先看答案」題數 */
  }

  function explainKey(unit) {
    return CTX.unit + "|" + CTX.source + "|" + unit.id;
  }
  var results = {};

  function getValue(key) {
    var el = document.querySelector('[data-key="' + key + '"]');
    if (!el) return "";
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") return el.value;
    if (el.classList.contains("choice-group")) {
      var sel = el.querySelector(".choice-btn.is-selected");
      return sel ? sel.getAttribute("data-value") : "";
    }
    return "";
  }

  function markInput(key, ok) {
    var el = document.querySelector('[data-key="' + key + '"]');
    if (!el) return;
    if (el.classList.contains("choice-group")) {
      el.querySelectorAll(".choice-btn").forEach(function (b) {
        b.classList.remove("is-correct", "is-wrong");
        if (b.classList.contains("is-selected")) {
          b.classList.add(ok ? "is-correct" : "is-wrong");
        }
      });
      return;
    }
    el.classList.remove("is-correct", "is-wrong");
    el.classList.add(ok ? "is-correct" : "is-wrong");
  }

  function buildPayload(unit) {
    var card = document.querySelector('[data-unit="' + unit.id + '"]');
    var prompt = window.WrongBook ? window.WrongBook.snapshotPrompt(card) : unit.label;
    var userParts = [];
    var correctParts = [];
    var blanks = [];
    unit.keys.forEach(function (k) {
      var val = getValue(k);
      userParts.push(val || "（空）");
      var exp = KEYS[k];
      correctParts.push(Array.isArray(exp) ? exp[0] : exp);
      blanks.push({ key: k, user: val, correctAnswers: exp });
    });
    return {
      unit: CTX.unit,
      week: CTX.week,
      source: CTX.source,
      questionId: unit.id,
      label: unit.label + "（" + CTX.unitTitle + "・練習）",
      prompt: prompt,
      userAnswer: userParts.join("、"),
      correctAnswer: correctParts.join("、"),
      correctAnswers: unit.keys.length === 1 ? KEYS[unit.keys[0]] : correctParts,
      skillTags: unit.skills || [],
      answerType: unit.answerType || "choice",
      choices: unit.choices || null,
      blanks: blanks,
      href: CTX.href,
      explainKey: explainKey(unit),
      explain: window.MathExplain ? window.MathExplain.get(explainKey(unit)) : null
    };
  }

  function syncWrongBook(unit, allOk, empty) {
    if (!window.WrongBook || empty) return;
    if (allOk) {
      if (revealed[unit.id] || counted[unit.id]) return;
      counted[unit.id] = true;
      window.WrongBook.recordCorrect({
        unit: CTX.unit,
        source: CTX.source,
        questionId: unit.id
      });
    } else {
      window.WrongBook.recordWrong(buildPayload(unit));
    }
  }

  function checkUnit(unit) {
    var allOk = true;
    var empty = false;
    unit.keys.forEach(function (k) {
      var val = getValue(k);
      if (!val) empty = true;
      var ok = window.MathLib.answersMatch(val, KEYS[k]);
      if (!ok) allOk = false;
      markInput(k, ok && !!val);
    });
    if (empty) allOk = false;

    checked[unit.id] = true;
    if (!empty) attempted[unit.id] = true;
    results[unit.id] = allOk;

    var card = document.querySelector('[data-unit="' + unit.id + '"]');
    var fb = card ? card.querySelector(".feedback") : null;
    if (card) {
      card.classList.remove("is-done-ok", "is-done-bad");
      card.classList.add(allOk ? "is-done-ok" : "is-done-bad");
    }
    if (fb) {
      fb.classList.add("is-visible");
      fb.classList.remove("ok", "bad", "info");
      if (empty) {
        fb.classList.add("info");
        fb.textContent = "先點一個答案再檢查喔。";
      } else if (allOk) {
        fb.classList.add("ok");
        fb.textContent = "答對了！你有慢慢數，真棒。";
      } else {
        fb.classList.add("bad");
        fb.textContent = "再數一次：用手指一個一個指。已記入錯題本。";
      }
    }
    var wasRevealed = !!revealed[unit.id];
    var ctl = answerCtl[unit.id];
    var answerOpen = !!(ctl && ctl.answerShown());
    syncWrongBook(unit, allOk, empty);
    if (window.MathExplain && card) {
      if (empty) {
        if (!answerOpen) window.MathExplain.detach(card);
      } else {
        window.MathExplain.attach(card, explainKey(unit), { wrong: !allOk, open: !allOk || answerOpen });
        if (!allOk) {
          revealed[unit.id] = true;
          if (fb) fb.textContent += " 👇 先看下面「看看怎樣做」。";
        } else if (viewed[unit.id] && fb) {
          fb.textContent += "（先看過答案：這題不計分，也不計入錯題本進度。）";
        } else if (wasRevealed && fb) {
          fb.textContent += "（看過解法後答對：這次不計入錯題本進度，記得之後到「重溫」再做一次。）";
        }
      }
    }
    if (ctl) ctl.sync();
    updateProgress();
  }

  function updateProgress() {
    var done = 0;
    var correct = 0;
    UNITS.forEach(function (u) {
      if (checked[u.id]) {
        done++;
        if (results[u.id] && !viewed[u.id]) correct++;
      }
    });
    var pct = Math.round((done / UNITS.length) * 100);
    var bar = document.getElementById("progress-bar");
    var text = document.getElementById("progress-text");
    if (bar) bar.style.width = pct + "%";
    if (text) text.textContent = "已檢查 " + done + " / " + UNITS.length + "　答對 " + correct +
      (viewedCount() ? "　先看答案 " + viewedCount() + "（不計分）" : "");
    if (done === UNITS.length) showSummary(correct);
  }

  function showSummary(correct) {
    var panel = document.getElementById("practice-summary");
    if (!panel) return;
    panel.classList.add("is-visible");
    var vn = document.getElementById("viewed-note");
    var scoreHost = document.getElementById("final-score");
    if (!vn && scoreHost && scoreHost.parentNode) {
      vn = document.createElement("p");
      vn.id = "viewed-note";
      vn.className = "small viewed-note";
      scoreHost.parentNode.parentNode.insertBefore(vn, scoreHost.parentNode.nextSibling);
    }
    if (vn) {
      vn.textContent = viewedCount()
        ? "👀 先看答案 " + viewedCount() + " 題：這些題即使答對也不計分（不算入上面的得分）。"
        : "";
      vn.style.display = viewedCount() ? "" : "none";
    }
    var scoreEl = document.getElementById("final-score");
    if (scoreEl) scoreEl.textContent = correct + " / " + UNITS.length;
    var list = document.getElementById("wrong-list");
    if (list) {
      list.innerHTML = "";
      var wrongs = UNITS.filter(function (u) {
        return checked[u.id] && !results[u.id];
      });
      var seen = UNITS.filter(function (u) {
        return viewed[u.id] && checked[u.id] && results[u.id];
      });
      if (wrongs.length === 0 && seen.length === 0) {
        list.innerHTML = "<li>全部正確！可以休息，或做小測（約 5 題）。</li>";
      } else {
        wrongs.forEach(function (u) {
          var li = document.createElement("li");
          li.innerHTML =
            u.label +
            "（" +
            (u.skills || []).join("、") +
            "）— 已記入<a href=\"../../../wrongbook.html?track=k3\">錯題本</a>，建議<a href=\"../../../review.html?track=k3\">重溫</a>。";
          list.appendChild(li);
        });
      }
      seen.forEach(function (u) {
        var li = document.createElement("li");
        li.textContent = u.label + " — 先看了答案才作答，這次不計分；建議隔天不看答案再做一次。";
        list.appendChild(li);
      });
    }
  }

  document.querySelectorAll("[data-check-unit]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-check-unit");
      var unit = UNITS.filter(function (u) {
        return u.id === id;
      })[0];
      if (unit) checkUnit(unit);
    });
  });

  /* 每題「檢查」右邊加「答案」按鈕（列印時與 .q-actions 一起隱藏） */
  UNITS.forEach(function (u) {
    var card = document.querySelector('[data-unit="' + u.id + '"]');
    if (!card || !window.MathExplain || !window.MathExplain.answerButton) return;
    answerCtl[u.id] = window.MathExplain.answerButton(card, explainKey(u), {
      fallback: u.keys
        .map(function (k) {
          var e = KEYS[k];
          return Array.isArray(e) ? e[0] : e;
        })
        .join("、"),
      onReveal: function () {
        markViewed(u);
      }
    });
  });

  var checkAll = document.getElementById("btn-check-all");
  if (checkAll) {
    checkAll.addEventListener("click", function () {
      UNITS.forEach(checkUnit);
    });
  }

  document.querySelectorAll(".choice-group").forEach(function (group) {
    group.querySelectorAll(".choice-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        group.querySelectorAll(".choice-btn").forEach(function (b) {
          b.classList.remove("is-selected", "is-correct", "is-wrong");
        });
        btn.classList.add("is-selected");
      });
    });
  });

  if (window.MathLib) window.MathLib.bindPrintButton("#btn-print");
})();
