/* K3 第1週小測：5 題・可選 8 分鐘 */
(function () {
  "use strict";

  var CTX = {
    unit: "k3-w01",
    week: 1,
    unitTitle: "數一數・比多少",
    source: "quiz",
    href: "tracks/k3/w01-count-compare/quiz.html",
    track: "k3"
  };

  var KEYS = {
    q1: ["6"],
    q2: ["9"],
    q3: ["A", "a"],
    q4: ["一樣多", "一样多", "相同"],
    q5: ["🟢", "綠", "绿色", "綠色"]
  };

  var UNITS = [
    { id: "q1", keys: ["q1"], label: "第 1 題", skills: ["數數1-20", "一一對應"], answerType: "choice", choices: ["5", "6", "7"] },
    { id: "q2", keys: ["q2"], label: "第 2 題", skills: ["數數1-20"], answerType: "choice", choices: ["8", "9", "10"] },
    { id: "q3", keys: ["q3"], label: "第 3 題", skills: ["比較多少"], answerType: "choice", choices: ["A", "B", "一樣多"] },
    { id: "q4", keys: ["q4"], label: "第 4 題", skills: ["比較多少", "一一對應"], answerType: "choice", choices: ["左多", "右多", "一樣多"] },
    { id: "q5", keys: ["q5"], label: "第 5 題", skills: ["簡單規律"], answerType: "choice", choices: ["🟡", "🟢", "🔴"] }
  ];

  var DURATION_SEC = 8 * 60;
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
    if (el.classList.contains("choice-group")) {
      var sel = el.querySelector(".choice-btn.is-selected");
      return sel ? sel.getAttribute("data-value") : "";
    }
    return "";
  }

  function lockInputs() {
    document.querySelectorAll(".choice-btn").forEach(function (b) {
      b.disabled = true;
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
        label: unit.label + "（" + CTX.unitTitle + "・小測）",
        prompt: prompt,
        userAnswer: userParts.join("、"),
        correctAnswer: correctParts.join("、"),
        correctAnswers: unit.keys.length === 1 ? KEYS[unit.keys[0]] : correctParts,
        skillTags: unit.skills || [],
        answerType: unit.answerType || "choice",
        choices: unit.choices || null,
        blanks: blanks,
        href: CTX.href
      });
    }
  }

  function submitQuiz() {
    if (submitted || !started) return;
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
        }
      });
      if (allOk) correct++;
      else wrongs.push(unit.label + "（" + (unit.skills || []).join("、") + "）");
      syncWrongBook(unit, allOk);
    });

    if (summary) {
      summary.classList.add("is-visible");
      var scoreEl = document.getElementById("quiz-score");
      if (scoreEl) scoreEl.textContent = correct + " / " + UNITS.length;
      var used = document.getElementById("quiz-time-used");
      if (used) {
        if (remaining === DURATION_SEC && !timerId) used.textContent = "未計時";
        else used.textContent = formatTime(DURATION_SEC - remaining);
      }
      var list = document.getElementById("quiz-wrong-list");
      if (list) {
        list.innerHTML = "";
        if (wrongs.length === 0) {
          list.innerHTML = "<li>全部正確！太棒了，記得休息。</li>";
        } else {
          wrongs.forEach(function (label) {
            var li = document.createElement("li");
            li.innerHTML = label + ' — 已記入<a href="../../../wrongbook.html?track=k3">錯題本</a>';
            list.appendChild(li);
          });
          var tip = document.createElement("li");
          tip.innerHTML = '請到 <a href="../../../review.html?track=k3">重溫頁</a> 依技能標籤再練（必做）。';
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
        timerEl.textContent = "未計時";
        timerEl.classList.remove("urgent", "expired");
      }
    });
  }
  if (btnSubmit) {
    btnSubmit.addEventListener("click", function () {
      if (!confirm("確定交卷嗎？")) return;
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
  if (body) body.classList.add("is-locked-gate");
})();
