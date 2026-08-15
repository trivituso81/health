#!/usr/bin/env python3
"""Render the Tom's Health App home-screen icons.

Everything is drawn at 4x and downsampled so the edges stay clean at 60px,
which is the size iOS actually shows on the Home Screen. Artwork is kept
inside a safe inset because iOS masks the square with a squircle and clips
roughly the outer tenth at each corner.

Usage: python3 tools/make-icons.py
"""

from PIL import Image, ImageDraw

S = 1024          # nominal icon size
SS = 4            # supersample factor
C = S * SS        # working canvas

TEAL_TL = (13, 122, 111)     # --accent  #0d7a6f
TEAL_BR = (18, 165, 148)     # brand-mark gradient end #12a594
WHITE = (255, 255, 255)
MINT = (168, 232, 219)

OUT = "icons"
SIZES = {
    "icon-152.png": 152,     # iPad
    "icon-167.png": 167,     # iPad Pro
    "icon-180.png": 180,     # iPhone apple-touch-icon
    "icon-192.png": 192,     # manifest
    "icon-512.png": 512,     # manifest / launch screen
    "favicon-32.png": 32,
}


def px(v):
    return int(round(v * SS))


def gradient(canvas):
    """135-degree linear gradient, drawn as horizontal bands along the diagonal."""
    d = ImageDraw.Draw(canvas)
    span = 2 * C
    for i in range(span):
        t = i / (span - 1)
        color = tuple(round(a + (b - a) * t) for a, b in zip(TEAL_TL, TEAL_BR))
        d.line([(i, 0), (i - C, C)], fill=color, width=2)


def molecules(canvas):
    """Faint connected nodes, kept well inside the corner mask."""
    layer = Image.new("RGBA", (C, C), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    clusters = [
        [(206, 214, 46), (322, 290, 26), (188, 334, 20)],
        [(818, 214, 46), (802, 336, 26), (900, 290, 20)],
    ]
    for nodes in clusters:
        hub = nodes[0]
        for node in nodes[1:]:
            d.line([px(hub[0]), px(hub[1]), px(node[0]), px(node[1])],
                   fill=WHITE + (58,), width=px(3))
        for x, y, r in nodes:
            d.ellipse([px(x - r), px(y - r), px(x + r), px(y + r)],
                      fill=WHITE + (72,))
    canvas.alpha_composite(layer)


def pulse(canvas):
    """ECG trace under the mark — the 'health' cue, and the fun one."""
    d = ImageDraw.Draw(canvas)
    y = 826
    pts = [
        (176, y), (386, y), (424, y - 30), (462, y + 26),
        (512, y - 82), (562, y + 54), (600, y - 18), (638, y), (848, y),
    ]
    d.line([(px(x), px(v)) for x, v in pts],
           fill=MINT, width=px(22), joint="curve")
    for x, v in ((176, y), (848, y)):
        d.ellipse([px(x - 11), px(v - 11), px(x + 11), px(v + 11)], fill=MINT)


def monogram(canvas):
    """Geometric slab T built from two rounded rectangles."""
    d = ImageDraw.Draw(canvas)
    bar_w, bar_h = 452, 116
    stem_w = 116
    top, bottom = 246, 664
    left = (S - bar_w) / 2
    d.rounded_rectangle([px(left), px(top), px(left + bar_w), px(top + bar_h)],
                        radius=px(16), fill=WHITE)
    d.rounded_rectangle([px((S - stem_w) / 2), px(top), px((S + stem_w) / 2), px(bottom)],
                        radius=px(16), fill=WHITE)


def build():
    canvas = Image.new("RGBA", (C, C), TEAL_TL + (255,))
    gradient(canvas)
    molecules(canvas)
    pulse(canvas)
    monogram(canvas)
    return canvas.convert("RGB").resize((S, S), Image.LANCZOS)


if __name__ == "__main__":
    import os

    os.makedirs(OUT, exist_ok=True)
    master = build()
    master.save(os.path.join(OUT, "icon-1024.png"), optimize=True)
    for name, size in SIZES.items():
        master.resize((size, size), Image.LANCZOS).save(
            os.path.join(OUT, name), optimize=True)
    print("wrote", len(SIZES) + 1, "icons to", OUT)
