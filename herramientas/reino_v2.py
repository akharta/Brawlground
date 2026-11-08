# Fondo del reino alto (assets/reino/v2/reino_fondo.png, con el arrabal: Mercado negro y Altar del Retorno) y el recorte
# de cada lugar (para iluminarlo al tocarlo): dentro de su caja se quitan la hierba, el camino y el cielo y se queda la
# mancha más grande. Uso: python3 herramientas/reino_v2.py → docs/img/reino/reino.jpg, sel_<lugar>.png y su posición (%)
import os, json, numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); SRC = os.path.join(R, 'assets/reino/v2'); OUT = os.path.join(R, 'docs/img/reino')
RECT = {'trono': (190, 6, 725, 480), 'cripta': (22, 418, 345, 548), 'sanctum': (662, 215, 882, 548), 'taberna': (0, 615, 300, 870), 'consulado': (305, 570, 600, 868),
        'cuartel': (600, 618, 908, 918), 'murallas': (190, 935, 722, 1210), 'mercado': (10, 1265, 412, 1612), 'retorno': (510, 1225, 908, 1595)}
bg = Image.open(os.path.join(SRC, 'reino_fondo.png')).convert('RGB'); W, H = bg.size
bg.save(os.path.join(OUT, 'reino.jpg'), quality=90, optimize=True, progressive=True)
a = np.asarray(bg).astype(np.float32) / 255; mx = a.max(-1); mn = a.min(-1); dd = mx - mn + 1e-9; r, g, b = a[..., 0], a[..., 1], a[..., 2]
hue = np.where(mx == r, ((g - b) / dd) % 6, np.where(mx == g, (b - r) / dd + 2, (r - g) / dd + 4)) / 6; sat = (mx - mn) / (mx + 1e-9)
grass = (hue > 0.17) & (hue < 0.40) & (sat > 0.35) & (mx > 0.45)
sand = (hue > 0.07) & (hue < 0.14) & (sat > 0.2) & (sat < 0.55) & (mx > 0.75)
sky = (hue > 0.5) & (hue < 0.62) & (mx > 0.8) & (sat < 0.45)
fondo = ndimage.binary_opening(grass | sand | sky, iterations=2)
pos = {}
for n, (x0, y0, x1, y1) in RECT.items():
    zona = np.zeros((H, W), bool); zona[y0:y1, x0:x1] = True
    lab, nl = ndimage.label(zona & ~fondo); big = max(range(1, nl + 1), key=lambda i: (lab == i).sum())
    m = ndimage.binary_fill_holes(lab == big); m = ndimage.binary_closing(m, iterations=3) & zona; m = ndimage.binary_fill_holes(m)
    ys, xs = np.nonzero(m); bx0, by0, bx1, by1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    al = Image.fromarray((m[by0:by1, bx0:bx1] * 255).astype(np.uint8))
    piece = bg.crop((bx0, by0, bx1, by1)).convert('RGBA'); piece.putalpha(al); piece.save(os.path.join(OUT, 'sel_' + n + '.png'), optimize=True)
    pos[n] = [round(bx0 / W * 100, 3), round(by0 / H * 100, 3), round((bx1 - bx0) / W * 100, 3), round((by1 - by0) / H * 100, 3)]
for n in ('mercado', 'retorno'):   # los dibujos sueltos, para la cabecera de su pantalla y su cartel
    im = Image.open(os.path.join(SRC, n + '.png')).convert('RGBA'); im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 60 else 0).getbbox())
    k = 520 / max(im.size); im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS).save(os.path.join(OUT, n + '.png'), optimize=True)
    ic = im.resize((round(im.width * 96 / max(im.size)), round(im.height * 96 / max(im.size))), Image.LANCZOS); ic.save(os.path.join(OUT, 'ico_' + n + '.png'), optimize=True)
print(json.dumps({'size': [W, H], 'sel': pos}))
