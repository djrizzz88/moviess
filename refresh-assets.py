"""Run after changing ember.css or ember.js, before uploading to GitHub."""
from pathlib import Path
import hashlib
import re
root = Path(__file__).resolve().parent
page = root / 'index.html'
html = page.read_text()
for extension in ('css', 'js'):
    data = (root / f'ember.{extension}').read_bytes()
    digest = hashlib.sha256(data).hexdigest()[:10]
    name = f'ember.{digest}.{extension}'
    (root / name).write_bytes(data)
    html = re.sub(r'ember(?:\.[0-9a-f]{10})?\.' + extension, name, html)
    print(name)
page.write_text(html)
