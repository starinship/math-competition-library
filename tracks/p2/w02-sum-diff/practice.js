/* 小二第2週練習：和與差・加減進階（逐題核對、進度、過關判定＋寫入錯題本） */
(function () {
  "use strict";

  var CTX = {
    unit: "w02",
    week: 2,
    unitTitle: "和與差・加減進階",
    source: "practice",
    href: "tracks/p2/w02-sum-diff/practice.html"
  };

  /* 及格門檻（精熟）：10 題約 8 題 */
  var PASS = 8;

  /* 正確答案：字串或字串陣列（多種寫法） */
  var KEYS = {
    q1: ["15"],
    q2a: ["17"],
    q2b: ["36"],
    q3: ["22"],
    q4: ["45"],
    q5: ["37"],
    q6a: ["減法", "減", "减法", "减", "-", "−"],
    q6b: ["27"],
    q7: ["16"],
    q8a: ["37"],
    q8b: ["46"],
    q9: ["26"],
    q10: ["28"]
  };

  /* 計分單元：一題一單位（多空共用一單位） */
  var UNITS = [
    { id: "q1", keys: ["q1"], label: "第 1 題", skills: ["已知和求一部分", "驗算習慣"], answerType: "text" },
    { id: "q2", keys: ["q2a", "q2b"], label: "第 2 題", skills: ["已知和求一部分", "驗算習慣"], answerType: "text" },
    { id: "q3", keys: ["q3"], label: "第 3 題", skills: ["已知和求一部分"], answerType: "text" },
    { id: "q4", keys: ["q4"], label: "第 4 題", skills: ["已知差求一部分"], answerType: "text" },
    { id: "q5", keys: ["q5"], label: "第 5 題", skills: ["已知差求一部分"], answerType: "text" },
    { id: "q6", keys: ["q6a", "q6b"], label: "第 6 題", skills: ["已知差求一部分", "和差關係口訣"], answerType: "mixed" },
    { id: "q7", keys: ["q7"], label: "第 7 題", skills: ["已知差求一部分", "和差關係口訣"], answerType: "text" },
    { id: "q8", keys: ["q8a", "q8b"], label: "第 8 題", skills: ["和差關係口訣", "驗算習慣"], answerType: "text" },
    { id: "q9", keys: ["q9"], label: "第 9 題（溫故）", skills: ["觀察數列規律", "奇偶／加減規律"], answerType: "text" },
    { id: "q10", keys: ["q10"], label: "第 10 題（溫故）", skills: ["觀察數列規律", "填空推理"], answerType: "text" }
  ];

  /* 家長停損：連錯 2 題提示 */
  var wrongStreak = 0;
  function updateStopCue(allOk, empty) {
    if (empty) return;
    wrongStreak = allOk ? 0 : wrongStreak + 1;
    var cue = document.getElementById("stop-cue");
    if (cue) cue.classList.toggle("is-visible", wrongStreak >= 2);
  }

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
  var bulkChecking = false;
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
        fb.textContent = "答對了！記得說出「誰是總數／誰大誰小」，並驗算一次。";
      } else {
        fb.classList.add("bad");
        fb.textContent = "再想想看：先畫線段圖，找出誰是總數、誰大誰小，再用相反算法驗算。（已記入錯題本）";
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
    if (!bulkChecking) updateStopCue(allOk, empty);
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
    var verdict = document.getElementById("practice-verdict");
    if (verdict) {
      verdict.classList.add("is-visible");
      verdict.classList.remove("pass", "notyet");
      if (correct >= PASS) {
        verdict.classList.add("pass");
        verdict.innerHTML =
          "✅ 達標（" + correct + "/" + UNITS.length + "，門檻約 " + PASS + "/10）" +
          "<ul><li>下一步：隔天先做<a href=\"../../../review.html?track=p2\">錯題重溫</a>（到期題清完），再做<a href=\"quiz.html\">測驗</a>。</li>" +
          "<li>請孩子挑一題，口頭講「圖 → 式 → 答 → 驗」四步。</li></ul>";
      } else {
        verdict.classList.add("notyet");
        verdict.innerHTML =
          "⏸ 未達標（" + correct + "/" + UNITS.length + "，門檻約 " + PASS + "/10）—— 沒關係，精熟再前進。" +
          "<ul><li>下一步：回<a href=\"teach.html\">教學頁</a>重講錯題相關的例題（看下面的技能標籤）。</li>" +
          "<li>明天到<a href=\"../../../review.html?track=p2\">錯題重溫</a>只做錯題 2–3 題，達標前先不做測驗、不進第 3 週。</li></ul>";
      }
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
            "（" +
            (u.skills || []).join("、") +
            "）— 已記入<a href=\"../../../wrongbook.html?track=p2\">錯題本</a>，建議到<a href=\"../../../review.html?track=p2\">重溫</a>再練。";
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
      bulkChecking = true;
      UNITS.forEach(checkUnit);
      bulkChecking = false;
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
