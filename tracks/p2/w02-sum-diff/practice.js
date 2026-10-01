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
      _allOk: allOk,
      _empty: empty
    };
  }

  function syncWrongBook(unit, allOk, empty) {
    if (!window.WrongBook) return;
    if (empty) return; /* 未填完不記錯 */
    var payload = buildPayload(unit, allOk, empty);
    if (allOk) {
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

    syncWrongBook(unit, allOk, empty);
    if (!bulkChecking) updateStopCue(allOk, empty);
    updateProgress();
  }

  function updateProgress() {
    var done = 0;
    var correct = 0;
    UNITS.forEach(function (u) {
      if (checked[u.id]) {
        done++;
        if (results[u.id]) correct++;
      }
    });
    var pct = Math.round((done / UNITS.length) * 100);
    var bar = document.getElementById("progress-bar");
    var text = document.getElementById("progress-text");
    if (bar) bar.style.width = pct + "%";
    if (text) text.textContent = "已檢查 " + done + " / " + UNITS.length + "　答對 " + correct;

    if (done === UNITS.length) {
      showSummary(correct);
    }
  }

  function showSummary(correct) {
    var panel = document.getElementById("practice-summary");
    if (!panel) return;
    panel.classList.add("is-visible");
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
      if (wrongs.length === 0) {
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
