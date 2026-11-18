"""Draws StudyFox's raster brand images from the fox mark in assets/logo-mark.svg.

Outputs (in assets/):
  logo-512.png       Organization logo for Google (square, dark tile)
  favicon-48/96/192  PNG favicons; Google Search shows a raster icon next to results
  og-image.png       1200x630 share card used by og:image / twitter:card on every page

Run: python3 tools/build-brand-images.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"

DARK = (10, 15, 12)
BRAND = (31, 107, 71)
BRAND_LIGHT = (95, 207, 148)
ORANGE = (249, 168, 37)
CREAM = (255, 248, 236)
INK = (26, 26, 26)
WHITE = (255, 255, 255)

# Fox geometry, in the SVG's own coordinates (viewBox -2 2 70 62)
HEAD = [(8, 6), (24, 20), (40, 20), (56, 6), (54, 36), (32, 60), (10, 36)]
MUZZLE = [(10, 36), (32, 60), (54, 36), (42, 32), (32, 41), (22, 32)]
NOSE = [(26.5, 54), (37.5, 54), (32, 60)]
EYES = [(23, 28), (41, 28)]


def draw_fox(img, cx, cy, size):
    """Draws the fox centred on (cx, cy), `size` px wide, supersampled for smooth edges."""
    ss = 4
    w = int(size * ss)
    scale = w / 70
    h = int(62 * scale)
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    def pts(poly):
        return [((x + 2) * scale, (y - 2) * scale) for x, y in poly]

    # white outline (the SVG strokes the head 6 units wide)
    outline = int(3 * scale)
    d.polygon(pts(HEAD), fill=WHITE)
    for p in pts(HEAD):
        d.ellipse([p[0] - outline, p[1] - outline, p[0] + outline, p[1] + outline], fill=WHITE)
    d.line(pts(HEAD) + [pts(HEAD)[0]], fill=WHITE, width=outline * 2, joint="curve")
    d.polygon(pts(HEAD), fill=ORANGE)
    d.polygon(pts(MUZZLE), fill=CREAM)
    d.polygon(pts(NOSE), fill=INK)
    r = 3 * scale
    for x, y in EYES:
        px, py = (x + 2) * scale, (y - 2) * scale
        d.ellipse([px - r, py - r, px + r, py + r], fill=INK)

    layer = layer.resize((int(size), int(size * 62 / 70)), Image.LANCZOS)
    img.alpha_composite(layer, (int(cx - layer.width / 2), int(cy - layer.height / 2)))


def tile(size, radius_ratio=0.22):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * radius_ratio), fill=DARK)
    draw_fox(img, size / 2, size / 2 + size * 0.03, size * 0.74)
    return img


def font(names, size):
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


SERIF = ["/System/Library/Fonts/Supplemental/Georgia Bold.ttf", "DejaVuSerif-Bold.ttf"]
SANS_BOLD = [("/System/Library/Fonts/Avenir Next.ttc"), "DejaVuSans-Bold.ttf"]


def sans(size, bold=False):
    try:
        return ImageFont.truetype("/System/Library/Fonts/Avenir Next.ttc", size, index=0 if bold else 7)
    except OSError:
        return font(["DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"], size)


def og_image():
    W, H = 1200, 630
    img = Image.new("RGBA", (W, H), DARK + (255,))
    d = ImageDraw.Draw(img)

    # soft green glow behind the fox
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i in range(60, 0, -1):
        a = int(4 * (60 - i) / 60 * 3)
        r = 210 + i * 4
        gd.ellipse([930 - r, 315 - r, 930 + r, 315 + r], fill=BRAND + (a,))
    img.alpha_composite(glow)

    draw_fox(img, 930, 330, 380)

    d.text((80, 120), "StudyFox", font=font(SERIF, 104), fill=WHITE)
    d.text((84, 262), "Free study material for", font=sans(42, True), fill=(232, 239, 233))
    d.text((84, 314), "every AP class, SAT & ACT", font=sans(42, True), fill=BRAND_LIGHT)

    # pills
    x = 84
    for label in ["49 courses", "301 lessons", "Flashcards"]:
        f = sans(28, True)
        tw = d.textlength(label, font=f)
        d.rounded_rectangle([x, 410, x + tw + 44, 466], radius=28, fill=(26, 51, 38), outline=(47, 92, 66), width=2)
        d.text((x + 22, 421), label, font=f, fill=(232, 239, 233))
        x += tw + 64

    d.text((84, 520), "No ads. No paywalls.  studyfox.org", font=sans(30), fill=(138, 153, 142))
    return img.convert("RGB")


def main():
    tile(512).save(ASSETS / "logo-512.png", optimize=True)
    big = tile(768)
    for s in (48, 96, 192):
        big.resize((s, s), Image.LANCZOS).save(ASSETS / f"favicon-{s}.png", optimize=True)
    og_image().save(ASSETS / "og-image.png", optimize=True)
    print("wrote logo-512.png, favicon-48/96/192.png, og-image.png")


if __name__ == "__main__":
    main()
