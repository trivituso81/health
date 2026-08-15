#!/usr/bin/env python3
"""Render the Tom's Health App home-screen icons.

Everything is drawn at 4x and downsampled so the edges stay clean at 60px,
which is the size iOS actually shows on the Home Screen. Artwork is kept
inside a safe inset because iOS masks the square with a squircle and clips
roughly the outer tenth at each corner. The maskable variant shrinks the
same artwork into the middle 80% so Android's circular mask cannot crop it.

Usage: python3 tools/make-icons.py
"""

import os

from PIL import Image, ImageDraw

S = 1024          # nominal icon size
SS = 4            # supersample factor
C = S * SS        # working canvas
MID = S / 2

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


class Sketch:
    """Draws the mark at a given scale about the centre of the canvas."""

    def __init__(self, scale=1.0):
        self.scale = scale

    def px(self, v):
        return int(round(v * SS))

    def x(self, v):
        return self.px(MID + (v - MID) * self.scale)

    def r(self, v):
        return self.px(v * self.scale)

    def gradient(self, canvas):
        """135-degree linear gradient, drawn as bands along the diagonal."""
        d = ImageDraw.Draw(canvas)
        span = 2 * C
        for i in range(span):
            t = i / (span - 1)
            color = tuple(round(a + (b - a) * t) for a, b in zip(TEAL_TL, TEAL_BR))
            d.line([(i, 0), (i - C, C)], fill=color, width=2)

    def molecules(self, canvas):
        """Faint connected nodes, kept well inside the corner mask."""
        layer = Image.new("RGBA", (C, C), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        clusters = [
            [(206, 214, 46), (322, 290, 26), (188, 334, 20)],
            [(818, 214, 46), (802, 336, 26), (900, 290, 20)],
        ]
        for nodes in clusters:
            hx, hy, _ = nodes[0]
            for nx, ny, _ in nodes[1:]:
                d.line([self.x(hx), self.x(hy), self.x(nx), self.x(ny)],
                       fill=WHITE + (58,), width=max(1, self.r(3)))
            for nx, ny, rad in nodes:
                d.ellipse([self.x(nx) - self.r(rad), self.x(ny) - self.r(rad),
                           self.x(nx) + self.r(rad), self.x(ny) + self.r(rad)],
                          fill=WHITE + (72,))
        canvas.alpha_composite(layer)

    def pulse(self, canvas):
        """ECG trace under the mark — the 'health' cue, and the fun one."""
        d = ImageDraw.Draw(canvas)
        y = 826
        pts = [
            (176, y), (386, y), (424, y - 30), (462, y + 26),
            (512, y - 82), (562, y + 54), (600, y - 18), (638, y), (848, y),
        ]
        d.line([(self.x(a), self.x(b)) for a, b in pts],
               fill=MINT, width=self.r(22), joint="curve")
        for a, b in ((176, y), (848, y)):
            d.ellipse([self.x(a) - self.r(11), self.x(b) - self.r(11),
                       self.x(a) + self.r(11), self.x(b) + self.r(11)], fill=MINT)

    def monogram(self, canvas):
        """Geometric slab T built from two rounded rectangles."""
        d = ImageDraw.Draw(canvas)
        bar_w, bar_h, stem_w = 452, 116, 116
        top, bottom = 246, 664
        left = (S - bar_w) / 2
        d.rounded_rectangle([self.x(left), self.x(top),
                             self.x(left + bar_w), self.x(top + bar_h)],
                            radius=self.r(16), fill=WHITE)
        d.rounded_rectangle([self.x((S - stem_w) / 2), self.x(top),
                             self.x((S + stem_w) / 2), self.x(bottom)],
                            radius=self.r(16), fill=WHITE)

    def render(self):
        canvas = Image.new("RGBA", (C, C), TEAL_TL + (255,))
        self.gradient(canvas)
        self.molecules(canvas)
        self.pulse(canvas)
        self.monogram(canvas)
        return canvas.convert("RGB").resize((S, S), Image.LANCZOS)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    master = Sketch().render()
    master.save(os.path.join(OUT, "icon-1024.png"), optimize=True)
    for name, size in SIZES.items():
        master.resize((size, size), Image.LANCZOS).save(
            os.path.join(OUT, name), optimize=True)
    Sketch(scale=0.72).render().resize((512, 512), Image.LANCZOS).save(
        os.path.join(OUT, "icon-maskable-512.png"), optimize=True)
    print("wrote", len(SIZES) + 2, "icons to", OUT)
