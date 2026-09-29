/* 雙軌選擇：小二(p2)｜K3(k3)・錯題本分庫 */
(function (global) {
  "use strict";

  var TRACK_KEY = "mathLibTrack";
  var LEGACY_WB = "mathLibWrongbook.v1";

  var TRACKS = {
    p2: {
      id: "p2",
      label: "小二",
      shortLabel: "小二",
      fullLabel: "小二｜學界賽預備",
      ageHint: "約 7–8 歲・小學二年級",
      wrongbookKey: "mathWrongbook_p2",
      color: "#1a4d8c"
    },
    k3: {
      id: "k3",
      label: "K3",
      shortLabel: "K3",
      fullLabel: "K3｜幼稚園高班數感",
      ageHint: "約 5–6 歲・幼稚園高班",
      wrongbookKey: "mathWrongbook_k3",
      color: "#2d6a4f"
    }
  };

  function getTrackId() {
    try {
      var t = localStorage.getItem(TRACK_KEY);
      if (t && TRACKS[t]) return t;
    } catch (e) {}
    return null;
  }

  function setTrack(id) {
    if (!TRACKS[id]) return null;
    try {
      localStorage.setItem(TRACK_KEY, id);
    } catch (e) {}
    document.documentElement.setAttribute("data-track", id);
    return TRACKS[id];
  }

  function current() {
    var id = getTrackId();
    return id ? TRACKS[id] : null;
  }

  function requireTrack(fallback) {
    var id = getTrackId() || fallback || "p2";
    if (!TRACKS[id]) id = "p2";
    setTrack(id);
    return TRACKS[id];
  }

  function wrongbookKeyFor(id) {
    var t = TRACKS[id || getTrackId()];
    return t ? t.wrongbookKey : TRACKS.p2.wrongbookKey;
  }

  /** 舊版單庫 → 遷移到小二庫（只做一次） */
  function migrateLegacyIfNeeded() {
    try {
      if (localStorage.getItem(TRACKS.p2.wrongbookKey)) return;
      var legacy = localStorage.getItem(LEGACY_WB);
      if (!legacy) return;
      localStorage.setItem(TRACKS.p2.wrongbookKey, legacy);
      /* 保留舊 key 以免其他分頁讀取失敗；新寫入只用新 key */
    } catch (e) {}
  }

  function qs(name) {
    var m = location.search.match(new RegExp("[?&]" + name + "=([^&]*)"));
    return m ? decodeURIComponent(m[1]) : "";
  }

  /** 從 URL ?track= 或頁面 data-track 初始化 */
  function initFromPage(defaultId) {
    var fromUrl = qs("track");
    var fromAttr =
      document.body && document.body.getAttribute("data-track");
    var id = fromUrl || fromAttr || getTrackId() || defaultId || null;
    if (id && TRACKS[id]) setTrack(id);
    migrateLegacyIfNeeded();
    return current();
  }

  function withTrackQuery(url, trackId) {
    if (!url) return url;
    var id = trackId || getTrackId();
    if (!id) return url;
    if (url.indexOf("track=") >= 0) return url;
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "track=" + encodeURIComponent(id);
  }

  global.MathTrack = {
    TRACK_KEY: TRACK_KEY,
    TRACKS: TRACKS,
    getTrackId: getTrackId,
    setTrack: setTrack,
    current: current,
    requireTrack: requireTrack,
    wrongbookKeyFor: wrongbookKeyFor,
    migrateLegacyIfNeeded: migrateLegacyIfNeeded,
    initFromPage: initFromPage,
    withTrackQuery: withTrackQuery
  };
})(typeof window !== "undefined" ? window : this);
