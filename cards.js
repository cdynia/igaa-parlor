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

  // clean vector seasonal icons (inherit the card's --cc via currentColor)
  var ICON = {
    Winter:
      '<svg viewBox="0 0 24 24" class="sic" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">' +
      '<path d="M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17"/>' +
      '<path d="M12 5.4l-2.1-1.2M12 5.4l2.1-1.2M12 18.6l-2.1 1.2M12 18.6l2.1 1.2M4.9 8.7l.1 2.4M4.9 8.7l-2.1.4M19.1 15.3l-.1-2.4M19.1 15.3l2.1-.4M4.9 15.3l-2.1-.4M4.9 15.3l.1-2.4M19.1 8.7l2.1.4M19.1 8.7l-.1 2.4"/></svg>',
    // Spring = potted daffodil: gold bloom (currentColor) over green leaves
    Spring:
      '<svg viewBox="0 0 24 24" class="sic">' +
      '<g fill="none" stroke="#4a9d4a" stroke-width="1.6" stroke-linecap="round">' +
      '<path d="M12 22C9 18.5 8 14 11 10"/><path d="M12 22C15 18.5 16 14 13 10"/></g>' +
      '<g fill="currentColor">' +
      '<ellipse cx="12" cy="4" rx="1.7" ry="2.9"/>' +
      '<ellipse cx="12" cy="4" rx="1.7" ry="2.9" transform="rotate(72 12 8)"/>' +
      '<ellipse cx="12" cy="4" rx="1.7" ry="2.9" transform="rotate(144 12 8)"/>' +
      '<ellipse cx="12" cy="4" rx="1.7" ry="2.9" transform="rotate(216 12 8)"/>' +
      '<ellipse cx="12" cy="4" rx="1.7" ry="2.9" transform="rotate(288 12 8)"/></g>' +
      '<circle cx="12" cy="8" r="2.1" fill="#e0a400"/><circle cx="12" cy="8" r="1" fill="#fff"/></svg>',
    // Summer = full bushy green tree (currentColor canopy) on a short brown trunk
    Summer:
      '<svg viewBox="0 0 24 24" class="sic">' +
      '<rect x="11" y="15" width="2" height="6.5" rx="0.9" fill="#8a5a2b"/>' +
      '<g fill="currentColor">' +
      '<circle cx="8" cy="10.5" r="3.7"/><circle cx="16" cy="10.5" r="3.7"/>' +
      '<circle cx="12" cy="7.5" r="4.6"/><circle cx="12" cy="12" r="4.3"/></g></svg>',
    // Fall = orange maple leaf (currentColor)
    Fall:
      '<svg viewBox="0 0 24 24" class="sic">' +
      '<path d="M12 21.5v-3.1l3 .7-1-2.5 3.3.4-1.9-2.2 3.1-.9-2.6-1.6 2.3-1.9-3 .2 1-3-2.5 1.8L12 2.6l-1.5 3.5-2.5-1.8 1 3-3-.2 2.3 1.9-2.6 1.6 3.1.9-1.9 2.2 3.3-.4-1 2.5 3-.7v3.1z" fill="currentColor"/></svg>'
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
      var nl = esc(c.value || "12:00 NOON").toUpperCase();
      return '<div class="card ' + extra + '" data-color="noon" data-cat="noon" data-id="' + id + '">' +
        '<div class="idx">' + nl + '</div><div class="mid">' + clockHTML(12) + '</div><div class="idx bottom">RED</div></div>';
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
      var art = new Array(7).join(",").split(",").map(function () { return icon; }).join("");
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

  // expose as globals, overriding each game's inline versions
  window.cardFaceHTML = cardFaceHTML;
  window.clockHTML = clockHTML;
  window.cardBackHTML = cardBackHTML;
  window.cardBackRows = cardBackRows;
  window.fitBind = fitBind;
})();
