# Fondo del reino alto (assets/reino/v2/reino_fondo.png, con el arrabal: Mercado negro y Altar del Retorno) y el recorte
# de cada lugar (para iluminarlo al tocarlo): dentro de su caja se quitan la hierba, el camino y el cielo y se queda la
# mancha más grande. Uso: python3 herramientas/reino_v2.py → docs/img/reino/reino.jpg, sel_<lugar>.png y su posición (%)
import os, json, numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); SRC = os.path.join(R, 'assets/reino/v2'); OUT = os.path.join(R, 'docs/img/reino')
RECT = {'trono': (235, 90, 700, 505), 'cripta': (110, 445, 375, 560), 'sanctum': (630, 275, 845, 560), 'taberna': (75, 615, 335, 850), 'consulado': (340, 585, 595, 845),
        'cuartel': (595, 625, 870, 885), 'murallas': (240, 900, 700, 1160), 'mercado': (80, 1195, 430, 1480), 'retorno': (515, 1155, 865, 1470)}
bg = Image.open(os.path.join(SRC, 'reino_fondo.png')).convert('RGB'); W, H = bg.size
from PIL import ImageFilter
K = 2   # se guarda al doble, con un poco de enfoque: en los móviles se ve nítido
grande = bg.resize((W * K, H * K), Image.LANCZOS).filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.UnsharpMask(radius=2.2, percent=110, threshold=1))
grande.save(os.path.join(OUT, 'reino.jpg'), quality=92, optimize=True, progressive=True, subsampling=0)
a = np.asarray(bg).astype(np.float32) / 255; mx = a.max(-1); mn = a.min(-1); dd = mx - mn + 1e-9; r, g, b = a[..., 0], a[..., 1], a[..., 2]
hue = np.where(mx == r, ((g - b) / dd) % 6, np.where(mx == g, (b - r) / dd + 2, (r - g) / dd + 4)) / 6; sat = (mx - mn) / (mx + 1e-9)
grass = (hue > 0.17) & (hue < 0.40) & (sat > 0.35) & (mx > 0.45)
sand = (hue > 0.07) & (hue < 0.14) & (sat > 0.2) & (sat < 0.55) & (mx > 0.75)
sky = (hue > 0.5) & (hue < 0.62) & (mx > 0.8) & (sat < 0.45)
fondo = ndimage.binary_opening(grass | sand | sky, iterations=2)
# máscara del azul del reino (tejados, banderas, estandartes): solo eso se pinta con tu color, con los bordes suaves.
# El Sanctum (morado y violeta) y el cielo no se tocan
azul = ((hue > 0.56) & (hue < 0.685) & (sat > 0.42) & (mx > 0.3)).astype(np.float32)
azul[int(H * 0.16):int(H * 0.34), int(W * 0.66):int(W * 0.92)] *= ((hue > 0.56) & (hue < 0.64))[int(H * 0.16):int(H * 0.34), int(W * 0.66):int(W * 0.92)]   # en el Sanctum, solo la bandera y el tejado azules
cielo = np.zeros_like(azul); cielo[:int(H * 0.08)] = ((mx > 0.78) & (sat < 0.62))[:int(H * 0.08)]; azul *= 1 - cielo
azul = ndimage.binary_opening(azul > 0.5, iterations=1).astype(np.float32)
azul = np.maximum(azul, ndimage.binary_dilation(azul > 0.5, iterations=1) * ((hue > 0.5) & (hue < 0.72) & (sat > 0.25)))   # el borde suave
mask = Image.fromarray((ndimage.gaussian_filter(azul, 0.7) * 255).clip(0, 255).astype(np.uint8))
mask.resize((W * K, H * K), Image.BILINEAR).save(os.path.join(OUT, 'reino_m.png'), optimize=True)
pos = {}
for n, (x0, y0, x1, y1) in RECT.items():
    zona = np.zeros((H, W), bool); zona[y0:y1, x0:x1] = True
    lab, nl = ndimage.label(zona & ~fondo); big = max(range(1, nl + 1), key=lambda i: (lab == i).sum())
    m = ndimage.binary_fill_holes(lab == big); m = ndimage.binary_closing(m, iterations=3) & zona; m = ndimage.binary_fill_holes(m)
    ys, xs = np.nonzero(m); bx0, by0, bx1, by1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    al = Image.fromarray((m[by0:by1, bx0:bx1] * 255).astype(np.uint8))
    piece = grande.crop((bx0 * K, by0 * K, bx1 * K, by1 * K)).convert('RGBA'); piece.putalpha(al.resize(((bx1 - bx0) * K, (by1 - by0) * K), Image.BILINEAR)); piece.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(os.path.join(OUT, 'sel_' + n + '.png'), optimize=True)
    mask.crop((bx0, by0, bx1, by1)).resize(((bx1 - bx0) * K, (by1 - by0) * K), Image.BILINEAR).save(os.path.join(OUT, 'sel_' + n + '_m.png'), optimize=True)
    pos[n] = [round(bx0 / W * 100, 3), round(by0 / H * 100, 3), round((bx1 - bx0) / W * 100, 3), round((by1 - by0) / H * 100, 3)]
for n in ('mercado', 'retorno'):   # los dibujos sueltos, para la cabecera de su pantalla y su cartel
    im = Image.open(os.path.join(SRC, n + '.png')).convert('RGBA'); im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 60 else 0).getbbox())
    k = 520 / max(im.size); im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS).save(os.path.join(OUT, n + '.png'), optimize=True)
    ic = im.resize((round(im.width * 96 / max(im.size)), round(im.height * 96 / max(im.size))), Image.LANCZOS); ic.save(os.path.join(OUT, 'ico_' + n + '.png'), optimize=True)
print(json.dumps({'size': [W, H], 'sel': pos}))
