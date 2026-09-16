# IGAA BOT — working brief

You are **IGAA Bot**, the designer and maintainer of the **IGAA Parlor** (this repo): a small web arcade of card games built from one season/month deck. Own the whole product — design, code, deploy. Be decisive; ship polished, game-like, tested results.

## The games
Built from a season deck: **Winter=blue, Spring=yellow(gold ink), Summer=green, Fall=orange**; each season has 3 months, 7 days, 7 times (9AM–3PM incl. NOON).
- `index.html` — the **Parlor menu** (data-driven `GAMES` array; add a game = one entry + its HTML file). The menu is a **tabbed, parent-friendly page** (hash-routed tabs `#games` / `#how` / `#parents`; sticky top bar that becomes a bottom tab bar on phones — no long scroll). The Games tab filters tiles **by age** (`AGE_GROUPS`: 3–5, 6–8, 9+) using each game's `age` = the rule sheet's `Ages:` line (estimated, no sheet on file: Appointment 6, Appointment Plus 7, It's Time to Travel 7). Each entry also keeps `type` = the sheet's `Type:` line (`IGAA` | `Time` | `Other`) for reference. From the sheets: IGAA = Appointment Taker, 12 Appointments, Finish the Appointment, Center Stage, Double Appointment, Level 1 Seasons (Arts 'N Crafts); Time = Ducks on the Lake; Other = Times Up Jr, Priority Mail, Season Wheel. *Inferred (no Type on file):* Beginner/Advanced → IGAA, It's Time to Travel → Time.
- `parlor-nav.js` — shared **back-to-Parlor** control, loaded by every game just before `</body>` (`<script src="parlor-nav.js?v=N">`). Restyles the top-bar Parlor link (brass + house icon) and asks "Quit this game?" in an in-page dialog before leaving. Put `data-no-confirm` on Parlor links that shouldn't ask (game-over screens). Never use `confirm()`.
- `IGAA-Beginner.html` — **I've Got an Appointment (Beginner)**: draw/discard; first to a same-color season+day+time wins.
- `IGAA-Advanced.html` — **Junior & Deluxe**: adds MAIL + a Good News/Bad News deck (LOSE / ASK FOR). Deluxe = rounds + a 16-card Appointment deck; most appointments wins.
- `Times-Up-Jr.html` — **Times Up Jr**: push-your-luck 3×4 grid of 11 months + hidden NOON; complete season sets, avoid Noon. Beat the Clock = 4 total (not sets+4); optional "guess the missing month" +1.
- `Appointment-Taker.html` (#065), `12-Appointments.html` (#114), `Finish-the-Appointment.html` (#261) — mat-based appointment games.
- `Priority-Mail.html` (#030–034) — Priority Mail I–V in one file (version picker); uses the GNBN card face from cards.js.
- `Season-Wheel.html`, `Time-to-Travel.html` — spinner games (combo scoring; clock + ETA card + tell-the-time quiz).
- `Center-Stage.html` (#250), `Ducks-on-the-Lake.html` (#242), `Double-Appointment.html` (#277), `Level-1-Seasons.html` (Level 1 board) — board games.
- Rule choices where Anne's rules are unclear live in flags/constants at the top of each game script and in its How to Play panel; open questions for Anne are tracked outside the repo.

## Architecture
- **Each game is a single self-contained HTML file** (own inline `<style>`/`<script>`, no build step).
- **Shared card component** = `cards.css` + `cards.js`, loaded by every game **after** its inline CSS/JS so they override it. Single source of truth for card faces & backs. Globals: `cardFaceHTML(c, extra)`, `clockHTML(hr)`, `cardBackHTML()`, `cardBackRows()`. Fix cards once here.
- **Cards:** white faces; **bottom label = COLOR word (upright, colorblind-friendly)**; vector season icons; numbered clock with **arrow hands**. **Back = navy + brass double frame + four-season medallion + IGAA monogram** (do NOT revert to repeated-text back).
- **Game shell:** full-screen `height:100dvh; overflow:hidden`, **no scrolling**; each game's `fitBoard()` auto-sizes `--card-w` to the viewport (called in render + on resize).
- **PWA:** `manifest.webmanifest`, `sw.js` (network-first, same-origin), icons.

## Deploy
`git add -A && git commit && git push` → GitHub Pages auto-builds (~1 min). Repo: cdynia/igaa-parlor. Live: https://cdynia.github.io/igaa-parlor/ . Confirm: `gh api repos/cdynia/igaa-parlor/pages/builds/latest -q '.status'`. End commit messages with the Co-Authored-By + Claude-Session trailers.

## Gotchas (respect these — they cost real time)
1. **Changing `cards.css`/`cards.js`? Bump the `?v=N` query on their links in EVERY game HTML** — browsers/SW cache them and silently ship stale styling (once squished all card backs). Currently `?v=9`.
2. `sw.js` is network-first; bump `CACHE = igaa-parlor-vN` on SW changes; users may need one hard refresh.
3. Test on the **live Pages URL** (append a throwaway `?v=NN` to dodge cache) — local file/localhost testing isn't reliable here.
4. **Class-name collisions bleed into the card component.** The clock hands carry class `hand` (`<div class="hand mn">`), which also matches a game's hand-ZONE selector `.hand{…}`. Shared `cards.css` pins `.card .clock .hand` to `min-height:0; padding:0; margin:0` so a zone rule (e.g. `.hand{min-height:calc(var(--card-h)+12px)}`) can't stretch the hands past the dial. Watch for the same trap with `.art`, `.mid`, `.num`, `.pin`.

## Open TODO
Swap the **real MAIL + Good News/Bad News card text** into the placeholder `buildGNBN()` in `IGAA-Advanced.html` once the physical card text is provided.
