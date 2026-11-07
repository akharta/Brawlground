#!/usr/bin/env python3
"""Prepara el arte de la campaña para la app: assets/campana/*.png → docs/img/campana/.
Mapas (mapa_mundo.png, mapa_reino1.png): JPG de 1024 px de ancho. Iconos (icono_*.png): recortados y a 256 px.
Después hay que apuntar MAP_ART / ICON en prototipos/batalla/campana.js y volver a construir."""
import os, numpy as np
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
A = R + '/assets/campana'; O = R + '/docs/img/campana'; os.makedirs(O, exist_ok=True)
for f in sorted(os.listdir(A)):
    if not f.endswith('.png'): continue
    n = f[:-4]; im = Image.open(os.path.join(A, f))
    if n.startswith('mapa'):
        im = im.convert('RGB'); im = im.resize((1024, round(im.height * 1024 / im.width)), Image.LANCZOS)
        im.save(f'{O}/{n}.jpg', quality=86); print(n, im.size)
    else:
        im = im.convert('RGBA'); a = np.asarray(im)[..., 3] > 30; ys, xs = np.nonzero(a)
        im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)); s = 256 / max(im.size)
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS); im.save(f'{O}/{n}.png', optimize=True); print(n, im.size)
