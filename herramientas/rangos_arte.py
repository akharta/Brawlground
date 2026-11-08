#!/usr/bin/env python3
"""Sellos de rango (assets/rangos -> docs/img/rangos): recorte al contorno, todos al mismo tamaño (alto 160).
Uso: python3 herramientas/rangos_arte.py"""
import os
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
A, O = os.path.join(R, 'assets/rangos'), os.path.join(R, 'docs/img/rangos'); os.makedirs(O, exist_ok=True)
for n in ['e', 'd', 'c', 'b', 'a', 's', 'splus']:
    im = Image.open(os.path.join(A, n + '.png')).convert('RGBA'); im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox())
    s = 160 / im.height; im = im.resize((round(im.width * s), 160), Image.LANCZOS)
    im.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(os.path.join(O, n + '.png'), optimize=True)
    print(n, im.size)
