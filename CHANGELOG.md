# Release notes

## 1.2.3 — 2026-11-16
- New: "↩️ Paparan Asal" button (grey, above "Cetak") after formatting, including after the automatic format triggered by the page's own print. It reloads the page in the original MOEIS layout. It is hidden in print.
- Install guide (CARA-PASANG.txt) updated: Kemahiran report, versioned zip name, how to update, Paparan Asal.
- Build: the unpacked extension is now written to a fixed `dist/MOEIS-A4-Formatter/`, so Chrome's ↻ picks up each new build. Old per-version folders are removed; the versioned zips remain.

## 1.2.2 — 2026-11-16
- Fix: "Muat semula untuk paparan asal?" → OK reloaded the page but it came back formatted again (PBD, Kemahiran). The page's own `window.print()` on load triggers auto-format; the reload now carries a one-time `#a4-asal` marker that skips it, then removes the marker from the URL. A normal refresh still auto-formats.

## 1.2.1 — 2026-11-16
- Fix: Kemahiran printout / Save as PDF came out shrunk to ~65% (content in the top two-thirds of the page). The site's print CSS sets `html,body{width:297mm}` (landscape), so Chrome scaled the whole document down to fit A4 portrait. The formatter now resets `html` as well as `body`.

## 1.2.0 — 2026-11-16
- New: Laporan Kemahiran BM/BI (`/laporan/pbd/kemahiran/...`) now formats to one A4 portrait page per student. Pages without `div.book` are split at the site's empty page-break spacers.
- The "📄 Format A4" button now also appears on pages that have `.box` report blocks.

## 1.1.1 — 2026-11-16
- Fix: blank printout on MOEIS pages the formatter doesn't recognise (e.g. `/laporan/pbd/kemahiran/...`). The formatter now leaves such pages untouched instead of injecting print CSS that hid everything; the page's own print still works.

## 1.1.0 — 2026-11-16
- Ctrl+P / the page's own Print button now formats to A4 first (`print-guard.js` in MAIN world replaces `window.print` with a flag-setter; `content.js` formats, then prints).
- Crest/badge images keep their aspect ratio (`object-fit:contain`).
- Docs updated (CLAUDE.md, security.md, page-structure.md).

## 1.0.5 — interim build
- Not committed to git; no notes were recorded at the time.

## 1.0.3 — 2026-11-16
- First committed release: Chrome extension (MV3), build script, docs.
- Formats Laporan PBD and Slip Keputusan Peperiksaan to one A4 portrait page per student.
