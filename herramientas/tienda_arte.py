# Prepara los dibujos de los packs de oro y diamantes de la Tienda (assets/tienda/*.png):
# recorta lo transparente y los deja en 240 px por su lado mayor.
# Uso: python3 herramientas/tienda_arte.py   → docs/img/tienda/<nombre>.png
import os
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); SRC = os.path.join(R, 'assets/tienda'); OUT = os.path.join(R, 'docs/img/tienda')
os.makedirs(OUT, exist_ok=True)
for f in sorted(os.listdir(SRC)):
    if not f.endswith('.png'): continue
    im = Image.open(os.path.join(SRC, f)).convert('RGBA'); im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox())
    k = 240 / max(im.size); im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    im.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(os.path.join(OUT, f), optimize=True)
    print(f, im.size, os.path.getsize(os.path.join(OUT, f)) // 1024, 'KB')
