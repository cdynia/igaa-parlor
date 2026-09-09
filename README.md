# IGAA Parlor

A little web arcade of card games built from one season-and-month deck
(Winter = blue, Spring = gold, Summer = green, Fall = pumpkin).

**Play:** open `index.html` (locally, just double-click it), or visit the GitHub Pages site.

## Games

| File | Game | Notes |
|------|------|-------|
| `IGAA-Beginner.html` | **I've Got an Appointment** (Beginner) | Collect a same-color season + day + time. |
| `IGAA-Advanced.html` | **Appointment: Junior & Deluxe** | Adds MAIL + Good News/Bad News; Deluxe adds rounds + an Appointment deck. |
| `Times-Up-Jr.html` | **Times Up Jr** | Flip months for season sets; avoid the hidden Noon card. |

## Project layout

Every game is a **single self-contained HTML file** — its own styles and script,
no build step, no dependencies. That keeps each game independent and easy to edit
or drop in. The menu (`index.html`) is the only shared page.

```
index.html          ← the Parlor menu (data-driven; edit GAMES to add a game)
IGAA-Beginner.html
IGAA-Advanced.html
Times-Up-Jr.html
IGAA.ico / IGAA.png  ← app icon
```

## Add a new game (the easy path)

1. Create a new self-contained `MyGame.html` in this folder. Easiest start:
   copy an existing game and rebuild the middle. Shared conventions:
   - Season colors as CSS vars: `--blue --yellow --green --orange`, with
     on-white "ink" variants `--ink-blue --ink-gold --ink-green --ink-orange`.
   - A brass UI accent (`--brass`, `--brass-hi`) and the dark felt background.
   - Add a back link in the top bar: `<a class="btn ghost" href="index.html">← Parlor</a>`.
2. Open `index.html` and add one entry to the `GAMES` array near the bottom:

   ```js
   { file:"MyGame.html", name:"My Game", desc:"One short line.",
     emoji:"🎲", players:"2–8 players", accent:"#3d78bf", soft:"#dbe7f5" },
   ```

That's it — the menu card renders itself from that entry.

## Swapping in real card text

`IGAA-Advanced.html` uses a **designed placeholder** for the MAIL and
Good News / Bad News cards, isolated in one function, `buildGNBN()`. Replace the
entries there with the real card text and everything else keeps working.
