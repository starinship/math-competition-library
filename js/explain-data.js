/* 各題圖解資料（每題一筆，key = 單元|來源|題號）
 * 圖上的數字＝題目的數字；答案由 js/explain.js 依圖計算，並由測試核對答案鍵。
 * 小二：type partWhole（已知總數，可多部分）/ compare（比多比少）/ seq（數列）/ shapes（圖形重複）/ choiceSeq / multi
 *       steps（數量變化：原有 → 下車 → 上車）/ twoStep（兩步應用題，第二步用 "$1" 代表第一步答案）
 * K3：count（十格框）/ match（一一配對；ask: more／less／diff／toEqual）/ numeral（讀數）/ numberLine（數線）/ shapes
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

  /* ================= 小二 第3週：應用題入門・讀題畫重點 ================= */
  add("w03", "practice", {
    q1: { type: "partWhole", total: { label: "原有", v: 46 }, parts: [{ label: "借出", v: 19 }, { label: "還剩", v: null }],
      answer: "27 本", expect: { q1: "27" },
      think: "圈數字：46 本、19 本；劃問題：「還剩多少本？」原有 46 本是總數，借出和還剩是兩部分 → 求部分用減法。", say: "還剩 27 本。" },
    q2: { type: "partWhole", total: { label: "雀鳥共", v: null }, parts: [{ label: "白鴿", v: 18 }, { label: "麻雀", v: 7 }],
      answer: "（1）5（2）25 隻", expect: { q2a: "5", q2b: "25" },
      think: "問題問「雀鳥」共有多少隻。5 個小朋友不是雀鳥 → 用不着（多餘資料）。白鴿和麻雀是兩部分，合起來是總數。", say: "（1）5 用不着（2）公園裏共有 25 隻雀鳥。",
      tip: "讀題時把用不着的資料劃走（例如「5 個小朋友」），畫圖時不用畫。" },
    q3: { type: "partWhole", total: { label: "全長", v: 60 }, parts: [{ label: "用去", v: 24 }, { label: "還剩", v: null }],
      answer: "（1）36（2）厘米", expect: { q3a: "36", q3b: "厘米" },
      think: "全長 60 厘米是總數，用去和還剩是兩部分。題目量長度用「厘米」，答句也要寫厘米。", say: "絲帶還剩 36 厘米。" },
    q4: { type: "steps", start: { label: "原有", v: 35 }, ops: [{ op: "-", v: 12, label: "下車" }, { op: "+", v: 8, label: "上車" }], endLabel: "現在",
      answer: "（1）23（2）31 人", expect: { q4a: "23", q4b: "31" },
      think: "兩步題：人數變了兩次。下車 → 少了，用減；上車 → 多了，用加。一步一步跟着變。", say: "（1）下車後有 23 人（2）現在巴士上有 31 人。" },
    q5: { type: "twoStep", steps: [
        { type: "compare", cap: "第一步：先求小華（小華比小明多 → 小華是大數）",
          rows: [{ label: "小明", v: 25, role: "small" }, { label: "小華", v: null, role: "big" }], diff: { v: 9, word: "多" } },
        { type: "partWhole", cap: "第二步：再求兩人共有多少元",
          total: { label: "兩人共", v: null }, parts: [{ label: "小明", v: 25 }, { label: "小華", v: "$1" }] }
      ],
      answer: "（1）34（2）59 元", expect: { q5a: "34", q5b: "59" },
      think: "問題問「兩人共有」，但小華有多少還未知 → 要先求小華，再求合共。", say: "（1）小華有 34 元（2）兩人共有 59 元。" },
    q6: { type: "partWhole", total: { label: "帶了", v: 50 }, parts: [{ label: "圖書", v: 18 }, { label: "筆", v: 9 }, { label: "還剩", v: null }],
      answer: "23 元", expect: { q6: "23" },
      think: "50 元是總數，分成三部分：圖書、筆、還剩。從總數減去用了的兩部分。", say: "她還剩 23 元。",
      tip: "也可以先算一共用了多少：18 ＋ 9 ＝ 27，再算 50 − 27 ＝ 23。" },
    q7: { type: "partWhole", total: { label: "一盒", v: 30 }, parts: [{ label: "哥哥吃", v: 8 }, { label: "妹妹吃", v: 6 }, { label: "還剩", v: null }],
      answer: "B（30 − 8 − 6 ＝ 16，還剩 16 粒）", expect: { q7: "B" },
      think: "哥哥吃了、妹妹也吃了 → 兩次都是拿走，所以兩次都用減。", say: "選 B：30 − 8 − 6 ＝ 16，還剩 16 粒。",
      tip: "A（30 − 8 ＋ 6）把妹妹吃掉的又加回去，不合理；C（30 ＋ 8 ＋ 6）越吃越多，更不合理。" },
    q8: { type: "compare", rows: [{ label: "哥哥", v: 52, role: "big" }, { label: "弟弟", v: null, role: "small" }], diff: { v: 17, word: "多" },
      answer: "35 粒", expect: { q8: "35" },
      think: "溫故第 2 週（陷阱）：哥哥比弟弟多 → 哥哥 52 是大數，要求的弟弟是小數 → 用減法。", say: "弟弟有 35 粒波子。" },
    q9: { type: "partWhole", total: { label: "□", v: null }, parts: [{ label: "", v: 26 }, { label: "", v: 38 }],
      answer: "64", expect: { q9: "64" },
      think: "溫故第 2 週：□ − 26 ＝ 38，□ 是總數，拿走 26 剩 38 → 26 和 38 合起來就是 □。", say: "□ ＝ 64" },
    q10: { type: "seq", terms: [9, 16, 23, 30, null], step: 7, answer: "37", expect: { q10: "37" },
      think: "溫故第 1 週：9→16→23→30，每次多 7。", say: "下一個數是 37。" }
  });

  add("w03", "quiz", {
    q1: { type: "partWhole", total: { label: "摘了", v: 63 }, parts: [{ label: "賣出", v: 28 }, { label: "還剩", v: null }],
      answer: "35 個", expect: { q1: "35" },
      think: "摘了 63 個是總數，賣出和還剩是兩部分 → 用減法。", say: "還剩 35 個橙。" },
    q2: { type: "partWhole", total: { label: "現在共", v: null }, parts: [{ label: "原有", v: 34 }, { label: "姐姐給", v: 17 }],
      answer: "（1）8（2）51 張", expect: { q2a: "8", q2b: "51" },
      think: "問題問貼紙。「8 歲」是年齡，和貼紙無關 → 用不着。原有 34 張和姐姐給的 17 張合起來。", say: "（1）8 用不着（2）小強現在有 51 張貼紙。" },
    q3: { type: "steps", start: { label: "原有", v: 26 }, ops: [{ op: "-", v: 9, label: "開走" }, { op: "+", v: 14, label: "駛入" }], endLabel: "現在",
      answer: "31 架", expect: { q3: "31" },
      think: "車的數量變了兩次：開走 → 少了，用減；駛入 → 多了，用加。", say: "現在停車場有 31 架車。" },
    q4: { type: "twoStep", steps: [
        { type: "compare", cap: "第一步：先求黃花（黃花比紅花少 → 黃花是小數）",
          rows: [{ label: "紅花", v: 27, role: "big" }, { label: "黃花", v: null, role: "small" }], diff: { v: 8, word: "少" } },
        { type: "partWhole", cap: "第二步：再求兩種花共有多少朵",
          total: { label: "共", v: null }, parts: [{ label: "紅花", v: 27 }, { label: "黃花", v: "$1" }] }
      ],
      answer: "46 朵", expect: { q4: "46" },
      think: "問題問「共有」，但黃花有多少還未知 → 先求黃花，再求合共。", say: "紅花和黃花共有 46 朵。" },
    q5: { type: "partWhole", total: { label: "爸爸有", v: 100 }, parts: [{ label: "買菜", v: 45 }, { label: "買水果", v: 28 }, { label: "還剩", v: null }],
      answer: "27 元", expect: { q5: "27" },
      think: "100 元是總數，分成買菜、買水果、還剩三部分。", say: "爸爸還剩 27 元。",
      tip: "也可以先算一共用了多少：45 ＋ 28 ＝ 73，再算 100 − 73 ＝ 27。" },
    q6: { type: "compare", rows: [{ label: "鉛筆", v: 18, role: "small" }, { label: "尺", v: null, role: "big" }], diff: { v: 12, word: "長" },
      answer: "（1）30（2）厘米", expect: { q6a: "30", q6b: "厘米" },
      think: "尺比鉛筆長 → 尺是大數。大數 ＝ 小數 ＋ 相差。量長度用「厘米」。", say: "尺長 30 厘米。" },
    q7: { type: "seq", terms: [12, 20, 28, 36, null], step: 8, answer: "44", expect: { q7: "44" },
      think: "溫故第 1 週：12→20→28→36，每次多 8。", say: "下一個數是 44。" }
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

  /* ================= K3 第3週：多・少・一樣多（加深） ================= */
  add("k3-w03", "practice", {
    q1: { type: "match", left: { label: "A", n: 5, icon: "🍎" }, right: { label: "B", n: 7, icon: "🍎" }, answer: "B", expect: { q1: "B" },
      parent: "「上下一個配一個（拉線）。A 配完了，B 還多出 2 個 → B 比較多。」" },
    q2: { type: "match", ask: "less", left: { label: "A", n: 6, icon: "🐟" }, right: { label: "B", n: 4, icon: "🐟" }, answer: "B", expect: { q2: "B" },
      parent: "「一個配一個。B 先配完，A 還有多出來 → B 比較少。一起說：『B 比 A 少』。」" },
    q3: { type: "match", left: { label: "兔子", n: 5, icon: "🐰" }, right: { label: "蘿蔔", n: 5, icon: "🥕" },
      answerLabels: { left: "兔子多", right: "蘿蔔多", equal: "一樣多" }, answer: "一樣多", expect: { q3: "一樣多" },
      parent: "「每隻兔子配一個蘿蔔，全部配完，沒有多出來 → 一樣多。一起說：『兔子和蘿蔔一樣多』。」" },
    q4: { type: "match", ask: "diff", left: { label: "A", n: 3, icon: "⭐" }, right: { label: "B", n: 5, icon: "⭐" }, answer: "2", expect: { q4: "2" },
      parent: "「先一個配一個，再數多出來的：1、2 → B 比 A 多 2 個。」" },
    q5: { type: "match", left: { label: "汽車", n: 4, icon: "🚗" }, right: { label: "巴士", n: 2, icon: "🚌" },
      answerLabels: { left: "汽車比巴士多", right: "汽車比巴士少", equal: "一樣多" }, answer: "汽車比巴士多", expect: { q5: "汽車比巴士多" },
      parent: "「汽車配巴士，巴士先配完，汽車多出 2 架。所以說：『汽車比巴士多』，也可以說『巴士比汽車少』。」" },
    q6: { type: "numberLine", known: [14, 15], ref: 15, dir: "after", answer: "16", expect: { q6: "16" },
      parent: "「溫故：後面的數多 1，15 向右走一格是 16。」" }
  });

  add("k3-w03", "quiz", {
    q1: { type: "match", left: { label: "A", n: 8, icon: "🌸" }, right: { label: "B", n: 6, icon: "🌸" }, answer: "A", expect: { q1: "A" },
      parent: "「一個配一個。B 配完了，A 還多出 2 朵 → A 比較多。」" },
    q2: { type: "match", ask: "less", left: { label: "小狗", n: 3, icon: "🐶" }, right: { label: "小貓", n: 5, icon: "🐱" }, answer: "小狗", expect: { q2: "小狗" },
      parent: "「小狗配小貓，小狗先配完 → 小狗比較少（小狗比小貓少）。」" },
    q3: { type: "match", ask: "diff", left: { label: "A", n: 7, icon: "●" }, right: { label: "B", n: 4, icon: "●" }, answer: "3", expect: { q3: "3" },
      parent: "「一個配一個，再數 A 多出來的：1、2、3 → A 比 B 多 3 個。」" },
    q4: { type: "match", ask: "toEqual", left: { label: "碗", n: 5, icon: "🥣" }, right: { label: "匙羹", n: 3, icon: "🥄" }, answer: "2", expect: { q4: "2" },
      parent: "「每個碗配一隻匙羹。有 2 個碗沒有匙羹 → 再拿 2 隻匙羹，就一樣多。」" },
    q5: { type: "match", left: { label: "香蕉", n: 3, icon: "🍌" }, right: { label: "蘋果", n: 3, icon: "🍎" },
      answerLabels: { left: "香蕉比蘋果多", right: "香蕉比蘋果少", equal: "香蕉和蘋果一樣多" }, answer: "香蕉和蘋果一樣多", expect: { q5: "香蕉和蘋果一樣多" },
      parent: "「一條香蕉配一個蘋果，全部配完，沒有多出來 → 香蕉和蘋果一樣多。」" }
  });

  global.MathExplainData = D;
})(typeof window !== "undefined" ? window : this);
