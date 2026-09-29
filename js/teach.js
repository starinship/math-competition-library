/* 教學頁：逐步例題、提示展開、家長區 */
(function () {
  "use strict";

  var slides = Array.prototype.slice.call(document.querySelectorAll(".example-slide"));
  var idx = 0;
  var total = slides.length;
  var indicator = document.getElementById("step-indicator");
  var btnPrev = document.getElementById("btn-prev");
  var btnNext = document.getElementById("btn-next");
  var btnHint = document.getElementById("btn-hint");

  function showSlide(i) {
    if (total === 0) return;
    idx = Math.max(0, Math.min(i, total - 1));
    slides.forEach(function (el, n) {
      if (n === idx) {
        el.classList.remove("is-hidden-screen");
      } else {
        el.classList.add("is-hidden-screen");
      }
    });
    if (indicator) {
      indicator.textContent = "例題 " + (idx + 1) + " / " + total;
    }
    if (btnPrev) btnPrev.disabled = idx === 0;
    if (btnNext) btnNext.disabled = idx === total - 1;
    updateHintButton();
  }

  function currentHint() {
    var slide = slides[idx];
    if (!slide) return null;
    return slide.querySelector(".hint-content");
  }

  function updateHintButton() {
    if (!btnHint) return;
    var hint = currentHint();
    if (!hint) {
      btnHint.style.display = "none";
      return;
    }
    btnHint.style.display = "";
    var open = hint.classList.contains("is-open");
    btnHint.textContent = open ? "隱藏提示" : "顯示提示／怎麼想";
  }

  if (btnPrev) {
    btnPrev.addEventListener("click", function () {
      showSlide(idx - 1);
    });
  }
  if (btnNext) {
    btnNext.addEventListener("click", function () {
      showSlide(idx + 1);
    });
  }
  if (btnHint) {
    btnHint.addEventListener("click", function () {
      var hint = currentHint();
      if (!hint) return;
      if (hint.classList.contains("is-open")) {
        hint.classList.remove("is-open");
        hint.classList.add("is-collapsed");
      } else {
        hint.classList.remove("is-collapsed");
        hint.classList.add("is-open");
      }
      updateHintButton();
    });
  }

  document.querySelectorAll(".hint-content").forEach(function (h) {
    h.classList.add("is-collapsed");
    h.classList.remove("is-open");
  });

  if (window.MathLib) window.MathLib.bindPrintButton("#btn-print");

  window.addEventListener("afterprint", function () {
    showSlide(idx);
    document.querySelectorAll(".hint-content").forEach(function (h) {
      h.classList.add("is-collapsed");
      h.classList.remove("is-open");
    });
    updateHintButton();
  });

  showSlide(0);
})();
