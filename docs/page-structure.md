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
- A trailing `CENTER` and `SCRIPT` at the end of body.

## Slip Keputusan Peperiksaan — `/laporan/peperiksaan/individu/slip?all=1&tbt_peperiksaan_kelas_id={id}`
- Per student: `div.book` (contains logos, title, Nama/No. KP/Tahun/Jantina, subject table, summary, Nama Guru Kelas / Ulasan Guru Kelas), followed by
  `CENTER > input.hide` (the site's own print/back button, grey).
- Subject table header: `th` with `color:white`, background `#1C67B0` from `.box table thead th`, white inset borders.
- "Ulasan Guru Kelas" table is only ~408px wide (value cell 200px) → comment wraps unless widened.

## Gotchas
- Without `print-color-adjust:exact`, Chrome prints the white header text with no blue background (looks faint grey).
- Elements outside `.a4sheet` (CENTER buttons) can create blank pages → hidden in print.
- `.a4inner td` queries must run after wrapping, not before.
