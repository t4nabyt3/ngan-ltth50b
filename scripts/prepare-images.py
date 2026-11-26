#!/usr/bin/env python3
"""Download Hak5 product photos and create transparent PNG cutouts.

Usage:
  python -m pip install requests pillow numpy
  python scripts/prepare-images.py

The script reads official public image URLs listed below, downloads the source
photos, removes a near-white background connected to the image edges, and writes
transparent PNGs into public/images/. Review cutouts before using them publicly:
reflective/silver product parts can resemble a white background.
"""
from collections import deque
from pathlib import Path
import io
import sys

import numpy as np
import requests
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "images"
SOURCES = {
    "wifi-pineapple": "https://shop.hak5.org/cdn/shop/products/wp-mk7_81d03a53-bf1a-426f-9425-a34c8b3d9c85_1600x.jpg?v=1599680489",
    "rubber-ducky": "https://shop.hak5.org/cdn/shop/products/usb-rubber-ducky_mk2_1600x.jpg?v=1659974440",
    "bash-bunny": "https://shop.hak5.org/cdn/shop/products/bash-bunny-mk2_001_a71eaf45-5f2e-4156-ac45-5b782d25f62f_1600x.jpg?v=1624910237",
}


def remove_edge_background(image: Image.Image) -> Image.Image:
    """Make near-white pixels connected to the border transparent."""
    rgb = np.asarray(image.convert("RGB"))
    height, width, _ = rgb.shape
    max_channel = rgb.max(axis=2).astype(np.int16)
    min_channel = rgb.min(axis=2).astype(np.int16)
    brightness = rgb.mean(axis=2)
    # Restrict removal to neutral light pixels, not colored LEDs or circuitry.
    candidate = (brightness >= 226) & ((max_channel - min_channel) <= 34)
    visited = np.zeros((height, width), dtype=bool)
    queue = deque()

    # Seed the flood fill from all four image borders.
    for x in range(width):
        if candidate[0, x]:
            visited[0, x] = True
            queue.append((0, x))
        if candidate[height - 1, x] and not visited[height - 1, x]:
            visited[height - 1, x] = True
            queue.append((height - 1, x))
    for y in range(height):
        if candidate[y, 0] and not visited[y, 0]:
            visited[y, 0] = True
            queue.append((y, 0))
        if candidate[y, width - 1] and not visited[y, width - 1]:
            visited[y, width - 1] = True
            queue.append((y, width - 1))

    while queue:
        y, x = queue.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < height and 0 <= nx < width and candidate[ny, nx] and not visited[ny, nx]:
                visited[ny, nx] = True
                queue.append((ny, nx))

    # Soften cutout edges while retaining fully transparent background.
    alpha = np.where(visited, 0, 255).astype(np.uint8)
    alpha_image = Image.fromarray(alpha, mode="L").filter(ImageFilter.GaussianBlur(radius=0.65))
    rgba = image.convert("RGBA")
    rgba.putalpha(alpha_image)
    return rgba


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, url in SOURCES.items():
        print(f"Downloading {name}...")
        try:
            response = requests.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0 TryHackMyShop educational demo"})
            response.raise_for_status()
            raw = Image.open(io.BytesIO(response.content)).convert("RGB")
        except Exception as exc:
            print(f"  ERROR: {exc}", file=sys.stderr)
            continue
        raw_path = OUT / f"{name}-source.jpg"
        raw.save(raw_path, quality=94, optimize=True)
        cutout = remove_edge_background(raw)
        # Center on a transparent square canvas for consistent product cards.
        bbox = cutout.getbbox()
        if bbox:
            cutout = cutout.crop(bbox)
        cutout.thumbnail((920, 920), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
        x = (1024 - cutout.width) // 2
        y = (1024 - cutout.height) // 2
        canvas.alpha_composite(cutout, (x, y))
        out_path = OUT / f"{name}.png"
        canvas.save(out_path, optimize=True)
        print(f"  Wrote {out_path.relative_to(ROOT)} ({out_path.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
