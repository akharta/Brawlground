# Prepara el arte de la interfaz (assets/interfaz): el fondo de la pantalla de carga, el fondo azul de las pantallas,
# los 8 botones de los lados de Campaña y las piezas de arriba (marco del avatar con su nivel, cápsulas de oro y de
# diamantes, barra de experiencia y su relleno). El halo de las piezas se recorta: queda solo lo opaco.
# Uso: python3 herramientas/interfaz_arte.py   → docs/img/ui/*
import os, numpy as np
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); SRC = os.path.join(R, 'assets/interfaz'); OUT = os.path.join(R, 'docs/img/ui')
os.makedirs(OUT, exist_ok=True)
for n in ('fondo_carga', 'fondo_azul'):
    Image.open(os.path.join(SRC, n + '.png')).convert('RGB').save(os.path.join(OUT, n + '.jpg'), quality=86, optimize=True, progressive=True)
def pieza(src, box, n, alto=None, ancho=None, corte=110):
    im = Image.open(os.path.join(SRC, 'campana', src + '.png')).convert('RGBA').crop(box)
    a = np.asarray(im).copy(); al = a[..., 3].astype(np.float32)
    a[..., 3] = np.clip((al - corte) * 255 / (255 - corte), 0, 255).astype(np.uint8)   # sin el halo
    im = Image.fromarray(a); im = im.crop(im.getchannel('A').getbbox())
    if alto: im = im.resize((round(im.width * alto / im.height), alto), Image.LANCZOS)
    if ancho: im = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
    im.save(os.path.join(OUT, n + '.png'), optimize=True); print(n, im.size)
for i, n in enumerate(('tropas', 'diario', 'misiones', 'jaulas', 'ofertas', 'correo', 'ranking', 'practica')):
    x, y = (56, 499, 943, 1386)[i % 4], (58, 501)[i // 4]
    pieza('botones', (x - 8, y - 8, x + 342, y + 354), 'b_' + n, alto=112)
pieza('piezas', (100, 70, 630, 580), 'avatar', alto=150)
pieza('piezas', (820, 80, 1400, 320), 'capsula_oro', alto=60)
pieza('piezas', (820, 335, 1400, 580), 'capsula_gema', alto=60)
pieza('piezas', (50, 655, 1490, 815), 'barra', alto=40)
pieza('piezas', (90, 870, 1445, 965), 'barra_relleno', alto=24)
