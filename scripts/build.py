#!/usr/bin/env python3
"""Build release artifacts for MOEIS A4 Formatter.

Outputs (in dist/):
  - MOEIS-A4-Formatter-<version>.zip   Chrome extension, ready for "Load unpacked"
  - MOEIS-A4-Formatter/                same extension, unpacked, for "Load unpacked" (fixed path, so ↻ picks up new builds)
  - RELEASE-NOTES.md                   copy of CHANGELOG.md (build fails if current version has no entry)
  - SHA256SUMS.txt                     checksums of the zip and every extension file
  - bookmarklet.txt                    one-line bookmarklet built from the same core function
  - bookmarklet.html                   drag-to-bookmarks-bar install page

Usage:  python3 scripts/build.py
"""
import hashlib, json, pathlib, re, shutil, urllib.parse, zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
EXT = ROOT / "extension"
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)

manifest = json.loads((EXT / "manifest.json").read_text(encoding="utf-8"))
version = manifest["version"]
content = (EXT / "content.js").read_text(encoding="utf-8")

def sha(p: pathlib.Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()

# 1) Per-file checksums inside the extension folder
files = sorted(p for p in EXT.rglob("*") if p.is_file() and p.name != "SHA256SUMS.txt")
(EXT / "SHA256SUMS.txt").write_text(
    "".join(f"{sha(p)}  {p.relative_to(EXT).as_posix()}\n" for p in files if p.suffix != ".txt"),
    encoding="utf-8")

# 2) Extension zip (deterministic order)
zpath = DIST / f"MOEIS-A4-Formatter-{version}.zip"
with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
    for p in sorted(p for p in EXT.rglob("*") if p.is_file()):
        z.write(p, p.relative_to(EXT).as_posix())

# 2b) Unpacked extension folder at a fixed path, so Chrome's ↻ on a dist/ install picks up each new build.
#     Old per-version folders are removed (the versioned zips stay as the release archive).
for old in DIST.glob("MOEIS-A4-Formatter-*"):
    if old.is_dir(): shutil.rmtree(old)
upk = DIST / "MOEIS-A4-Formatter"
shutil.rmtree(upk, ignore_errors=True)
shutil.copytree(EXT, upk)

# 2c) Release notes: every released version must have an entry
notes = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
if f"## {version} " not in notes:
    raise SystemExit(f"CHANGELOG.md has no entry for {version}; add release notes first")
shutil.copy(ROOT / "CHANGELOG.md", DIST / "RELEASE-NOTES.md")

# 3) Bookmarklet from the shared core function a4FormatMoeis()
m = re.search(r"function a4FormatMoeis\(\)\{(.*?)\nreturn groups\.length;\n\}", content, re.S)
if not m:
    raise SystemExit("Could not find a4FormatMoeis() in extension/content.js")
core = m.group(1).replace(
    "if(document.getElementById('a4fix'))return -1;",
    "if(document.getElementById('a4fix')){alert(\"Sudah diformat. Muat semula halaman untuk asal.\");return;}")
js = ("(()=>{" + core +
      '\nalert(groups.length?groups.length+" laporan siap untuk A4 potret. Tekan Ctrl+P untuk cetak.":"Format halaman ini tidak dikenali.");\n})()')
one_line = " ".join(l.strip() for l in js.splitlines() if l.strip())
bm = "javascript:" + urllib.parse.quote(one_line, safe="(){}[];,=!<>|.:'+*/-_@#?$~^`")
(DIST / "bookmarklet.txt").write_text(bm, encoding="utf-8")
(DIST / "bookmarklet.html").write_text(f"""<!DOCTYPE html><html><head><meta charset="utf-8"><title>MOEIS A4 Formatter (bookmarklet)</title>
<style>body{{font-family:Arial,sans-serif;max-width:640px;margin:40px auto;line-height:1.6}}a.bm{{display:inline-block;padding:12px 20px;background:#1C67B0;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold}}</style></head><body>
<h2>MOEIS A4 Formatter v{version} (bookmarklet)</h2>
<p>Seret butang ini ke Bookmarks bar Chrome:</p>
<p><a class="bm" href="{bm.replace('"', '&quot;')}">MOEIS A4</a></p>
<p>Buka Laporan PBD / Slip Peperiksaan di moeissppb.moe.gov.my, klik bookmark, kemudian Ctrl+P.</p>
</body></html>""", encoding="utf-8")

# 4) Release checksums
(DIST / "SHA256SUMS.txt").write_text(
    f"{sha(zpath)}  {zpath.name}\n{sha(DIST / 'bookmarklet.txt')}  bookmarklet.txt\n", encoding="utf-8")

print(f"Built v{version}:")
for p in sorted(DIST.iterdir()):
    print("  dist/" + p.name)
