/* =====================================================================
   IGAA Parlor — shared card rendering (loaded after each game's inline
   script so it provides the single source of truth for cardFaceHTML /
   clockHTML across every game). Accepts each game's card shapes:
     season/month: {cat:"season", value|name, valAbbr|mAbbr, season, color}
     day:          {cat:"day", value, color, kind?}
     time:         {cat:"time", value, color, hr}
     mail:         {cat:"mail"}  |  {mail:true}
     noon:         {noon:true, value, color:"noon"}
   ===================================================================== */
(function () {
  "use strict";

  /* =============================================================
     SEASONAL MOTIFS — traced from the printed IGAA deck art
     ("Anne The Game Lady Project 1" originals) so the digital cards
     carry the same four symbols as the physical ones:
       Winter  blue six-point snowflake
       Spring  clump of yellow daffodils standing in sage grass
       Summer  full green tree, brown trunk + branches, ground shadow
       Fall    a pair of orange maple leaves, black outline
     Redrawn as VECTOR art (not upscaled clip-art bitmaps), so they
     stay razor sharp at every card size on any display.
     Palette sampled straight from the original scans.
     ============================================================= */
  var INK = {
    flake: "#0b6fc2", flakeHi: "#bfe6ff", flakeCore: "#1a86d8",
    petal: "#f2e00a", petalEdge: "#d9c400", trumpet: "#e9b100", trumpetHi: "#fff3a8",
    grass: "#9dd4ad", grassEdge: "#74b489", grassDeep: "#8cc79d", stem: "#eef6ec",
    canopy: "#31b44e", canopyEdge: "#177a2e", bark: "#8a6a3a", branch: "#6b4f28", turf: "#12a255",
    leaf: "#e8912b", leafEdge: "#1c1c1c", leafVein: "#9a5411"
  };

  // repeat `inner` n times, rotated `step` degrees about (cx,cy)
  function ring(n, step, inner, cx, cy) {
    var out = "";
    for (var i = 0; i < n; i++) out += '<g transform="rotate(' + (i * step) + ' ' + cx + ' ' + cy + ')">' + inner + "</g>";
    return out;
  }
  function svgIcon(inner) {
    return '<svg viewBox="0 0 100 100" class="sic" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + inner + "</svg>";
  }

  // --- Winter: six-point snowflake (spike + two barb pairs per arm) ---
  var FLAKE_ARM =
    '<path d="M50 3 L53.8 18 L52.6 47 L47.4 47 L46.2 18 Z"/>' +
    '<path d="M49.2 17 L58.5 9.5 L55.2 21.5 Z"/><path d="M50.8 17 L41.5 9.5 L44.8 21.5 Z"/>' +
    '<path d="M49.4 30 L57.5 25 L54.6 34 Z"/><path d="M50.6 30 L42.5 25 L45.4 34 Z"/>';

  // --- Spring: one daffodil bloom (6 pointed petals + trumpet) ---
  function bloom(cx, cy, r) {
    var petal = '<path d="M' + cx + ' ' + cy + ' L' + (cx - r * 0.3) + ' ' + (cy - r * 0.55) +
      ' L' + cx + ' ' + (cy - r) + ' L' + (cx + r * 0.3) + ' ' + (cy - r * 0.55) + ' Z"/>';
    return '<g fill="' + INK.petal + '" stroke="' + INK.petalEdge + '" stroke-width="' + (r * 0.07).toFixed(2) + '" stroke-linejoin="round">' +
      ring(6, 60, petal, cx, cy) + "</g>" +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.34).toFixed(2) + '" fill="' + INK.trumpet + '"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.17).toFixed(2) + '" fill="' + INK.trumpetHi + '"/>';
  }

  // --- Fall: one maple leaf, drawn tip-up in the full 100x100 box ---
  var MAPLE =
    '<path d="M50 4 L55.5 21 L65 14 L62.5 29 L77 24 L70.5 37 L89 35 L75.5 47 L92 57 L72 59 ' +
    'L76.5 75 L57.5 67.5 L55.5 84 L52.5 86 L52.5 99 L47.5 99 L47.5 86 L44.5 84 L42.5 67.5 ' +
    'L23.5 75 L28 59 L8 57 L24.5 47 L11 35 L29.5 37 L23 24 L37.5 29 L35 14 L44.5 21 Z" ' +
    'fill="' + INK.leaf + '" stroke="' + INK.leafEdge + '" stroke-width="3.2" stroke-linejoin="round"/>' +
    '<g stroke="' + INK.leafVein + '" stroke-width="1.8" fill="none" stroke-linecap="round">' +
    '<path d="M50 80 L50 22"/><path d="M50 64 L72 42"/><path d="M50 64 L28 42"/>' +
    '<path d="M50 72 L79 56"/><path d="M50 72 L21 56"/></g>';
  function maple(tx, ty, s, rot) {
    return '<g transform="translate(' + tx + ' ' + ty + ') scale(' + s + ') rotate(' + rot + ' 50 50)">' + MAPLE + "</g>";
  }

  var ICON = {
    Winter: svgIcon(
      '<g fill="' + INK.flake + '">' + ring(6, 60, FLAKE_ARM, 50, 50) + "</g>" +
      '<circle cx="50" cy="50" r="6.6" fill="' + INK.flakeCore + '"/>' +
      ring(6, 60, '<circle cx="50" cy="41.5" r="2.1" fill="' + INK.flakeHi + '"/>', 50, 50) +
      '<circle cx="50" cy="50" r="2.7" fill="#dff0ff"/>'),

    Spring: svgIcon(
      // stems first, then the grass clump hides their feet, blooms on top
      '<g stroke="' + INK.stem + '" stroke-width="2.6" stroke-linecap="round" fill="none">' +
      '<path d="M30 34 L35 70"/><path d="M67 30 L60 68"/><path d="M48 54 L48 76"/></g>' +
      '<path d="M24 97 C14 81 12 63 17 49 C22 63 23 81 28 97 Z" fill="' + INK.grassDeep + '"/>' +
      '<path d="M76 97 C86 81 88 63 83 49 C78 63 77 81 72 97 Z" fill="' + INK.grassDeep + '"/>' +
      '<path d="M22 98 C20 84 21 70 25 58 L29 74 L33 50 L38 72 L43 54 L48 74 L53 52 ' +
      'L58 72 L63 50 L68 74 L73 58 C77 70 78 84 76 98 Z" fill="' + INK.grass +
      '" stroke="' + INK.grassEdge + '" stroke-width="1.5" stroke-linejoin="round"/>' +
      bloom(30, 27, 17) + bloom(67, 22, 19) + bloom(48, 46, 18)),

    Summer: svgIcon(
      '<ellipse cx="50" cy="93" rx="33" ry="6" fill="' + INK.turf + '" opacity=".5"/>' +
      '<path d="M50 5 C59 3 67 6 71 12 C80 11 88 18 87 27 C93 33 92 44 85 49 C82 57 73 61 65 59 ' +
      'C59 64 49 64 44 59 C35 62 25 57 22 49 C13 46 10 34 16 27 C13 18 20 10 29 11 C34 4 43 3 50 5 Z" ' +
      'fill="' + INK.canopy + '" stroke="' + INK.canopyEdge + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M45 94 L46 66 L43 52 L45.5 50.5 L48 62 L48.5 40 L51.5 40 L52 60 L57 48 L59.5 49.5 ' +
      'L54 64 L55 94 Z" fill="' + INK.bark + '"/>' +
      '<g stroke="' + INK.branch + '" stroke-width="1.7" stroke-linecap="round" fill="none">' +
      '<path d="M48 48 L42 36 M42 36 L35 30 M42 36 L44 26"/>' +
      '<path d="M52 46 L59 33 M59 33 L67 28 M59 33 L58 23"/>' +
      '<path d="M50 40 L50 21 M50 27 L43 19 M50 25 L58 17"/></g>'),

    Fall: svgIcon(maple(1, 0, 0.56, -20) + maple(43, 40, 0.56, 14))
  };

  var CLOCK_NUMS = [[50,9,12],[71,14,1],[86,29,2],[91,50,3],[86,71,4],[71,86,5],[50,91,6],[29,86,7],[14,71,8],[9,50,9],[14,29,10],[29,14,11]];
  function clockNumbers() {
    return CLOCK_NUMS.map(function (p) { return '<span class="num" style="left:' + p[0] + '%;top:' + p[1] + '%">' + p[2] + '</span>'; }).join("");
  }
  function clockHTML(hr) {
    if (hr == null) hr = 12;
    return '<div class="clock" style="--hrot:' + ((hr % 12) * 30) + 'deg">' + clockNumbers() +
      '<div class="hand mn"></div><div class="hand hr"></div><div class="pin"></div></div>';
  }

  // NOON reads in all four season colors on the printed card
  var NOON_LETTERS = '<i class="nl y">N</i><i class="nl g">O</i><i class="nl o">O</i><i class="nl b">N</i>';

  var WEEKEND = { Saturday: 1, Sunday: 1 };
  // spell out the card's color on the bottom label — colorblind-friendly
  var COLORNAME = { blue: "BLUE", yellow: "YELLOW", green: "GREEN", orange: "ORANGE" };
  function esc(s) { return String(s == null ? "" : s); }

  function cardFaceHTML(c, extra) {
    extra = extra || "";
    var id = c && c.id != null ? c.id : "";
    if (c && (c.cat === "mail" || c.mail)) {
      return '<div class="card ' + extra + '" data-color="mail" data-cat="mail" data-id="' + id + '">' +
        '<div class="idx">MAIL</div><div class="mid"><div class="mailglyph">✉</div></div><div class="idx bottom">PURPLE</div></div>';
    }
    if (c && (c.cat === "noon" || c.noon)) {
      // matches the printed NOON card: sky-blue dial, hands straight up at 12,
      // and the word NOON lettered in the four season colors
      var nl = esc(c.value || "12:00 NOON").toUpperCase();
      var head = nl.indexOf("NOON") >= 0
        ? nl.replace("NOON", '<span class="noonword">' + NOON_LETTERS + "</span>")
        : nl;
      return '<div class="card ' + extra + '" data-color="noon" data-cat="noon" data-id="' + id + '">' +
        '<div class="idx">' + head + '</div><div class="mid">' + clockHTML(12) + '</div>' +
        '<div class="idx bottom">ALL COLORS</div></div>';
    }
    var cat = (c && c.cat) || "season";
    var label, mid;
    if (cat === "time") {
      label = esc(c.value).toUpperCase();
      mid = clockHTML(c.hr == null ? 12 : c.hr);
    } else if (cat === "day") {
      label = esc(c.value).toUpperCase();
      var kind = c.kind || (WEEKEND[c.value] ? "WEEKEND" : "WEEKDAY");
      // both WEEKEND and WEEKDAY are 7 letters — always use the small size so
      // the vertical word never clips the card top/bottom
      mid = '<div class="vword day">' + kind + '</div>';
    } else { // season / month
      label = esc(c.value || c.name).toUpperCase();
      var season = c.season || "Winter";
      var icon = ICON[season] || "";
      // 3 rows x 2 columns of motifs flanking the season word — the
      // exact arrangement printed on the original month cards
      var art = "", n;
      for (n = 0; n < 6; n++) art += icon;
      mid = '<div class="art">' + art + '</div><div class="vword">' + season.toUpperCase() + '</div>';
    }
    var colorLabel = COLORNAME[c.color] || label; // bottom = the color name (accessibility, upright)
    return '<div class="card ' + extra + '" data-color="' + esc(c.color) + '" data-cat="' + cat + '" data-id="' + id + '">' +
      '<div class="idx">' + label + '</div><div class="mid">' + mid + '</div><div class="idx bottom">' + colorLabel + '</div></div>';
  }

  // card back: "I'VE GOT AN APPOINTMENT" repeated
  function cardBackRows() {
    // four-season medallion with an IGAA monogram (styled in cards.css)
    return '<div class="bk-medallion"><div class="bk-core">IGAA</div></div>';
  }
  function cardBackHTML() {
    return '<div class="cardback">' + cardBackRows() + "</div>";
  }

  /* Shared viewport-fit scheduler. Each game passes its fitBoard(); every
     game then sizes cards through ONE code path that:
       - coalesces resize / rotate / visualViewport events into a single
         requestAnimationFrame pass (no more un-debounced reflow storms),
       - re-runs after an orientation change settles (dvh / clientHeight lag
         a few frames on rotate, which otherwise lands on a wrong size),
       - guards against reentrancy so a fit that nudges layout can't loop.
     Returns a schedule() the game calls after each render to re-fit. */
  function fitBind(fn) {
    var pending = false, running = false;
    function run() {
      pending = false;
      if (running) return;
      running = true;
      try { fn(); } finally { running = false; }
    }
    function schedule() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(run);
    }
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", function () {
      schedule();
      setTimeout(schedule, 120);   // catch the settled viewport after rotate
      setTimeout(schedule, 320);
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", schedule, { passive: true });
    }
    run();          // initial fit, synchronous — no first-paint size flash
    return schedule;
  }

  /* ---- Good News / Bad News (GNBN) card face — ADDITIVE ----
     g = {id, cat:"gnbn", kind:"lose"|"ask",
          target:{cat:"day"|"time"|"season", match, label, short}, pts?}
     day match = ["Monday",...], time match = "AM"|"PM"|"NOON",
     season match = "Winter"|"Spring"|"Summer"|"Fall".
     Face: kind word on top, the target (big words + a shape strip so it
     reads without color), bottom = point value (if g.pts) or "GN · BN". */
  var WEEK = [["Sunday","S"],["Monday","M"],["Tuesday","T"],["Wednesday","W"],["Thursday","T"],["Friday","F"],["Saturday","S"]];
  var HOURS = [["AM","9"],["AM","10"],["AM","11"],["NOON","12"],["PM","1"],["PM","2"],["PM","3"]];
  var SEASON_COLOR = { Winter: "blue", Spring: "yellow", Summer: "green", Fall: "orange" };
  function gnbnWords(s) {
    return esc(s).split(" ").map(function (w) {
      var small = w === "thru" || w === "or" || w === "&";
      return '<span class="gw' + (small ? " sm" : "") + '">' + w + "</span>";
    }).join("");
  }
  function gnbnFaceHTML(g, extra) {
    extra = extra || "";
    var t = (g && g.target) || {};
    var id = g && g.id != null ? g.id : "";
    var kind = g && g.kind === "ask" ? "ask" : "lose";
    var body, strip = "", sc = "";
    if (t.cat === "season") {
      sc = SEASON_COLOR[t.match] || "";
      body = '<div class="g-sic">' + (ICON[t.match] || "") + '</div><div class="gwords season">' + gnbnWords(esc(t.short || t.match).toUpperCase()) + "</div>";
    } else if (t.cat === "time") {
      body = '<div class="gwords">' + gnbnWords(t.short || t.match) + "</div>";
      strip = '<div class="g-strip time">' + HOURS.map(function (h) {
        return '<i class="' + (h[0] === t.match ? "on" : "") + '">' + h[1] + "</i>";
      }).join("") + "</div>";
    } else {
      var days = t.match || [];
      body = '<div class="gwords">' + gnbnWords(t.short || days.join(" or ")) + "</div>";
      strip = '<div class="g-strip">' + WEEK.map(function (d) {
        return '<i class="' + (days.indexOf(d[0]) >= 0 ? "on" : "") + '">' + d[1] + "</i>";
      }).join("") + "</div>";
    }
    var foot = g && g.pts != null ? g.pts + " PTS" : "GN · BN";
    return '<div class="card gnbn ' + extra + '" data-color="gnbn" data-cat="gnbn" data-kind="' + kind + '"' +
      (sc ? ' data-season="' + sc + '"' : "") + ' data-id="' + id + '">' +
      '<div class="idx">' + (kind === "ask" ? "ASK FOR" : "LOSE") + "</div>" +
      '<div class="mid"><div class="g-body">' + body + strip + "</div></div>" +
      '<div class="idx bottom">' + foot + "</div></div>";
  }

  // route GNBN objects through the shared face too (existing faces unchanged)
  var baseFace = cardFaceHTML;
  cardFaceHTML = function (c, extra) {
    if (c && c.cat === "gnbn") return gnbnFaceHTML(c, extra);
    return baseFace(c, extra);
  };

  // expose as globals, overriding each game's inline versions
  window.gnbnFaceHTML = gnbnFaceHTML;
  window.cardFaceHTML = cardFaceHTML;
  window.clockHTML = clockHTML;
  window.cardBackHTML = cardBackHTML;
  window.cardBackRows = cardBackRows;
  window.fitBind = fitBind;
})();
