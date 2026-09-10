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
    Spring:
      '<svg viewBox="0 0 24 24" class="sic">' +
      '<g fill="currentColor"><circle cx="12" cy="5.5" r="3.1"/><circle cx="12" cy="18.5" r="3.1"/><circle cx="5.5" cy="12" r="3.1"/><circle cx="18.5" cy="12" r="3.1"/></g>' +
      '<circle cx="12" cy="12" r="2.6" fill="#fff"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/></svg>',
    Summer:
      '<svg viewBox="0 0 24 24" class="sic">' +
      '<circle cx="12" cy="12" r="4.4" fill="currentColor"/>' +
      '<g stroke="currentColor" stroke-width="1.7" stroke-linecap="round">' +
      '<path d="M12 1.6v2.6M12 19.8v2.6M1.6 12h2.6M19.8 12h2.6M4.4 4.4l1.9 1.9M17.7 17.7l1.9 1.9M19.6 4.4l-1.9 1.9M6.3 17.7l-1.9 1.9"/></g></svg>',
    Fall:
      '<svg viewBox="0 0 24 24" class="sic">' +
      '<path d="M12 2.5C8.2 6.5 8.2 15 12 21.5C15.8 15 15.8 6.5 12 2.5Z" fill="currentColor"/>' +
      '<path d="M12 5v15" stroke="#fff" stroke-width="1" stroke-linecap="round"/></svg>'
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
        '<div class="idx">MAIL</div><div class="mid"><div class="mailglyph">✉</div></div><div class="idx b">MAIL</div></div>';
    }
    if (c && (c.cat === "noon" || c.noon)) {
      var nl = esc(c.value || "12:00 NOON").toUpperCase();
      return '<div class="card ' + extra + '" data-color="noon" data-cat="noon" data-id="' + id + '">' +
        '<div class="idx">' + nl + '</div><div class="mid">' + clockHTML(12) + '</div><div class="idx b">' + nl + '</div></div>';
    }
    var cat = (c && c.cat) || "season";
    var label, mid;
    if (cat === "time") {
      label = esc(c.value).toUpperCase();
      mid = clockHTML(c.hr == null ? 12 : c.hr);
    } else if (cat === "day") {
      label = esc(c.value).toUpperCase();
      var kind = c.kind || (WEEKEND[c.value] ? "WEEKEND" : "WEEKDAY");
      mid = '<div class="vword ' + (kind === "WEEKEND" ? "" : "sm") + '">' + kind + '</div>';
    } else { // season / month
      label = esc(c.value || c.name).toUpperCase();
      var season = c.season || "Winter";
      var icon = ICON[season] || "";
      var art = new Array(9).join(",").split(",").map(function () { return icon; }).join("");
      mid = '<div class="art">' + art + '</div><div class="vword">' + season.toUpperCase() + '</div>';
    }
    var colorLabel = COLORNAME[c.color] || label; // bottom = the color name (accessibility)
    return '<div class="card ' + extra + '" data-color="' + esc(c.color) + '" data-cat="' + cat + '" data-id="' + id + '">' +
      '<div class="idx">' + label + '</div><div class="mid">' + mid + '</div><div class="idx b">' + colorLabel + '</div></div>';
  }

  // card back: "I'VE GOT AN APPOINTMENT" repeated
  var BACK_TEXT = "I'VE GOT AN APPOINTMENT";
  function cardBackRows() {
    var s = "";
    for (var i = 0; i < 15; i++) s += "<span>" + BACK_TEXT + "</span>";
    return '<div class="rows">' + s + "</div>";
  }
  function cardBackHTML() {
    return '<div class="cardback">' + cardBackRows() + "</div>";
  }

  // expose as globals, overriding each game's inline versions
  window.cardFaceHTML = cardFaceHTML;
  window.clockHTML = clockHTML;
  window.cardBackHTML = cardBackHTML;
  window.cardBackRows = cardBackRows;
})();
