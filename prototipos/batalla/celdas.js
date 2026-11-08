
/* ==== Celdas de prisioneros: cinco calidades; al abrir una salen varias cartas de rarezas al azar, con copias.
   Si la unidad no la tenías, se une a tu ejército; si ya la tenías, son copias para mejorarla. ==== */
const CELDAS = [
  { id: 'madera', name: 'Celda de madera', cartas: 2, copias: [2, 3], precio: 20, color: '#c98a4a',
    prob: { comun: 80, poco: 20 } },
  { id: 'hierro', name: 'Celda de hierro', cartas: 3, copias: [3, 5], precio: 50, color: '#8fa3c7',
    prob: { comun: 45, poco: 40, rara: 15 } },
  { id: 'runica', name: 'Celda rúnica', cartas: 3, copias: [5, 8], precio: 120, color: '#a66bff',
    prob: { poco: 35, rara: 45, epica: 20 } },
  { id: 'oro', name: 'Celda de oro', cartas: 4, copias: [8, 12], precio: 250, color: '#ffc83d',
    prob: { poco: 15, rara: 40, epica: 40, legendaria: 5 } },
  { id: 'diamante', name: 'Celda de diamante', cartas: 5, copias: [12, 18], precio: 600, color: '#ff3a5c',
    prob: { comun: 5, poco: 15, rara: 30, epica: 49, legendaria: 10, ascendida: 1 } },
];
const CELDA = id => CELDAS.find(c => c.id === id);
const RAR_K = { comun: 1, poco: 0.75, rara: 0.5, epica: 0.35, legendaria: 0.2 };
const RAR_COL = { comun: '#c7cde0', poco: '#3ccf86', rara: '#4da3ff', epica: '#a855f7', legendaria: '#fbbf24', ascendida: '#ff3a5c' };
const celdasDe = () => perfil.celdas || (perfil.celdas = {});
const nCeldas = () => Object.values(celdasDe()).reduce((s, n) => s + n, 0);
function darCelda(id, n = 1) { celdasDe()[id] = (celdasDe()[id] || 0) + n; }

/* ---- sorteo: rareza según la celda, unidad al azar de esa rareza, copias según celda y rareza ---- */
function sortea(c) {
  const tot = Object.values(c.prob).reduce((x, y) => x + y, 0);   // si los porcentajes no suman 100, se reparten en proporción
  let r = Math.random() * tot, rar = 'comun';
  for (const [k, p] of Object.entries(c.prob)) { if (r < p) { rar = k; break; } r -= p; }
  const pool = ALL.filter(k => (RARITY[k] || 'comun') === rar);
  const k = pool[Math.floor(Math.random() * pool.length)];
  const base = c.copias[0] + Math.floor(Math.random() * (c.copias[1] - c.copias[0] + 1));
  const n = rar === 'ascendida' ? 1 + (Math.random() < 0.3 ? 1 : 0) : Math.max(1, Math.round(base * RAR_K[rar]));
  return { k, rar, n };
}
function abrirCelda(id) {
  const c = CELDA(id); if (!(celdasDe()[id] > 0)) return null;
  celdasDe()[id]--;
  // varias cartas; si sale repetida en la misma celda, se suman
  const out = [];
  for (let i = 0; i < c.cartas; i++) { const s = sortea(c), prev = out.find(o => o.k === s.k); if (prev) prev.n += s.n; else out.push(s); }
  const orden = ['comun', 'poco', 'rara', 'epica', 'legendaria', 'ascendida'];
  out.sort((a, b) => orden.indexOf(a.rar) - orden.indexOf(b.rar));   // la mejor, al final
  for (const o of out) {
    o.nueva = !perfil.owned.includes(o.k);
    if (o.nueva) { perfil.owned.push(o.k); if (o.n > 1) addCopias(o.k, o.n - 1); } else addCopias(o.k, o.n);
  }
  savePerfil(); return { c, out };
}

/* ---- pantalla de celdas: las que tienes y la tienda (con diamantes) ---- */
const gemas = () => perfil.gemas || 0;
function openCeldas() {
  $('cel-list').innerHTML = CELDAS.map(c => {
    const n = celdasDe()[c.id] || 0, pr = Object.entries(c.prob).map(([r, p]) => '<span style="--c:' + RAR_COL[r] + '">' + RAREZA[r] + ' ' + p + ' %</span>').join('');
    return '<div class="celda" style="--c:' + c.color + '"><div class="cimg"><img src="img/celdas/celda_' + c.id + '_0.png" alt=""><b class="cnum">×' + n + '</b></div>'
      + '<div class="cinfo"><b>' + c.name + '</b><small>' + c.cartas + ' cartas · ' + c.copias[0] + '–' + c.copias[1] + ' copias por carta (menos cuanto más rara)</small><div class="probs">' + pr + '</div>'
      + '<div class="acts start"><button class="btn gold small" data-open="' + c.id + '"' + (n ? '' : ' disabled') + '>Abrir</button>'
      + '<button class="btn small" data-buy="' + c.id + '"><span class="oro gema" style="border:0;background:none;padding:0"><i></i><b>' + c.precio + '</b></span></button></div></div></div>';
  }).join('');
  document.querySelectorAll('#cel-list [data-open]').forEach(b => { b.onclick = () => abrirAnim(b.dataset.open); });
  document.querySelectorAll('#cel-list [data-buy]').forEach(b => { b.onclick = () => comprar(b.dataset.buy); });
  paintGold(); show('celdas');
}
function comprar(id) {
  const c = CELDA(id);
  if (gemas() < c.precio) return toast('Te faltan ' + (c.precio - gemas()) + ' diamantes. Se consiguen en el diario, las misiones y conquistando castillos reales.');
  perfil.gemas -= c.precio; darCelda(id); savePerfil(); toast('Has conseguido una ' + c.name.toLowerCase() + '.'); openCeldas();
}

/* ---- apertura: tocas la celda tres veces, tiembla, se rompe y salen los presos uno a uno ---- */
let AB = null;
function abrirAnim(id) {
  const r = abrirCelda(id); if (!r) return;
  AB = { r, golpes: 0, i: -1 };
  const top = r.out[r.out.length - 1];
  $('ab-stage').innerHTML = '<div class="abcell" style="--c:' + r.c.color + '"><div class="abfondo"><img class="absil" src="img/' + top.k + '_carta.png" alt=""></div><img class="abimg" src="img/celdas/celda_' + id + '_0.png" alt="' + r.c.name + '"></div>';
  $('ab-txt').textContent = 'Toca la celda para forzar la puerta';
  $('ab-sum').hidden = true; $('ab-ok').hidden = true; $('abrir').hidden = false;
  $('ab-stage').onclick = golpe;
}
function chispas(el, col, n) {
  const r = el.getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i'); s.className = 'chispa'; s.style.background = col; document.body.appendChild(s);
    const a = Math.random() * 6.28, d = 60 + Math.random() * 120;
    s.style.left = (r.left + r.width / 2) + 'px'; s.style.top = (r.top + r.height * 0.6) + 'px';
    s.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * d + 'px,' + Math.sin(a) * d + 'px) scale(.3)', opacity: 0 }], { duration: 500 + Math.random() * 300, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => s.remove();
  }
}
function golpe() {
  if (!AB || AB.i >= 0) return siguiente();
  const cell = document.querySelector('.abcell'); AB.golpes++;
  cell.classList.remove('hit'); void cell.offsetWidth; cell.classList.add('hit');
  cell.style.setProperty('--g', AB.golpes);
  cell.querySelector('.abimg').src = 'img/celdas/celda_' + AB.r.c.id + '_' + AB.golpes + '.png';   // forzada, entreabierta, abierta
  chispas(cell, AB.r.c.color, 8 + AB.golpes * 6);
  if (AB.golpes < 3) { $('ab-txt').textContent = AB.golpes === 1 ? '¡La has forzado! Otra vez' : '¡Ya cede! Una más'; return; }
  $('ab-txt').textContent = '';
  cell.classList.add('abierta'); chispas(cell, '#fff', 30);
  setTimeout(() => siguiente(), 1100);
}
function siguiente() {
  const out = AB.r.out; AB.i++;
  if (AB.i >= out.length) return resumen();
  const o = out[AB.i], last = AB.i === out.length - 1;
  $('ab-stage').innerHTML = '<div class="abcard r-' + o.rar + '" style="--c:' + RAR_COL[o.rar] + '"><div class="rayos"></div>' + cardHtml(o.k, 'reveal') + '<p class="eyebrow">' + RAREZA[o.rar] + (o.nueva ? ' · ¡Nuevo!' : '') + '</p><h2>' + NAMES[o.k] + '</h2><b class="abn">+' + o.n + ' ' + (o.n === 1 ? 'copia' : 'copias') + '</b></div>';
  if (o.nueva) document.querySelector('.abcard').insertAdjacentHTML('beforeend', '<p class="note">Se une a tu ejército.</p>');
  $('ab-txt').textContent = (AB.i + 1) + ' de ' + out.length + ' · ' + (last ? 'toca para ver el resumen' : 'toca para el siguiente preso');
  chispas($('ab-stage'), RAR_COL[o.rar], o.rar === 'legendaria' || o.rar === 'ascendida' ? 40 : 16);
}
function resumen() {
  const out = AB.r.out; AB.i = 99;
  $('ab-stage').onclick = null; $('ab-stage').innerHTML = '';
  $('ab-txt').textContent = AB.r.c.name;
  $('ab-sum').innerHTML = out.map(o => '<span class="cpgain">' + cardHtml(o.k) + '<b>+' + o.n + '</b>' + (o.nueva ? '<em>Nuevo</em>' : '') + '</span>').join('');
  $('ab-sum').hidden = false; $('ab-ok').hidden = false;
}
$('ab-ok').onclick = () => { $('abrir').hidden = true; AB = null; openCeldas(); };

/* ---- de dónde salen las celdas ---- */
const CEL_TIER = { praderas: 'madera', bosque: 'hierro', desierto: 'hierro', nieve: 'runica', pantano: 'runica', volcan: 'oro', playa: 'oro', setas: 'oro', huesos: 'oro', engranajes: 'oro', cristal: 'diamante', cementerio: 'diamante', cielo: 'diamante' };
const subeTier = id => CELDAS[Math.min(CELDAS.length - 1, CELDAS.findIndex(c => c.id === id) + 1)].id;
const _brCel = battleResult;
battleResult = function (win) {
  const r = _brCel(win);
  if (win && !B.auto) {
    let id = null;
    if (r.run.kind === 'nivel') {
      const lv = KD(r.run.k).levels[r.run.i];
      if (r.first) { id = CEL_TIER[r.run.k] || 'madera'; if (lv.royal) { id = subeTier(id); perfil.gemas = (perfil.gemas || 0) + 10; r.gemas = 10; } }
      else if (Math.random() < 0.25) id = 'madera';
    } else if (Math.random() < 0.15) id = 'madera';
    if (id) { darCelda(id); r.celda = id; }
    savePerfil();
  }
  return r;
};
const _srCel = showResult;
showResult = function (res) {
  _srCel(res);
  if (res.celda) $('over-prize').insertAdjacentHTML('beforeend', '<div class="freed"><img class="celmini" src="img/celdas/celda_' + res.celda + '_0.png" alt=""><p><b>¡' + CELDA(res.celda).name + '!</b><br>Ábrela en Celdas, desde Campaña.' + (res.gemas ? ' Y +' + res.gemas + ' diamantes por conquistar el castillo real.' : '') + '</p></div>');
};
// expedición: una celda de madera cada 4 horas
const _ceCel = collectExp;
collectExp = function (el) {
  const t0 = perfil.exp || Date.now(), h = Math.min(12, (Date.now() - t0) / 3.6e6);
  _ceCel(el);
  if (perfil.exp !== t0 && h >= 4) { darCelda('madera', Math.floor(h / 4)); savePerfil(); setTimeout(() => toast('La expedición ha traído ' + Math.floor(h / 4) + ' celda(s) de madera.'), 3200); }
};
// diario: algunos días dan celdas
DIARIO[1].celda = 'madera'; DIARIO[4].celda = 'hierro'; DIARIO[6].celda = 'runica';
const _rwCel = rewardTxt;
rewardTxt = function (r) { const t = _rwCel(r); return r.celda ? (t ? t + ' y ' : '') + CELDA(r.celda).name.toLowerCase() : t; };
const _giveCel = give;
give = function (r, el) { if (r.celda) darCelda(r.celda); _giveCel(r, el); };

/* ---- enganches con el menú ---- */
SCREENS.push('celdas');
$('s-jaulas').onclick = openCeldas;
$('s-jaulas').setAttribute('aria-label', 'Celdas'); $('s-jaulas').querySelector('.slbl').textContent = 'Celdas';
$('cel-back').onclick = () => { show('menu'); startDemo(); };
const _phCel = paintHub;
paintHub = function () { _phCel(); const d = document.querySelector('#s-jaulas .dot'); if (d) d.hidden = !nCeldas(); };
$('pf-gemas').onclick = () => { perfil.gemas = (perfil.gemas || 0) + 500; CELDAS.forEach(c => darCelda(c.id)); savePerfil(); toast('Pruebas: +500 diamantes y una celda de cada.'); openPerfil(); };
window.__abrirCelda = abrirCelda; window.__openCeldas = openCeldas; window.__darCelda = darCelda;
