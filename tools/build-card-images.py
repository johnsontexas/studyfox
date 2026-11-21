"""Draws a 1200x630 share card for every hub, course and flashcard deck, so each page has its own image
for Google Images, link previews and og:image.

Reads assets/cards/cards.json (written by `npm run seo`) and writes assets/cards/<file>.png.
Run: npm run seo && python3 tools/build-card-images.py
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from PIL import Image, ImageDraw
import importlib.util

spec = importlib.util.spec_from_file_location("brand", Path(__file__).resolve().parent / "build-brand-images.py")
brand = importlib.util.module_from_spec(spec)
spec.loader.exec_module(brand)

OUT = brand.ASSETS / "cards"
W, H = 1200, 630


def wrap(d, text, f, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= width or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def render(c):
    img = Image.new("RGBA", (W, H), brand.DARK + (255,))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 14, H], fill=brand.BRAND)
    brand.draw_fox(img, 1010, 300, 280)
    d.text((84, 80), c["kicker"].upper(), font=brand.sans(30, True), fill=brand.BRAND_LIGHT)

    size = 92
    while size > 48:
        f = brand.font(brand.SERIF, size)
        lines = wrap(d, c["title"], f, 760)
        if len(lines) <= 3:
            break
        size -= 6
    y = 140
    for line in lines[:3]:
        d.text((80, y), line, font=f, fill=brand.WHITE)
        y += int(size * 1.15)

    sf = brand.sans(34, True)
    for line in wrap(d, c["sub"], sf, 760)[:2]:
        d.text((84, y + 24), line, font=sf, fill=(232, 239, 233))
        y += 46
    d.text((84, 540), "Free · No ads · studyfox.org", font=brand.sans(30), fill=(138, 153, 142))
    return img.convert("RGB")


def main():
    cards = json.loads((OUT / "cards.json").read_text())
    for c in cards:
        render(c).save(OUT / f"{c['file']}.png", optimize=True)
    print(f"wrote {len(cards)} cards to assets/cards/")


if __name__ == "__main__":
    main()
