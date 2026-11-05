# Ficha de equilibrio

1. Sirve la escena: `cd prototipos/escena && python3 -m http.server 8789`
2. Lanza los duelos: `node herramientas/equilibrio/simular.js` (con Playwright; `PHASER=/ruta/phaser.min.js` para usar una copia local)
3. Genera la ficha: `python3 herramientas/equilibrio/generar.py` → `ficha.html`

Las notas de «Lo que veo en esta ronda» están en `plantilla.html` y se escriben a mano en cada ronda.
