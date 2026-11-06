#!/usr/bin/env python3
"""Monta batalla/index.html: código de unidades del campo de pruebas (escena) + capa de batalla (batalla.js) + plantilla.
Uso: python3 construir.py   (copia también las imágenes de escena/img a batalla/img)"""
import os, re, shutil, json
D = os.path.dirname(os.path.abspath(__file__))
esc = open(os.path.join(D, '../escena/index.html')).read()
script = esc[esc.index("<script>\n(() => {") + len('<script>\n'):]
core = script[:script.index('/* ---- Phaser ---- */')]
phaser = script[script.index('/* ---- Phaser ---- */'):script.index('function create() {')]
pre = re.search(r'preload\(\) \{\n(.*?)\n    \}, create, update', script, re.S).group(1)
def rep(a, b, n=1):
    global core
    assert core.count(a) == n, (core.count(a), a[:70]); core = core.replace(a, b)
# campo 1,5 veces más largo; el lienzo sigue siendo de 960
rep("const W = 960, HGT = 540", "const W = 1440, VW = 960, HGT = 540")
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
bat = open(os.path.join(D, 'batalla.js')).read().replace('__COST__', json.dumps(cost)).replace('__PRELOAD__', pre).replace('__ESC__', json.dumps(json.load(open(os.path.join(D, 'img/esc/esc.json')))))
html = open(os.path.join(D, 'plantilla.html')).read().replace('{{SCRIPT}}', '<script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.80.1/phaser.min.js"></script>\n<script>\n' + core + phaser + bat + '</script>')
open(os.path.join(D, 'index.html'), 'w').write(html)
src = os.path.join(D, '../escena/img'); dst = os.path.join(D, 'img')
for f in os.listdir(src): shutil.copy(os.path.join(src, f), os.path.join(dst, f))
print('ok', len(cost), 'cartas')
