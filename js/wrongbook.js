/* 錯題本＋間隔複習（SM-2-lite）・離線 localStorage */
(function (global) {
  "use strict";

  var LEGACY_KEY = "mathLibWrongbook.v1";
  var MASTER_STREAK = 3;
  var INTERVALS = [1, 3, 7]; /* 天：1 → 3 → 7 */

  function storageKey() {
    if (global.MathTrack && global.MathTrack.wrongbookKeyFor) {
      return global.MathTrack.wrongbookKeyFor();
    }
    return "mathWrongbook_p2";
  }

  function now() {
    return Date.now();
  }

  function dayMs(days) {
    return days * 24 * 60 * 60 * 1000;
  }

  function loadAll() {
    try {
      var key = storageKey();
      var raw = localStorage.getItem(key);
      /* 小二庫空時，嘗試一次性遷移舊單庫 */
      if (!raw && key === "mathWrongbook_p2") {
        raw = localStorage.getItem(LEGACY_KEY);
        if (raw) {
          try { localStorage.setItem(key, raw); } catch (e2) {}
        }
      }
      if (!raw) return [];
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveAll(items) {
    localStorage.setItem(storageKey(), JSON.stringify(items));
  }

  function findIndex(items, id) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) return i;
    }
    return -1;
  }

  function makeId(unit, source, questionId) {
    return [unit, source, questionId].join("-");
  }

  function primaryCorrect(correctAnswers) {
    if (Array.isArray(correctAnswers) && correctAnswers.length) {
      if (Array.isArray(correctAnswers[0])) {
        return correctAnswers
          .map(function (arr) {
            return Array.isArray(arr) && arr.length ? arr[0] : String(arr);
          })
          .join("、");
      }
      return String(correctAnswers[0]);
    }
    return String(correctAnswers || "");
  }

  /**
   * 記錄錯題（練習檢查／測驗交卷呼叫）
   * payload: {
   *   unit, week, source, questionId, label,
   *   prompt, userAnswer, correctAnswer, correctAnswers,
   *   skillTags, answerType, choices, blanks, href
   * }
   */
  function recordWrong(payload) {
    if (!payload || !payload.unit || !payload.questionId || !payload.source) {
      return null;
    }
    var id = makeId(payload.unit, payload.source, payload.questionId);
    var items = loadAll();
    var idx = findIndex(items, id);
    var t = now();
    /* 新錯／再錯：立刻可重溫（nextReviewAt=現在）；答對後才進入 1→3→7 */
    var next = t;

    if (idx >= 0) {
      var prev = items[idx];
      prev.timesWrong = (prev.timesWrong || 0) + 1;
      prev.lastWrongAt = t;
      prev.nextReviewAt = next;
      prev.status = "learning";
      prev.correctStreak = 0;
      prev.intervalIndex = 0;
      prev.userAnswer = payload.userAnswer != null ? String(payload.userAnswer) : prev.userAnswer;
      if (payload.prompt) prev.prompt = payload.prompt;
      if (payload.correctAnswer != null) prev.correctAnswer = String(payload.correctAnswer);
      if (payload.correctAnswers) prev.correctAnswers = payload.correctAnswers;
      if (payload.skillTags) prev.skillTags = payload.skillTags;
      if (payload.answerType) prev.answerType = payload.answerType;
      if (payload.choices) prev.choices = payload.choices;
      if (payload.blanks) prev.blanks = payload.blanks;
      if (payload.label) prev.label = payload.label;
      if (payload.href) prev.href = payload.href;
      prev.week = payload.week != null ? payload.week : prev.week;
      items[idx] = prev;
      saveAll(items);
      return prev;
    }

    var item = {
      id: id,
      unit: payload.unit,
      week: payload.week != null ? payload.week : 0,
      source: payload.source,
      questionId: payload.questionId,
      label: payload.label || payload.questionId,
      prompt: payload.prompt || "",
      userAnswer: payload.userAnswer != null ? String(payload.userAnswer) : "",
      correctAnswer:
        payload.correctAnswer != null
          ? String(payload.correctAnswer)
          : primaryCorrect(payload.correctAnswers),
      correctAnswers: payload.correctAnswers || [payload.correctAnswer || ""],
      skillTags: payload.skillTags || [],
      answerType: payload.answerType || "text",
      choices: payload.choices || null,
      blanks: payload.blanks || null,
      href: payload.href || "",
      timesWrong: 1,
      lastWrongAt: t,
      nextReviewAt: next,
      correctStreak: 0,
      intervalIndex: 0,
      status: "learning",
      createdAt: t
    };
    items.push(item);
    saveAll(items);
    return item;
  }

  /** 答對時：若題目在錯題本且 learning，累計間隔正確；3 次間隔正確 → mastered */
  function recordCorrect(idOrPayload) {
    var id =
      typeof idOrPayload === "string"
        ? idOrPayload
        : makeId(idOrPayload.unit, idOrPayload.source, idOrPayload.questionId);
    var items = loadAll();
    var idx = findIndex(items, id);
    if (idx < 0) return null;

    var item = items[idx];
    if (item.status === "mastered") return item;

    var t = now();
    var streak = (item.correctStreak || 0) + 1;
    /* streak 1→間隔[0]=1天；2→[1]=3天；3→已掌握（參考[2]=7天） */
    var ii = Math.min(streak - 1, INTERVALS.length - 1);

    if (streak >= MASTER_STREAK) {
      item.status = "mastered";
      item.correctStreak = streak;
      item.intervalIndex = INTERVALS.length - 1;
      item.nextReviewAt = t + dayMs(INTERVALS[INTERVALS.length - 1]);
      item.lastCorrectAt = t;
    } else {
      item.intervalIndex = ii;
      item.correctStreak = streak;
      item.nextReviewAt = t + dayMs(INTERVALS[ii]);
      item.lastCorrectAt = t;
      item.status = "learning";
    }
    items[idx] = item;
    saveAll(items);
    return item;
  }

  /** 覆習答錯：重置間隔與 streak */
  function recordReviewWrong(id) {
    var items = loadAll();
    var idx = findIndex(items, id);
    if (idx < 0) return null;
    var item = items[idx];
    var t = now();
    item.timesWrong = (item.timesWrong || 0) + 1;
    item.lastWrongAt = t;
    item.correctStreak = 0;
    item.intervalIndex = 0;
    item.nextReviewAt = t; /* 立刻可再練 */
    item.status = "learning";
    items[idx] = item;
    saveAll(items);
    return item;
  }

  function list(filter) {
    var items = loadAll();
    filter = filter || {};
    return items.filter(function (it) {
      if (filter.status === "pending" || filter.status === "learning") {
        if (it.status === "mastered") return false;
      } else if (filter.status === "mastered") {
        if (it.status !== "mastered") return false;
      } else if (filter.status === "due") {
        if (it.status === "mastered") return false;
        if ((it.nextReviewAt || 0) > now()) return false;
      }
      if (filter.unit && it.unit !== filter.unit) return false;
      if (filter.skill) {
        var tags = it.skillTags || [];
        if (tags.indexOf(filter.skill) < 0) return false;
      }
      if (filter.week != null && it.week !== filter.week) return false;
      return true;
    });
  }

  function getDue(includeAllPending) {
    if (includeAllPending) {
      return list({ status: "learning" }).sort(function (a, b) {
        return (a.nextReviewAt || 0) - (b.nextReviewAt || 0);
      });
    }
    return list({ status: "due" }).sort(function (a, b) {
      return (a.nextReviewAt || 0) - (b.nextReviewAt || 0);
    });
  }

  function getById(id) {
    var items = loadAll();
    var idx = findIndex(items, id);
    return idx >= 0 ? items[idx] : null;
  }

  function remove(id) {
    var items = loadAll().filter(function (it) {
      return it.id !== id;
    });
    saveAll(items);
  }

  function clearAll() {
    saveAll([]);
  }

  function exportJSON() {
    var trackId = global.MathTrack && global.MathTrack.getTrackId
      ? global.MathTrack.getTrackId()
      : "p2";
    return JSON.stringify(
      {
        version: 2,
        track: trackId,
        storageKey: storageKey(),
        exportedAt: new Date().toISOString(),
        items: loadAll()
      },
      null,
      2
    );
  }

  function importJSON(text, mode) {
    /* mode: "merge" | "replace" */
    var parsed = JSON.parse(text);
    var incoming = Array.isArray(parsed) ? parsed : parsed.items;
    if (!Array.isArray(incoming)) throw new Error("格式不正確：需要 items 陣列");
    if (mode === "replace") {
      saveAll(incoming);
      return incoming.length;
    }
    var items = loadAll();
    incoming.forEach(function (inc) {
      if (!inc || !inc.id) return;
      var idx = findIndex(items, inc.id);
      if (idx >= 0) {
        var cur = items[idx];
        /* 保留較新／較嚴重的狀態 */
        if ((inc.lastWrongAt || 0) >= (cur.lastWrongAt || 0)) {
          items[idx] = inc;
        }
      } else {
        items.push(inc);
      }
    });
    saveAll(items);
    return items.length;
  }

  function stats() {
    var items = loadAll();
    var due = 0;
    var learning = 0;
    var mastered = 0;
    var t = now();
    items.forEach(function (it) {
      if (it.status === "mastered") mastered++;
      else {
        learning++;
        if ((it.nextReviewAt || 0) <= t) due++;
      }
    });
    return { total: items.length, learning: learning, mastered: mastered, due: due };
  }

  function formatDate(ts) {
    if (!ts) return "—";
    var d = new Date(ts);
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    var hh = d.getHours();
    var mm = d.getMinutes();
    function pad(n) {
      return n < 10 ? "0" + n : "" + n;
    }
    return y + "/" + pad(m) + "/" + pad(day) + " " + pad(hh) + ":" + pad(mm);
  }

  function isDue(item) {
    if (!item || item.status === "mastered") return false;
    return (item.nextReviewAt || 0) <= now();
  }

  /**
   * 從 DOM 擷取題幹文字（去掉輸入、按鈕、回饋）
   */
  function snapshotPrompt(cardEl) {
    if (!cardEl) return "";
    var clone = cardEl.cloneNode(true);
    clone.querySelectorAll("input, button, .feedback, .q-actions, .print-only").forEach(function (el) {
      el.parentNode && el.parentNode.removeChild(el);
    });
    var text = (clone.textContent || "").replace(/\s+/g, " ").trim();
    return text;
  }

  function checkAnswer(user, correctAnswers) {
    if (!global.MathLib || !global.MathLib.answersMatch) {
      var u = String(user || "")
        .trim()
        .toLowerCase();
      if (Array.isArray(correctAnswers)) {
        return correctAnswers.some(function (c) {
          return u === String(c).trim().toLowerCase();
        });
      }
      return u === String(correctAnswers || "")
        .trim()
        .toLowerCase();
    }
    return global.MathLib.answersMatch(user, correctAnswers);
  }

  global.WrongBook = {
    get STORAGE_KEY() { return storageKey(); },
    storageKey: storageKey,
    LEGACY_KEY: LEGACY_KEY,
    MASTER_STREAK: MASTER_STREAK,
    INTERVALS: INTERVALS,
    makeId: makeId,
    recordWrong: recordWrong,
    recordCorrect: recordCorrect,
    recordReviewWrong: recordReviewWrong,
    list: list,
    getDue: getDue,
    getById: getById,
    remove: remove,
    clearAll: clearAll,
    exportJSON: exportJSON,
    importJSON: importJSON,
    stats: stats,
    formatDate: formatDate,
    isDue: isDue,
    snapshotPrompt: snapshotPrompt,
    checkAnswer: checkAnswer,
    loadAll: loadAll
  };
})(typeof window !== "undefined" ? window : this);
