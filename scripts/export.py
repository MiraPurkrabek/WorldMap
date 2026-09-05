"""Make a GitHub Pages ZIP and a single-file browser preview. Python stdlib only."""
from pathlib import Path
import base64
import json
import re
import sys
import zipfile

root = Path(__file__).resolve().parent.parent
public = root / "dist" if (root / "dist" / "index.html").exists() else root
output = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root / "exports"
output.mkdir(parents=True, exist_ok=True)

def data_url(path, mime):
    return "data:" + mime + ";base64," + base64.b64encode(path.read_bytes()).decode("ascii")

html = (public / "index.html").read_text()
def embed_css(match):
    return "<style>\n" + (public / match.group(1)).read_text() + "\n</style>"
html = re.sub(r'<link rel="stylesheet" href="\./([^"]+)">', embed_css, html)
assets = {
    "overviewTiles": {str(path.relative_to(public / "data/overview")).removesuffix('.jpg'): data_url(path, "image/jpeg") for path in sorted((public / "data/overview").rglob('*.jpg'))},
    "glyphs": data_url(public / "vendor/fonts/Open Sans Semibold/0-255.pbf", "application/x-protobuf")
}
html = html.replace("</head>", "<script>window.WORLD_MAP_ASSETS=" + json.dumps(assets) + ";</script>\n</head>")
scripts = []
def collect_js(match):
    js = (public / match.group(1)).read_text()
    js = re.sub(r"//# sourceMappingURL=[^\n]*", "", js)
    scripts.append("<script>\n" + js.replace("</script", "<\\/script") + "\n</script>")
    return ""
html = re.sub(r'<script defer src="\./([^"]+)"></script>', collect_js, html)
# Inline scripts run after the body exists. Their original order is preserved.
html = html.replace("</body>", "\n".join(scripts) + "\n</body>")
preview = output / "WorldMap-preview.html"
preview.write_text(html)

with zipfile.ZipFile(output / "WorldMap.zip", "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for name in ["index.html", "app.js", "styles.css", "map-utils.js", ".nojekyll"]:
        archive.write(public / name, name)
    for directory in ["data", "vendor"]:
        for path in sorted((public / directory).rglob("*")):
            if path.is_file(): archive.write(path, path.relative_to(public))
    for name in ["README.md", "SOURCES.md", "DATA-NOTES.md", "scripts/check-data.cjs", "scripts/export.py"]:
        archive.write(root / name, name)

for name in ["WorldMap.zip", "WorldMap-preview.html"]:
    path = output / name
    print(f"{path}: {path.stat().st_size:,} bytes")
