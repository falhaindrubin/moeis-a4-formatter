# MOEIS PPB page structure (observed 16 Nov 2026)

## Laporan PBD — `/laporan/pbd/detail/{a}/{b}/{classId}/{c}`
- Site CSS: `@page{size:a4 landscape}`, body font 12px Arial.
- Per student, as direct children of `<body>`:
  1. `TABLE` — header with KPM crest + school logo (~143px tall)
  2. `div.book > div.page` containing:
     - `CENTER` (empty), `TABLE` student details (Nama Murid, ID Pengenalan, Tingkatan, Jantina, Sekolah, Tarikh)
     - `div.box`:
       - `TABLE[style="border:3px solid #000"]`: subject table (Mata Pelajaran | Tahap Penguasaan | Penyataan TP | Ulasan Guru MP | Usaha Murid), thead bg #1C67B0
       - `div[style="display:block; clear:both; page-break-after:always;"]` ← forced break, must be neutralised
       - `TABLE` Ulasan Guru Kelas
       - `div.box` Petunjuk Usaha Murid
       - 10 × `<br>`
       - `TABLE` signatures (Guru Kelas, Pengetua/Guru Besar, Ibu Bapa/Penjaga)
  3. empty `DIV` (page-break spacer)
- A trailing `CENTER` and an inline `SCRIPT` (`window.print();`) at the end of body; it prints the unformatted page on load (see Gotchas).

## Slip Keputusan Peperiksaan — `/laporan/peperiksaan/individu/slip?all=1&tbt_peperiksaan_kelas_id={id}`
- Per student: `div.book` (contains logos, title, Nama/No. KP/Tahun/Jantina, subject table, summary, Nama Guru Kelas / Ulasan Guru Kelas), followed by
  `CENTER > input.hide` (the site's own print/back button, grey).
- Subject table header: `th` with `color:white`, background `#1C67B0` from `.box table thead th`, white inset borders.
- "Ulasan Guru Kelas" table is only ~408px wide (value cell 200px) → comment wraps unless widened.

## Laporan Kemahiran BM/BI — `/laporan/pbd/kemahiran/{a}/{b}/{classId}/{c}`
- No `div.book`. Per student, as direct children of `<body>`:
  `TABLE` (logos) → `CENTER > h3` (title) → `TABLE#table_header` (student details) → `div.box` (skills table `#maintable`, CEFR target table, 5 × `<br>`, signatures) → `CENTER > input.hide` (Kembali) → empty `div[style*="page-break-after:always"]` spacer (none after the last student).
- Grouped by the fallback in `a4FormatMoeis()`: split body at the spacers, keep runs that contain a `.box`. Fit ≈ 0.73 zoom (32 students, max inner height 1040px).

## Gotchas
- Both page types end with an inline `<script>window.print();</script>`, so the dialog opens before our `document_idle` content script runs. `print-guard.js` (MAIN world, `document_start`) overrides `window.print` to set `<html data-a4-print-requested="1">`; `content.js` then formats the page and calls `window.print()` itself.
- Without `print-color-adjust:exact`, Chrome prints the white header text with no blue background (looks faint grey).
- Elements outside `.a4sheet` (CENTER buttons) can create blank pages → hidden in print.
- `.a4inner td` queries must run after wrapping, not before.
- Kemahiran's print CSS sets `html, body { width: 297mm; height: 210mm }`. If `html` keeps that width, Chrome shrinks the whole printout to ~64% (190/297) → reset `html` too, not just `body`.
