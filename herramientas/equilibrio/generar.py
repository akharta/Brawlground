#!/usr/bin/env python3
"""Genera ficha.html (ficha de equilibrio) a partir de datos.json (simular.js) y de las cartas de la escena."""
import json, re, html, os
D = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(D, 'datos.json')))
src = open(os.path.join(D, '../../prototipos/escena/index.html')).read()
CH, RAR, NAMES, H = d['data']['CH'], d['data']['RARITY'], d['data']['NAMES'], d['data']['H']
keys = list(NAMES)
cards = {}
for m in re.finditer(r'<div class="cost">(\d+)</div>\s*<div class="art"><img src="img/(\w+)_carta.png".*?<dl>(.*?)</dl>', src, re.S):
    cards[m.group(2)] = (int(m.group(1)), re.findall(r'<dt>(.*?)</dt><dd>(.*?)</dd>', m.group(3)))
def card(k): return cards.get(k, (None, []))
RN = {'comun': 'Común', 'poco': 'Poco común', 'rara': 'Rara', 'epica': 'Épica', 'legendaria': 'Legendaria', 'ascendida': 'Ascendida'}
# duelos
W = {k: [0, 0] for k in keys}; M = {}
for r in d['duels']:
    for x, y, win, hp, t in [(r['a'], r['b'], r['winner'] == 'a', r['aHp'], r['t']), (r['b'], r['a'], r['winner'] == 'b', r['bHp'], r['t'])]:
        W[x][0] += win; W[x][1] += 1
        m = M.setdefault((x, y), [0, 0, 0.0, 0.0]); m[0] += win; m[1] += 1; m[2] += hp if win else 0; m[3] += t
rows = []
for k in keys:
    c = CH[k]; cost, pairs = card(k); dps = d['dps'][k]['dps']
    wr = W[k][0] / W[k][1]
    rows.append(dict(k=k, name=NAMES[k], rar=RAR.get(k, 'comun'), cost=cost, hp=c['hp'], dmg=c.get('dmg'), cd=c.get('cd'), rng=c['range'] / H, spd=c['speed'],
                     dps=dps, wr=wr, dpsE=dps / cost if cost else 0, hpE=c['hp'] / cost if cost else 0, ranged=c.get('ranged'), pairs=pairs))
# tendencia victorias ~ coste (mínimos cuadrados) para ver quién rinde por encima o por debajo de lo que cuesta
pts = [(r['cost'], r['wr']) for r in rows if r['k'] not in ('fraile',)]
n = len(pts); mx = sum(p[0] for p in pts) / n; my = sum(p[1] for p in pts) / n
b = sum((x - mx) * (y - my) for x, y in pts) / sum((x - mx) ** 2 for x, y in pts); a0 = my - b * mx
for r in rows: r['exp'] = a0 + b * r['cost']; r['delta'] = r['wr'] - r['exp']
SUPPORT = {'fraile': 'No ataca: cura. Un duelo no mide su papel.', 'catapulta': 'Asedio: rinde contra castillos y grupos, no en duelo.',
           'imparable': 'En un duelo no llega a 7 bajas: solo se ve su primera forma.', 'muerte': 'Sus tumbas sacan esqueletos que también pelean.',
           'centinela': 'Alterna francotirador y minigun según la distancia.', 'tercio': 'Bonus ×1,8 contra Valkiria y Lobo; empuja.',
           'valkiria': 'Daño en área: un duelo no lo aprovecha.', 'desencadenado': 'Cada 3 ataques golpea a todo el carril y al castillo.',
           'acorazado': 'Escudo frontal −30 %; refuerzo −60 % por debajo de la mitad de vida.', 'ninja': 'Se teletransporta junto a los tiradores.',
           'lobo': 'Embestida al acercarse.', 'kungfu': 'Combo de 3 golpes, palma que empuja y patada giratoria.', 'samurai': 'Un solo tajo de iaido por ataque.'}
def esc(s): return html.escape(str(s))
def f1(x): return f'{x:.1f}'.replace('.', ',')
def pct(x): return f'{round(x * 100)} %'
def verdict(r):
    if r['k'] in ('fraile', 'catapulta'): return ('role', 'Otro papel')
    if r['delta'] > 0.15: return ('hot', 'Rinde de más')
    if r['delta'] < -0.15: return ('cold', 'Rinde de menos')
    return ('ok', 'En su sitio')
order = sorted(rows, key=lambda r: -r['wr'])
# tabla
trs = []
for r in order:
    vc, vt = verdict(r)
    dmg = (f1(sum(r['dmg']) / 2) if r['dmg'] else '—'); cd = (f1(sum(r['cd']) / 2) + ' s' if r['cd'] else '—')
    hab = '; '.join(f'{esc(a)}: {esc(b_)}' for a, b_ in r['pairs'] if a not in ('Vida',))
    trs.append(f'''<tr data-k="{r['k']}">
<th scope="row"><span class="nm">{esc(r['name'])}</span><span class="rar r-{r['rar']}">{RN[r['rar']]}</span></th>
<td class="num">{r['cost']}</td><td class="num">{r['hp']}</td><td class="num">{dmg}</td><td class="num">{cd}</td><td class="num">{f1(r['rng'])}</td><td class="num">{r['spd']}</td>
<td class="num strong">{f1(r['dps'])}</td><td class="num">{f1(r['dpsE'])}</td><td class="num">{f1(r['hpE'])}</td>
<td class="num"><span class="bar"><i style="width:{r['wr']*100:.0f}%"></i></span>{pct(r['wr'])}</td>
<td><span class="pill p-{vc}">{vt}</span></td>
<td class="note">{hab}<br><span class="sub">{esc(SUPPORT.get(r['k'], ''))}</span></td></tr>''')
# matriz
head = ''.join(f'<th scope="col"><span>{esc(NAMES[k])}</span></th>' for k in [r['k'] for r in order])
mrows = []
for r in order:
    cells = []
    for c in order:
        if c['k'] == r['k']: cells.append('<td class="self"></td>'); continue
        w, nn, hp, t = M[(r['k'], c['k'])]; v = w / nn
        cells.append(f'<td class="c" style="--v:{v:.2f}" title="{esc(r["name"])} contra {esc(c["name"])}: gana {w} de {nn} · {f1(t/nn)} s de media">{w}</td>')
    mrows.append(f'<tr><th scope="row">{esc(r["name"])}</th>{"".join(cells)}</tr>')
# dispersión victorias / coste
SW, SH, PL, PB, PT, PR = 640, 340, 46, 40, 16, 16
def sx(c): return PL + (c - 0.5) / 7 * (SW - PL - PR)
def sy(v): return PT + (1 - v) * (SH - PT - PB)
svg = [f'<svg viewBox="0 0 {SW} {SH}" role="img" aria-label="Victorias en duelos frente al coste en energía">']
for v in [0, 0.25, 0.5, 0.75, 1]:
    svg.append(f'<line class="grid" x1="{PL}" x2="{SW-PR}" y1="{sy(v):.1f}" y2="{sy(v):.1f}"/><text class="ax" x="{PL-8}" y="{sy(v)+4:.1f}" text-anchor="end">{int(v*100)} %</text>')
for c in range(1, 8): svg.append(f'<text class="ax" x="{sx(c):.1f}" y="{SH-PB+18}" text-anchor="middle">{c}</text>')
svg.append(f'<text class="ax lbl" x="{(SW+PL)/2:.0f}" y="{SH-4}" text-anchor="middle">Coste en energía</text>')
svg.append(f'<line class="trend" x1="{sx(0.6):.1f}" y1="{sy(a0+b*0.6):.1f}" x2="{sx(7.4):.1f}" y2="{sy(min(1.05,a0+b*7.4)):.1f}"/>')
# etiquetas: dentro de cada columna de coste se separan para que no se pisen
labels = {}
for r in sorted(rows, key=lambda r: -r['wr']):
    y = sy(r['wr']) + 4; col = labels.setdefault(r['cost'], [])
    for py in col:
        if abs(y - py) < 15: y = py + 15
    col.append(y); r['ly'] = y
for r in rows:
    vc, _ = verdict(r)
    x, y = sx(r['cost']), sy(r['wr']); anchor = 'start' if r['cost'] < 6 else 'end'; dx = 9 if anchor == 'start' else -9
    svg.append(f'<circle class="dot d-{vc}" cx="{x:.1f}" cy="{y:.1f}" r="6"/><text class="dl" x="{x+dx:.1f}" y="{r["ly"]:.1f}" text-anchor="{anchor}">{esc(r["name"])}</text>')
svg.append('</svg>')
hot = [r for r in order if verdict(r)[0] == 'hot']; cold = [r for r in order if verdict(r)[0] == 'cold']
def names(lst): return ', '.join(esc(r['name']) for r in lst) or 'ninguno'
total = len(d['duels'])
out = open(os.path.join(D, 'plantilla.html')).read()
for k, v in {'{{ROWS}}': '\n'.join(trs), '{{MHEAD}}': head, '{{MROWS}}': '\n'.join(mrows), '{{SVG}}': ''.join(svg), '{{HOT}}': names(hot), '{{COLD}}': names(cold),
             '{{TOTAL}}': str(total), '{{N}}': str(len(keys))}.items():
    out = out.replace(k, v)
open(os.path.join(D, 'ficha.html'), 'w').write(out)
print('ok', len(hot), len(cold))
