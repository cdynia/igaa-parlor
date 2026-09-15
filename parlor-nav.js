/* =========================================================================
   IGAA Parlor — shared "back to the Parlor" control.
   Load in every game just before </body>:
     <script src="parlor-nav.js?v=N"></script>
   • Makes the top-bar "← Parlor" link easy to spot (brass outline + house icon).
   • Any link to index.html asks "Quit this game?" in an in-page dialog first.
     Add  data-no-confirm  to a link that should leave without asking
     (e.g. the Parlor button on a game-over screen).
   Self-contained: injects its own CSS; no dependency on a game's variables.
   ========================================================================= */
(function () {
  if (window.__parlorNav) return;
  window.__parlorNav = true;

  var HOUSE = '<svg class="pq-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M3 11.2 12 3.5l9 7.7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M5.6 9.6V20h4.6v-5.6h3.6V20h4.6V9.6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>';

  var css =
    '.pq-home{display:inline-flex!important;align-items:center;gap:.4em;font-weight:700!important;' +
      'border-color:#c9a24a!important;color:#f1d58c!important}' +
    '.pq-home:hover{border-color:#f1d58c!important;color:#fff!important;background:rgba(201,162,74,.14)!important}' +
    '.pq-ico{width:1.1em;height:1.1em;flex:none}' +

    '.pq-scrim{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;' +
      'padding:16px;background:rgba(6,11,18,.64);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}' +
    '.pq-scrim.pq-open{display:flex;animation:pqFade .14s ease-out}' +
    '.pq-card{width:min(380px,100%);box-sizing:border-box;text-align:center;color:#e9edf2;' +
      'font-family:"Archivo",system-ui,"Segoe UI",sans-serif;border-radius:18px;padding:24px 22px 20px;' +
      'background:linear-gradient(180deg,#1d3046 0%,#101b28 100%);border:1px solid #8a6a26;' +
      'box-shadow:0 0 0 3px #0b131c,0 0 0 4px rgba(201,162,74,.45),0 30px 70px -20px #000;animation:pqPop .16s ease-out}' +
    '.pq-tabs{display:inline-flex;gap:5px;margin-bottom:12px}' +
    '.pq-tabs i{display:block;width:11px;height:24px;border-radius:3px}' +
    '.pq-card h2{font-family:"Fraunces",Georgia,serif;font-weight:700;font-size:1.65rem;line-height:1.1;margin:0 0 8px;color:#fff}' +
    '.pq-card p{margin:0 0 20px;color:#b9c6d4;font-size:1rem;line-height:1.45}' +
    '.pq-row{display:flex;gap:10px;flex-wrap:wrap}' +
    '.pq-btn{flex:1 1 140px;min-height:46px;font:inherit;font-weight:800;font-size:1.02rem;letter-spacing:.02em;' +
      'padding:.65em 1em;border-radius:999px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:.45em}' +
    '.pq-stay{background:linear-gradient(#f0d488,#c99a3e);color:#211a0c;border:1px solid #8a6a26;box-shadow:0 3px 0 #8a6a26}' +
    '.pq-stay:hover{filter:brightness(1.06)}' +
    '.pq-stay:active{transform:translateY(2px);box-shadow:0 1px 0 #8a6a26}' +
    '.pq-quit{background:transparent;color:#e9edf2;border:1px solid #56687c}' +
    '.pq-quit:hover{border-color:#e0664a;color:#ffc2b3}' +
    '.pq-btn:focus-visible{outline:3px solid #f1d58c;outline-offset:2px}' +
    '@keyframes pqFade{from{opacity:0}to{opacity:1}}' +
    '@keyframes pqPop{from{transform:translateY(8px) scale(.97);opacity:0}to{transform:none;opacity:1}}' +
    '@media (prefers-reduced-motion:reduce){.pq-scrim.pq-open,.pq-card{animation:none}}';

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var modal = null, stayBtn = null, quitBtn = null, lastFocus = null, target = "index.html";

  function build() {
    modal = document.createElement("div");
    modal.className = "pq-scrim";
    modal.innerHTML =
      '<div class="pq-card" role="dialog" aria-modal="true" aria-labelledby="pq-title" aria-describedby="pq-desc">' +
        '<div class="pq-tabs" aria-hidden="true"><i style="background:#3d78bf"></i><i style="background:#e6b23a"></i>' +
          '<i style="background:#45a06a"></i><i style="background:#cf7620"></i></div>' +
        '<h2 id="pq-title">Quit this game?</h2>' +
        '<p id="pq-desc">You’ll go back to the Parlor. This game won’t be saved.</p>' +
        '<div class="pq-row">' +
          '<button type="button" class="pq-btn pq-stay">Keep playing</button>' +
          '<button type="button" class="pq-btn pq-quit">' + HOUSE + 'Quit to Parlor</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    stayBtn = modal.querySelector(".pq-stay");
    quitBtn = modal.querySelector(".pq-quit");
    stayBtn.addEventListener("click", close);
    quitBtn.addEventListener("click", function () { window.location.href = target; });
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
  }

  function isOpen() { return !!modal && modal.classList.contains("pq-open"); }

  function open(href) {
    if (!modal) build();
    target = href || "index.html";
    lastFocus = document.activeElement;
    modal.classList.add("pq-open");
    stayBtn.focus();
  }

  function close() {
    modal.classList.remove("pq-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // Intercept every link back to the menu (capture phase, before game handlers).
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href="index.html"]');
    if (!a || a.hasAttribute("data-no-confirm")) return;
    e.preventDefault();
    e.stopPropagation();
    open(a.getAttribute("href"));
  }, true);

  // Esc closes the dialog; Tab stays inside it. Swallow keys so the game doesn't react.
  document.addEventListener("keydown", function (e) {
    if (!isOpen()) return;
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (e.key === "Tab") {
      e.preventDefault(); e.stopPropagation();
      (document.activeElement === stayBtn ? quitBtn : stayBtn).focus();
      return;
    }
    if (e.key !== "Enter" && e.key !== " ") e.stopPropagation();
  }, true);

  // Make the top-bar Parlor button easy to find.
  function upgrade() {
    var links = document.querySelectorAll('.topbar a[href="index.html"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      a.classList.add("pq-home");
      a.innerHTML = HOUSE + "<span>Parlor</span>";
      a.setAttribute("aria-label", "Back to the Parlor (quit game)");
      a.setAttribute("title", "Back to the Parlor");
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", upgrade);
  else upgrade();
})();
