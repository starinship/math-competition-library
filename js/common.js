/* 共用：列印前展開摺疊、正規化答案字串（離線） */
(function (global) {
  "use strict";

  function normalizeAnswer(s) {
    if (s == null) return "";
    return String(s)
      .trim()
      .replace(/\s+/g, "")
      .replace(/，/g, ",")
      .replace(/＋/g, "+")
      .replace(/－/g, "-")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .toLowerCase();
  }

  function answersMatch(user, expected) {
    var u = normalizeAnswer(user);
    if (!u) return false;
    if (Array.isArray(expected)) {
      return expected.some(function (e) {
        return u === normalizeAnswer(e);
      });
    }
    return u === normalizeAnswer(expected);
  }

  function onBeforePrintExpand() {
    document.querySelectorAll("details.parent-guide-details").forEach(function (d) {
      d.setAttribute("open", "");
    });
    document.querySelectorAll(".hint-content").forEach(function (h) {
      h.classList.remove("is-collapsed");
      h.classList.add("is-open");
    });
    document.querySelectorAll(".example-slide").forEach(function (el) {
      el.classList.remove("is-hidden-screen");
    });
    /* 圖解解法：會印出的（錯題本）先展開；練習／測驗頁的面板屬 screen-only，不受影響 */
    document.querySelectorAll("details.sol-details").forEach(function (d) {
      if (!d.closest(".screen-only")) d.setAttribute("open", "");
    });
  }

  function bindPrintButton(selector) {
    var btn = document.querySelector(selector || "#btn-print");
    if (!btn) return;
    btn.addEventListener("click", function () {
      onBeforePrintExpand();
      window.print();
    });
  }

  if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
    window.addEventListener("beforeprint", onBeforePrintExpand);
  }

  global.MathLib = {
    normalizeAnswer: normalizeAnswer,
    answersMatch: answersMatch,
    onBeforePrintExpand: onBeforePrintExpand,
    bindPrintButton: bindPrintButton
  };
})(typeof window !== "undefined" ? window : this);
