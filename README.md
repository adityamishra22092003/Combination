# COMBINATION — A Heist in Three Locks

A single-file, story-driven coding game that teaches **variables, conditionals, and functions** through a heist narrative. Built for adult beginners who already understand *what* code is but need to build intuition for *why* these three concepts exist and when to reach for each one.

Live file: `combination.html` — open it in any browser, no server or install required.

---

## What it is

You play a new "runner" on a heist crew. Ravel, your comms officer, talks you through a job in real time and radios you problems that can only be solved by writing actual JavaScript into an in-browser console. The code you write is genuinely executed and checked against test cases — this isn't a quiz about syntax, it's syntax used to do something.

The three core programming concepts map onto three narrative beats, in an order where each one solves a problem the last one created:

| Lock | Concept | Story problem | What it teaches |
|---|---|---|---|
| 1 | **Variables** | A keypad needs a code built from two numbers radioed in separately | Naming and storing a value so you can reuse it |
| 2 | **Conditionals** | A guard moves unpredictably; the same code must react differently each time | Branching logic based on live conditions |
| 3 | **Functions** | Two more doors need the identical lock-picking calculation | Writing logic once, reusing it on demand |
| Finale | **All three** | A mechanical vault dial with a narrow "sweet spot" | Combining a variable, a condition, and a function together |

After each lock, two **multiple-choice "quick check" questions** test the concept in plain language, separate from the coding exercise — so understanding is checked two ways, not one.

---

## How it works (for anyone extending it)

Everything lives in one HTML file: markup, styles, and game logic.

- **`acts` array** (in the `<script>` tag) is the whole game. Each entry has:
  - `label` — shown in the console header (e.g. `"LOCK 1"`)
  - `brief` — the objective line shown above the code editor
  - `intro` — an array of `[speaker, text]` lines played into the story panel when the act loads. Speaker is `'scene'`, `'ravel'`, or `'system'`
  - `starter` — the code pre-filled into the editor
  - `run(code)` — takes the player's code as a string, executes it safely with `new Function(...)`, and returns `{ ok, log }`. `log` is an array of strings shown in the test feed (pass/fail per line)
  - `success` — narrative lines played when `run()` returns `ok: true`
  - `quiz` — array of `{ q, options, correct }` multiple-choice questions asked after the coding challenge passes

- **`startQuiz()`** walks through an act's `quiz` array one question at a time, then calls `loadAct(next)` once both are answered.

- **Progress tracking** is the diagonal flag line in the hero: `updateProgress()` toggles `.active` / `.done` classes on the flag labels and animates the SVG path's `stroke-dashoffset` to "fill in" as locks are cleared.

### Adding a new lock

1. Duplicate an existing object in the `acts` array.
2. Write the `intro` narrative and a `starter` code snippet with something missing for the player to fill in.
3. Write `run(code)` to check the player's variables/functions against expected values (see existing locks for the pattern: wrap player code in `new Function`, return the values you need, compare them).
4. Add 1–2 `quiz` questions.
5. If you add a 5th lock before the finale, add a matching flag label in the `.flagline` `<div>` in the HTML and adjust its `left`/`top` position along the curve.

### Adding more quiz questions

Just add more objects to any act's `quiz` array — the game will ask them in order automatically, no other changes needed.

---

## Design notes

- **Visual theme**: cream background, oversized display type, and a flat-SVG collage (sun, mountain, skyscraper) inspired by editorial/collage-style marketing pages — repurposed so the decorative diagonal line doubles as the real progress tracker, rather than being pure decoration.
- **Dark console panel**: kept intentionally dark against the light page — visually signals "this is the terminal, the one live system in the room."
- **Code execution**: player code runs via `new Function()` inside the browser tab. This is standard for in-browser coding playgrounds and is sandboxed to the page itself — it does not access the network, the file system, or anything outside the tab.
- **No build step, no dependencies** beyond Google Fonts (loaded via `<link>`), so the file can be opened directly, hosted as a static file, or embedded in an iframe.

---

## Known limitations / good next steps

- Only supports JavaScript. Python is arguably more common for absolute beginners — would need a JS-based Python interpreter (e.g. Skulpt or Pyodide) to keep it running client-side.
- No progress saving — refreshing the page restarts the game. Adding `localStorage` would work outside of Claude's artifact environment, or a small backend/database would be needed for cross-session saves.
- Currently one linear "job." A full campaign (loops, arrays, objects) would follow the same `acts` array pattern, just longer.
- Mobile layout is functional but the collage graphic and flag line are tuned primarily for desktop widths.

---

## Credits

Prototype built as a demonstration of teaching intermediate programming concepts (variables, conditionals, functions) through narrative and real, executable code rather than passive explanation.
