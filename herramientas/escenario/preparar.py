#!/usr/bin/env python3
"""Prepara el escenario para la batalla: fondos (JPG), caminos con la hierba
transparente y piezas de decoración reducidas. Escribe prototipos/batalla/img/esc/ y esc.json."""
import os, json, glob, numpy as np
from PIL import Image
from scipy import ndimage as nd
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
A = R + '/assets/escenario'; O = R + '/docs/img/esc'; os.makedirs(O, exist_ok=True)
info = {'fondos': {}, 'caminos': {}, 'deco': {}}
for f in sorted(glob.glob(A + '/fondos/*.png')):
    n = os.path.basename(f)[:-4]; im = Image.open(f).convert('RGB'); a = np.asarray(im).astype(int)
    h, w, _ = a.shape
    # horizonte: primera fila (desde abajo) que deja de ser el prado liso
    grass = np.median(a[-40:].reshape(-1, 3), 0)
    rowdev = np.abs(a - grass).sum(2).mean(1)
    hz = h - 1
    while hz > 0 and rowdev[hz] < 25: hz -= 1
    out = a
    Image.fromarray(out.astype(np.uint8)).resize((1200, round(h * 1200 / w)), Image.LANCZOS).save(f'{O}/{n}.jpg', quality=86)
    info['fondos'][n] = {'hz': hz / h, 'grass': '#%02x%02x%02x' % tuple(int(v) for v in grass), 'w': w, 'h': h}
for f in sorted(glob.glob(A + '/caminos/*.png')):
    n = os.path.basename(f)[:-4]; a = np.asarray(Image.open(f).convert('RGB')).astype(int); h, w, _ = a.shape
    L = a.mean(2)
    # contorno oscuro de cada borde: filas con más píxeles oscuros en el 20 % superior / inferior
    dk = (L < 70)
    alpha = np.full((h, w), 255, np.uint8)
    for x in range(w):
        col = dk[:, x]
        t = np.nonzero(col[: h // 4])[0]; b = np.nonzero(col[3 * h // 4:])[0]
        if len(t): alpha[: t.max() - 2, x] = 0
        if len(b): alpha[3 * h // 4 + b.min() + 3:, x] = 0
    # matas: lo que no es prado liso por encima del contorno se conserva
    grass_t = np.median(a[5:20].reshape(-1, 3), 0); grass_b = np.median(a[-20:-5].reshape(-1, 3), 0)
    keep = np.zeros((h, w), bool)
    keep[: h // 4] = np.abs(a[: h // 4] - grass_t).sum(2) > 45
    keep[3 * h // 4:] = np.abs(a[3 * h // 4:] - grass_b).sum(2) > 45
    keep = nd.binary_opening(keep, iterations=1); keep = nd.binary_dilation(keep, iterations=1)
    alpha[keep] = 255
    rgba = np.dstack([a, alpha]).astype(np.uint8)
    im = Image.fromarray(rgba); im = im.resize((1440, round(h * 1440 / w)), Image.LANCZOS)
    im.save(f'{O}/{n}.png', optimize=True)
    full = np.nonzero((np.asarray(im)[..., 3] > 200).mean(1) > 0.97)[0]
    info['caminos'][n] = {'w': im.width, 'h': im.height, 't': round(full.min() / im.height, 3), 'b': round(full.max() / im.height, 3)}
for f in sorted(glob.glob(A + '/decoracion/*.png')):
    n = os.path.basename(f)[:-4]; im = Image.open(f); s = 200 / max(im.size)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS); im.save(f'{O}/{n}.png', optimize=True)
    info['deco'][n] = [im.width, im.height]
json.dump(info, open(O + '/esc.json', 'w'), indent=1)
print("ok", len(info["fondos"]), "fondos", len(info["caminos"]), "caminos", len(info["deco"]), "piezas")
