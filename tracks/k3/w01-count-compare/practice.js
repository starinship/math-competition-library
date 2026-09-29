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
      href: CTX.href
    };
  }

  function syncWrongBook(unit, allOk, empty) {
    if (!window.WrongBook || empty) return;
    if (allOk) {
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
    if (done === UNITS.length) showSummary(correct);
  }

  function showSummary(correct) {
    var panel = document.getElementById("practice-summary");
    if (!panel) return;
    panel.classList.add("is-visible");
    var scoreEl = document.getElementById("final-score");
    if (scoreEl) scoreEl.textContent = correct + " / " + UNITS.length;
    var list = document.getElementById("wrong-list");
    if (list) {
      list.innerHTML = "";
      var wrongs = UNITS.filter(function (u) {
        return checked[u.id] && !results[u.id];
      });
      if (wrongs.length === 0) {
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
