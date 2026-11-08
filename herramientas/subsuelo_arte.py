# Prepara los fondos del subsuelo de la batalla (assets/subsuelo/<tema>.png, 1536×1024): uno por aspecto del castillo,
# con la cripta de tu bando a la izquierda (gemas cian) y la del rival a la derecha (gemas moradas).
# Mide en cada uno el muro del fondo de las dos criptas (donde se pone la bestia), su suelo y las gemas del bando,
# que el juego pinta con el color de cada reino.
# Uso: python3 herramientas/subsuelo_arte.py   → docs/img/subsuelo/<tema>.jpg y subsuelo.json
import json, os, numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); SRC = os.path.join(R, 'assets/subsuelo'); OUT = os.path.join(R, 'docs/img/subsuelo')
os.makedirs(OUT, exist_ok=True)
# muros que el contorno no cierra bien (se confunden con el arco o con la tierra): medidos a mano
FIJO = {('pagoda', 'L'): [95, 290, 415, 486], ('marea', 'L'): [88, 290, 402, 476]}
# franjas de la imagen: [0, XA] la cripta de la izquierda con su escalera, [XB, ancho] la de la derecha y en medio la tierra
XA, XB = 525, 922


def hsv(a):
    mx = a.max(-1); mn = a.min(-1); dd = mx - mn + 1e-9; r, g, b = a[..., 0], a[..., 1], a[..., 2]
    h = np.where(mx == r, ((g - b) / dd) % 6, np.where(mx == g, (b - r) / dd + 2, (r - g) / dd + 4)) / 6
    return h, (mx - mn) / (mx + 1e-9), mx


def muro(lum, sx, sy):
    # la zona clara rodeada por el contorno oscuro que contiene el punto (sx, sy); si se escapa, umbral más alto
    for t in (0.22, 0.3, 0.38, 0.46):
        lab, _ = ndimage.label(~(lum < t)); l = lab[sy, sx]
        if not l: continue
        ys, xs = np.nonzero(ndimage.binary_fill_holes(lab == l))
        if len(xs) > 15000 and xs.max() - xs.min() < 470 and ys.max() - ys.min() < 300: return [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]


res = {'xa': XA, 'xb': XB, 'temas': {}}
for f in sorted(os.listdir(SRC)):
    if not f.endswith('.png'): continue
    n = f[:-4]; im = Image.open(os.path.join(SRC, f)).convert('RGB'); a = np.asarray(im).astype(np.float32) / 255
    lum = a @ np.array([.299, .587, .114]); h, s, v = hsv(a); t = {}
    for lado, sx in (('L', 200), ('R', 1150)):
        x0, y0, x1, y1 = FIJO.get((n, lado)) or muro(lum, sx, 400)
        if y0 < 270: y0 = 295   # el muro se ha juntado con el arco (hielo): la bóveda empieza hacia aquí en todos
        # gemas del bando: en los dos pilares (a la altura de 395 a 470) y, si la tiene, en la clave del arco
        h0, h1 = (0.44, 0.58) if lado == 'L' else (0.70, 0.86)
        gm = (h >= h0) & (h <= h1) & (s > 0.4) & (v > 0.4); zona = np.zeros_like(gm)
        zona[395:472, x0 - 72:x0 + 2] = True; zona[395:472, x1 - 2:x1 + 100] = True; zona[y0 - 85:y0 + 5, x0 + 60:x1 - 40] = True
        gl, _ = ndimage.label(gm & zona); gemas = []
        for k, sl in enumerate(ndimage.find_objects(gl)):
            w_, h_ = sl[1].stop - sl[1].start, sl[0].stop - sl[0].start
            if 60 <= (gl[sl] == k + 1).sum() <= 2500 and 12 <= w_ <= 60 and 12 <= h_ <= 60 and 0.6 < w_ / h_ < 1.6: gemas.append([sl[1].start - 3, sl[0].start - 3, w_ + 6, h_ + 6])
        t[lado] = {'muro': [x0, y0, x1, y1], 'gemas': [[int(q) for q in g] for g in gemas]}
    # la clave del arco solo es gema del bando si las dos criptas la tienen (en el hielo y las setas es un adorno del tema)
    clave = {l: [g for g in t[l]['gemas'] if g[1] < 380] for l in 'LR'}
    if not (clave['L'] and clave['R']):
        for l in 'LR': t[l]['gemas'] = [g for g in t[l]['gemas'] if g[1] >= 380]
    t['fondo'] = '#%02x%02x%02x' % tuple(int(c) for c in np.asarray(im)[-24:].reshape(-1, 3).mean(0))
    res['temas'][n] = t
    im.save(os.path.join(OUT, n + '.jpg'), quality=95, optimize=True, progressive=True, subsampling=0)
    print(n, t['L']['muro'], len(t['L']['gemas']), '|', t['R']['muro'], len(t['R']['gemas']), t['fondo'], os.path.getsize(os.path.join(OUT, n + '.jpg')) // 1024, 'KB')
json.dump(res, open(os.path.join(OUT, 'subsuelo.json'), 'w'), separators=(',', ':'))
