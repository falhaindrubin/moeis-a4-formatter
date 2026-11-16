# Security review — v1.0.3 (16 Nov 2026)

## Threat model
The extension runs on pages showing student personal data (names, IC numbers, results). The main risks are:
(a) leaking that data, (b) being abused by page scripts or other extensions, (c) tampering with the unpacked files, (d) careless handling of the printed PDFs.

## Controls in place
| Risk | Control |
|---|---|
| Data exfiltration | No network/storage/cookie APIs in code; no permissions; strict extension CSP (`default-src 'none'; script-src 'self'`). |
| Running on wrong sites | `matches` limited to `https://moeissppb.moe.gov.my/laporan/*`; runtime `A4_OK` guard (https, exact host, path, top frame); `all_frames:false`. |
| Page-script abuse | Isolated world; button reacts only to `isTrusted` clicks; no page data is evaluated or injected as HTML. |
| Message spoofing | `onMessage` accepts only messages from this extension's background (`sender.id === chrome.runtime.id`, no `sender.tab`). Toolbar handler checks `tab.url` when available. |
| Tampering (unpacked) | `SHA256SUMS.txt` per file + release zip checksum; keep the folder in a private user directory. |
| Distribution | Share only from the author; verify zip SHA-256. Future: Chrome Web Store. |
| Printed PDFs (PDPA) | User guidance in `CARA-PASANG.txt`: store privately, don't post in groups, delete unneeded copies. |

## Audit commands
```bash
grep -nE "fetch|XMLHttp|eval|Function\(|innerHTML|outerHTML|insertAdjacentHTML|document.write|storage|cookie|sendBeacon|WebSocket|import\(" extension/*.js
```
Expected: no matches.
