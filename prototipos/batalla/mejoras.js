
/* ==== Mejora de unidades: con copias de su carta y oro subes una unidad de nivel (del 1 al 10).
   Cada nivel le da un 10 % más de vida, daño y curación (nivel 10 = ×1,9). Las copias salen al ganar batallas,
   en la expedición y en la taberna. Los reinos enemigos también tienen nivel: más alto cuanto más lejos. ==== */
const LV_MAX = 10, LV_PASO = 0.1;
const LV_COPIAS = [0, 1, 2, 3, 5, 8, 12, 16, 22, 30];          // copias para subir desde el nivel n (índice = nivel actual)
const LV_ORO = [0, 50, 100, 180, 300, 450, 650, 900, 1250, 1700];
const LV_RAR = { comun: 1, poco: 1.2, rara: 1.5, epica: 2, legendaria: 3, ascendida: 4 };
const REINO_LV = { praderas: 1, bosque: 2, desierto: 3, nieve: 4, pantano: 5, volcan: 6, playa: 7, setas: 7, huesos: 8, engranajes: 8, cristal: 9, cementerio: 9, cielo: 10 };   // nivel de los ejércitos de cada reino
const lvK = lv => 1 + LV_PASO * ((lv || 1) - 1);
const lvOf = k => Math.max(1, Math.min(LV_MAX, (perfil.niveles || {})[k] || 1));
const copiasOf = k => (perfil.copias || {})[k] || 0;
const lvCoste = k => { const lv = lvOf(k); return lv >= LV_MAX ? null : { copias: LV_COPIAS[lv], oro: Math.round(LV_ORO[lv] * (LV_RAR[RARITY[k] || 'comun'] || 1) / 10) * 10 }; };
const puedeMejorar = k => { const c = lvCoste(k); return !!c && owned().includes(k) && copiasOf(k) >= c.copias && perfil.gold >= c.oro; };
const mejorables = () => owned().filter(puedeMejorar).length;
function addCopias(k, n) { perfil.copias = perfil.copias || {}; perfil.copias[k] = (perfil.copias[k] || 0) + n; }

/* ---- en batalla: cada unidad sale con las estadísticas de su nivel ---- */
function applyLevel(u, lv) {
  if (!u || !u.cfg || lv <= 1) return;
  const k = lvK(lv), c = Object.assign({}, u.cfg);
  c.hp = Math.round(c.hp * k); if (c.heal) c.heal = c.heal.map(x => Math.round(x * k));
  u.cfg = c; u.lv = lv; u.lvK = k; u.hp = u.max = c.hp;
}
const _dmgLv = Unit.prototype.damage;
Unit.prototype.damage = function (d, src, fromX, crit) { if (src && src.lvK > 1) d = Math.round(d * src.lvK); return _dmgLv.call(this, d, src, fromX, crit); };
const _mkCastle = makeCastle;
makeCastle = function (team, hp) {
  const c = _mkCastle(team, hp), f = c.damage;
  c.damage = function (d, src) { if (src && src.lvK > 1) d = Math.round(d * src.lvK); return f.call(this, d, src); };
  return c;
};
const _resetLv = resetBattle;
resetBattle = function (o = {}) {
  _resetLv(o);
  const real = !o.demo && !o.sim;
  B.blue.lv = real ? Object.fromEntries(owned().map(k => [k, lvOf(k)])) : {};
  const d = B.blue.deck || [], media = d.length ? Math.round(d.reduce((s, k) => s + (B.blue.lv[k] || 1), 0) / d.length) : 1;
  B.purple.lvAll = o.enemyLv || (o.run && o.run.kind === 'rapida' ? media : 1);
};
const _levelOptsLv = levelOpts;
levelOpts = function (kid, i) { return Object.assign(_levelOptsLv(kid, i), { enemyLv: enemyLevel(kid, i) }); };
function enemyLevel(kid, i) { const base = REINO_LV[kid] || 1, lv = KD(kid).levels[i]; return Math.min(LV_MAX, base + (lv && lv.royal && base > 1 ? 1 : 0)); }
const _playLv = play;
play = function (team, idx) {
  const type = B && B[team] && B[team].hand[idx], n = units.length, ok = _playLv(team, idx);
  if (ok && units.length > n) applyLevel(units[units.length - 1], team === 'blue' ? (B.blue.lv || {})[type] || 1 : B.purple.lvAll || 1);
  return ok;
};

/* ---- recompensas: copias al ganar y en la expedición ---- */
function repartirCopias(pool, n) {
  const out = {}; pool = pool.filter(k => owned().includes(k)); if (!pool.length) return out;
  // prioriza las que aún pueden subir de nivel
  const vivas = pool.filter(k => lvOf(k) < LV_MAX), lista = vivas.length ? vivas : pool;
  for (let i = 0; i < n; i++) { const k = lista[Math.floor(Math.random() * lista.length)]; out[k] = (out[k] || 0) + 1; addCopias(k, 1); }
  return out;
}
const _brLv = battleResult;
battleResult = function (win) {
  const r = _brLv(win);
  if (win && !B.auto) { const n = r.run.kind === 'nivel' ? (r.first ? 3 : 1) : 1; r.copias = repartirCopias(B.blue.deck, n); savePerfil(); }
  return r;
};
const copiasHtml = c => Object.entries(c).map(([k, n]) => '<span class="cpgain">' + cardHtml(k) + '<b>+' + n + '</b></span>').join('');
const _srLv = showResult;
showResult = function (res) {
  _srLv(res);
  if (res.copias && Object.keys(res.copias).length) $('over-prize').insertAdjacentHTML('beforeend', '<div class="loot cps"><span class="note">Copias de cartas</span>' + copiasHtml(res.copias) + '</div>');
};
const _ceLv = collectExp;
collectExp = function (el) {
  const t0 = perfil.exp || Date.now(), h = Math.min(12, (Date.now() - t0) / 3.6e6);
  _ceLv(el);
  if (perfil.exp !== t0) {
    const n = Math.floor(h / 2);
    if (n > 0) { const c = repartirCopias(playerDeck(), n); savePerfil(); setTimeout(() => pop('<p class="eyebrow">Botín de la expedición</p><h2>Copias de cartas</h2><p class="note">Tu ejército ha traído copias de algunas cartas. Úsalas en Ejército para subir de nivel tus unidades.</p><div class="army">' + copiasHtml(c) + '</div>'), 900); }
  }
};

/* ---- insignias de nivel en las cartas ---- */
const lvBadge = (lv, enemy) => '<span class="lvb' + (enemy ? ' foe' : '') + '">Nv ' + lv + '</span>';
function marcaCartas(sel, lvFn) {
  document.querySelectorAll(sel).forEach(b => {
    const k = b.dataset.k || (B && B.blue.hand[+b.dataset.i]); if (!k || b.querySelector('.lvb') || b.classList.contains('lock')) return;
    b.insertAdjacentHTML('beforeend', lvBadge(lvFn(k)));
  });
}
const _renderHandLv = renderHand;
renderHand = function () { _renderHandLv(); marcaCartas('#hand .hc', k => (B.blue.lv || {})[k] || 1); };
const _openDeckLv = openDeck;
openDeck = function (from) { _openDeckLv(from); marcaCartas('#deckgrid .dk', lvOf); };
const _openLevelLv = openLevel;
openLevel = function (kid, i) {
  _openLevelLv(kid, i);
  const lv = enemyLevel(kid, i);
  document.querySelectorAll('#nv-army .dk').forEach(b => b.insertAdjacentHTML('beforeend', lvBadge(lv, true)));
  $('nv-desc').textContent += ' Su ejército es de nivel ' + lv + '.';
};
const _openArmyLv = openArmy;
openArmy = function (seg) {
  _openArmyLv(seg);
  if (armySeg !== 'unidades') return;
  document.querySelectorAll('#ej-grid .dk').forEach(b => {
    const k = b.dataset.k; if (!owned().includes(k)) return;
    const c = lvCoste(k), have = copiasOf(k);
    b.insertAdjacentHTML('beforeend', lvBadge(lvOf(k)) + '<span class="cpbar' + (c && have >= c.copias ? ' full' : '') + '"><i style="width:' + (c ? Math.min(100, have / c.copias * 100) : 100) + '%"></i><b>' + (c ? have + '/' + c.copias : 'Máx.') + '</b></span>');
    b.classList.toggle('up', puedeMejorar(k));
  });
  $('ej-note').textContent = 'Tienes ' + owned().length + ' de ' + ALL.length + ' unidades. Toca una para ver su ficha y mejorarla.' + (mejorables() ? ' Puedes mejorar ' + mejorables() + '.' : '');
};
// aviso en la pestaña Ejército cuando hay mejoras posibles
const _paintGoldLv = paintGold;
paintGold = function () {
  _paintGoldLv();
  const t = document.querySelector('#nav [data-tab="ejercito"]'); if (!t) return;
  let d = t.querySelector('.ndot'); if (!d) { t.insertAdjacentHTML('beforeend', '<span class="ndot" hidden></span>'); d = t.querySelector('.ndot'); }
  d.hidden = !mejorables();
};

/* ---- ficha de la unidad con su mejora ---- */
openUnit = function (k, subio) {
  const c = CH[k], has = owned().includes(k), lv = lvOf(k), cost = lvCoste(k), k0 = lvK(lv), k1 = lvK(lv + 1), w = prizeWhere(k);
  const spd = c.speed >= 80 ? 'rápida' : c.speed >= 50 ? 'normal' : 'lenta', f = x => Math.round(x);
  const sube = (a, b) => has && cost ? a + ' <em>→ ' + b + '</em>' : a;
  const rows = [
    ['Vida', sube(f(c.hp * k0), f(c.hp * k1))],
    c.heal ? ['Cura', sube(f(c.heal[0] * k0) + '–' + f(c.heal[1] * k0), f(c.heal[0] * k1) + '–' + f(c.heal[1] * k1))] : ['Daño', sube(f(c.dmg[0] * k0) + '–' + f(c.dmg[1] * k0), f(c.dmg[0] * k1) + '–' + f(c.dmg[1] * k1))],
    ['Cadencia', 'cada ' + String(c.cd[0]).replace('.', ',') + '–' + String(c.cd[1]).replace('.', ',') + ' s'], ['Alcance', (c.range / H).toFixed(1).replace('.', ',')], ['Velocidad', spd], ['Coste', COST[k] + ' de energía'],
  ];
  let mejora = '';
  if (has) {
    const have = copiasOf(k);
    mejora = '<div class="mejora"><div class="mrow"><b>Nivel ' + lv + '</b><span class="note">de ' + LV_MAX + '</span></div>'
      + (cost ? '<span class="cpbar wide' + (have >= cost.copias ? ' full' : '') + '"><i style="width:' + Math.min(100, have / cost.copias * 100) + '%"></i><b>Copias ' + have + '/' + cost.copias + '</b></span>'
        + '<p class="note">' + (have < cost.copias ? 'Te faltan ' + (cost.copias - have) + ' copias. Salen al ganar batallas, en la expedición y en la taberna.' : perfil.gold < cost.oro ? 'Te faltan ' + fmt(cost.oro - perfil.gold) + ' de oro.' : 'Lista para subir: +10 % de vida y de ' + (c.heal ? 'curación' : 'daño') + '.') + '</p>'
        : '<p class="note">Nivel máximo.</p>') + '</div>';
  }
  pop('<div class="udetail' + (subio ? ' lvup' : '') + '">' + cardHtml(k, has ? '' : 'shadow') + '<div><p class="eyebrow">' + RAREZA[RARITY[k] || 'comun'] + '</p><h2>' + NAMES[k] + '</h2>'
    + '<table class="ustats">' + rows.map(([a, b]) => '<tr><th>' + a + '</th><td>' + b + '</td></tr>').join('') + '</table><p>' + HABILIDAD[k] + '</p>'
    + (has ? '' : '<p class="note">' + (w ? 'Prisionero en ' + w + '.' : 'Se recluta en la Taberna del Multiverso.') + '</p>') + '</div></div>' + mejora,
    has && cost ? 'Mejorar · ' + fmt(cost.oro) + ' de oro' : null, () => mejorar(k));
  if (has) document.querySelector('#pop .udetail .dk').insertAdjacentHTML('beforeend', lvBadge(lv));
  if (has && cost && !puedeMejorar(k)) $('pop-ok').disabled = true;
};
const _popLv = pop;
pop = function (...a) { $('pop-ok').disabled = false; return _popLv(...a); };
$('pop-close').addEventListener('click', () => { if (!$('ejercito').hidden && armySeg === 'unidades') openArmy('unidades'); });
function mejorar(k) {
  if (!puedeMejorar(k)) return;
  const c = lvCoste(k);
  perfil.gold -= c.oro; perfil.copias[k] -= c.copias; perfil.niveles = perfil.niveles || {}; perfil.niveles[k] = lvOf(k) + 1;
  savePerfil(); paintGold();
  toast('¡' + LABEL[k] + ' sube a nivel ' + lvOf(k) + '!');
  openUnit(k, true);
}
window.__mejorar = mejorar; window.__lvOf = lvOf; window.__openLevel = openLevel;
window.__unitsLv = () => units.map(u => u.type + ":" + u.team + ":" + u.max + ":nv" + (u.lv || 1));
