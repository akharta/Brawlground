# Prepara la barra de abajo (assets/interfaz/barra): el marco, las baldosas de los botones (normal y seleccionada, sin
# icono: se borra el dibujo de dentro rellenando cada fila con el color del fondo de la baldosa) y los cinco iconos.
# Uso: python3 herramientas/barra_arte.py   → docs/img/barra/*.png
import os, numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); SRC = os.path.join(R, 'assets/interfaz/barra'); OUT = os.path.join(R, 'docs/img/barra')
os.makedirs(OUT, exist_ok=True)
guarda = lambda im, n: im.save(os.path.join(OUT, n + '.png'), optimize=True)
abox = lambda im: im.getchannel('A').point(lambda v: 255 if v > 60 else 0).getbbox()
# marco: recortado, a 1000 px de ancho
m = Image.open(os.path.join(SRC, 'marco.png')).convert('RGBA'); m = m.crop(abox(m)); m = m.resize((1000, round(m.height * 1000 / m.width)), Image.LANCZOS); guarda(m, 'marco'); print('marco', m.size)
# baldosas: la última (normal) y la del medio (seleccionada)
b = np.asarray(Image.open(os.path.join(SRC, 'botonera.png')).convert('RGBA')).astype(np.float32)
for n, (x0, y0, x1, y1) in (('boton', (1704, 214, 2103, 589)), ('boton_sel', (892, 213, 1285, 590))):   # normal: la de Eventos, que es la que se vacía limpia
    t = b[y0:y1, x0:x1].copy(); H, W = t.shape[:2]
    # el fondo de la baldosa: lo que se parece al color de un punto del interior y está conectado a él; el icono son los
    # huecos que quedan dentro, y se rellenan con el color de fondo de su fila (es un degradado de arriba abajo)
    ref = np.median(t[H // 2 - 10:H // 2 + 10, 44:52, :3].reshape(-1, 3), 0)
    lab, _ = ndimage.label(np.abs(t[..., :3] - ref).max(-1) < 30); fon = lab == lab[H // 2, 48]
    dentro = ndimage.binary_fill_holes(fon); hueco = ndimage.binary_dilation(dentro & ~fon, iterations=3) & dentro
    fila = np.array([np.median(t[y, fon[y], :3], 0) if fon[y].sum() > 5 else ref for y in range(H)])
    fila = ndimage.uniform_filter1d(fila, 9, axis=0)
    yy = np.nonzero(hueco)[0]; t[hueco, :3] = fila[yy]
    im = Image.fromarray(np.clip(t, 0, 255).astype(np.uint8)); im = im.resize((160, round(H * 160 / W)), Image.LANCZOS); guarda(im, n); print(n, im.size)
# iconos: recortados, a 128 px por su lado mayor
for n in ('tienda', 'reino', 'campana', 'ejercito', 'eventos'):
    im = Image.open(os.path.join(SRC, n + '.png')).convert('RGBA'); im = im.crop(abox(im))
    k = 128 / max(im.size); im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS); guarda(im, n); print(n, im.size)
