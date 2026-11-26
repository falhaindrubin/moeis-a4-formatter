# MOEIS A4 Formatter — project context for Claude Code

## What this is
A Chrome extension (Manifest V3) that reformats **MOEIS PPB** report pages so each student's report prints on **one A4 portrait page**, keeping the site's original design (blue table headers, borders, logos).
The owner is Fal (Falhaind Rubin), a teacher at SMJK Lok Yuk Kudat. He uses it for class reports. End users are Malaysian teachers, so user-facing text is in **Bahasa Melayu**.

Supported pages (all under `https://moeissppb.moe.gov.my/laporan/`):
1. **Laporan PBD**: `/laporan/pbd/detail/...` (end-of-year classroom assessment report, one block per student)
2. **Slip Keputusan Peperiksaan**: `/laporan/peperiksaan/individu/slip?all=1&tbt_peperiksaan_kelas_id=...`
3. **Laporan Kemahiran BM/BI**: `/laporan/pbd/kemahiran/...` (no `div.book`; grouped by splitting body at empty page-break spacers, keeping runs that contain `.box`)

## Layout
```
extension/          ← the shippable extension (Load unpacked from here)
  manifest.json     MV3, no permissions, content script only on moeissppb.moe.gov.my/laporan/*
  content.js        core logic: a4FormatMoeis(), floating "📄 Format A4" button, message handler
  background.js     toolbar-icon click → sends {cmd:'a4run'} to the content script
  icons/            16/48/128 px
  CARA-PASANG.txt   install guide + security notes (Malay)
scripts/build.py    builds dist/: extension zip, SHA256SUMS, bookmarklet.txt/.html
docs/               page-structure.md (MOEIS DOM notes), security.md
```
`dist/` is generated output, so never edit it by hand. The owner's Chrome loads the unpacked extension from `dist/MOEIS-A4-Formatter/`, a fixed path that build.py overwrites. After any code change, rebuild so ↻ picks it up. Run `python3 scripts/build.py`.

## How the formatter works (content.js → a4FormatMoeis)
1. Injects `<style id="a4fix">`: `@page{size:A4 portrait;margin:10mm}`. On screen, each sheet shows as a 210×297 mm paper. In print, `.a4sheet` is 190×277 mm with `break-after:page`, and `body>*:not(.a4sheet)` is hidden.
2. Forces `print-color-adjust:exact` on every element. **Required**: the slip's column header is white text on #1C67B0, and without this Chrome drops the background when printing (an earlier bug).
3. Groups `body` children per student:
   - PBD: `TABLE` (logo header) + next sibling `div.book`
   - Slip: a lone `div.book`
   Empty spacer `div`s are removed (they carry page breaks that would make blank pages).
4. Wraps each group in `.a4sheet > .a4inner`, then neutralises every inner `page-break-*` / `break-*`. PBD has an inner `div` with `page-break-after:always` after the subject table that pushed signatures onto page 2.
5. PBD: trims the run of 10 `<br>` above the signature table down to 4.
6. Slip: widens the "Ulasan Guru Kelas" table (value cell `min-width:420px`) so the comment stays on one line. This must run **after** the group is inside `.a4inner`.
7. Fit-to-page: tries layout widths 760–1400 px (step 40), picks the width W that maximises `zoom = min(AW/W, AH/H)` where AW=190 mm, AH=277 mm at 96 dpi. It applies `zoom × 0.99`.
   Typical results: PBD ≈ 0.71 (≈8.5 px text), slip ≈ 0.94.

Re-running on an already formatted page returns -1. A plain refresh re-formats, because the page's own `window.print()` on load triggers auto-format. To get the original, reload with `#a4-asal` (a4Run does this): content.js skips the auto-format once and strips the hash.

## Security invariants (do not regress)
- No `permissions`, no `host_permissions`. Content script `matches` only `https://moeissppb.moe.gov.my/laporan/*`, `all_frames:false`, isolated world.
  - One deliberate exception: `print-guard.js` runs in the MAIN world at document_start, only to replace `window.print` with a function that sets `document.documentElement.dataset.a4PrintRequested='1'`. It must stay that tiny: no data access, no network. `content.js` (isolated) reads the flag, runs `a4FormatMoeis()`, then calls `window.print()`.
- Runtime guard `A4_OK` (https + exact hostname + `/laporan/` path + top frame) before anything runs.
- Button handlers act only on `e.isTrusted` clicks. `onMessage` accepts only `sender.id === chrome.runtime.id && !sender.tab`.
- Never add `fetch`/XHR/storage/cookies/`eval`/`innerHTML` with page data/remote code. The pages contain student personal data (IC numbers), and the extension must never read it out or transmit it.
- Strict `content_security_policy.extension_pages`.
- Keep `SHA256SUMS.txt` regenerated (build.py does this).
See `docs/security.md`.

## Testing
There is no automated test harness yet. Manual check:
1. `chrome://extensions` → Developer mode → Load unpacked → `extension/` (click ↻ after edits).
2. Open a PBD page and a slip page while signed in to MOEIS (via idMe; the user signs in himself, never handle passwords).
3. Click **📄 Format A4** and check in DevTools:
   `document.querySelectorAll('.a4sheet').length` = number of students, and
   `Math.max(...[...document.querySelectorAll('.a4inner')].map(i=>i.getBoundingClientRect().height))` ≤ 1047 (277 mm).
4. Ctrl+P preview: A4 portrait, 1 page per student, blue headers visible, no blank pages.
Tested on 16 Nov 2026 with class 4 Stanford (32 students) on both page types.

## Conventions
- Bump `manifest.json` `version` for every release (current 1.2.4).
- Add a `CHANGELOG.md` entry for every release (build.py refuses to build without one).
- User-facing strings in Malay. Code comments in English.
- Keep the core function self-contained, because `build.py` extracts `a4FormatMoeis()` by regex to build the bookmarklet. Keep its signature and the final `return groups.length;` line intact.

## Ideas / backlog
- Automated test: save sample HTML of both pages (with personal data anonymised) into `tests/fixtures/` and run with Playwright.
- Options: margin size, "one student only" test mode, skip signature trimming.
- Support other MOEIS report types (detect structure, fall back gracefully).
- Chrome Web Store publication (removes the developer-mode warning).
