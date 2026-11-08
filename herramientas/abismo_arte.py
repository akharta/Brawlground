#!/usr/bin/env python3
"""Prepara el arte del Abismo del Despertar (assets/abismo -> docs/img/abismo).
- fondo.jpg (vertical, pantalla del Abismo) y cartel.jpg (horizontal, tarjeta de Eventos y fondo en horizontal)
- las 4 entradas con sus 3 trampas (vacío, lava, sombras), todas con el mismo recorte para que encajen igual
- cada entrada "a oscuras" (sin trampa a la vista), de la hoja entradas.png
- cuerda, antorcha e insignia de mando (docs/img/insignia.png)
Uso: python3 herramientas/abismo_arte.py"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as nd
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
A = os.path.join(R, 'assets/abismo'); O = os.path.join(R, 'docs/img/abismo'); os.makedirs(O, exist_ok=True)
CAMINOS, TRAMPAS = ['gruta', 'cueva', 'grieta', 'tunel'], ['vacio', 'lava', 'sombras']
def guarda(im, path, colores=256):
    im.quantize(colores, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(path, optimize=True) if colores else im.save(path, optimize=True)
# fondos
Image.open(os.path.join(A, 'fondo_vertical.png')).convert('RGB').save(os.path.join(O, 'fondo.jpg'), quality=82, optimize=True, progressive=True)
c = Image.open(os.path.join(A, 'cartel.png')).convert('RGB'); c.resize((1280, round(1280 * c.height / c.width)), Image.LANCZOS).save(os.path.join(O, 'cartel.jpg'), quality=82, optimize=True, progressive=True)
# entradas: el mismo recorte para las 12 (la unión de sus contornos)
ims = {(k, t): Image.open(os.path.join(A, f'{k}_{t}.png')).convert('RGBA') for k in CAMINOS for t in TRAMPAS}
box = None
for im in ims.values():
    b = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
box = (box[0] - 6, box[1] - 6, box[2] + 6, box[3] + 6)
LADO = 300
def salida(im): im = im.crop(box); return im.resize((LADO, round(LADO * im.height / im.width)), Image.LANCZOS)
for (k, t), im in ims.items(): guarda(salida(im), os.path.join(O, f'{k}_{t}.png'))
# a oscuras: la hoja de las cuatro entradas vacías (2×2, en el orden gruta, cueva / grieta, túnel), cada una
# escalada y colocada sobre su versión con trampa para que al cambiar de una a otra la piedra no se mueva
hoja = Image.open(os.path.join(A, 'entradas.png')).convert('RGBA'); q = hoja.width // 2
caja = lambda im: im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
for n, k in enumerate(CAMINOS):
    x0, y0 = (n % 2) * q, (n // 2) * q
    pieza = hoja.crop((x0, y0, x0 + q, y0 + q)); pieza = pieza.crop(caja(pieza))
    ref = ims[(k, 'sombras')]; rb = caja(ref); rw, rh = rb[2] - rb[0], rb[3] - rb[1]
    mejor = None
    for ds in np.linspace(-0.02, 0.02, 9):   # ajuste fino: la escala y el sitio que mejor tapan la silueta de la de trampa
        sc = (rw / pieza.width + rh / pieza.height) / 2 * (1 + ds)
        p2 = pieza.resize((round(pieza.width * sc), round(pieza.height * sc)), Image.LANCZOS)
        for dx in range(-6, 7, 2):
            for dy in range(-6, 7, 2):
                lien = Image.new('RGBA', ref.size, (0, 0, 0, 0))
                lien.paste(p2, (round((rb[0] + rb[2] - p2.width) / 2) + dx, round((rb[1] + rb[3] - p2.height) / 2) + dy), p2)
                a1 = np.asarray(lien.getchannel('A')) > 128; a2 = np.asarray(ref.getchannel('A')) > 128
                iou = (a1 & a2).sum() / (a1 | a2).sum()
                if not mejor or iou > mejor[0]: mejor = (iou, lien)
    print(k, 'encaje', round(mejor[0], 4))
    guarda(salida(mejor[1]), os.path.join(O, f'{k}.png'))
# objetos
for n, dst in [('cuerda', os.path.join(O, 'cuerda.png')), ('antorcha', os.path.join(O, 'antorcha.png')), ('insignia', os.path.join(R, 'docs/img/insignia.png'))]:
    im = Image.open(os.path.join(A, n + '.png')).convert('RGBA'); im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox())
    s = 160 / max(im.size); guarda(im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS), dst)
print('ok', box)
