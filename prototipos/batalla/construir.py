#!/usr/bin/env python3
"""Monta la app en docs/ (lo que se publica en GitHub Pages):
  docs/index.html    = código de unidades del campo de pruebas (escena) + capa de batalla (batalla.js) + plantilla.html
  docs/practica.html = el campo de pruebas con un botón para volver al menú
  docs/img/          = imágenes de escena/img (las del escenario ya viven en docs/img/esc)
También deja build/artefacto.html: la misma app sin cabecera de documento, para publicarla como artifact.
Uso: python3 construir.py"""
import os, re, shutil, json
D = os.path.dirname(os.path.abspath(__file__))
R = os.path.abspath(os.path.join(D, '../..')); OUT = os.path.join(R, 'docs'); os.makedirs(os.path.join(OUT, 'img'), exist_ok=True)
esc = open(os.path.join(D, '../escena/index.html')).read()
script = esc[esc.index("<script>\n(() => {") + len('<script>\n'):]
core = script[:script.index('/* ---- Phaser ---- */')]
phaser = script[script.index('/* ---- Phaser ---- */'):script.index('function create() {')]
pre = re.search(r'preload\(\) \{\n(.*?)\n    \}, create, update', script, re.S).group(1)
def rep(a, b, n=1):
    global core
    assert core.count(a) == n, (core.count(a), a[:70]); core = core.replace(a, b)
# campo 1,5 veces más largo; el lienzo sigue siendo de 960
rep("const W = 960, HGT = 540", "const W = 2160, VW = 960, HGT = 540")
# en batalla las unidades se reparten más a lo ancho del camino
rep("Math.round(rand(-18, 16))", "Math.round(rand(-34, 30))")
# la velocidad de ataque depende de hechizos, bestias y habilidades de rango (atkK en reino.js)
assert core.count('u.cd -= dt') == 4, core.count('u.cd -= dt'); core = core.replace('u.cd -= dt', 'u.cd -= dt * atkK(u)')
# los colores de cada bando cambian según el color que elige el jugador y el del reino rival
rep("const OUT = 0x1e2235, BLUE = 0x3b82f6, PURPLE = 0x8b5cf6, STRING = 0xf6e3c6;", "const OUT = 0x1e2235, STRING = 0xf6e3c6; let BLUE = 0x3b82f6, PURPLE = 0x8b5cf6;")
# el castillo rival también es un objetivo
rep("const enemiesOf = u => units.filter(v => v.team !== u.team && v.alive && v.state !== 'die' && v.state !== 'spawn');",
    "const enemiesOf = u => units.filter(v => v.team !== u.team && v.alive && v.state !== 'die' && v.state !== 'spawn').concat(enemyCastle(u));")
# en batalla las bajas no vuelven: onDead lo define batalla.js
i = core.index('function onDead(u) {'); j = core.index('\n}\n', i) + 3; core = core[:i] + core[j:]
# los proyectiles recuerdan quién los lanzó (para las estadísticas)
core = core.replace('team: u.team, fromX: u.x }', 'team: u.team, fromX: u.x, src: u }')
rep("a.target.damage(a.dmg, null, a.fromX)", "a.target.damage(a.dmg, a.src || null, a.fromX)")
# costes desde las cartas de la escena
cost = {m.group(2): int(m.group(1)) for m in re.finditer(r'<div class="cost">(\d+)</div>\s*<div class="art"><img src="img/(\w+)_carta\.png"', esc)}
bat = (open(os.path.join(D, 'batalla.js')).read() + open(os.path.join(D, 'campana.js')).read() + open(os.path.join(D, 'hub.js')).read() + open(os.path.join(D, 'mejoras.js')).read() + open(os.path.join(D, 'celdas.js')).read() + ''.join(open(os.path.join(D, f)).read() for f in ['tienda.js', 'reino.js', 'eventos.js']) + '\n(document.fonts ? document.fonts.ready : Promise.resolve()).then(start, start);\n})();\n').replace('__COST__', json.dumps(cost)).replace('__PRELOAD__', pre).replace('__ICONOS__', json.dumps(json.load(open(os.path.join(OUT, 'img/campana/iconos.json'))))).replace('__ESC__', json.dumps(json.load(open(os.path.join(OUT, 'img/esc/escenas.json')))))
html = open(os.path.join(D, 'plantilla.html')).read().replace('{{SCRIPT}}', '<script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.80.1/phaser.min.js"></script>\n<script>\n' + core + phaser + bat + '</script>')
open(os.path.join(OUT, 'index.html'), 'w').write(html)
# versión para el artifact: sin doctype/html/head/body (el visor la envuelve) y sin lo propio de la app instalable
art = re.sub(r'<!--APP-->.*?<!--/APP-->\n?', '', html, flags=re.S)
for tag in ['<!doctype html>\n', '<html lang="es">\n', '<head>\n', '</head>\n', '<body>\n', '</body>\n', '</html>\n']: art = art.replace(tag, '', 1)
art = re.sub(r'<meta charset="utf-8">\n<meta name="viewport"[^>]*>\n', '', art, count=1)
os.makedirs(os.path.join(R, 'build'), exist_ok=True); open(os.path.join(R, 'build/artefacto.html'), 'w').write(art)
# práctica: el campo de pruebas tal cual, con su cabecera de documento y un botón de vuelta al menú
pr = esc.replace('<div class="seg" role="group" aria-label="Modo">', '<a class="btn" href="index.html#menu" style="text-decoration:none">← Menú</a>\n    <div class="seg" role="group" aria-label="Modo">', 1)
pr = '<!doctype html>\n<html lang="es">\n<head>\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + pr.replace('<style>', '<meta name="theme-color" content="#161b2b">\n<style>', 1) + '\n</html>\n'
open(os.path.join(OUT, 'practica.html'), 'w').write(pr)
src = os.path.join(D, '../escena/img'); dst = os.path.join(OUT, 'img')
for f in os.listdir(src): shutil.copy(os.path.join(src, f), os.path.join(dst, f))
print('ok', len(cost), 'cartas')
