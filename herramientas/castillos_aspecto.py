# Prepara los castillos de personalización (assets/castillos_aspecto/*.png) para el juego:
# recorta, deja 520 px de ancho como el castillo base y calcula el suelo del torreón (trono) y el arquero delantero.
# Si hay dibujo dañado (assets/castillos_aspecto/danado/<id>.png) o en ruinas (…/ruinas/<id>.png), vienen con el mismo
# encuadre que el intacto: se recortan con su misma caja y escala para que el trono y el arquero caigan en el mismo sitio.
# Uso: python3 herramientas/castillos_aspecto.py   → docs/img/castillos/<id>.png, <id>_d.png, <id>_r.png y aspectos.json
import json, os, numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); SRC = os.path.join(R, 'assets/castillos_aspecto'); OUT = os.path.join(R, 'docs/img/castillos')
os.makedirs(OUT, exist_ok=True); res = {}
abox = lambda im: im.getchannel('A').point(lambda v: 255 if v > 100 else 0).getbbox()


def hsv(im):
    a = np.asarray(im).astype(np.float32) / 255
    rgb = a[..., :3]; mx = rgb.max(-1); mn = rgb.min(-1); dd = mx - mn + 1e-9; r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    hue = np.where(mx == r, ((g - b) / dd) % 6, np.where(mx == g, (b - r) / dd + 2, (r - g) / dd + 4)) / 6
    return a, hue, mx, mn


def azules(im, ruinas=False):
    # solo los estandartes y los arqueros cambian de color con tu reino: el resto de azules intensos (ventanas de la luna,
    # hielo…) se apagan un pelo para que el juego no los repinte (azul con saturación > 0,72 y brillo > 0,62).
    # En las ruinas solo se queda el estandarte caído (la mancha azul más grande y lo que la toca).
    a, hue, mx, mn = hsv(im); Hh, Wd = a.shape[:2]
    sat = (mx - mn) / (mx + 1e-9); strong = (hue > 0.58) & (hue < 0.69) & (sat > 0.72) & (mx > 0.62) & (a[..., 3] > 0.5)
    lab, nl = ndimage.label(strong); keep = np.zeros_like(strong); ban = None; bsz = 0
    objs = ndimage.find_objects(lab); sizes = ndimage.sum(strong, lab, range(1, nl + 1)) if nl else []
    if ruinas and nl:
        big = int(np.argmax(sizes)); s0 = objs[big]; y0, y1, x0, x1 = s0[0].start - 6, s0[0].stop + 6, s0[1].start - 6, s0[1].stop + 6
        for i, sl in enumerate(objs):
            if i == big or (sizes[i] > 40 and sl[0].start < y1 and sl[0].stop > y0 and sl[1].start < x1 and sl[1].stop > x0): keep[sl] |= lab[sl] == i + 1
    else:
        for i, sl in enumerate(objs):
            c = lab[sl] == i + 1; n_ = c.sum(); cy = (sl[0].start + sl[0].stop) / 2 / Hh; cx = (sl[1].start + sl[1].stop) / 2 / Wd
            if (0.18 < cy < 0.62 and n_ > 300) or ((cx < 0.3 or cx > 0.7) and cy < 0.3 and n_ > 80):
                keep[sl] |= c
                if 0.35 < cx < 0.65 and n_ > bsz: bsz = n_; ban = [round(sl[1].start / Wd, 4), round(sl[0].start / Hh, 4), round((sl[1].stop - sl[1].start) / Wd, 4), round((sl[0].stop - sl[0].start) / Hh, 4)]
    off = strong & ~keep
    if off.any():
        px = np.asarray(im).copy(); f = px[off][..., :3].astype(np.float32); m_ = f.max(-1, keepdims=True); f = m_ - (m_ - f) * 0.68 / np.maximum(1e-6, (m_ - f.min(-1, keepdims=True)) / m_)
        px[off, :3] = np.clip(f, 0, 255).astype(np.uint8); im = Image.fromarray(px)
    return im, ban


guarda = lambda im, n: im.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(os.path.join(OUT, n + '.png'), optimize=True)
for f in sorted(os.listdir(SRC)):
    if not f.endswith('.png'): continue
    n = f[:-4]; src = Image.open(os.path.join(SRC, f)).convert('RGBA'); box = abox(src)
    im = src.crop(box)
    k = 520 / im.width; im = im.resize((520, round(im.height * k)), Image.LANCZOS)
    a, hue, mx, mn = hsv(im); Hh = im.height
    # capucha azul del arquero de la torre derecha: azul saturado, arriba a la derecha
    blue = (hue > 0.6) & (hue < 0.7) & ((mx - mn) / (mx + 1e-9) > 0.5) & (mx > 0.45) & (a[..., 3] > 0.5)
    zone = np.zeros_like(blue); zone[int(Hh * 0.08):int(Hh * 0.42), 360:] = True
    lab, nl = ndimage.label(blue & zone); sz = ndimage.sum(blue & zone, lab, range(1, nl + 1))
    tops = [(ndimage.find_objects(lab)[i][0].start, i) for i in range(nl) if sz[i] > 120]
    i = min(tops)[1]; sl = ndimage.find_objects(lab)[i]; hy = (sl[0].start + sl[0].stop) / 2; hx = (sl[1].start + sl[1].stop) / 2
    arch = [round(hx + 50), round(hy + 18)]
    plat = [260, round(Hh * 0.2)]   # el centro del suelo del torreón cae en todos hacia el 20 % del alto
    im, ban = azules(im); guarda(im, n)
    res[n] = {'h': Hh, 'plat': plat, 'arch': arch, 'ban': ban}
    # dañado (_d) y en ruinas (_r): misma caja en horizontal; en vertical crecen si el dibujo asoma por arriba o por abajo
    # (dy: lo que crece por arriba, para que el suelo del torreón siga en su sitio)
    for sub, suf in (('danado', 'd'), ('ruinas', 'r')):
        p = os.path.join(SRC, sub, f)
        if not os.path.exists(p): continue
        s2 = Image.open(p).convert('RGBA'); b2 = abox(s2); t, b = min(box[1], b2[1]), max(box[3], b2[3])
        im2 = s2.crop((box[0], t, box[2], b)).resize((520, round((b - t) * k)), Image.LANCZOS)
        im2, ban2 = azules(im2, ruinas=suf == 'r'); guarda(im2, n + '_' + suf)
        res[n][suf] = {'dy': round((box[1] - t) * k), 'h': im2.height}
        if suf == 'd' and ban2: res[n][suf]['ban'] = ban2
json.dump(res, open(os.path.join(OUT, 'aspectos.json'), 'w'), indent=0)
print(json.dumps(res))
