
/* ==== Centro de la app: menú con la expedición en marcha, pestañas (Inicio, Campaña, Ejército, Taberna, Arena),
   perfil, diario, misiones y las secciones que llegarán (jaulas, ofertas, correo, clasificación). ==== */
const RAREZA = { comun: 'Común', poco: 'Poco común', rara: 'Rara', epica: 'Épica', legendaria: 'Legendaria', ascendida: 'Ascendida' };
const HABILIDAD = {
  legionario: 'Espada y escudo. Aguanta en primera línea.',
  arquera: 'Dispara flechas en parábola desde lejos.',
  valkiria: 'A caballo. Barrido de hacha que da a todos los que tiene delante.',
  ninja: 'Se teletransporta junto a los tiradores enemigos (cada 9 s) y lanza shuriken.',
  pistolero: 'Ráfagas con dos revólveres. Si le echan encima, da un mortal hacia atrás.',
  lobo: 'Embiste al ver a un enemigo cerca (1,5 veces su daño) y luego muerde.',
  samurai: 'Iaido: un tajo y vuelve a envainar. Todos sus golpes son críticos.',
  kungfu: 'Se lanza a ras de suelo, combo de puñetazos y patada giratoria que arrolla y aturde a los de detrás.',
  tercio: 'Pica larga que empuja. Triple de daño a la caballería y a los lobos.',
  muerte: 'Guadaña en área, corte giratorio, corte de oscuridad y tumbas de las que salen esqueletos.',
  acorazado: 'Escudo frontal que para el 30 % del daño; herido, se atrinchera y para el 60 %.',
  fraile: 'No ataca: cura al aliado más herido con la luz de su farolillo.',
  catapulta: 'Rocas en área desde muy lejos. Triple de daño a los castillos.',
  centinela: 'Francotirador y ametralladora. Misiles, dron que repara, escudo de energía y sobrecalentamiento.',
  desencadenado: 'Cadenazos en área; cada 3 ataques, cadenas por todo el carril hasta el castillo.',
  imparable: 'Con 5 marcas se vuelve monstruo; al caer implosiona y renace consumido.',
};
const HERO_TXT = {
  aldric: ['Estandarte real: tus unidades cercanas hacen un 20 % más de daño.', 'Golpe sísmico (12 s): daña y aturde a su alrededor y llegan dos guardianes.'],
  lyra: ['Flechas perforantes: cada flecha atraviesa hasta 3 enemigos.', 'Tormenta de plumas (10 s): ráfaga que barre el carril y daña al castillo rival.'],
  gull: ['Al galope: tus unidades andan un 15 % más rápido mientras lucha.', 'Embestida porcina (8 s): arrolla y aturde en línea recta y remata girando.'],
};
const hoy = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
const fmt = n => Math.floor(n).toLocaleString('es-ES');

/* ---- experiencia y nivel del señor ---- */
const xpNeed = lv => 100 + 60 * (lv - 1);
function nivelDe(xp) { let lv = 1; while (xp >= xpNeed(lv)) { xp -= xpNeed(lv); lv++; } return { lv, cur: xp, need: xpNeed(lv) }; }
function addXP(n) { const a = nivelDe(perfil.xp || 0).lv; perfil.xp = (perfil.xp || 0) + n; const b = nivelDe(perfil.xp).lv; if (b > a) setTimeout(() => toast('¡Tu reino sube a nivel ' + b + '!'), 400); }
const conquistados = () => KINGDOMS.reduce((s, k) => s + (k.levels ? starsOf(k.id).filter(x => x > 0).length : 0), 0);

/* ---- expedición: tu ejército recorre los caminos y trae oro y experiencia aunque no juegues (hasta 12 h) ---- */
const EXP = { cap: 12 };
const expRate = () => ({ oro: 30 + 8 * conquistados(), xp: 20 + 3 * conquistados() });
function expPending() {
  const t0 = perfil.exp || (perfil.exp = Date.now()), h = Math.min(EXP.cap, (Date.now() - t0) / 3.6e6), r = expRate();
  return { oro: Math.floor(h * r.oro), xp: Math.floor(h * r.xp), full: h >= EXP.cap };
}
function collectExp(el) {
  const p = expPending(); if (p.oro < 1) return toast('Tu ejército acaba de salir: vuelve en un rato a por el botín.');
  perfil.gold += p.oro; addXP(p.xp); perfil.exp = Date.now(); dia().cobros++; savePerfil(); coinFly(el, p.oro);
  toast('Botín de la expedición: ' + fmt(p.oro) + ' de oro y ' + p.xp + ' de experiencia.'); paintHub();
}
// en el menú, las unidades de tu mazo avanzan por el camino y despachan de un golpe a los enemigos que salen al paso
const IDLE = { tb: 0, tp: 0 };
startDemo = function () { resetBattle({ demo: true, idle: true, deck: playerDeck(), hero: playerHero(), heroP: null, colors: battleColors(null) }); IDLE.tb = 0; IDLE.tp = 1; };
function idleStep(dt) {
  B.t += dt;
  const z = cam.zoom, cx = cam.scrollX + cam.width / 2, half = cam.width / (2 * z), L = cx - half, R = cx + half;
  IDLE.tb -= dt; IDLE.tp -= dt;
  const mine = units.filter(u => u.team === 'blue' && u.alive), foes = units.filter(u => u.team === 'purple' && u.alive);
  if (IDLE.tb <= 0 && mine.length < 6) {
    IDLE.tb = rand(1.3, 2.3); const d = B.blue.deck, u = new Unit(scene, d[Math.floor(Math.random() * d.length)], 'blue', L - 70);
    u.hp = u.max = 1e6; u.bar.setVisible(false); units.push(u);
  }
  if (IDLE.tp <= 0 && foes.length < 5) {
    IDLE.tp = rand(1.1, 2.1); const pool = ['legionario', 'arquera', 'tercio', 'lobo', 'valkiria'], u = new Unit(scene, pool[Math.floor(Math.random() * pool.length)], 'purple', R + 70);
    u.hp = u.max = 1; u.bar.setVisible(false); units.push(u);
  }
  fightLogic(dt);
  for (const u of units.slice()) if ((u.team === 'blue' && u.x > R + 160) || (u.team === 'purple' && u.x < L - 160)) {
    units = units.filter(v => v !== u); u.root.destroy(); u.bar.destroy();
  }
}
const _onDead = onDead;
onDead = function (u) {
  if (B && B.idle && u.team === 'purple') {   // monedita que sale del enemigo
    const c = scene.add.image(u.x, u.gy - H * 0.9, 'moneda').setScale(0.42 * H / 100).setDepth(1001);
    scene.tweens.add({ targets: c, y: c.y - H * 0.7, alpha: 0, duration: 800, ease: 'Quad.out', onComplete: () => c.destroy() });
  }
  _onDead(u);
};

/* ---- diario (recompensa por entrar cada día) y misiones diarias ---- */
const DIARIO = [{ oro: 100 }, { oro: 150 }, { gemas: 3 }, { oro: 250 }, { oro: 300 }, { gemas: 5 }, { oro: 600, gemas: 10 }];
const diarioListo = () => !perfil.diario || perfil.diario.f !== hoy();
function dia() { if (!perfil.dia || perfil.dia.f !== hoy()) perfil.dia = { f: hoy(), wins: 0, cards: 0, cobros: 0, ok: {} }; return perfil.dia; }
const MISIONES = [
  { id: 'wins', txt: 'Gana 2 batallas', n: 2, oro: 120, xp: 30 },
  { id: 'cards', txt: 'Saca 25 cartas en batalla', n: 25, oro: 80, xp: 20 },
  { id: 'cobros', txt: 'Recoge tributo o botín 2 veces', n: 2, oro: 60, xp: 15 },
];
const misionesListas = () => { const d = dia(); return MISIONES.filter(m => d[m.id] >= m.n && !d.ok[m.id]).length + (MISIONES.every(m => d.ok[m.id]) && !d.ok.todas ? 1 : 0); };
function rewardTxt(r) { return [r.oro ? fmt(r.oro) + ' de oro' : '', r.gemas ? r.gemas + ' diamantes' : '', r.xp ? r.xp + ' de experiencia' : ''].filter(Boolean).join(' y '); }
function give(r, el) { if (r.oro) { perfil.gold += r.oro; coinFly(el, r.oro); } if (r.gemas) perfil.gemas = (perfil.gemas || 0) + r.gemas; if (r.xp) addXP(r.xp); savePerfil(); paintHub(); }
function openDiario() {
  const n = perfil.diario ? perfil.diario.n : 0, today = n % 7, ready = diarioListo();
  pop('<p class="eyebrow">Recompensa diaria</p><h2>Diario del reino</h2><p class="note">Entra cada día para llevarte el premio del día siguiente. El séptimo día es el mejor.</p><div class="days">'
    + DIARIO.map((r, i) => '<div class="day' + (i < today ? ' done' : '') + (i === today && ready ? ' today' : '') + (i === 6 ? ' big' : '') + '"><b>Día ' + (i + 1) + '</b>' + rewardTxt(r) + '</div>').join('') + '</div>',
    ready ? '¡Recoger!' : null, el => { const r = DIARIO[today]; perfil.diario = { n: n + 1, f: hoy() }; give(r, el); toast('Recompensa del día ' + (today + 1) + ': ' + rewardTxt(r) + '.'); openDiario(); });
  if (!ready) $('pop-body').insertAdjacentHTML('beforeend', '<p class="note">Ya has recogido el de hoy. Vuelve mañana.</p>');
}
function openMisiones() {
  const d = dia();
  pop('<p class="eyebrow">Se renuevan cada día</p><h2>Misiones</h2><div class="col full">' + MISIONES.map(m => {
    const v = Math.min(m.n, d[m.id]), done = v >= m.n, got = d.ok[m.id];
    return '<div class="mis' + (got ? ' got' : '') + '"><b>' + m.txt + '</b><small>' + (got ? 'Recogida' : rewardTxt(m)) + '</small><span class="xpbar"><span style="width:' + (v / m.n * 100) + '%"></span></span>'
      + (done && !got ? '<button class="btn gold small" data-m="' + m.id + '">Recoger</button>' : '<small>' + v + '/' + m.n + '</small>') + '</div>';
  }).join('') + '<div class="mis' + (d.ok.todas ? ' got' : '') + '"><b>Completa las 3 misiones</b><small>' + (d.ok.todas ? 'Recogida' : '5 diamantes y 1 insignia') + '</small>'
    + (MISIONES.every(m => d.ok[m.id]) && !d.ok.todas ? '<button class="btn gold small" data-m="todas">Recoger</button>' : '<small>' + MISIONES.filter(m => d.ok[m.id]).length + '/3</small>') + '</div></div>');
  document.querySelectorAll('#pop-body [data-m]').forEach(b => { b.onclick = () => { const id = b.dataset.m; d.ok[id] = true; give(id === 'todas' ? { gemas: 5, insignias: 1 } : MISIONES.find(m => m.id === id), b); openMisiones(); }; });
}
// contadores para las misiones
const _br = battleResult;
battleResult = function (win) {
  const r = _br(win);
  if (win) dia().wins++;
  const lv = r.run && r.run.kind === 'nivel' ? r.run.i : -1;
  r.xp = win ? (lv >= 0 ? (20 + 4 * lv) * (r.first ? 2 : 1) : 15) : 5;
  addXP(r.xp); savePerfil(); return r;
};
const _sr = showResult;
showResult = function (res) { _sr(res); $('over-prize').insertAdjacentHTML('afterbegin', '<div class="loot"><span class="oro xpp"><b>+' + res.xp + ' de experiencia</b></span></div>'); };
const _play2 = play;
play = function (team, idx) { const ok = _play2(team, idx); if (ok && team === 'blue' && B && !B.auto) dia().cards++; return ok; };
const _collect = collect;
collect = function (kid, list, el) { const got = _collect(kid, list, el); if (got) { dia().cobros++; savePerfil(); } return got; };

/* ---- ventana emergente genérica ---- */
let popOk = null;
function pop(html, okLabel, onOk) {
  $('pop-body').innerHTML = html; popOk = onOk || null;
  $('pop-ok').hidden = !okLabel; if (okLabel) $('pop-ok').textContent = okLabel;
  $('pop').hidden = false;
}
$('pop-close').onclick = () => { $('pop').hidden = true; paintHub(); };
$('pop-ok').onclick = e => { if (popOk) popOk(e.currentTarget); };
const PROX = {
  jaulas: ['Jaulas de prisioneros', 'Liberas a un preso y se une a tu ejército; si ya lo tenías, te da copias de su carta. Habrá cuatro rarezas (madera, hierro, acero con runas y oro), cada una con su llave.'],
  ofertas: ['Ofertas', 'Lotes de oro, diamantes, llaves y jaulas.'],
  correo: ['Correo', 'Aquí llegarán los mensajes del juego y los premios de los eventos. Ahora mismo no tienes cartas nuevas.'],
  ranking: ['Clasificación', 'Tu posición frente a otros señores en la Arena.'],
};
const proximamente = k => pop('<p class="eyebrow">Próximamente</p><h2>' + PROX[k][0] + '</h2><p class="note">' + PROX[k][1] + '</p>');

/* ---- menú: barra de arriba, iconos de los lados y botón de batalla ---- */
function nextLevel() {
  for (const k of KINGDOMS) { if (!k.levels) continue; const st = starsOf(k.id), i = st.findIndex(s => s === 0); if (i >= 0) return { k: k.id, i }; }
  return null;
}
function paintHub() {
  if (!perfil) return;
  const nv = nivelDe(perfil.xp || 0), port = 'img/' + HEROES[playerHero()].portrait + '.png';
  $('h-lv').textContent = nv.lv; $('h-xp').style.width = (nv.cur / nv.need * 100) + '%'; $('h-name').textContent = perfil.nombre || 'Señor del Reino';
  $('h-avatar').src = port; document.querySelectorAll('.ring').forEach(r => { r.style.background = COLORES[myColor()][1]; });
  document.querySelectorAll('.gema-n').forEach(e => { e.textContent = perfil.gemas || 0; });
  const p = expPending(); $('h-botin-n').textContent = fmt(p.oro); $('h-botin').classList.toggle('full', p.full);
  const nx = nextLevel(); $('h-next').textContent = nx ? 'Castillo ' + (nx.i + 1) + ': ' + KD(nx.k).levels[nx.i].name : 'Elige reino en la campaña';
  const dot = (id, on) => { const d = document.querySelector('#' + id + ' .dot'); if (d) d.hidden = !on; };
  dot('s-diario', diarioListo()); dot('s-misiones', misionesListas() > 0);
}
setInterval(() => { if (!$('menu').hidden) paintHub(); }, 5000);
$('h-perfil').onclick = () => openPerfil();
$('h-botin').onclick = e => collectExp(e.currentTarget);
$('h-batalla').onclick = () => { const nx = nextLevel(); if (nx) { nivelFrom = 'menu'; openLevel(nx.k, nx.i); } else openWorld(); };
$('h-mazo').onclick = () => openWorld();
$('s-tropas').onclick = () => openArmy('unidades');
$('ej-back').onclick = () => goTab('menu');
$('tab-back').onclick = () => goTab('hogar');
$('s-diario').onclick = openDiario;
$('s-misiones').onclick = openMisiones;
$('s-jaulas').onclick = () => proximamente('jaulas');
$('s-ofertas').onclick = () => goTab('tienda');
$('s-correo').onclick = () => proximamente('correo');
$('s-ranking').onclick = () => goTab('arena');
$('s-practica').onclick = () => { location.href = 'practica.html'; };
$('pf-practica').onclick = () => { location.href = 'practica.html'; };

/* ---- barra de pestañas: Tienda · Reino · Campaña · Ejército · Eventos ---- */
function goTab(t) {
  if (t === 'menu') { show('menu'); startDemo(); }
  else if (t === 'mundo') openWorld();
  else if (t === 'tienda') openTienda();
  else if (t === 'hogar') openHogar();
  else if (t === 'arena') show('arena');
  else if (t === 'eventos') openEventos();
  else if (t === 'ejercito') openArmy('unidades');
  else if (t === 'taberna') openTaberna();
}
document.querySelectorAll('#nav button').forEach(b => { b.onclick = () => goTab(b.dataset.tab); });
$('mundo-back').textContent = '← Campaña';
$('mundo-back').onclick = () => goTab('menu');
let nivelFrom = 'reino';
const _openKingdom = openKingdom;
openKingdom = function (kid) { nivelFrom = 'reino'; _openKingdom(kid); };
$('nv-close').onclick = () => { if (nivelFrom === 'menu') show('menu'); else show('reino'); };
$('ar-rapida').onclick = () => startRun({ kind: 'rapida' });
// tras una batalla rápida se vuelve al inicio
const _leave = leaveRun;
leaveRun = function () { if (RUN && RUN.kind === 'nivel') { _leave(); return; } show('menu'); startDemo(); };

/* ---- ejército: unidades (con su ficha), héroes y estandarte ---- */
let armySeg = 'unidades';
function openArmy(seg = armySeg) {
  armySeg = seg;
  document.querySelectorAll('#ejercito .seg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.seg === seg));
  ['unidades', 'heroes', 'estandarte'].forEach(s => { const el = $('seg-' + s); if (el) el.hidden = s !== seg; });
  const own = owned();
  if (seg === 'unidades') {
    $('ej-note').textContent = 'Tienes ' + own.length + ' de ' + ALL.length + ' unidades. Toca una para ver su ficha.';
    $('ej-grid').innerHTML = ALL.slice().sort((a, b) => (own.includes(b) - own.includes(a)) || COST[a] - COST[b]).map(k => {
      const has = own.includes(k); return '<button type="button" class="dk ' + (RARITY[k] || 'comun') + (has ? '' : ' lock') + '" data-k="' + k + '" aria-label="' + NAMES[k] + (has ? '' : ', bloqueada') + '"><span class="cost">' + COST[k] + '</span><img src="img/' + k + '_carta.png" alt=""><span class="nm">' + (has ? LABEL[k] : '¿?') + '</span></button>';
    }).join('');
    document.querySelectorAll('#ej-grid .dk').forEach(b => { b.onclick = () => openUnit(b.dataset.k); });
  } else if (seg === 'heroes') {
    const hs = heroesOwned();
    $('ej-heroes').innerHTML = Object.entries(HEROES).map(([k, h]) => {
      const has = hs.includes(k), c = CH[k], q = KINGDOMS.find(z => z.ruler === k), sel = playerHero() === k;
      return '<div class="hcard' + (has ? '' : ' lock') + '"><header><img class="hport" src="img/' + h.portrait + '.png" alt=""><div><b>' + NAMES_H[k] + '</b><span class="note">' + (has ? (sel ? 'Tu héroe en batalla' : 'Disponible') : 'Conquista el ' + (q ? q.name : 'reino de su rey')) + '</span></div></header>'
        + '<div class="statrow"><span>Vida ' + c.hp + '</span><span>Daño ' + c.dmg[0] + '–' + c.dmg[1] + '</span><span>Salta a las ' + c.goal + ' bajas</span></div>'
        + '<p><em>Pasiva.</em> ' + HERO_TXT[k][0] + '</p><p><em>Activa.</em> ' + HERO_TXT[k][1] + '</p>'
        + (has && !sel ? '<button class="btn gold small" data-h="' + k + '">Llevar a la batalla</button>' : '') + '</div>';
    }).join('');
    document.querySelectorAll('#ej-heroes [data-h]').forEach(b => { b.onclick = () => { myHero = b.dataset.h; try { localStorage.setItem('bg-hero', myHero); } catch (e) {} openArmy('heroes'); }; });
  } else paintColors();
  show('ejercito');
}
document.querySelectorAll('#ejercito .seg button').forEach(b => { b.onclick = () => openArmy(b.dataset.seg); });
$('ej-mazo').onclick = () => openDeck('ejercito');
function openUnit(k) {
  const c = CH[k], has = owned().includes(k), w = prizeWhere(k), spd = c.speed >= 80 ? 'rápida' : c.speed >= 50 ? 'normal' : 'lenta';
  const stats = ['Vida ' + c.hp, c.heal ? 'Cura ' + c.heal[0] + '–' + c.heal[1] : 'Daño ' + c.dmg[0] + '–' + c.dmg[1], 'Cada ' + c.cd[0].toString().replace('.', ',') + '–' + c.cd[1].toString().replace('.', ',') + ' s',
    'Alcance ' + (c.range / H).toFixed(1).replace('.', ','), 'Velocidad ' + spd, 'Coste ' + COST[k]];
  pop('<div class="udetail">' + cardHtml(k, has ? '' : 'shadow') + '<div><p class="eyebrow">' + RAREZA[RARITY[k] || 'comun'] + '</p><h2>' + NAMES[k] + '</h2><div class="statrow">' + stats.map(s => '<span>' + s + '</span>').join('') + '</div><p>' + HABILIDAD[k] + '</p>'
    + (has ? ((perfil.copias || {})[k] ? '<p class="note">Copias guardadas: ' + perfil.copias[k] + '</p>' : '') : '<p class="note">' + (w ? 'Prisionero en ' + w + '.' : 'Se recluta en la Taberna del Multiverso.') + '</p>') + '</div></div>');
}

/* ---- taberna del multiverso: 2 mercenarios que se renuevan cada 4 horas ---- */
const TAB = { h: 4, precio: { comun: 200, poco: 400, rara: 800, epica: 1600, legendaria: 3200 }, peso: [['comun', 50], ['poco', 28], ['rara', 15], ['epica', 5], ['legendaria', 2]] };
function rollMerc(taken) {
  let r = Math.random() * 100, rar = 'comun';
  for (const [k, w] of TAB.peso) { if (r < w) { rar = k; break; } r -= w; }
  const pool = ALL.filter(k => RARITY[k] === rar && !taken.includes(k));
  const all = ALL.filter(k => RARITY[k] !== 'ascendida' && !taken.includes(k));
  const list = pool.length ? pool : all; return list[Math.floor(Math.random() * list.length)];
}
function tabSlots() {
  const per = Math.floor(Date.now() / (TAB.h * 3.6e6));
  if (!perfil.taberna || perfil.taberna.per !== per) { const a = rollMerc([]), b = rollMerc([a]); perfil.taberna = { per, slots: [{ k: a, sold: false }, { k: b, sold: false }] }; savePerfil(); }
  return perfil.taberna.slots;
}
function openTaberna() {
  const own = owned(), slots = tabSlots();
  $('tab-slots').innerHTML = slots.map((s, i) => {
    const r = RARITY[s.k] || 'comun', price = TAB.precio[r];
    return '<div class="slot' + (s.sold ? ' sold' : '') + '">' + cardHtml(s.k) + '<b>' + NAMES[s.k] + '</b><small>' + RAREZA[r] + (own.includes(s.k) ? ' · ya lo tienes: te da una copia' : ' · nuevo para tu ejército') + '</small>'
      + (s.sold ? '<span class="chip">Contratado</span>' : '<button class="btn gold small" data-i="' + i + '"><span class="oro" style="border:0;background:none;padding:0"><i></i><b>' + fmt(price) + '</b></span></button>') + '</div>';
  }).join('');
  document.querySelectorAll('#tab-slots [data-i]').forEach(b => { b.onclick = () => buyMerc(+b.dataset.i); });
  tabTimer(); show('taberna');
}
function tabTimer() { const left = (Math.floor(Date.now() / (TAB.h * 3.6e6)) + 1) * TAB.h * 3.6e6 - Date.now(); $('tab-timer').textContent = Math.floor(left / 3.6e6) + ' h ' + Math.floor(left % 3.6e6 / 6e4) + ' min'; }
setInterval(() => { if (!$('taberna').hidden) { const per = perfil.taberna && perfil.taberna.per; tabSlots(); if (perfil.taberna.per !== per) openTaberna(); else tabTimer(); } }, 20000);
function buyMerc(i) {
  const s = tabSlots()[i], price = TAB.precio[RARITY[s.k] || 'comun'];
  if (s.sold) return;
  if (perfil.gold < price) return toast('Te faltan ' + fmt(price - perfil.gold) + ' de oro. Recoge el tributo de tus castillos y el botín de la expedición.');
  perfil.gold -= price; s.sold = true;
  if (perfil.owned.includes(s.k)) { perfil.copias = perfil.copias || {}; perfil.copias[s.k] = (perfil.copias[s.k] || 0) + 1; savePerfil(); toast(LABEL[s.k] + ' ya estaba en tu ejército: guardas una copia de su carta.'); openTaberna(); }
  else {
    perfil.owned.push(s.k); savePerfil(); openTaberna();
    pop('<div class="freed">' + cardHtml(s.k, 'reveal') + '<p><b>¡' + NAMES[s.k] + ' se une a tu ejército!</b><br>Ya puedes llevarlo en tu mazo.</p></div>');
  }
  paintGold();
}

/* ---- perfil ---- */
function openPerfil() {
  const nv = nivelDe(perfil.xp || 0), port = 'img/' + HEROES[playerHero()].portrait + '.png', est = Object.values(perfil.stars || {}).flat().reduce((s, x) => s + x, 0);
  $('pf-avatar').src = port; $('pf-name').value = perfil.nombre || 'Señor del Reino';
  $('pf-lv').textContent = 'Nivel ' + nv.lv + ' · ' + nv.cur + ' de ' + nv.need + ' de experiencia para el siguiente'; $('pf-xp').style.width = (nv.cur / nv.need * 100) + '%';
  const stats = [[fmt(perfil.gold), 'de oro'], [perfil.gemas || 0, 'diamantes'], [conquistados(), 'castillos conquistados'], [est, 'estrellas'], [owned().length + '/' + ALL.length, 'unidades'], [heroesOwned().length + '/' + Object.keys(HEROES).length, 'héroes']];
  $('pf-stats').innerHTML = stats.map(([a, b]) => '<div><b>' + a + '</b><span>' + b + '</span></div>').join('');
  $('deckall').setAttribute('aria-pressed', perfil.all); $('deckall').textContent = perfil.all ? 'Pruebas: todo desbloqueado' : 'Pruebas: desbloquear todo';
  $('deckwipe').dataset.sure = ''; $('deckwipe').textContent = 'Borrar progreso';
  paintColors(); show('perfil');
}
$('pf-back').onclick = () => goTab('menu');
$('pf-name').onchange = e => { perfil.nombre = e.target.value.trim().slice(0, 22) || 'Señor del Reino'; savePerfil(); paintHub(); };
$('pf-estandarte').onclick = () => openEdif('murallas');
$('deckall').onclick = () => { perfil.all = !perfil.all; savePerfil(); openPerfil(); };
$('deckwipe').onclick = e => {
  const b = e.currentTarget;
  if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = '¿Seguro? Toca otra vez'; return; }
  perfil = newPerfil(); savePerfil(); myDeck = STARTERS.slice(); myHero = 'aldric'; toast('Progreso borrado: vuelves a empezar con Tulio, Ailin y Rodrigo.'); openPerfil();
};

/* ---- mazo: se abre desde el menú, desde Ejército o desde la ficha de un castillo ---- */
$('deckback').onclick = () => { keepDeck(); if (deckFrom === 'nivel' && LV) show('nivel'); else if (deckFrom === 'ejercito') openArmy('unidades'); else { show('menu'); startDemo(); } };
$('deckgo').onclick = () => {
  keepDeck();
  if (deckFrom === 'nivel' && LV) startRun({ kind: 'nivel', k: LV.k, i: LV.i });
  else if (deckFrom === 'ejercito') openArmy('unidades');
  else { show('menu'); startDemo(); }
};
const _openDeck = openDeck;
openDeck = function (from = 'menu') { _openDeck(from); $('deckgo').textContent = from === 'nivel' ? '¡Atacar!' : 'Guardar mazo'; };
// al entrar desde la carga se llega al inicio con la expedición en marcha
const _tap = $('tap').onclick;
$('tap').onclick = () => { _tap(); startDemo(); };
window.__perfilAbrir = openPerfil; window.__goTab = goTab;
