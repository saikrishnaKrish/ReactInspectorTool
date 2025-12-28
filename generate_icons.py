#!/usr/bin/env python3
"""
generate_icons.py

Create simple PNG icons (16x16, 48x48, 128x128) that match the SVG look:
blue rounded square, white circle, diagonal line.
This uses only the Python standard library (zlib, struct).
"""
import os
import zlib
import struct

OUT_DIR = os.path.join(os.path.dirname(__file__), 'icons')
os.makedirs(OUT_DIR, exist_ok=True)

def write_png(path, width, height, pixels):
    def png_pack(png_tag, data):
        chunk = png_tag.encode('ascii') + data
        return struct.pack('!I', len(data)) + chunk + struct.pack('!I', zlib.crc32(chunk) & 0xffffffff)

    # PNG file signature
    png = b'\x89PNG\r\n\x1a\n'
    # IHDR
    ihdr = struct.pack('!IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png += png_pack('IHDR', ihdr)

    # IDAT - raw RGBA -> filter bytes
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # no filter for this scanline
        offset = y * width * 4
        raw.extend(pixels[offset:offset + width * 4])

    compressed = zlib.compress(bytes(raw), level=9)
    png += png_pack('IDAT', compressed)
    png += png_pack('IEND', b'')

    with open(path, 'wb') as f:
        f.write(png)

def make_icon(size, outpath):
    # colors
    blue = (0x3b, 0x82, 0xf6, 255)
    white = (255,255,255,255)
    w = h = size
    pixels = bytearray(w * h * 4)

    # draw rounded rect background (approx by circle corners)
    radius = max(2, size // 6)

    def set_px(x,y,color):
        if 0 <= x < w and 0 <= y < h:
            i = (y * w + x) * 4
            pixels[i:i+4] = bytes(color)

    # fill background with blue
    for y in range(h):
        for x in range(w):
            set_px(x,y,blue)

    # draw white circle centered left-of-center
    cx = int(size * 10 / 24)
    cy = int(size * 10 / 24)
    r = int(size * 4 / 24)
    for y in range(h):
        for x in range(w):
            dx = x - cx
            dy = y - cy
            if dx*dx + dy*dy <= r*r:
                set_px(x,y,white)

    # draw diagonal stroke (simple Bresenham) in white
    x0 = int(size * 14 / 24)
    y0 = int(size * 14 / 24)
    x1 = int(size * 20 / 24)
    y1 = int(size * 20 / 24)
    dx = abs(x1 - x0)
    dy = -abs(y1 - y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1
    err = dx + dy
    while True:
        # draw small 2px dot to make line visible on tiny sizes
        for ox in (-1,0,1):
            for oy in (-1,0,1):
                set_px(x0+ox, y0+oy, white)
        if x0 == x1 and y0 == y1:
            break
        e2 = 2*err
        if e2 >= dy:
            err += dy
            x0 += sx
        if e2 <= dx:
            err += dx
            y0 += sy

    write_png(outpath, w, h, pixels)

def main():
    sizes = [(16, 'icon16.png'), (48, 'icon48.png'), (128, 'icon128.png')]
    for s, name in sizes:
        out = os.path.join(OUT_DIR, name)
        print('Generating', out)
        make_icon(s, out)
    print('Done')

if __name__ == '__main__':
    main()
