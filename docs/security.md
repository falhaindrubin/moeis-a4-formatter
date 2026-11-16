# Security review — v1.1.0 (16 Nov 2026)

## Threat model
The extension runs on pages showing student personal data (names, IC numbers, results). The main risks are:
(a) leaking that data, (b) being abused by page scripts or other extensions, (c) tampering with the unpacked files, (d) careless handling of the printed PDFs.

## Controls in place
| Risk | Control |
|---|---|
| Data exfiltration | No network/storage/cookie APIs in code; no permissions; strict extension CSP (`default-src 'none'; script-src 'self'`). |
| Running on wrong sites | `matches` limited to `https://moeissppb.moe.gov.my/laporan/*`; runtime `A4_OK` guard (https, exact host, path, top frame); `all_frames:false`. |
| Page-script abuse | Isolated world (sole exception: `print-guard.js`, see below); button reacts only to `isTrusted` clicks; no page data is evaluated or injected as HTML. |
| Message spoofing | `onMessage` accepts only messages from this extension's background (`sender.id === chrome.runtime.id`, no `sender.tab`). Toolbar handler checks `tab.url` when available. |
| Tampering (unpacked) | `SHA256SUMS.txt` per file + release zip checksum; keep the folder in a private user directory. |
| Distribution | Share only from the author; verify zip SHA-256. Future: Chrome Web Store. |
| Printed PDFs (PDPA) | User guidance in `CARA-PASANG.txt`: store privately, don't post in groups, delete unneeded copies. |

## Exception: print-guard.js (MAIN world)
The MOEIS slip and PBD pages end with an inline `<script>window.print();</script>`, which opens the print dialog before the content script can format the page. `print-guard.js` runs in the page's own world at `document_start` (same `matches`, top frame only) and replaces `window.print` with a function that only sets `document.documentElement.dataset.a4PrintRequested='1'`.
- It reads no page data, makes no requests and has no access to extension APIs.
- The isolated `content.js` (behind the `A4_OK` guard) reads the flag, deletes it, runs `a4FormatMoeis()` and then calls the browser's native `window.print()`.
- Residual risk: page scripts can also set that flag, which can only make the extension format and print the page. It exposes no data and gives no extra capability.
- Keep the file to that one line of behaviour; any other code in it must be treated as a security regression.

## Audit commands
```bash
grep -nE "fetch|XMLHttp|eval|Function\(|innerHTML|outerHTML|insertAdjacentHTML|document.write|storage|cookie|sendBeacon|WebSocket|import\(" extension/*.js
```
Expected: no matches.
