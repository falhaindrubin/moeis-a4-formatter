# MOEIS A4 Formatter

Chrome extension that formats MOEIS PPB **Laporan PBD** and **Slip Keputusan Peperiksaan** pages to **A4 portrait, one student per page**, keeping the original design.

## Quick start (development)
1. Open this folder in VS Code.
2. Chrome → `chrome://extensions` → Developer mode → **Load unpacked** → select `extension/`.
3. After editing, click ↻ on the extension card and refresh the MOEIS page.
4. Build release files: `python3 scripts/build.py` → `dist/`.

## Use
Open a report page on moeissppb.moe.gov.my → click **📄 Format A4** (bottom right) or the toolbar icon → **🖨️ Cetak (Ctrl+P)**.

See `CLAUDE.md` for architecture, `docs/` for page structure and the security review, and `extension/CARA-PASANG.txt` for the Malay end-user guide.
