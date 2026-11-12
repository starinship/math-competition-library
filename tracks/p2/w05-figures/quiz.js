/* 小二第5週測驗：圖形與方格 */
(function () {
  "use strict";

  var CTX = {
    unit: "w05",
    week: 5,
    unitTitle: "圖形與方格",
    source: "quiz",
    href: "tracks/p2/w05-figures/quiz.html"
  };

  /* 及格門檻（精熟）：7 題約 5 題 */
  var PASS = 5;

  var KEYS = {
    q1: ["3", "3條", "三"],
    q2: ["上下摺會重合"],
    q3: ["5", "5格", "五"],
    q4: ["8", "8條", "八"],
    q5: ["8", "8格", "八"],
    q6: ["27"],
    q7: ["24"]
  };

  var UNITS = [
    { id: "q1", keys: ["q1"], label: "第 1 題", skills: ["平面圖形特徵"], answerType: "choice", choices: ["2", "3", "4"] },
    { id: "q2", keys: ["q2"], label: "第 2 題", skills: ["對稱初步"], answerType: "choice", choices: ["上下摺會重合", "左右摺會重合", "不會重合"] },
    { id: "q3", keys: ["q3"], label: "第 3 題", skills: ["數方格"], answerType: "text" },
    { id: "q4", keys: ["q4"], label: "第 4 題", skills: ["周界直覺"], answerType: "text" },
    { id: "q5", keys: ["q5"], label: "第 5 題", skills: ["簡單割補"], answerType: "text" },
    { id: "q6", keys: ["q6"], label: "第 6 題（溫故）", skills: ["觀察數列規律"], answerType: "text" },
    { id: "q7", keys: ["q7"], label: "第 7 題（溫故）", skills: ["已知和求一部分"], answerType: "text" }
  ];

  var DURATION_SEC = 20 * 60;
  var remaining = DURATION_SEC;
  var timerId = null;
  var started = false;
  var submitted = false;

  var gate = document.getElementById("quiz-gate");
  var body = document.getElementById("quiz-body");
  var timerEl = document.getElementById("timer-display");
  var btnStartTimed = document.getElementById("btn-start-timed");
  var btnStartFree = document.getElementById("btn-start-free");
  var btnSubmit = document.getElementById("btn-submit");
  var summary = document.getElementById("quiz-summary");

  function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function updateTimer() {
    if (!timerEl) return;
    timerEl.textContent = "剩餘 " + formatTime(remaining);
    timerEl.classList.toggle("urgent", remaining <= 60 && remaining > 0);
    timerEl.classList.toggle("expired", remaining <= 0);
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function startTimer() {
    remaining = DURATION_SEC;
    updateTimer();
    stopTimer();
    timerId = setInterval(function () {
      remaining--;
      if (remaining <= 0) {
        remaining = 0;
        updateTimer();
        stopTimer();
        if (!submitted) {
          alert("時間到！將自動交卷。");
          submitQuiz();
        }
        return;
      }
      updateTimer();
    }, 1000);
  }

  function unlockQuestions() {
    started = true;
    if (gate) gate.style.display = "none";
    if (body) body.classList.remove("is-locked-gate");
    var bar = document.getElementById("quiz-toolbar");
    if (bar) bar.style.display = "flex";
  }

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
    var radio = document.querySelector('input[name="' + key + '"]:checked');
    if (radio) return radio.value;
    return "";
  }

  function lockInputs() {
    document.querySelectorAll(".ans-input, .meta-input").forEach(function (el) {
      el.disabled = true;
    });
    document.querySelectorAll(".choice-btn").forEach(function (b) {
      b.disabled = true;
    });
    document.querySelectorAll('input[type="radio"]').forEach(function (r) {
      r.disabled = true;
    });
    if (btnSubmit) btnSubmit.disabled = true;
  }

  function syncWrongBook(unit, allOk) {
    if (!window.WrongBook) return;
    var card = document.querySelector('[data-unit="' + unit.id + '"]');
    var prompt = window.WrongBook.snapshotPrompt(card);
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
    if (allOk) {
      window.WrongBook.recordCorrect({
        unit: CTX.unit,
        source: CTX.source,
        questionId: unit.id
      });
    } else {
      window.WrongBook.recordWrong({
        unit: CTX.unit,
        week: CTX.week,
        source: CTX.source,
        questionId: unit.id,
        label: unit.label + "（" + CTX.unitTitle + "・測驗）",
        prompt: prompt,
        userAnswer: userParts.join("、"),
        correctAnswer: correctParts.join("、"),
        correctAnswers: unit.keys.length === 1 ? KEYS[unit.keys[0]] : correctParts,
        skillTags: unit.skills || [],
        answerType: unit.answerType || "text",
        choices: unit.choices || null,
        blanks: blanks,
        href: CTX.href,
        explainKey: CTX.unit + "|" + CTX.source + "|" + unit.id,
        explain: window.MathExplain ? window.MathExplain.get(CTX.unit, CTX.source, unit.id) : null
      });
    }
  }

  function submitQuiz() {
    if (submitted) return;
    if (!started) return;
    submitted = true;
    stopTimer();
    lockInputs();

    var correct = 0;
    var wrongs = [];

    UNITS.forEach(function (unit) {
      var allOk = true;
      unit.keys.forEach(function (k) {
        var val = getValue(k);
        var ok = window.MathLib.answersMatch(val, KEYS[k]);
        if (!ok) allOk = false;
        var input = document.querySelector('[data-key="' + k + '"]');
        if (input && input.classList.contains("choice-group")) {
          input.querySelectorAll(".choice-btn").forEach(function (b) {
            b.classList.remove("is-correct", "is-wrong");
            if (b.classList.contains("is-selected")) {
              b.classList.add(ok ? "is-correct" : "is-wrong");
            }
          });
        } else if (input) {
          input.classList.remove("is-correct", "is-wrong");
          input.classList.add(ok ? "is-correct" : "is-wrong");
        }
      });
      if (allOk) correct++;
      else wrongs.push(unit.label + "（" + (unit.skills || []).join("、") + "）");
      syncWrongBook(unit, allOk);
      /* 交卷後才顯示圖解（答錯的自動打開） */
      if (window.MathExplain) {
        window.MathExplain.attach(document.querySelector('[data-unit="' + unit.id + '"]'), CTX.unit + "|" + CTX.source + "|" + unit.id, { wrong: !allOk });
      }
    });

    if (summary) {
      summary.classList.add("is-visible");
      var scoreEl = document.getElementById("quiz-score");
      if (scoreEl) scoreEl.textContent = correct + " / " + UNITS.length;
      var verdict = document.getElementById("quiz-verdict");
      if (verdict) {
        verdict.classList.add("is-visible");
        verdict.classList.remove("pass", "notyet");
        if (correct >= PASS) {
          verdict.classList.add("pass");
          verdict.innerHTML =
            "✅ 達標（" + correct + "/" + UNITS.length + "，門檻約 " + PASS + "/7）" +
            "<ul><li>下一步：未來幾天按<a href=\"../../../review.html?track=p2\">重溫頁</a>做間隔複習（1→3→7 天）；到期錯題清完即可進第 6 週。</li></ul>";
        } else {
          verdict.classList.add("notyet");
          verdict.innerHTML =
            "⏸ 未達標（" + correct + "/" + UNITS.length + "，門檻約 " + PASS + "/7）—— 精熟再前進，先不進第 6 週。" +
            "<ul><li>下一步：看下面錯題的技能標籤，回<a href=\"teach.html\">教學頁</a>重講相關例題。</li>" +
            "<li>明天到<a href=\"../../../review.html?track=p2\">錯題重溫</a>只練錯題 2–3 題；兩三天後再做一次測驗。</li></ul>";
        }
      }
      var used = document.getElementById("quiz-time-used");
      if (used) {
        if (timerId === null && remaining < DURATION_SEC) {
          var usedSec = DURATION_SEC - remaining;
          used.textContent = formatTime(usedSec);
        } else if (remaining === DURATION_SEC && !timerId) {
          used.textContent = "未計時";
        } else {
          used.textContent = formatTime(DURATION_SEC - remaining);
        }
      }
      var list = document.getElementById("quiz-wrong-list");
      if (list) {
        list.innerHTML = "";
        if (wrongs.length === 0) {
          list.innerHTML = "<li>全部正確！太厲害了。</li>";
        } else {
          wrongs.forEach(function (label) {
            var li = document.createElement("li");
            li.innerHTML =
              label +
              " — 已記入<a href=\"../../../wrongbook.html?track=p2\">錯題本</a>";
            list.appendChild(li);
          });
          var tip = document.createElement("li");
          tip.innerHTML =
            '請到 <a href="../../../review.html?track=p2">重溫頁</a> 做間隔複習（必做，不是選做）。';
          list.appendChild(tip);
        }
      }
      summary.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  if (btnStartTimed) {
    btnStartTimed.addEventListener("click", function () {
      unlockQuestions();
      startTimer();
    });
  }
  if (btnStartFree) {
    btnStartFree.addEventListener("click", function () {
      unlockQuestions();
      if (timerEl) {
        timerEl.textContent = "未計時（自由練習）";
        timerEl.classList.remove("urgent", "expired");
      }
    });
  }
  if (btnSubmit) {
    btnSubmit.addEventListener("click", function () {
      if (!confirm("確定交卷嗎？交卷後不能再改答案。")) return;
      submitQuiz();
    });
  }

  document.querySelectorAll(".choice-group").forEach(function (group) {
    group.querySelectorAll(".choice-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (submitted) return;
        group.querySelectorAll(".choice-btn").forEach(function (b) {
          b.classList.remove("is-selected");
        });
        btn.classList.add("is-selected");
      });
    });
  });

  if (window.MathLib) window.MathLib.bindPrintButton("#btn-print");

  /* 列印時不需先按開始：列印空白卷 */
  if (body) body.classList.add("is-locked-gate");
})();
