#!/usr/bin/env python3
"""Prepara las escenas completas (fondo + camino + objetos ya integrados) para la batalla.
Mide la franja de tierra del camino de cada una y escribe prototipos/batalla/img/esc/escenas.json."""
import os, json, numpy as np
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
A = R + '/assets/escenario/escenas'; O = R + '/prototipos/batalla/img/esc'; os.makedirs(O, exist_ok=True)
info = {}
for f in sorted(os.listdir(A)):
    if not f.endswith('.png'): continue
    n = f[:-4]; im = Image.open(os.path.join(A, f)).convert('RGB'); a = np.asarray(im).astype(int); h, w, _ = a.shape
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    dirt = (r > 190) & (g > 130) & (g < 225) & (b < 190) & (r - g > 25)
    frac = dirt[:, 100:-100].mean(1); rows = [y for y in range(int(h * 0.6), h) if frac[y] > 0.6]
    im.resize((1440, round(h * 1440 / w)), Image.LANCZOS).save(f'{O}/{n}.jpg', quality=88)
    info[n] = {'t': round(min(rows) / h, 4), 'b': round(max(rows) / h, 4), 'w': w, 'h': h,
               'top': '#%02x%02x%02x' % tuple(a[2, w // 2]), 'bot': '#%02x%02x%02x' % tuple(a[-2, w // 2])}
json.dump(info, open(O + '/escenas.json', 'w'), indent=1)
print({k: (v['t'], v['b']) for k, v in info.items()})
