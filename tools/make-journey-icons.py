#!/usr/bin/env python3
"""Render Tom's Hair Journey home-screen icons.

Before → after scalp silhouettes with a center arrow, drawn at 4x and
downsampled for clean edges on the iOS Home Screen.

Usage: python3 tools/make-journey-icons.py
"""

import math
import os

from PIL import Image, ImageDraw

S = 1024
SS = 4
C = S * SS
MID = S / 2

# Deep forest → soft sage — distinct from the teal Health App mark
BG_TL = (28, 58, 48)
BG_BR = (52, 98, 82)
PANEL = (245, 242, 235)
INK = (22, 32, 28)
HAIR_BEFORE = (90, 78, 68)
HAIR_AFTER = (42, 34, 28)
ARROW = (212, 168, 90)
MUTED = (160, 150, 138)

OUT = "icons"
SIZES = {
    "icon-152.png": 152,
    "icon-167.png": 167,
    "icon-180.png": 180,
    "icon-192.png": 192,
    "icon-512.png": 512,
    "favicon-32.png": 32,
}


def px(v):
    return int(round(v * SS))


def gradient(canvas):
    d = ImageDraw.Draw(canvas)
    span = 2 * C
    for i in range(span):
        t = i / (span - 1)
        color = tuple(round(a + (b - a) * t) for a, b in zip(BG_TL, BG_BR))
        d.line([(i, 0), (i - C, C)], fill=color, width=2)


def round_panel(d, x0, y0, x1, y1, radius, fill):
    d.rounded_rectangle([px(x0), px(y0), px(x1), px(y1)], radius=px(radius), fill=fill)


def head_outline(cx, cy, scale=1.0):
    """Return ellipse bbox for a head silhouette."""
    w, h = 210 * scale, 250 * scale
    return [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]


def draw_hair_before(d, cx, cy, scale=1.0):
    """Sparse / receding hairline — few short strokes on the crown."""
    # Thin fringe high on the forehead (receded temples)
    strokes = [
        (-70, -95, -55, -70),
        (-40, -105, -28, -78),
        (-10, -110, 0, -82),
        (20, -105, 32, -78),
        (50, -95, 62, -70),
        (-55, -80, -48, -58),
        (45, -80, 52, -58),
        (-25, -88, -18, -65),
        (15, -88, 22, -65),
    ]
    width = max(2, int(7 * scale))
    for x0, y0, x1, y1 in strokes:
        d.line(
            [px(cx + x0 * scale), px(cy + y0 * scale),
             px(cx + x1 * scale), px(cy + y1 * scale)],
            fill=HAIR_BEFORE, width=px(width), joint="curve",
        )


def draw_hair_after(d, cx, cy, scale=1.0):
    """Fuller hair — denser crown and natural hairline."""
    # Filled crown cap
    bbox = [
        px(cx - 105 * scale), px(cy - 145 * scale),
        px(cx + 105 * scale), px(cy - 20 * scale),
    ]
    d.ellipse(bbox, fill=HAIR_AFTER)
    # Soft hairline scallops
    for i, ang in enumerate(range(-70, 75, 14)):
        rad = math.radians(ang)
        ox = math.sin(rad) * 95 * scale
        oy = -math.cos(rad) * 40 * scale - 55 * scale
        r = (14 + (i % 3) * 3) * scale
        d.ellipse(
            [px(cx + ox - r), px(cy + oy - r),
             px(cx + ox + r), px(cy + oy + r)],
            fill=HAIR_AFTER,
        )
    # Forward hairline strokes for texture
    for x0, y0, x1, y1 in [
        (-80, -40, -70, -5), (-50, -55, -42, -10), (-20, -62, -12, -12),
        (10, -62, 18, -12), (40, -55, 48, -10), (70, -40, 78, -5),
        (-65, -70, -58, -35), (55, -70, 62, -35),
    ]:
        d.line(
            [px(cx + x0 * scale), px(cy + y0 * scale),
             px(cx + x1 * scale), px(cy + y1 * scale)],
            fill=(55, 45, 38), width=px(max(2, int(5 * scale))),
        )


def draw_face(d, cx, cy, scale=1.0):
    """Minimal face cue so the silhouette reads as a head."""
    # Neck
    nw, nh = 70 * scale, 55 * scale
    d.rectangle(
        [px(cx - nw / 2), px(cy + 90 * scale),
         px(cx + nw / 2), px(cy + 90 * scale + nh)],
        fill=INK,
    )
    # Head
    x0, y0, x1, y1 = head_outline(cx, cy, scale)
    d.ellipse([px(x0), px(y0), px(x1), px(y1)], fill=INK)
    # Ears
    er = 22 * scale
    for side in (-1, 1):
        ex = cx + side * 108 * scale
        d.ellipse(
            [px(ex - er), px(cy - er * 0.3),
             px(ex + er), px(cy + er * 1.4)],
            fill=INK,
        )


def draw_arrow(d, cx, cy):
    """Center arrow pointing before → after."""
    shaft_y = cy
    left, right = cx - 48, cx + 48
    d.line([px(left), px(shaft_y), px(right - 18), px(shaft_y)],
           fill=ARROW, width=px(22))
    # Arrowhead
    tip = [(right, shaft_y), (right - 46, shaft_y - 36), (right - 46, shaft_y + 36)]
    d.polygon([(px(x), px(y)) for x, y in tip], fill=ARROW)


def render(scale=1.0):
    canvas = Image.new("RGBA", (C, C), BG_TL + (255,))
    gradient(canvas)
    d = ImageDraw.Draw(canvas)

    # Soft panels behind each portrait
    inset = 72
    round_panel(d, inset, 180, 460, 860, 48, PANEL)
    round_panel(d, 564, 180, S - inset, 860, 48, PANEL)

    # Before (left)
    bx, by = 266, 480
    draw_face(d, bx, by, scale=0.92 * scale)
    draw_hair_before(d, bx, by, scale=0.92 * scale)

    # After (right)
    ax, ay = 758, 480
    draw_face(d, ax, ay, scale=0.92 * scale)
    draw_hair_after(d, ax, ay, scale=0.92 * scale)

    # Arrow on the forest background between panels
    draw_arrow(d, MID, 510)

    # Tiny labels
    d.ellipse([px(MID - 8), px(900), px(MID + 8), px(916)], fill=MUTED)

    return canvas.convert("RGB").resize((S, S), Image.LANCZOS)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    master = render()
    master.save(os.path.join(OUT, "icon-1024.png"), optimize=True)
    for name, size in SIZES.items():
        master.resize((size, size), Image.LANCZOS).save(
            os.path.join(OUT, name), optimize=True
        )
    # Maskable: shrink artwork into the safe 80% center
    maskable = render(scale=0.78).resize((512, 512), Image.LANCZOS)
    maskable.save(os.path.join(OUT, "icon-maskable-512.png"), optimize=True)
    print("wrote", len(SIZES) + 2, "journey icons to", OUT)
