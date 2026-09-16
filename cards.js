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

  /* Season motifs come from season-art.js (loaded in each game's <head>),
     which is the ONE copy of the printed deck's Winter / Spring / Summer /
     Fall art. Fix a motif there and every card, board and menu updates. */
  var ICON = {};
  (window.IGAA_SEASONS || ["Winter", "Spring", "Summer", "Fall"]).forEach(function (s) {
    ICON[s] = window.seasonIcon ? window.seasonIcon(s) : "";
  });

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
