#!/usr/bin/env python3
"""Pasa al juego (prototipos/escena) los valores de la tabla de personajes.
Uso: python3 aplicar.py <carpeta con un JSON por personaje, como los guarda la tabla>"""
import json, os, re, sys
D = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(D, '../../prototipos/escena/index.html')
src = sys.argv[1]
s = open(P).read()
T = {}
for f in os.listdir(src):
    j = json.load(open(os.path.join(src, f))); T[f[:-5]] = j.get('data', j)
def num(x): return ('%g' % x)
i0 = s.index('const CH = {'); i1 = s.index('const SKEL'); CHs = s[i0:i1]
def span(txt, k):
    m = re.search(r'\n  %s: \{' % k, txt); nx = re.search(r'\n  (?://|\w+: \{)', txt[m.end():])
    return m.start(), m.end() + (nx.start() if nx else len(txt) - m.end())
def patch(k, field, val):
    global CHs
    a, b = span(CHs, k); seg = CHs[a:b]
    pat = re.compile(r'(\b%s: )(\[[^\]]*\]|H \* [\d.]+|[\d.]+)' % field)
    assert pat.search(seg), (k, field)
    CHs = CHs[:a] + pat.sub(lambda m: m.group(1) + val, seg, count=1) + CHs[b:]
for k, r in T.items():
    patch(k, 'hp', num(r['vida'])); patch(k, 'speed', num(r['velocidad'])); patch(k, 'range', 'H * ' + num(r['alcance']))
    patch(k, 'cd', '[%s, %s]' % (num(r['cadMin']), num(r['cadMax'])))
    dk = {'centinela': 'snipe', 'fraile': 'heal'}.get(k, 'dmg')
    patch(k, dk, '[%s, %s]' % (num(r['danoMin']), num(r['danoMax'])))
s = s[:i0] + CHs + s[i1:]
# rarezas
m = re.search(r'const RARITY = \{[^}]*\};', s)
s = s.replace(m.group(0), 'const RARITY = { ' + ', '.join(f"{k}: '{T[k]['rareza']}'" for k in T) + ' };')
# cartas: coste, rareza, vida y daño medio (solo donde la carta muestra un número de daño simple)
CLS = {'comun': '', 'poco': 'uncommon', 'rara': 'rare', 'epica': 'epic', 'legendaria': 'legend', 'ascendida': 'ascended'}
LAB = {'comun': 'Común', 'poco': 'Poco común', 'rara': 'Rara', 'epica': 'Épica', 'legendaria': 'Legendaria', 'ascendida': 'Ascendida'}
for k, r in T.items():
    m = re.search(r'<div class="cardbox">\s*<div class="card[^"]*"(?:(?!</dl>).)*?img/%s_carta\.png.*?</dl>' % k, s, re.S)
    assert m, k
    blk = m.group(0); nb = re.sub(r'<div class="card(?: [a-z]+)?" aria-label', '<div class="card' + (' ' + CLS[r['rareza']] if CLS[r['rareza']] else '') + '" aria-label', blk, count=1)
    nb = re.sub(r'<div class="cost">\d+</div>', '<div class="cost">%d</div>' % r['coste'], nb, count=1)
    nb = re.sub(r'<div class="rar">[^<]*</div>', '<div class="rar">%s</div>' % LAB[r['rareza']], nb, count=1)
    nb = re.sub(r'(<dt>Vida</dt><dd>)[^<]*', lambda mm: mm.group(1) + num(r['vida']), nb, count=1)
    avg = round((r['danoMin'] + r['danoMax']) / 2)
    nb = re.sub(r'(<dt>Daño</dt><dd>)\d+', lambda mm: mm.group(1) + str(avg), nb, count=1)
    s = s.replace(blk, nb)
open(P, 'w').write(s); print('aplicados', len(T))
