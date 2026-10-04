/* 練習頁：逐題核對、進度、總分＋寫入錯題本（答案僅存於本腳本） */
(function () {
  "use strict";

  var CTX = {
    unit: "w01",
    week: 1,
    unitTitle: "找規律・填數",
    source: "practice",
    href: "tracks/p2/w01-patterns/practice.html"
  };

  /* 正確答案：字串或字串陣列（多種寫法） */
  var KEYS = {
    q1: ["15"],
    q2: ["12"],
    q3a: ["24"],
    q3b: ["29"],
    q4: ["12"],
    q5: ["40"],
    q6a: ["10"],
    q6b: ["12"],
    q6c: ["偶數", "偶数", "雙數", "双数"],
    q7: ["7"],
    q8: ["☆", "★☆的☆", "空心星", "白星"],
    q9: ["■", "方", "方塊", "黑方", "正方形"],
    q10a: ["30"],
    q10b: ["35"]
  };

  /* 計分單元：一題一單位（多空共用一單位時在 groups） */
  var UNITS = [
    { id: "q1", keys: ["q1"], label: "第 1 題", skills: ["觀察數列規律", "奇偶／加減規律"], answerType: "text" },
    { id: "q2", keys: ["q2"], label: "第 2 題", skills: ["觀察數列規律", "奇偶／加減規律"], answerType: "text" },
    { id: "q3", keys: ["q3a", "q3b"], label: "第 3 題", skills: ["觀察數列規律", "填空推理"], answerType: "text" },
    { id: "q4", keys: ["q4"], label: "第 4 題", skills: ["觀察數列規律", "填空推理"], answerType: "text" },
    { id: "q5", keys: ["q5"], label: "第 5 題", skills: ["觀察數列規律", "奇偶／加減規律"], answerType: "text" },
    { id: "q6", keys: ["q6a", "q6b", "q6c"], label: "第 6 題", skills: ["奇偶／加減規律"], answerType: "mixed" },
    { id: "q7", keys: ["q7"], label: "第 7 題", skills: ["奇偶／加減規律", "填空推理"], answerType: "text" },
    { id: "q8", keys: ["q8"], label: "第 8 題", skills: ["圖形重複規律"], answerType: "choice", choices: ["★", "☆", "●"] },
    { id: "q9", keys: ["q9"], label: "第 9 題", skills: ["圖形重複規律"], answerType: "choice", choices: ["▲", "■", "●"] },
    { id: "q10", keys: ["q10a", "q10b"], label: "第 10 題", skills: ["觀察數列規律", "填空推理"], answerType: "text" }
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
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      return el.value;
    }
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

  function buildPayload(unit, allOk, empty) {
    var card = document.querySelector('[data-unit="' + unit.id + '"]');
    var prompt = window.WrongBook
      ? window.WrongBook.snapshotPrompt(card)
      : unit.label;
    var userParts = [];
    var correctParts = [];
    var blanks = [];
    unit.keys.forEach(function (k) {
      var val = getValue(k);
      userParts.push(val || "（空）");
      var exp = KEYS[k];
      correctParts.push(Array.isArray(exp) ? exp[0] : exp);
      blanks.push({
        key: k,
        user: val,
        correctAnswers: exp
      });
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
      answerType: unit.answerType || "text",
      choices: unit.choices || null,
      blanks: blanks,
      href: CTX.href,
      explainKey: explainKey(unit),
      explain: window.MathExplain ? window.MathExplain.get(explainKey(unit)) : null,
      _allOk: allOk,
      _empty: empty
    };
  }

  function syncWrongBook(unit, allOk, empty) {
    if (!window.WrongBook) return;
    if (empty) return; /* 未填完不記錯 */
    var payload = buildPayload(unit, allOk, empty);
    if (allOk) {
      if (revealed[unit.id] || counted[unit.id]) return;
      counted[unit.id] = true;
      /* 若先前錯過，這次做對 → 計入正確 streak（練習核對也算一次） */
      window.WrongBook.recordCorrect({
        unit: CTX.unit,
        source: CTX.source,
        questionId: unit.id
      });
    } else {
      window.WrongBook.recordWrong(payload);
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
        fb.textContent = "還有空格沒填喔，先填完再檢查。";
      } else if (allOk) {
        fb.classList.add("ok");
        fb.textContent = "答對了！真棒，記得說出規律。";
      } else {
        fb.classList.add("bad");
        fb.textContent = "再想想看：先找「每次多／少幾」或「一組圖形是什麼」，再驗算一次。（已記入錯題本）";
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

    if (done === UNITS.length) {
      showSummary(correct);
    }
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
    if (scoreEl) {
      scoreEl.textContent = correct + " / " + UNITS.length;
    }
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
        list.innerHTML = "<li>全部正確！可以休息一下，或挑戰測驗頁。</li>";
      } else {
        wrongs.forEach(function (u) {
          var li = document.createElement("li");
          li.innerHTML =
            u.label +
            " — 已記入<a href=\"../../../wrongbook.html?track=p2\">錯題本</a>，建議到<a href=\"../../../review.html?track=p2\">重溫</a>再練。";
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
