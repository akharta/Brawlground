/* ==== Promoción de unidades: dos cosas que mejorar.
   NIVEL (1–100): se sube con oro; cada 10 niveles hay un salto que pide oro e insignias de mando. +3 % de vida y daño por nivel.
   RANGO (E, D, C, B, A, S, S+): se sube con copias de la carta. Cada rango multiplica mucho sus estadísticas y en C, A y S+
   la unidad aprende una habilidad nueva. Desde el rango B la unidad se ve más grande en batalla.
   Los reinos enemigos también tienen nivel y rango: más altos cuanto más lejos. ==== */
const LV_MAX = 100, LV_PASO = 0.03;
const RANGOS = ['E', 'D', 'C', 'B', 'A', 'S', 'S+'];
const RANGO_K = [1, 1.15, 1.3, 1.5, 1.75, 2.05, 2.4];            // multiplicador de vida y daño por rango
const RANGO_COPIAS = [5, 10, 20, 40, 70, 120];                   // copias para pasar del rango i al i+1 (en total)
const PUNTAS = 5;                                                 // cada estrella tiene 5 puntas: cada tanda de copias llena una, y con las 5 sube la estrella entera
const SALTO_INS = { 10: 1, 20: 2, 30: 3, 40: 4, 50: 6, 60: 8, 70: 10, 80: 13, 90: 16 };   // insignias para pasar del nivel 10, 20…
const LV_RAR = { comun: 1, poco: 1.15, rara: 1.3, epica: 1.5, legendaria: 1.8, ascendida: 2.2 };
// [nivel, rango] de los ejércitos de cada reino (los castillos más avanzados suben algo, el real +3)
const REINO_PODER = { praderas: [1, 0], bosque: [5, 0], desierto: [10, 0], nieve: [15, 1], pantano: [20, 1], volcan: [26, 1],
  playa: [32, 2], setas: [36, 2], huesos: [42, 2], engranajes: [48, 3], cristal: [55, 3], cementerio: [62, 4], cielo: [70, 4] };
const lvK = lv => 1 + LV_PASO * ((lv || 1) - 1);
const lvOf = k => Math.max(1, Math.min(LV_MAX, (perfil.niveles || {})[k] || 1));
const rangoOf = k => Math.max(0, Math.min(RANGOS.length - 1, (perfil.rangos || {})[k] || 0));
const rkK = r => { r = r || 0; const i = Math.min(RANGO_K.length - 1, Math.floor(r)), f = r - i; return i >= RANGO_K.length - 1 ? RANGO_K[i] : RANGO_K[i] + (RANGO_K[i + 1] - RANGO_K[i]) * f; };   // las puntas ya cuentan un poco
const poderK = (lv, r) => lvK(lv) * rkK(r);
const puntasOf = k => rangoOf(k) >= RANGOS.length - 1 ? 0 : Math.max(0, Math.min(PUNTAS - 1, (perfil.puntas || {})[k] || 0));
const rangoF = k => rangoOf(k) + puntasOf(k) / PUNTAS;           // rango con sus puntas (para la fuerza en batalla)
const copiasOf = k => (perfil.copias || {})[k] || 0;
const insignias = () => perfil.insignias || 0;
function addCopias(k, n) { perfil.copias = perfil.copias || {}; perfil.copias[k] = (perfil.copias[k] || 0) + n; }
function addInsignias(n) { perfil.insignias = insignias() + n; }
// estrellas y puntas dibujadas (img/estrellas), del color del rango: gris E, verde D, azul C, morado B, naranja A, rojo S, rojo y oro S+
const estImg = (c, cls) => '<img class="est' + (cls ? ' ' + cls : '') + '" src="img/estrellas/estrella' + c + '.png" alt="">';
const estrellas = r => r ? '<span class="ests">' + estImg(r).repeat(r) + '</span>' : '';
// sellos de rango dibujados (img/rangos): del gris de la E al rojo y oro de la S+
const RANGO_IMG = ['e', 'd', 'c', 'b', 'a', 's', 'splus'].map(n => 'img/rangos/' + n + '.png');
const sello = (r, cls) => '<img class="sello' + (cls ? ' ' + cls : '') + '" src="' + RANGO_IMG[r] + '" alt="Rango ' + RANGOS[r] + '">';
const rangoHtml = r => '<span class="rk r' + r + '">' + sello(r) + (r ? '<i>' + estrellas(r) + '</i>' : '') + '</span>';

/* ---- costes ---- */
const oroNivel = (k, lv) => Math.round((20 + 8 * lv + 0.6 * lv * lv) * (LV_RAR[RARITY[k] || 'comun'] || 1) / 10) * 10;
function lvCoste(k) {   // lo que cuesta subir del nivel actual al siguiente (null si está al máximo)
  const lv = lvOf(k); if (lv >= LV_MAX) return null;
  const salto = SALTO_INS[lv] || 0;
  return { oro: oroNivel(k, lv) * (salto ? 3 : 1), insignias: salto, salto: !!salto };
}
// lo que cuesta llenar la siguiente punta: la quinta parte de las copias del rango (el coste total no cambia)
const rkCoste = k => { const r = rangoOf(k); return r >= RANGOS.length - 1 ? null : { copias: Math.ceil(RANGO_COPIAS[r] / PUNTAS), punta: puntasOf(k) + 1, total: RANGO_COPIAS[r] }; };
const puntasHtml = (n, cls, rk) => '<span class="puntas' + (cls ? ' ' + cls : '') + '" aria-label="' + n + ' de ' + PUNTAS + ' puntas">' + Array.from({ length: PUNTAS }, (_, i) => '<img src="img/estrellas/punta' + (rk || 0) + '.png" alt="" style="transform:rotate(' + i * 72 + 'deg)"' + (i < n ? ' class="on"' : '') + '>').join('') + '</span>';
const puedeNivel = k => { const c = lvCoste(k); return !!c && owned().includes(k) && perfil.gold >= c.oro && insignias() >= c.insignias; };
const puedeRango = k => { const c = rkCoste(k); return !!c && owned().includes(k) && copiasOf(k) >= c.copias; };
const puedeMejorar = k => puedeRango(k);
const mejorables = () => owned().filter(puedeRango).length;

/* ---- habilidades que se aprenden al subir de rango (C, A y S+). Tipos genéricos que entiende el motor:
   crit (probabilidad de golpe doble), furia (+daño herido), ejecutar (+daño a enemigos tocados), aura (+daño a aliados cerca),
   escudo (sale con escudo: fracción de su vida), aguante (sobrevive una vez a un golpe mortal), robo (se cura con el daño),
   aturdir (probabilidad de aturdir), espinas (devuelve daño cuerpo a cuerpo), estallido (al caer explota), regen (vida por segundo),
   veloz (anda y ataca más rápido), asedio (+daño a castillos) ---- */
const PERK_TXT = {
  crit: v => Math.round(v * 100) + ' % de probabilidad de golpe crítico (daño doble).',
  furia: v => 'Herido por debajo de la mitad, hace un ' + Math.round(v * 100) + ' % más de daño.',
  ejecutar: v => 'Hace un ' + Math.round(v * 100) + ' % más de daño a enemigos con menos del 30 % de vida.',
  aura: v => 'Los aliados cercanos hacen un ' + Math.round(v * 100) + ' % más de daño.',
  escudo: v => 'Sale al campo con un escudo del ' + Math.round(v * 100) + ' % de su vida.',
  aguante: () => 'Una vez por batalla aguanta un golpe mortal y recupera el 40 % de su vida.',
  robo: v => 'Se cura un ' + Math.round(v * 100) + ' % del daño que hace.',
  aturdir: v => Math.round(v * 100) + ' % de probabilidad de aturdir al golpear.',
  espinas: v => 'Devuelve el ' + Math.round(v * 100) + ' % del daño cuerpo a cuerpo que recibe.',
  estallido: v => 'Al caer, estalla y hace ' + v + ' de daño a su alrededor.',
  regen: v => 'Recupera un ' + (v * 100).toString().replace('.', ',') + ' % de su vida cada segundo.',
  veloz: v => 'Anda y ataca un ' + Math.round(v * 100) + ' % más rápido.',
  asedio: v => 'Hace un ' + Math.round(v * 100) + ' % más de daño a los castillos.',
};
// por unidad: [rango en que se aprende, nombre, tipo, valor]
const PERKS = {
  legionario: [[2, 'Muro de escudos', 'escudo', 0.25], [4, 'Disciplina de legión', 'aura', 0.1], [6, 'Última legión', 'aguante', 1]],
  arquera: [[2, 'Ojo certero', 'crit', 0.2], [4, 'Flechas veloces', 'veloz', 0.2], [6, 'Puntería letal', 'ejecutar', 0.5]],
  tercio: [[2, 'Picas firmes', 'espinas', 0.25], [4, 'Erizo', 'escudo', 0.3], [6, '¡Santiago y cierra!', 'aturdir', 0.2]],
  valkiria: [[2, 'Galope', 'veloz', 0.2], [4, 'Furia nórdica', 'furia', 0.35], [6, 'Valhalla', 'aguante', 1]],
  ninja: [[2, 'Golpe en la sombra', 'crit', 0.25], [4, 'Veneno', 'ejecutar', 0.5], [6, 'Paso de humo', 'veloz', 0.25]],
  pistolero: [[2, 'Bala de plata', 'crit', 0.2], [4, 'Gatillo rápido', 'veloz', 0.25], [6, 'Duelo al sol', 'ejecutar', 0.6]],
  lobo: [[2, 'Sed de sangre', 'robo', 0.2], [4, 'Jauría', 'aura', 0.1], [6, 'Alfa', 'furia', 0.4]],
  samurai: [[2, 'Bushido', 'aguante', 1], [4, 'Filo del viento', 'veloz', 0.2], [6, 'Corte final', 'ejecutar', 0.6]],
  kungfu: [[2, 'Puño de hierro', 'aturdir', 0.15], [4, 'Chi', 'regen', 0.02], [6, 'Gran maestro', 'veloz', 0.25]],
  muerte: [[2, 'Cosecha', 'robo', 0.25], [4, 'Siega', 'ejecutar', 0.5], [6, 'Inmortal', 'aguante', 1]],
  acorazado: [[2, 'Coraza de púas', 'espinas', 0.3], [4, 'Bastión', 'regen', 0.02], [6, 'Inamovible', 'escudo', 0.35]],
  fraile: [[2, 'Fe', 'escudo', 0.3], [4, 'Bendición', 'aura', 0.1], [6, 'Milagro', 'aguante', 1]],
  catapulta: [[2, 'Piedras gordas', 'asedio', 0.5], [4, 'Metralla', 'crit', 0.2], [6, 'Barril de pólvora', 'estallido', 120]],
  centinela: [[2, 'Blindaje', 'escudo', 0.3], [4, 'Sobrecarga', 'veloz', 0.2], [6, 'Autodestrucción', 'estallido', 150]],
  desencadenado: [[2, 'Cadenas de sangre', 'robo', 0.2], [4, 'Ira', 'furia', 0.4], [6, 'Indomable', 'aguante', 1]],
  imparable: [[2, 'Hambre', 'robo', 0.25], [4, 'Frenesí', 'crit', 0.2], [6, 'Devorador', 'ejecutar', 0.6]],
};
const perksDe = (k, r) => (PERKS[k] || []).filter(p => p[0] <= r);

/* ---- en batalla: cada unidad sale con las estadísticas y habilidades de su nivel y rango ---- */
function applyPromo(u, lv, r, extra = 1) {
  if (!u || !u.cfg) return;
  const k = poderK(lv, r) * extra; u.lv = lv; u.rk = Math.floor(r); u.pk = k;
  if (k !== 1) {
    const c = Object.assign({}, u.cfg); c.hp = Math.round(c.hp * k); if (c.heal) c.heal = c.heal.map(x => Math.round(x * k));
    u.cfg = c; u.hp = u.max = c.hp;
  }
  const ps = perksDe(u.type, r); if (ps.length) { u.perk = {}; ps.forEach(([, , t, v]) => { u.perk[t] = v; }); }
  if (u.perk && u.perk.escudo) u.shieldHp = Math.round(u.max * u.perk.escudo);
  if (r >= 3 && u.root) u.root.setScale(1 + 0.03 * (Math.floor(r) - 2));   // rango B o más: un poco más grande (luego, aspecto propio)
}
let thornLock = false;
function auraBonus(src) {
  let b = 0;
  for (const v of units) if (v !== src && v.team === src.team && v.alive && v.perk && v.perk.aura && Math.abs(v.x - src.x) < H * 2.4) b = Math.max(b, v.perk.aura);
  return b;
}
const _dmgLv = Unit.prototype.damage;
Unit.prototype.damage = function (d, src, fromX, crit) {
  if (src && src.pk && src.pk !== 1) d = d * src.pk;
  if (src && src.perk) {
    const P = src.perk;
    if (P.crit && !crit && Math.random() < P.crit) { d *= 2; crit = true; }
    if (P.furia && src.hp < src.max * 0.5) d *= 1 + P.furia;
    if (P.ejecutar && this.hp < this.max * 0.3) d *= 1 + P.ejecutar;
  }
  if (src && src.team && !src.isCastle && units.length) { const a = auraBonus(src); if (a) d *= 1 + a; }
  if (typeof dmgMods === 'function') d = dmgMods(d, src, this);   // bestias y hechizos (reino.js)
  d = Math.max(1, Math.round(d));
  if (this.shieldHp > 0 && this.alive && this.state !== 'die') {   // el escudo para el golpe antes que la vida
    const a = Math.min(this.shieldHp, d); this.shieldHp -= a; d -= a;
    burst(this.x, this.gy - H * 0.6, 0x7fd0ff, 4, 110);
    if (d <= 0) { if (this.shieldHp <= 0 && !(B && B.sim)) floatText(this.x, this.gy - H * 1.5, '¡Sin escudo!', '#7fd0ff'); return; }
  }
  if (this.perk && this.perk.aguante && !this.aguanteUsed && this.alive && this.state !== 'die' && this.hp - d <= 0) {
    this.aguanteUsed = true; this.hp = Math.round(this.max * 0.4);
    if (!B || !B.sim) { floatText(this.x, this.gy - H * 1.7, '¡Aguanta!', '#ffd84a'); burst(this.x, this.gy - H * 0.6, 0xffd84a, 16, 200); }
    return;
  }
  const before = this.hp, dying = this.state === 'die';
  _dmgLv.call(this, d, src, fromX, crit);
  const dealt = Math.max(0, before - Math.max(0, this.hp));
  if (src && src.perk && src.alive && src.state !== 'die') {
    if (src.perk.robo && dealt > 0) src.hp = Math.min(src.max, src.hp + dealt * src.perk.robo);
    if (src.perk.aturdir && this.stun && this.alive && this.state !== 'die' && Math.random() < src.perk.aturdir) this.stun(0.8);
  }
  if (this.perk && this.perk.espinas && src && src.damage && !src.isCastle && src.cfg && !src.cfg.ranged && !thornLock && dealt > 0) {
    thornLock = true; src.damage(Math.max(1, Math.round(dealt * this.perk.espinas)), null, this.x); thornLock = false;
  }
  if (!dying && this.state === 'die' && this.perk && this.perk.estallido && !this.boom) {
    this.boom = true; const R = H * 1.6, x = this.x;
    if (!B || !B.sim) { burst(x, this.gy - H * 0.4, 0xff9a3a, 30, 320); burst(x, this.gy - H * 0.4, 0x3a3a3a, 16, 200); scene.cameras.main.shake(140, 0.004); }
    units.filter(v => v.team !== this.team && v.alive && v.state !== 'die' && Math.abs(v.x - x) <= R).forEach(v => v.damage(Math.round(this.perk.estallido * (this.pk || 1)), null, x));
  }
};
const _mkCastle = makeCastle;
makeCastle = function (team, hp) {
  const c = _mkCastle(team, hp), f = c.damage;
  c.damage = function (d, src) {
    if (src && src.pk && src.pk !== 1) d = d * src.pk;
    if (src && src.perk && src.perk.asedio) d *= 1 + src.perk.asedio;
    return f.call(this, Math.max(1, Math.round(d)), src);
  };
  return c;
};
// regeneración y escudo: cada fotograma de batalla
const _bsLv = battleStep;
battleStep = function (dt) {
  _bsLv(dt);
  if (!B || B.idle || B.over) return;
  for (const u of units) if (u.perk && u.perk.regen && u.alive && u.state !== 'die' && u.hp < u.max) u.hp = Math.min(u.max, u.hp + u.max * u.perk.regen * dt);
};
const _resetLv = resetBattle;
resetBattle = function (o = {}) {
  _resetLv(o);
  const real = !o.demo && !o.sim;
  B.blue.pw = real ? Object.fromEntries(owned().map(k => [k, [lvOf(k), rangoF(k)]])) : {};
  const d = B.blue.deck || [], pw = d.map(k => B.blue.pw[k] || [1, 0]);
  const media = pw.length ? [Math.round(pw.reduce((s, p) => s + p[0], 0) / pw.length), Math.round(pw.reduce((s, p) => s + p[1], 0) / pw.length)] : [1, 0];
  B.purple.pwAll = o.enemyPw || (o.run && o.run.kind === 'rapida' ? media : [1, 0]);
  if (!o.sim) renderHand();   // la mano ya estaba pintada: ahora con el nivel y el rango de cada carta
};
const _levelOptsLv = levelOpts;
levelOpts = function (kid, i) { return Object.assign(_levelOptsLv(kid, i), { enemyPw: enemyPower(kid, i) }); };
function enemyPower(kid, i) {
  const [lv, r] = REINO_PODER[kid] || [1, 0], L = KD(kid).levels[i];
  return [Math.min(LV_MAX, lv + (lv > 1 ? Math.floor(i / 3) : 0) + (L && L.royal && lv > 1 ? 3 : 0)), r];
}
const enemyLevel = (kid, i) => enemyPower(kid, i)[0];
const _playLv = play;
play = function (team, idx) {
  const type = B && B[team] && B[team].hand[idx], n = units.length, ok = _playLv(team, idx);
  if (ok && units.length > n) {
    const [lv, r] = team === 'blue' ? (B.blue.pw || {})[type] || [1, 0] : B.purple.pwAll || [1, 0];
    applyPromo(units[units.length - 1], lv, r, typeof teamBuffK === 'function' ? teamBuffK(team) : 1);
  }
  return ok;
};

/* ---- recompensas: copias al ganar y en la expedición; insignias al conquistar ---- */
function repartirCopias(pool, n) {
  const out = {}; pool = pool.filter(k => owned().includes(k)); if (!pool.length) return out;
  const vivas = pool.filter(k => rangoOf(k) < RANGOS.length - 1), lista = vivas.length ? vivas : pool;   // primero las que aún pueden subir de rango
  for (let i = 0; i < n; i++) { const k = lista[Math.floor(Math.random() * lista.length)]; out[k] = (out[k] || 0) + 1; addCopias(k, 1); }
  return out;
}
const _brLv = battleResult;
battleResult = function (win) {
  const r = _brLv(win);
  if (win && !B.auto) {
    const n = r.run.kind === 'nivel' ? (r.first ? 3 : 1) : 1; r.copias = repartirCopias(B.blue.deck, n);
    if (r.run.kind === 'nivel' && r.first) { r.insignias = KD(r.run.k).levels[r.run.i].royal ? 5 : 1; addInsignias(r.insignias); }
    savePerfil();
  }
  return r;
};
const copiasHtml = c => Object.entries(c).map(([k, n]) => '<span class="cpgain">' + cardHtml(k) + '<b>+' + n + '</b></span>').join('');
const insHtml = n => '<span class="oro ins"><i></i><b>' + (n === undefined ? insignias() : '+' + n) + '</b></span>';
const _srLv = showResult;
showResult = function (res) {
  _srLv(res);
  if (res.insignias) $('over-prize').insertAdjacentHTML('afterbegin', '<div class="loot">' + insHtml(res.insignias) + '<span class="note">insignias de mando</span></div>');
  if (res.copias && Object.keys(res.copias).length) $('over-prize').insertAdjacentHTML('beforeend', '<div class="loot cps"><span class="note">Copias de cartas</span>' + copiasHtml(res.copias) + '</div>');
};
const _ceLv = collectExp;
collectExp = function (el) {
  const t0 = perfil.exp || Date.now(), h = Math.min(12, (Date.now() - t0) / 3.6e6);
  _ceLv(el);
  if (perfil.exp !== t0) {
    const n = Math.floor(h / 2);
    if (n > 0) { const c = repartirCopias(playerDeck(), n); savePerfil(); setTimeout(() => pop('<p class="eyebrow">Botín de la expedición</p><h2>Copias de cartas</h2><p class="note">Tu ejército ha traído copias de algunas cartas. Úsalas en Tropas para subir de rango tus unidades.</p><div class="army">' + copiasHtml(c) + '</div>'), 900); }
  }
};
// misiones: completar las tres da también una insignia
const _giveLv = give;
give = function (r, el) { if (r.insignias) addInsignias(r.insignias); _giveLv(r, el); };
const _rwLv = rewardTxt;
rewardTxt = function (r) { const t = _rwLv(r); return r.insignias ? (t ? t + ' y ' : '') + r.insignias + (r.insignias === 1 ? ' insignia' : ' insignias') : t; };

/* ---- nivel y rango en las cartas ---- */
const lvBadge = (lv, enemy, r) => '<span class="lvb' + (enemy ? ' foe' : '') + '">Nv ' + lv + '</span>' + (r ? '<span class="rkb">' + estrellas(r) + '</span>' + sello(r, 'rks') : '');
function marcaCartas(sel, fn) {
  document.querySelectorAll(sel).forEach(b => {
    const k = b.dataset.k || (B && B.blue.hand[+b.dataset.i]); if (!k || b.classList.contains('lock')) return;
    const [lv, r] = fn(k), tag = k + ':' + lv + ':' + r; if (b.dataset.pw === tag) return;   // se repinta si cambia
    b.querySelectorAll('.lvb, .rkb, .rks').forEach(e => e.remove()); b.dataset.pw = tag; b.insertAdjacentHTML('beforeend', lvBadge(lv, false, r));
  });
}
const _renderHandLv = renderHand;
renderHand = function () { _renderHandLv(); marcaCartas('#hand .hc', k => (B.blue.pw || {})[k] || [1, 0]); };
const _openDeckLv = openDeck;
openDeck = function (from) { _openDeckLv(from); marcaCartas('#deckgrid .dk', k => [lvOf(k), rangoOf(k)]); };
const _openLevelLv = openLevel;
openLevel = function (kid, i) {
  _openLevelLv(kid, i);
  const [lv, r] = enemyPower(kid, i);
  document.querySelectorAll('#nv-army .dk').forEach(b => b.insertAdjacentHTML('beforeend', lvBadge(lv, true, r)));
  $('nv-desc').textContent += ' Su ejército es de nivel ' + lv + ', rango ' + RANGOS[r] + '.';
};
const _openArmyLv = openArmy;
openArmy = function (seg) {
  _openArmyLv(seg);
  if (armySeg !== 'unidades') return;
  document.querySelectorAll('#ej-grid .dk').forEach(b => {
    const k = b.dataset.k; if (!owned().includes(k)) return;
    const c = rkCoste(k), have = copiasOf(k);
    b.insertAdjacentHTML('beforeend', lvBadge(lvOf(k), false, rangoOf(k)) + '<span class="cpbar' + (c && have >= c.copias ? ' full' : '') + '"><i style="width:' + (c ? Math.min(100, have / c.copias * 100) : 100) + '%"></i><b>' + (c ? have + '/' + c.copias : 'Máx.') + '</b></span>' + (c ? puntasHtml(puntasOf(k), 'mini', rangoOf(k)) : ''));
    b.classList.toggle('up', puedeRango(k));
  });
  $('ej-note').innerHTML = 'Tienes ' + owned().length + ' de ' + ALL.length + ' unidades. Toca una para subirla de nivel (oro) o de rango (copias).' + (mejorables() ? ' <b>Puedes promocionar ' + mejorables() + '.</b>' : '') + ' ' + insHtml();
};
// aviso en el botón de Tropas cuando hay un rango listo
const _paintGoldLv = paintGold;
paintGold = function () {
  _paintGoldLv();
  document.querySelectorAll('.ins-n').forEach(e => { e.textContent = insignias(); });
  const d = document.querySelector('#s-tropas .dot'); if (d) d.hidden = !mejorables();
};

/* ---- ficha de la unidad: nivel (oro) y rango (copias) ---- */
const RK_ABBR = r => 'rango ' + RANGOS[r] + (r ? ' (' + r + '★)' : '');
openUnit = function (k, subio) {
  const c = CH[k], has = owned().includes(k), lv = lvOf(k), r = rangoOf(k), lc = lvCoste(k), rc = rkCoste(k), w = prizeWhere(k);
  const k0 = poderK(lv, rangoF(k)), kL = poderK(Math.min(LV_MAX, lv + 1), rangoF(k)), kR = poderK(lv, rc ? rangoF(k) + 1 / PUNTAS : r);
  const spd = c.speed >= 80 ? 'rápida' : c.speed >= 50 ? 'normal' : 'lenta', f = x => fmt(Math.round(x));
  const st = (a, kk) => c.heal ? f(c.heal[0] * kk) + '–' + f(c.heal[1] * kk) : f(c.dmg[0] * kk) + '–' + f(c.dmg[1] * kk);
  const rows = [['Vida', f(c.hp * k0)], [c.heal ? 'Cura' : 'Daño', st(0, k0)],
    ['Cadencia', 'cada ' + String(c.cd[0]).replace('.', ',') + '–' + String(c.cd[1]).replace('.', ',') + ' s'], ['Alcance', (c.range / H).toFixed(1).replace('.', ',')], ['Velocidad', spd], ['Coste', COST[k] + ' de energía']];
  const perks = (PERKS[k] || []).map(([rr, nm, t, v]) => '<li class="' + (rr <= r ? 'on' : '') + '"><b>' + nm + '</b> <small>' + sello(rr, 'mini') + 'rango ' + RANGOS[rr] + '</small><br>' + PERK_TXT[t](v) + '</li>').join('');
  let mejora = '';
  if (has) {
    const have = copiasOf(k);
    mejora = '<div class="promo">'
      + '<div class="pcol"><div class="mrow"><b>Nivel ' + lv + '</b><span class="note">de ' + LV_MAX + '</span></div>'
      + (lc ? '<p class="note">+3 % de vida y ' + (c.heal ? 'curación' : 'daño') + ': ' + f(c.hp * k0) + ' → <em>' + f(c.hp * kL) + '</em> de vida.' + (lc.salto ? ' <b>Salto de nivel:</b> pide ' + lc.insignias + (lc.insignias === 1 ? ' insignia' : ' insignias') + ' de mando (tienes ' + insignias() + ').' : '') + '</p>'
        + '<button class="btn gold small" id="up-lv"' + (puedeNivel(k) ? '' : ' disabled') + '><span class="oro" style="border:0;background:none;padding:0"><i></i><b>' + fmt(lc.oro) + '</b></span>' + (lc.insignias ? ' + ' + insHtml(lc.insignias).replace('+', '') : '') + '</button>'
        : '<p class="note">Nivel máximo.</p>') + '</div>'
      + '<div class="pcol"><div class="mrow">' + rangoHtml(r) + (rc ? puntasHtml(puntasOf(k), '', r) : '') + '<span class="note">' + (rc ? 'con las 5 puntas, rango ' + RANGOS[r + 1] : 'rango máximo') + '</span></div>'
      + (rc ? '<span class="cpbar wide' + (have >= rc.copias ? ' full' : '') + '"><i style="width:' + Math.min(100, have / rc.copias * 100) + '%"></i><b>Copias ' + have + '/' + rc.copias + '</b></span>'
        + '<p class="note">Cada punta pide ' + rc.copias + (rc.copias === 1 ? ' copia' : ' copias') + ' (punta ' + rc.punta + ' de ' + PUNTAS + '): ' + f(c.hp * k0) + ' → <em>' + f(c.hp * kR) + '</em> de vida. Con las 5, ×' + String(+(RANGO_K[r + 1] / RANGO_K[r]).toFixed(2)).replace('.', ',') + ' a todo.' + ((PERKS[k] || []).find(p => p[0] === r + 1) ? ' Aprende <b>' + PERKS[k].find(p => p[0] === r + 1)[1] + '</b>.' : '') + (r + 1 === 3 ? ' Se ve más grande en batalla.' : '') + '</p>'
        + '<button class="btn gold small" id="up-rk"' + (puedeRango(k) ? '' : ' disabled') + '>Promocionar</button>'
        : '') + '</div></div>';
  }
  pop('<div class="udetail' + (subio ? ' lvup' : '') + '">' + cardHtml(k, has ? '' : 'shadow') + '<div><p class="eyebrow">' + RAREZA[RARITY[k] || 'comun'] + (has ? ' · ' + RK_ABBR(r) : '') + '</p><h2>' + NAMES[k] + '</h2>'
    + '<table class="ustats">' + rows.map(([a, b]) => '<tr><th>' + a + '</th><td>' + b + '</td></tr>').join('') + '</table><p>' + HABILIDAD[k] + '</p>'
    + (has ? '' : '<p class="note">' + (w ? 'Prisionero en ' + w + '.' : 'Se recluta en la Taberna del Multiverso o en las celdas.') + '</p>') + '</div></div>'
    + mejora + (perks ? '<h3 class="ph">Habilidades de rango</h3><ul class="perks">' + perks + '</ul>' : ''));
  if (has) document.querySelector('#pop .udetail .dk').insertAdjacentHTML('beforeend', lvBadge(lv, false, r));
  // pulsar sube una vez; mantener pulsado sigue subiendo hasta el límite o hasta que pida un recurso nuevo (ver holdUp)
  if ($('up-lv')) { $('up-lv').onpointerdown = e => holdUp(e, () => subirNivel(k, true)); $('up-lv').onclick = () => { if (performance.now() - HOLD_T > 3000) subirNivel(k); }; }
  if ($('up-rk')) { $('up-rk').onpointerdown = e => holdUp(e, () => subirRango(k, true)); $('up-rk').onclick = () => { if (performance.now() - HOLD_T > 3000) subirRango(k); }; }
};
const _popLv = pop;
pop = function (...a) { $('pop-ok').disabled = false; return _popLv(...a); };
$('pop-close').addEventListener('click', () => { if (!$('ejercito').hidden && armySeg === 'unidades') openArmy('unidades'); });
// mantener pulsado el botón de subir: repite cada vez más rápido. Devuelve false para parar (sin recursos, en el máximo o
// ante un recurso nuevo: el salto de nivel pide insignias de mando y hay que volver a pulsar).
let HOLD = null, HOLD_T = 0;
function holdUp(e, fn) {
  if (e.button > 0 || HOLD) return;
  HOLD_T = performance.now();
  e.preventDefault(); HOLD = { n: 0, t: 0 };
  const paso = () => { if (!HOLD) return; const seguir = fn(); if (seguir === false) { HOLD = null; return; } HOLD.n++; HOLD.t = setTimeout(paso, Math.max(60, 320 - HOLD.n * 28)); };
  fn() === false ? (HOLD = null) : (HOLD.t = setTimeout(paso, 420));
}
const holdSuelta = () => { HOLD_T = performance.now(); if (HOLD) { clearTimeout(HOLD.t); HOLD = null; } };
['pointerup', 'pointercancel', 'blur'].forEach(ev => window.addEventListener(ev, holdSuelta, true));
function subirNivel(k, rep) {
  if (!puedeNivel(k)) return false;
  const c = lvCoste(k);
  perfil.gold -= c.oro; perfil.insignias = insignias() - c.insignias; perfil.niveles = perfil.niveles || {}; perfil.niveles[k] = lvOf(k) + 1;
  savePerfil(); paintGold(); if (!rep) toast(LABEL[k] + ' sube a nivel ' + lvOf(k) + '.'); openUnit(k, true);
  if (!rep) return true;
  const sig = lvCoste(k); return !!sig && puedeNivel(k) && !(sig.insignias && !c.insignias);   // el salto de nivel pide un recurso nuevo: se para
}
function subirRango(k, rep) {
  if (!puedeRango(k)) return false;
  const c = rkCoste(k); let r = rangoOf(k);
  perfil.copias[k] -= c.copias; perfil.puntas = perfil.puntas || {}; perfil.rangos = perfil.rangos || {};
  const pt = puntasOf(k) + 1, sube = pt >= PUNTAS;
  if (sube) { r++; perfil.rangos[k] = r; perfil.puntas[k] = 0; } else perfil.puntas[k] = pt;
  savePerfil(); paintGold();
  if (!sube) { if (!rep) toast(LABEL[k] + ': punta ' + pt + ' de ' + PUNTAS + ' del rango ' + RANGOS[r + 1] + '.'); openUnit(k, true); return rep ? puedeRango(k) : true; }
  const p = (PERKS[k] || []).find(x => x[0] === r);
  openUnit(k, true);
  // arriba de la ficha, el sello nuevo (la ficha sigue abierta para seguir promocionando)
  $('pop-body').insertAdjacentHTML('afterbegin', '<div class="ascenso">' + sello(r, 'big') + '<p><b>¡' + LABEL[k] + ' asciende a rango ' + RANGOS[r] + '!</b> ' + estrellas(r)
    + '<br>×' + RANGO_K[r].toString().replace('.', ',') + ' a vida y daño' + (p ? '. Aprende <b>' + p[1] + '</b>: ' + PERK_TXT[p[2]](p[3]).replace(/\.$/, '') : '') + '.</p></div>');
  $('pop-body').firstElementChild.scrollIntoView({ block: 'start' });
  return rep ? puedeRango(k) : true;
}
const mejorar = subirRango;
window.__mejorar = subirRango; window.__subirNivel = subirNivel; window.__lvOf = lvOf; window.__rangoOf = rangoOf; window.__openLevel = openLevel;
window.__unitsLv = () => units.map(u => u.type + ':' + u.team + ':' + u.max + ':nv' + (u.lv || 1) + ':r' + (u.rk || 0) + (u.perk ? ':' + Object.keys(u.perk).join('+') : ''));
