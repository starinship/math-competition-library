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
        fb.textContent = "答對了！真棒，記得說出規律。";
      } else {
        fb.classList.add("bad");
        fb.textContent = "再想想看：先找「每次多／少幾」或「一組圖形是什麼」，再驗算一次。（已記入錯題本）";
      }
    }

    syncWrongBook(unit, allOk, empty);
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
            " — 已記入<a href=\"../../../wrongbook.html?track=p2\">錯題本</a>，建議到<a href=\"../../../review.html?track=p2\">重溫</a>再練。";
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
