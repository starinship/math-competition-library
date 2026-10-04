/* 各題圖解資料（每題一筆，key = 單元|來源|題號）
 * 圖上的數字＝題目的數字；答案由 js/explain.js 依圖計算，並由測試核對答案鍵。
 * 小二：type partWhole（已知總數）/ compare（比多比少）/ seq（數列）/ shapes（圖形重複）/ choiceSeq / multi
 * K3：count（十格框）/ match（一一配對）/ numeral（讀數）/ numberLine（數線）/ shapes
 */
(function (global) {
  "use strict";
  var D = {};
  function add(unit, source, items) {
    Object.keys(items).forEach(function (q) {
      var s = items[q];
      s.track = unit.indexOf("k3-") === 0 ? "k3" : "p2";
      D[unit + "|" + source + "|" + q] = s;
    });
  }

  /* ================= 小二 第1週：找規律・填數 ================= */
  add("w01", "practice", {
    q1: { type: "seq", terms: [3, 6, 9, 12, null], step: 3, answer: "15", expect: { q1: "15" },
      think: "看相鄰兩個數：3→6→9→12，每次多 3。", say: "下一個數是 15。" },
    q2: { type: "seq", terms: [20, 18, 16, 14, null], step: -2, answer: "12", expect: { q2: "12" },
      think: "20→18→16→14，每次少 2（越來越小）。", say: "下一個數是 12。" },
    q3: { type: "seq", terms: [4, 9, 14, 19, null, null], step: 5, answer: "24、29", expect: { q3a: "24", q3b: "29" },
      think: "4→9→14→19，每次多 5。兩個空格要接連加兩次。", say: "兩個空格是 24 和 29。" },
    q4: { type: "seq", terms: [7, null, 17, 22, 27], step: 5, answer: "12", expect: { q4: "12" },
      think: "空格在中間：先看後面 17→22→27，每次多 5。", say: "空格是 12。" },
    q5: { type: "seq", terms: [50, 45, null, 35, 30], step: -5, answer: "40", expect: { q5: "40" },
      think: "50→45，35→30，每次少 5。", say: "空格是 40。" },
    q6: { type: "seq", terms: [2, 4, 6, 8, null, null], step: 2, answer: "10、12；偶數", expect: { q6a: "10", q6b: "12", q6c: "偶數" },
      think: "每次多 2。這些數個位都是 0、2、4、6、8，可以兩個兩個分完 → 偶數（雙數）。", say: "空格是 10 和 12；這些都是偶數。" },
    q7: { type: "seq", terms: [1, 3, 5, null, 9, 11], step: 2, answer: "7", expect: { q7: "7" },
      think: "1→3→5，每次多 2，都是奇數（單數）。", say: "空格是 7。" },
    q8: { type: "shapes", items: ["★", "☆", "★", "☆", "★"], group: 2, answer: "☆", expect: { q8: "☆" },
      think: "把兩個圖形圈成一組：★☆、★☆、★…", say: "下一個是 ☆。" },
    q9: { type: "shapes", items: ["▲", "▲", "■", "▲", "▲", "■", "▲", "▲"], group: 3, answer: "■", expect: { q9: "■" },
      think: "三個一組：▲▲■、▲▲■、▲▲…", say: "下一個是 ■（一組是「▲▲■」）。" },
    q10: { type: "seq", terms: [5, 10, 15, 20, 25, null, null], step: 5, answer: "30、35；每次多 5", expect: { q10a: "30", q10b: "35" },
      think: "5→10→15→20→25，每次多 5（都是 5 的倍數）。", say: "（1）30（2）35（3）規律：每次多 5。" }
  });

  add("w01", "quiz", {
    q1: { type: "seq", terms: [5, 10, 15, 20, null], step: 5, answer: "25", expect: { q1: "25" },
      think: "5→10→15→20，每次多 5。", say: "下一個數是 25。" },
    q2: { type: "seq", terms: [30, 27, 24, 21, null], step: -3, answer: "18", expect: { q2: "18" },
      think: "30→27→24→21，每次少 3。", say: "下一個數是 18。" },
    q3: { type: "seq", terms: [2, 5, 8, null, 14], step: 3, answer: "11", expect: { q3: "11" },
      think: "2→5→8，每次多 3；空格後面是 14。", say: "空格是 11。" },
    q4: { type: "seq", terms: [1, 2, 4, 8, null], mult: 2, answer: "16", expect: { q4: "16" },
      think: "不是加固定數：1→2→4→8，每次變成兩倍（加的數 1、2、4 也越來越大，下一次加 8）。", say: "下一個數是 16。" },
    q5: { type: "shapes", items: ["□", "○", "□", "○", "□"], group: 2, answer: "○", expect: { q5: "○" },
      think: "兩個一組：□○、□○、□…", say: "下一個是 ○。" },
    q6: { type: "seq", terms: [9, 12, 15, 18, 21, null], step: 3, showIndex: true, answer: "24", expect: { q6: "24" },
      think: "每次多 3。已經有 5 個數，第 6 個就是 21 再多 3。", say: "第 6 個數是 24。" },
    q7: { type: "choiceSeq", target: -4, rows: [
        { label: "A", terms: [16, 12, 8, 4] },
        { label: "B", terms: [16, 20, 24, 28] },
        { label: "C", terms: [16, 15, 14, 13] }
      ], answer: "A", expect: { q7: "A" },
      think: "每條數列都看相鄰兩數差多少，找「每次少 4」的。", say: "選 A。" }
  });

  /* ================= 小二 第2週：和與差・加減進階 ================= */
  add("w02", "practice", {
    q1: { type: "partWhole", total: { label: "共", v: 24 }, parts: [{ label: "紅筆", v: 9 }, { label: "藍筆", v: null }],
      answer: "15 枝", expect: { q1: "15" },
      think: "誰是總數？「共 24 枝」是總數，紅筆和藍筆是兩部分。求一部分 → 用減法。", say: "藍筆有 15 枝。" },
    q2: { type: "partWhole", total: { label: "全班", v: 36 }, parts: [{ label: "男生", v: 19 }, { label: "女生", v: null }],
      answer: "（1）17 人（2）36", expect: { q2a: "17", q2b: "36" },
      think: "全班 36 人是總數，男生、女生是兩部分。", say: "女生有 17 人；（2）驗算：17 ＋ 19 ＝ 36，等於全班人數。",
      tip: "退位小技巧：36 − 19 可以想成 36 − 20 ＋ 1 ＝ 17。" },
    q3: { type: "partWhole", total: { label: "全書", v: 50 }, parts: [{ label: "已讀", v: 28 }, { label: "未讀", v: null }],
      answer: "22 頁", expect: { q3: "22" },
      think: "全書 50 頁是總數，已讀和未讀是兩部分。", say: "還有 22 頁未讀。" },
    q4: { type: "compare", rows: [{ label: "小明", v: 38, role: "small" }, { label: "小強", v: null, role: "big" }], diff: { v: 7, word: "多" },
      answer: "45 粒", expect: { q4: "45" },
      think: "小強比小明多 → 小強是大數。大數 ＝ 小數 ＋ 相差。", say: "小強有 45 粒波子。" },
    q5: { type: "compare", rows: [{ label: "紅繩", v: 52, role: "big" }, { label: "藍繩", v: null, role: "small" }], diff: { v: 15, word: "短" },
      answer: "37 厘米", expect: { q5: "37" },
      think: "藍繩比紅繩短 → 藍繩是小數。小數 ＝ 大數 − 相差。", say: "藍繩長 37 厘米。" },
    q6: { type: "compare", rows: [{ label: "姐姐", v: 43, role: "big" }, { label: "妹妹", v: null, role: "small" }], diff: { v: 16, word: "多" },
      answer: "（1）減法（2）27 元", expect: { q6a: "減法", q6b: "27" },
      think: "陷阱：題目有「多」字，但姐姐比妹妹多 → 姐姐 43 是大數，要求的妹妹是小數 → 用減法。", say: "（1）減法（2）妹妹有 27 元。" },
    q7: { type: "compare", rows: [{ label: "甲隊", v: 61, role: "big" }, { label: "乙隊", v: 45, role: "small" }], diff: { v: null, word: "多" },
      answer: "16 分", expect: { q7: "16" },
      think: "求「多多少」就是求相差：大數 − 小數。", say: "甲隊比乙隊多得 16 分。" },
    q8: { type: "multi", answer: "（1）37（2）46", expect: { q8a: "37", q8b: "46" }, parts: [
        { type: "partWhole", sub: "（1）□ ＋ 27 ＝ 64", total: { label: "總數", v: 64 }, parts: [{ label: "□", v: null }, { label: "", v: 27 }],
          think: "64 是總數，□ 和 27 是兩部分 → 總數 − 一部分。", say: "□ ＝ 37" },
        { type: "partWhole", sub: "（2）81 − □ ＝ 35", total: { label: "總數", v: 81 }, parts: [{ label: "□", v: null }, { label: "", v: 35 }],
          think: "81 是總數，拿走 □ 剩 35 → □ 和 35 是兩部分。", say: "□ ＝ 46" }
      ] },
    q9: { type: "seq", terms: [6, 11, 16, 21, null], step: 5, answer: "26", expect: { q9: "26" },
      think: "溫故第 1 週：6→11→16→21，每次多 5。", say: "下一個數是 26。" },
    q10: { type: "seq", terms: [40, 36, 32, null, 24], step: -4, answer: "28", expect: { q10: "28" },
      think: "溫故第 1 週：40→36→32，每次少 4；空格後面是 24。", say: "空格是 28。" }
  });

  add("w02", "quiz", {
    q1: { type: "partWhole", total: { label: "共", v: 42 }, parts: [{ label: "私家車", v: 25 }, { label: "的士", v: null }],
      answer: "17 架", expect: { q1: "17" },
      think: "共 42 架是總數，私家車和的士是兩部分 → 用減法。", say: "的士有 17 架。" },
    q2: { type: "compare", rows: [{ label: "小華", v: 29, role: "small" }, { label: "小芳", v: null, role: "big" }], diff: { v: 13, word: "多" },
      answer: "42 本", expect: { q2: "42" },
      think: "小芳比小華多 → 小芳是大數。大數 ＝ 小數 ＋ 相差。", say: "小芳有 42 本圖書。" },
    q3: { type: "compare", rows: [{ label: "爺爺", v: 70, role: "big" }, { label: "嫲嫲", v: null, role: "small" }], diff: { v: 6, word: "小" },
      answer: "64 歲", expect: { q3: "64" },
      think: "嫲嫲比爺爺小 → 嫲嫲是小數。小數 ＝ 大數 − 相差。", say: "嫲嫲今年 64 歲。" },
    q4: { type: "compare", rows: [{ label: "上層", v: 55, role: "big" }, { label: "下層", v: null, role: "small" }], diff: { v: 18, word: "多" },
      answer: "37 本", expect: { q4: "37" },
      think: "陷阱：上層比下層多 → 上層 55 是大數，下層是小數 → 用減法。", say: "下層有 37 本書。" },
    q5: { type: "partWhole", total: { label: "□", v: null }, parts: [{ label: "", v: 19 }, { label: "", v: 44 }],
      answer: "63", expect: { q5: "63" },
      think: "□ − 19 ＝ 44：□ 是總數，拿走 19 剩 44 → 19 和 44 是兩部分，合起來就是 □。", say: "□ ＝ 63" },
    q6: { type: "compare", rows: [{ label: "小明", v: 26, role: "small" }, { label: "小儀", v: null, role: "big" }], diff: { v: 9, word: "少" },
      answer: "B（26 ＋ 9，小儀有 35 張）", expect: { q6: "B" },
      think: "陷阱：題目有「少」字，但小明比小儀少 → 小儀是大數 → 用加法。", say: "選 B：26 ＋ 9，小儀有 35 張卡。",
      tip: "A（26 − 9）會變成「小儀比小明少」；C（9 − 26）不夠減，不合理。" },
    q7: { type: "seq", terms: [3, 7, 11, 15, null], step: 4, answer: "19", expect: { q7: "19" },
      think: "溫故第 1 週：3→7→11→15，每次多 4。", say: "下一個數是 19。" }
  });

  /* ================= K3 第1週：數一數・比多少 ================= */
  add("k3-w01", "practice", {
    q1: { type: "count", n: 4, icon: "●", answer: "4", expect: { q1: "4" },
      parent: "「我們放進格仔，一格一個，邊點邊數：1、2、3、4。最後數到 4，所以有 4 個點。」" },
    q2: { type: "count", n: 7, icon: "⭐", answer: "7", expect: { q2: "7" },
      parent: "「上面一排滿 5 個，下面再數 6、7。最後一個數是 7，就是 7 顆星星。」" },
    q3: { type: "count", n: 10, icon: "🍎", answer: "10", expect: { q3: "10" },
      parent: "「兩排各 5 個，剛好放滿格仔 → 10 個蘋果。滿格就是 10。」" },
    q4: { type: "match", left: { label: "A", n: 2, icon: "●" }, right: { label: "B", n: 5, icon: "●" }, answer: "B", expect: { q4: "B" },
      parent: "「上下一個配一個（拉線）。A 配完了，B 還有 3 個沒有朋友 → B 比較多。」" },
    q5: { type: "match", left: { label: "貓", n: 3, icon: "🐱" }, right: { label: "狗", n: 3, icon: "🐶" }, answer: "一樣多", expect: { q5: "一樣多" },
      parent: "「每隻貓配一隻狗，全部配完，沒有多出來 → 一樣多。」" },
    q6: { type: "shapes", items: ["🔺", "⬛", "🔺", "⬛", "🔺"], group: 2, answer: "⬛", expect: { q6: "⬛" },
      parent: "「三角、方塊是一組，一直重複。三角後面是方塊。」" }
  });

  add("k3-w01", "quiz", {
    q1: { type: "count", n: 6, icon: "●", answer: "6", expect: { q1: "6" },
      parent: "「一格放一個，上排 5 個，下排再數 6。最後數到 6。」" },
    q2: { type: "count", n: 9, icon: "🌸", answer: "9", expect: { q2: "9" },
      parent: "「上排 5 朵，下排數 6、7、8、9；還差一格才滿 10 → 9 朵。」" },
    q3: { type: "match", left: { label: "A", n: 4, icon: "⭐" }, right: { label: "B", n: 2, icon: "⭐" }, answer: "A", expect: { q3: "A" },
      parent: "「一個配一個。B 配完了，A 還多 2 個 → A 比較多。」" },
    q4: { type: "match", left: { label: "左", n: 5, icon: "🔵" }, right: { label: "右", n: 5, icon: "🔵" },
      answerLabels: { left: "左多", right: "右多", equal: "一樣多" }, answer: "一樣多", expect: { q4: "一樣多" },
      parent: "「左右一個配一個，全部配完，沒有多出來 → 一樣多。」" },
    q5: { type: "shapes", items: ["🟡", "🟢", "🟡", "🟢", "🟡"], group: 2, answer: "🟢", expect: { q5: "🟢" },
      parent: "「黃、綠是一組，一直重複。黃後面是綠。」" }
  });

  /* ================= K3 第2週：數到 20・前後是誰 ================= */
  add("k3-w02", "practice", {
    q1: { type: "count", n: 12, icon: "⭐", answer: "12", expect: { q1: "12" },
      parent: "「第一個格仔放滿是 10，再接着數 11、12 → 12 顆星星。不用由 1 重新數。」" },
    q2: { type: "count", n: 16, icon: "●", answer: "16", expect: { q2: "16" },
      parent: "「滿格是 10，第二個格仔接着數 11、12、13、14、15、16 → 16 個點。」" },
    q3: { type: "numeral", n: 14, word: "十四", answer: "14", expect: { q3: "14" },
      parent: "「十四：先有一個十（寫 1），再有四（寫 4）→ 14。41 是『四十一』，4 是『四』。」" },
    q4: { type: "numberLine", known: [9, 10], ref: 10, dir: "after", answer: "11", expect: { q4: "11" },
      parent: "「後面的數多 1：10 後面向右走一格是 11。」" },
    q5: { type: "numberLine", known: [18], ref: 18, dir: "before", answer: "17", expect: { q5: "17" },
      parent: "「前面的數少 1：18 前面向左走一格是 17。」" },
    q6: { type: "match", left: { label: "A", n: 6, icon: "🍓" }, right: { label: "B", n: 8, icon: "🍓" }, answer: "B", expect: { q6: "B" },
      parent: "「上下一個配一個。A 配完了，B 還多 2 個 → B 比較多。」" }
  });

  add("k3-w02", "quiz", {
    q1: { type: "count", n: 14, icon: "●", answer: "14", expect: { q1: "14" },
      parent: "「滿格是 10，再接着數 11、12、13、14 → 14 個點。」" },
    q2: { type: "numeral", n: 19, word: "十九", answer: "19", expect: { q2: "19" },
      parent: "「十九：一個十（寫 1），再有九（寫 9）→ 19。91 是『九十一』。」" },
    q3: { type: "numberLine", known: [15, 16], ref: 16, dir: "after", answer: "17", expect: { q3: "17" },
      parent: "「後面多 1：16 向右走一格是 17。」" },
    q4: { type: "numberLine", known: [20], ref: 20, dir: "before", answer: "19", expect: { q4: "19" },
      parent: "「前面少 1：20 向左走一格是 19。」" },
    q5: { type: "numberLine", known: [12, 14], dir: "between", answer: "13", expect: { q5: "13" },
      parent: "「12 後面一格是 13，13 後面一格是 14 → 中間是 13。」" }
  });

  global.MathExplainData = D;
})(typeof window !== "undefined" ? window : this);
