/* =====================================================================
   IGAA Parlor — THE four season motifs. One copy, for everything.

   Traced from the printed IGAA deck art ("Anne The Game Lady Project 1")
   so the screen carries the same symbols as the physical cards:
     Winter  blue six-point snowflake
     Spring  clump of yellow daffodils standing in sage grass
     Summer  full green tree, brown trunk + branches, ground shadow
     Fall    a pair of orange maple leaves, black outline
   Vector art (not upscaled clip-art bitmaps), so it stays razor sharp
   at every size. Palette sampled straight from the original scans.

   LOAD ORDER: this file goes in <head>, BEFORE a game's inline script —
   unlike cards.css / cards.js (which load last so they override a game's
   own versions), this is data every game reads while it builds its board.

   Exposes:
     seasonIcon(name, className)  -> a complete <svg> (class defaults to "sic")
     seasonIconInner(name)        -> just the shapes, for nesting inside
                                     an <svg> a game is already drawing
     IGAA_SEASON_INK              -> the sampled palette
   ===================================================================== */
(function () {
  "use strict";

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

  /* --- Fall: one maple leaf, tip-up in the 100x100 box.
     Five lobes with a tooth on each edge, a deep V between them and a
     stem. Kept deliberately bold (few, large teeth) so it still reads as
     a maple leaf when it is only ~25px across on a phone. --- */
  var MAPLE =
    '<path d="M50 5 L57 24 L54 30 L64 40 L72 29 L71 34 L82 20 L75 42 L78 46 L73 53 ' +
    'L84 48 L83 53 L93 54 L72 64 L76 70 L60 70 L53 76 L53 97 L47 97 L47 76 L40 70 ' +
    'L24 70 L28 64 L7 54 L17 53 L16 48 L27 53 L22 46 L25 42 L18 20 L29 34 L28 29 ' +
    'L36 40 L46 30 L43 24 Z" ' +
    'fill="' + INK.leaf + '" stroke="' + INK.leafEdge + '" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<g stroke="' + INK.leafVein + '" stroke-width="2" fill="none" stroke-linecap="round" opacity=".85">' +
    '<path d="M50 74 L50 14"/><path d="M50 70 L78 27"/><path d="M50 70 L22 27"/>' +
    '<path d="M50 72 L87 53"/><path d="M50 72 L13 53"/></g>';
  function maple(tx, ty, s, rot) {
    return '<g transform="translate(' + tx + ' ' + ty + ') scale(' + s + ') rotate(' + rot + ' 50 50)">' + MAPLE + "</g>";
  }

  var INNER = {
    Winter:
      '<g fill="' + INK.flake + '">' + ring(6, 60, FLAKE_ARM, 50, 50) + "</g>" +
      '<circle cx="50" cy="50" r="6.6" fill="' + INK.flakeCore + '"/>' +
      ring(6, 60, '<circle cx="50" cy="41.5" r="2.1" fill="' + INK.flakeHi + '"/>', 50, 50) +
      '<circle cx="50" cy="50" r="2.7" fill="#dff0ff"/>',

    // stems first, then the grass clump hides their feet, blooms on top
    Spring:
      '<g stroke="' + INK.stem + '" stroke-width="2.6" stroke-linecap="round" fill="none">' +
      '<path d="M30 34 L35 70"/><path d="M67 30 L60 68"/><path d="M48 54 L48 76"/></g>' +
      '<path d="M24 97 C14 81 12 63 17 49 C22 63 23 81 28 97 Z" fill="' + INK.grassDeep + '"/>' +
      '<path d="M76 97 C86 81 88 63 83 49 C78 63 77 81 72 97 Z" fill="' + INK.grassDeep + '"/>' +
      '<path d="M22 98 C20 84 21 70 25 58 L29 74 L33 50 L38 72 L43 54 L48 74 L53 52 ' +
      'L58 72 L63 50 L68 74 L73 58 C77 70 78 84 76 98 Z" fill="' + INK.grass +
      '" stroke="' + INK.grassEdge + '" stroke-width="1.5" stroke-linejoin="round"/>' +
      bloom(30, 27, 17) + bloom(67, 22, 19) + bloom(48, 46, 18),

    Summer:
      '<ellipse cx="50" cy="93" rx="33" ry="6" fill="' + INK.turf + '" opacity=".5"/>' +
      '<path d="M50 5 C59 3 67 6 71 12 C80 11 88 18 87 27 C93 33 92 44 85 49 C82 57 73 61 65 59 ' +
      'C59 64 49 64 44 59 C35 62 25 57 22 49 C13 46 10 34 16 27 C13 18 20 10 29 11 C34 4 43 3 50 5 Z" ' +
      'fill="' + INK.canopy + '" stroke="' + INK.canopyEdge + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M45 94 L46 66 L43 52 L45.5 50.5 L48 62 L48.5 40 L51.5 40 L52 60 L57 48 L59.5 49.5 ' +
      'L54 64 L55 94 Z" fill="' + INK.bark + '"/>' +
      '<g stroke="' + INK.branch + '" stroke-width="1.7" stroke-linecap="round" fill="none">' +
      '<path d="M48 48 L42 36 M42 36 L35 30 M42 36 L44 26"/>' +
      '<path d="M52 46 L59 33 M59 33 L67 28 M59 33 L58 23"/>' +
      '<path d="M50 40 L50 21 M50 27 L43 19 M50 25 L58 17"/></g>',

    // two leaves on a diagonal, as printed: upper-left and lower-right
    Fall: maple(-4, -3, 0.63, -22) + maple(41, 36, 0.63, 13)
  };

  function seasonIconInner(name) { return INNER[name] || ""; }
  function seasonIcon(name, cls) {
    if (cls == null) cls = "sic";
    return '<svg viewBox="0 0 100 100"' + (cls ? ' class="' + cls + '"' : "") +
      ' xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      seasonIconInner(name) + "</svg>";
  }

  window.IGAA_SEASON_INK = INK;
  window.IGAA_SEASONS = ["Winter", "Spring", "Summer", "Fall"];
  window.seasonIconInner = seasonIconInner;
  window.seasonIcon = seasonIcon;
})();
