#!/usr/bin/env python3
"""Prepara el arte del Abismo del Despertar (assets/abismo -> docs/img/abismo).
- fondo.jpg (vertical, pantalla del Abismo) y cartel.jpg (horizontal, tarjeta de Eventos y fondo en horizontal)
- las 4 entradas con sus 3 trampas (vacío, lava, sombras), todas con el mismo recorte para que encajen igual
- cada entrada "a oscuras" (sin trampa a la vista): la de sombras con la boca rellena de negro
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
# a oscuras: el marco de piedra es igual en las tres trampas; lo que cambia entre ellas es el interior de la boca.
# Ese interior (sin las líneas finas de los bordes) se pinta de negro sobre la de sombras: se van los ojos.
for k in CAMINOS:
    v = [np.asarray(ims[(k, t)]).astype(int) for t in TRAMPAS]
    d = np.zeros(v[0].shape[:2], bool)
    for x in range(3):
        for y in range(x + 1, 3): d |= np.abs(v[x][..., :3] - v[y][..., :3]).sum(2) > 60
    d = nd.binary_opening(d, iterations=3)
    lab, n = nd.label(d); tam = nd.sum(d, lab, range(1, n + 1))
    d = np.isin(lab, [i + 1 for i, t in enumerate(tam) if t > 3000])
    boca = nd.binary_fill_holes(nd.binary_closing(d, iterations=8)) & (v[2][..., 3] > 200)
    h, w = boca.shape; g = np.linspace(0, 1, h)[:, None]
    out = v[2].astype(float)
    for ch, (c0, c1) in enumerate(zip([24, 18, 38], [7, 6, 14])): out[..., ch] = np.where(boca, (1 - g) * c0 + g * c1, out[..., ch])
    print(k, 'boca', int(boca.sum()), 'px')
    guarda(salida(Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')), os.path.join(O, f'{k}.png'))
# objetos
for n, dst in [('cuerda', os.path.join(O, 'cuerda.png')), ('antorcha', os.path.join(O, 'antorcha.png')), ('insignia', os.path.join(R, 'docs/img/insignia.png'))]:
    im = Image.open(os.path.join(A, n + '.png')).convert('RGBA'); im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox())
    s = 160 / max(im.size); guarda(im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS), dst)
print('ok', box)
