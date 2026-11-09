/* ==== Capa de batalla: castillos, torres, energía, mazo, IA y estadísticas.
   Se monta sobre el código de unidades del campo de pruebas (construir.py). ==== */
const COST = __COST__;
const LABEL = Object.fromEntries(Object.entries(NAMES).map(([k, v]) => [k, v.split(',')[0]]));
LABEL.aldric = 'Rey Aldric'; LABEL.lyra = 'Lyra'; LABEL.gull = 'Gūll'; LABEL.guardia = 'Guardián'; LABEL.esqueleto = 'Esqueleto';
const ALL = Object.keys(NAMES);
const EMAX = 10, EREGEN = 1 / 3.5, DOUBLE_AT = 120, CASTLE_HP = 1500, HERO_GOAL = CH.aldric.goal, TOWER = { range: H * 3.2, cd: 1.3, dmg: 8 };
let B = null, castles = {}, castleG, flashG, throneImg = null, throneImgP = null, paused = false;
const THRONE = { x: 140, y: 200, w: 140 };
// héroes que se pueden llevar a la batalla
const HEROES = {
  aldric: { name: 'Rey Aldric', skill: 'seismic', skillName: 'Golpe sísmico', throne: 'trono_aldric', empty: 'trono_vacio', portrait: 'aldric_retrato' },
  lyra: { name: 'Lyra', skill: 'storm', skillName: 'Tormenta de plumas', throne: 'trono_lyra', empty: 'trono_lyra_vacio', portrait: 'lyra_retrato' },
  gull: { name: 'Gūll', skill: 'charge', skillName: 'Embestida porcina', throne: 'trono_gull', empty: 'trono_gull_vacio', portrait: 'gull_retrato', tw: 1.5 },   // trono con el jabalí dormido al lado: más ancho
};
let myHero = (() => { try { const h = localStorage.getItem('bg-hero'); return HEROES[h] ? h : 'aldric'; } catch (e) { return 'aldric'; } })();   // trono sobre el torreón de tu castillo
// castillos dibujados: centro en CASTLE_VX, el suelo del torreón (plat) queda a la altura del trono; arch = arquero de la torre delantera
const CASTLE_VX = 140, CASTLE_W = 360, CASTLE_FRONT = CASTLE_VX + CASTLE_W * 0.47;   // frente de la muralla
// el terreno de juego va de FIELD_L a FIELD_R: nadie pisa ningún castillo (al aparecer, al ser empujado o al lanzarse)
const FIELD_L = CASTLE_FRONT + H * 0.5, FIELD_R = W - FIELD_L;
const CASTLE_ART = { blue: { key: 'castillo_azul', plat: [260, 105], arch: [490, 150] }, purple: { key: 'castillo_morado', plat: [260, 95], arch: [30, 162] } };
let castleImg = {};
// aspecto del castillo de cada bando (reino.js): dibujo propio con su suelo del torreón (plat) y su arquero (arch), también
// dañado (_d) y en ruinas (_r); dy: lo que el dibujo dañado asoma por arriba. Sin su dibujo de ruinas, las genéricas
let CASTLE_SKIN = { blue: null, purple: null };
function castleArt(team, st = '') {
  const sk = CASTLE_SKIN[team];
  if (sk) {
    const s = st === '_danado' ? 'd' : st === '_destruido' ? 'r' : '', key = 'cas_' + sk.id + (s ? '_' + s : ''), ok = !s || (scene && scene.textures.exists(key));
    if (ok || s === 'd') {   // el rival lo tiene al revés (volteado): su arquero queda a la izquierda
      const dy = ok && s && sk[s] ? sk[s].dy : 0, fx = x => team === 'purple' ? 520 - x : x;
      return { key: ok ? key : 'cas_' + sk.id, plat: [fx(sk.plat[0]), sk.plat[1] + dy], arch: [fx(sk.arch[0]), sk.arch[1] + dy], flip: team === 'purple' };
    }
  }
  return { key: CASTLE_ART[team].key + st, plat: CASTLE_ART[team].plat, arch: CASTLE_ART[team].arch };
}
let cam, db = null;
(async () => { try { db = await (window.claude?.use?.('db') ?? null); } catch (e) { db = null; } })();
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const $ = id => document.getElementById(id);

// mazo del jugador: se recuerda en este navegador
let myDeck = (() => { try { const d = JSON.parse(localStorage.getItem('bg-deck') || 'null'); if (Array.isArray(d) && d.length === 8 && d.every(k => COST[k])) return d; } catch (e) {} return ['legionario', 'arquera', 'lobo', 'tercio', 'valkiria', 'ninja', 'samurai', 'pistolero']; })();
function aiDeck(pool = ALL) {
  // la IA arma un mazo variado con las cartas de pool: dos baratas, cuatro medias y dos caras
  if (pool.length <= 8) return shuffle(pool.slice());
  const by = (lo, hi) => shuffle(pool.filter(k => COST[k] >= lo && COST[k] <= hi));
  const d = [...new Set([...by(1, 2).slice(0, 2), ...by(3, 4).slice(0, 4), ...by(5, 7).slice(0, 2)])];
  for (const k of shuffle(pool.slice())) if (d.length < 8 && !d.includes(k)) d.push(k);
  return d;
}
// un mazo puede tener menos de 8 cartas (al empezar la campaña solo hay 3): la mano enseña las que haya
function newSide(deck, regenK = 1) { const q = shuffle(deck.slice()); return { energy: 5, hand: q.splice(0, 4), queue: q, kills: 0, towerT: 1, deck: deck.slice(), regenK }; }

function makeCastle(team, hp = CASTLE_HP) {
  return { isCastle: true, type: 'castle', team, x: team === 'blue' ? CASTLE_FRONT - H * 0.2 : W - CASTLE_FRONT + H * 0.2, lane: 0,   // como objetivo, un poco detrás del frente: todos los de cuerpo a cuerpo llegan a golpearlo desde FIELD_L
     get gy() { return GROUND; }, alive: true, state: 'idle',
    hp, max: hp, cfg: { ranged: false, h: 1.8 }, dir: team === 'blue' ? 1 : -1, flash: 0, bigK: 1,
    knock() { return false; }, shove() {}, healBy() {},
    damage(d, src) {
      if (!this.alive || !B || B.over || B.idle) return;
      const dealt = Math.min(this.hp, d); this.hp -= d; this.flash = 0.12;
      if (src && src.team && src.type) stat(src.team, src.type).castle += dealt;
      if (!B.sim) floatText(this.x + this.dir * 20, GROUND - H * 1.7, '-' + d);
      burst(this.x + this.dir * 40, GROUND - H * 0.8, 0xbfc4d4, 5, 120);
      if (this.hp <= 0) { this.hp = 0; this.alive = false; endGame(this.team === 'purple'); }
    } };
}

// estadísticas por bando y carta
function stat(team, type) {
  const t = B.stats[team]; return t[type] || (t[type] = { played: 0, dmg: 0, castle: 0, kills: 0, deaths: 0, heal: 0, firstDeath: null });
}
const _damage = Unit.prototype.damage;
Unit.prototype.damage = function (d, src, fromX, crit) {
  const before = this.hp, wasAlive = this.state !== 'die';
  _damage.call(this, d, src, fromX, crit);
  if (!B || !src || !src.team || !src.type || src.team === this.team) return;
  stat(src.team, src.type).dmg += Math.max(0, before - Math.max(0, this.hp));
  if (wasAlive && this.state === 'die') stat(src.team, src.type).kills++;
};
const _heal = Unit.prototype.healBy;
Unit.prototype.healBy = function (n) {
  const before = this.hp; _heal.call(this, n);
  if (B) { const got = this.hp - before; if (got > 0 && units.some(v => v.team === this.team && v.type === 'fraile' && v.alive)) stat(this.team, 'fraile').heal += got; }
};

function onKill(u) {
  const other = u.team === 'blue' ? 'purple' : 'blue';
  B[other].kills++;   // las bajas ya no dan energía: solo se recarga con el tiempo
  if (u.type !== 'esqueleto') { const s = stat(u.team, u.type); s.deaths++; if (s.firstDeath === null) s.firstDeath = B.t; }
}
function onDead(u) {            // en batalla las bajas no vuelven
  if (B && !B.over) onKill(u);
  units = units.filter(v => v !== u); u.root.destroy(); u.bar.destroy(); if (u.laserG) u.laserG.destroy(); if (u.ultIcon) u.ultIcon.destroy(); if (u.plasmaG) u.plasmaG.destroy(); if (u.beamG) u.beamG.destroy();
}
let PLAY_AT = null;
function play(team, idx) {
  const side = B[team], type = side.hand[idx];
  if (!type || B.over || side.energy < COST[type]) return false;
  side.energy -= COST[type];
  side.queue.push(type); side.hand[idx] = side.queue.shift();
  const at = PLAY_AT && team === 'blue' ? PLAY_AT : null;   // arrastrada al campo (arrastre.js): cae donde la sueltas
  const u = new Unit(scene, type, team, at ? at.x : team === 'blue' ? FIELD_L : FIELD_R);   // si no, aparece justo delante de su muralla
  if (at) { u.lane = at.lane; u.root.y = u.gy; u.root.setDepth(u.gy); u.dropH = at.hop; u.swing = at.swing; }
  units.push(u);
  stat(team, type).played++;
  if (team === 'blue' && !B.auto) renderHand();
  return true;
}
function aiLogic(dt, team = 'purple') {
  // juega lo que puede pagar; a veces ahorra para la carta más cara de su mano
  const s = B[team]; s.aiT = (s.aiT === undefined ? 2.5 : s.aiT) - dt; if (s.aiT > 0) return;
  const ok = s.hand.map((t, i) => [t, i]).filter(([t]) => COST[t] <= s.energy);
  const priciest = Math.max(...s.hand.map(t => COST[t]));
  const saving = priciest > s.energy && priciest >= 5 && Math.random() < 0.6;
  if (ok.length && !saving && (s.energy >= 7 || Math.random() < 0.55)) {
    ok.sort((a, b) => COST[b[0]] - COST[a[0]]);
    const [, i] = Math.random() < 0.6 ? ok[0] : ok[Math.floor(Math.random() * ok.length)];
    play(team, i); s.aiT = rand(1.2, 3.2);
  } else s.aiT = 0.5;
}
function towers(dt) {
  for (const team of ['blue', 'purple']) {
    const c = castles[team]; if (!c.alive) continue;
    const s = B[team]; s.towerT -= dt; if (s.towerT > 0) continue;
    const foes = units.filter(v => v.team !== team && v.alive && v.state !== 'die' && v.state !== 'spawn' && Math.abs(v.x - c.x) <= TOWER.range);
    if (!foes.length) { s.towerT = 0.2; continue; }
    const tg = foes.sort((a, b) => Math.abs(a.x - c.x) - Math.abs(b.x - c.x))[0];
    const ci = castleImg[team], A = castleArt(team, ci.state || ''), k = ci.scaleX, sx = ci.x + (A.arch[0] - A.plat[0]) * k, sy = ci.y + (A.arch[1] - A.plat[1]) * k;
    const tx = tg.x, ty = tg.gy - H * 0.45, T = Math.max(0.35, Math.abs(tx - sx) / 700), g = 900;
    const img = scene.add.image(sx, sy, colorTex(team === 'blue' ? 'flecha_azul' : 'flecha_morada', TEAM_COLOR[team])).setOrigin(0.85, 0.5).setScale(0.55 * H / 512).setDepth(950);
    arrows.push({ img, x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy - 0.5 * g * T * T) / T, g, t: 0, T, target: tg, dmg: Math.round(TOWER.dmg * (s.towerK || 1)), stuck: 0 });
    s.towerT = TOWER.cd * (s.towerCd || 1);
  }
}
function drawCastleUI(dt) {
  castleG.clear(); flashG.clear();
  for (const team of ['blue', 'purple']) {
    const c = castles[team];
    const ci = castleImg[team], st = !c.alive ? '_destruido' : c.hp / c.max <= 0.5 ? '_danado' : '';
    if (ci.state !== st) {   // cambia de aspecto: polvo y cascotes
      if (ci.state !== undefined && B && B.t > 0.1) burst(ci.x, GROUND - 40, 0xbfc4d4, st === '_destruido' ? 30 : 14, st === '_destruido' ? 320 : 200);
      ci.state = st; const A = castleArt(team, st); ci.setTexture(colorTex(A.key, TEAM_COLOR[team], TEAM_EMB[team])).setFlipX(!!A.flip);
      ci.setOrigin(A.plat[0] / ci.width, A.plat[1] / ci.height).setScale(CASTLE_W / ci.width);
      const th = team === 'blue' ? throneImg : throneImgP;   // sin castillo no hay trono: cae entre los cascotes
      if (th) { scene.tweens.killTweensOf(th); if (st === '_destruido') scene.tweens.add({ targets: th, y: THRONE.y + 110, alpha: 0, angle: team === 'blue' ? 25 : -25, duration: 700, ease: 'Quad.in' }); else th.setPosition(team === 'blue' ? THRONE.x : W - THRONE.x, THRONE.y).setAlpha(1).setAngle(0); }
    }
    if (c.flash > 0) { c.flash -= dt; ci.setTint(0xffd0d0); } else if (ci.isTinted) ci.clearTint();
  }
}
function statsTable(team, title) {
  const rows = Object.entries(B.stats[team]).filter(([, s]) => s.played).sort((a, b) => (b[1].dmg + b[1].castle + b[1].heal) - (a[1].dmg + a[1].castle + a[1].heal));
  const tr = rows.map(([k, s]) => `<tr><td>${LABEL[k]}</td><td>${s.played}</td><td>${Math.round(s.dmg)}</td><td>${Math.round(s.castle)}</td><td>${s.kills}</td><td>${s.deaths}${s.firstDeath !== null ? ' (' + Math.round(s.firstDeath) + ' s)' : ''}</td>${s.heal ? `<td>+${Math.round(s.heal)}</td>` : '<td></td>'}</tr>`).join('');
  return `<div><h3>${title}</h3><table><thead><tr><th>Carta</th><th>Jugadas</th><th>Daño</th><th>Al castillo</th><th>Bajas</th><th>Caídas (1.ª)</th><th>Cura</th></tr></thead><tbody>${tr || '<tr><td colspan="7">Sin cartas jugadas</td></tr>'}</tbody></table></div>`;
}
function endGame(win) {
  B.over = true; B.win = win;
  if (B.sim) return;
  if (B.demo) { setTimeout(() => { if (B && B.demo) startDemo(); }, 2500); return; }   // la partida del menú vuelve a empezar sola
  $('stats').innerHTML = statsTable('blue', 'Tu bando') + statsTable('purple', 'Rival');
  window.__lastStats = JSON.parse(JSON.stringify({ win, t: B.t, stats: B.stats, decks: { blue: B.blue.deck, purple: B.purple.deck }, run: B.run }));
  if (db && !B.saved) { B.saved = true; db.collection('partidas').add({ ...window.__lastStats, t: Math.round(B.t), fecha: new Date().toISOString(), castillos: { azul: Math.max(0, Math.round(castles.blue.hp)), morado: Math.max(0, Math.round(castles.purple.hp)) } }).catch(() => {}); }
  const res = battleResult(win);   // recompensas y progreso (campana.js)
  setTimeout(() => { if (B && B.over && !B.demo) showResult(res); }, 900);
}
function resetBattle(o = {}) {
  // o: demo (la IA juega por los dos, de fondo en el menú), sim (simulación sin pantalla), run (nivel de campaña o batalla rápida),
  //    deck / enemyDeck, enemyHp, aiK (ritmo de energía del rival), hero / heroP (null: castillo sin héroe)
  clearUnits(); paused = false; if (scene) scene.tweens.resumeAll();
  const demo = !!o.demo, auto = demo || !!o.sim, rh = () => ['aldric', 'lyra', 'gull'][Math.floor(Math.random() * 3)];
  B = { demo, idle: !!o.idle, sim: !!o.sim, auto, run: o.run || null, blue: newSide(o.deck || (demo ? aiDeck() : myDeck)), purple: newSide(o.enemyDeck || aiDeck(), o.aiK || 1), over: false, t: 0, stats: { blue: {}, purple: {} },
    hero: { type: o.hero || (demo ? rh() : myHero), state: 'throne', unit: null, skillT: 0 },
    heroP: { type: o.heroP === undefined ? rh() : o.heroP, state: 'throne', unit: null, skillT: 0 } };
  if (!B.heroP.type) B.heroP.state = 'none';
  if (throneImg) {
    setThrone(throneImg, HEROES[B.hero.type].throne);
    throneImgP.setVisible(!!B.heroP.type); if (B.heroP.type) setThrone(throneImgP, HEROES[B.heroP.type].throne);
  }
  castles = { blue: makeCastle('blue'), purple: makeCastle('purple', o.enemyHp || CASTLE_HP) };
  if (!B.sim) applyColors(o.colors || battleColors(null));
  if (!auto) renderHand();
}
const enemyCastle = u => { const c = castles[u.team === 'blue' ? 'purple' : 'blue']; return c && c.alive ? [c] : []; };

/* ---- héroe ---- */
function setThrone(img, key) { const h = Object.values(HEROES).find(x => x.throne === key || x.empty === key); img.setTexture(key); img.setScale(THRONE.w * ((h && h.tw) || 1) / img.width); }
function heroAct(team) {
  // el héroe de un bando: si está en el trono y tiene las bajas, salta; si está en el campo y la habilidad está lista, la lanza
  const hr = team === 'blue' ? B.hero : B.heroP; if (!hr || !hr.type || B.over) return false;
  if (hr.state === 'throne' && B[team].kills >= HERO_GOAL) {
    const blue = team === 'blue', x = blue ? FIELD_L + H * 0.3 : FIELD_R - H * 0.3, tx = blue ? THRONE.x : W - THRONE.x;
    const u = new Unit(scene, hr.type, team, x); units.push(u);
    u.jumpFromX = tx; u.jumpToX = x; u.jumpFromY = GROUND - (THRONE.y - 40); u.set('heroJump');
    hr.unit = u; hr.state = 'field'; hr.skillT = 3; setThrone(blue ? throneImg : throneImgP, HEROES[hr.type].empty); stat(team, hr.type).played++;
    return true;
  } else if (hr.state === 'field' && hr.skillT <= 0 && ['idle', 'walk', 'attack'].includes(hr.unit.state)) {
    hr.unit.inPlace = false; hr.unit.set(HEROES[hr.type].skill); hr.skillT = CH[hr.type].skillCd; return true;
  }
  return false;
}
function heroClick() { heroAct('blue'); }
function heroAI(team = 'purple') {
  // la IA: salta en cuanto puede y usa la habilidad cuando le compensa
  const hr = team === 'blue' ? B.hero : B.heroP; if (!hr.type) return;
  if (hr.state === 'throne') heroAct(team);
  else if (hr.state === 'field' && hr.skillT <= 0) {
    const u = hr.unit, foes = enemiesOf(u).filter(v => !v.isCastle);
    if (hr.type === 'gull') {   // Gūll: embiste cuando tiene dos enemigos por delante y cerca
      if (foes.filter(v => (v.x - u.x) * u.dir > 0 && Math.abs(v.x - u.x) < H * 4).length >= 2) heroAct(team);
    } else if (hr.type === 'lyra') {   // Lyra: con dos enemigos por delante, o cerca del castillo rival
      const ahead = foes.filter(v => (v.x - u.x) * u.dir > 0).length, nearCastle = enemiesOf(u).some(v => v.isCastle && Math.abs(v.x - u.x) < H * 6);
      if (ahead >= 2 || nearCastle) heroAct(team);
    } else if (foes.filter(v => Math.abs(v.x - (u.x + u.dir * H * 0.9)) <= CH.aldric.seismic.r).length >= 2) heroAct(team);
  }
}
function heroUI() {
  // botón redondo con el retrato: el aro dorado se llena con las bajas y luego con la recarga de la habilidad
  const hr = B.hero, btn = $('hero'), k = B.blue.kills, HD = HEROES[hr.type];
  let txt, p, ready = false, label;
  if (hr.state === 'throne') { ready = k >= HERO_GOAL; p = Math.min(1, k / HERO_GOAL); txt = ready ? '¡Salta!' : Math.min(k, HERO_GOAL) + '/' + HERO_GOAL; label = HD.name + (ready ? ': toca para que salte del trono' : ': ' + txt + ' bajas'); }
  else if (hr.state === 'field') { ready = hr.skillT <= 0; p = 1 - hr.skillT / CH[hr.type].skillCd; txt = ready ? '¡Listo!' : Math.ceil(hr.skillT) + ' s'; label = HD.skillName + (ready ? ': lista' : ': ' + txt); }
  else { p = 0; txt = 'Ha caído'; label = HD.name + ' ha caído'; }
  btn.disabled = !ready; btn.classList.toggle('ready', ready); btn.style.setProperty('--p', p.toFixed(3));
  if (btn.dataset.t !== txt + hr.type) { btn.dataset.t = txt + hr.type; $('herotxt').textContent = txt; $('heroimg').src = 'img/' + HD.portrait + '.png'; btn.setAttribute('aria-label', label); }
}
$('hero').onclick = () => heroClick();
window.__heroClick = () => heroClick();
window.__hero = () => B.hero && { state: B.hero.state, skillT: B.hero.skillT, kills: B.blue.kills, hp: B.hero.unit && Math.round(B.hero.unit.hp) };
window.__setKills = (n, team = 'blue') => { B[team].kills = n; };
window.__heroP = () => B.heroP && { state: B.heroP.state, skillT: B.heroP.skillT, kills: B.purple.kills };

/* ---- escenario: escenas completas (fondo, camino y objetos en una sola imagen); t/b = franja de tierra (fracción del alto) ---- */
const ESC = __ESC__;
const ESC_NAME = { escena_01: 'Noche', escena_02: 'Cerezos', escena_03: 'Atardecer', escena_04: 'Amanecer', escena_05: 'Otoño', escena_06: 'Prado', escena_07: 'Montañas', escena_08: 'Molino', escena_09: 'Lago', escena_10: 'Pinos' };
let escena = (() => { try { const v = localStorage.getItem('bg-escena'); return ESC[v] ? v : 'escena_07'; } catch (e) { return 'escena_07'; } })(), escObjs = [], clouds = [];
function escPreload(L) {
  L.image(escena, 'img/esc/' + escena + '.jpg');
  for (const c of ['azul', 'morado']) for (const st of ['', '_danado', '_destruido']) L.image('castillo_' + c + st, 'img/esc/castillo_' + c + st + '.png');
  for (const k in ICONOS) L.image(k, 'img/campana/' + k + '.png');
  L.image('moneda', 'img/esc/moneda.png'); L.image('flecha_azul', 'img/esc/flecha_azul.png'); L.image('flecha_morada', 'img/esc/flecha_morada.png');
  for (const e of ['leon', 'aguila', 'ciervo', 'jabali', 'dragon', 'lobo', 'zarpa', 'pluma', 'corona', 'espadas', 'martillo', 'torre', 'arbol', 'lis', 'sol', 'luna', 'buho', 'caballo', 'cobra', 'carnero', 'hacha', 'arco', 'llave', 'ancla', 'caliz', 'reloj', 'calavera', 'yunque', 'flor', 'copo', 'llama', 'montanas']) L.image('emb_' + e, 'img/emb/' + e + '.png');
}
function makeCloud(sc) {
  // nube dibujada al estilo del arte: borde oscuro, cuerpo blanco y sombra azulada abajo
  if (sc.textures.exists('nube')) return;
  const g = sc.make.graphics({ x: 0, y: 0, add: false }), bl = [[62, 70, 40], [112, 52, 54], [168, 62, 46], [214, 80, 32], [36, 88, 26]];
  g.fillStyle(OUT, 1); bl.forEach(([x, y, r]) => g.fillCircle(x, y, r + 5)); g.fillRoundedRect(14, 72, 228, 44, 22);
  g.fillStyle(0xdfe9fb, 1); bl.forEach(([x, y, r]) => g.fillCircle(x, y, r)); g.fillRoundedRect(19, 77, 218, 34, 17);
  g.fillStyle(0xffffff, 1); bl.forEach(([x, y, r]) => g.fillCircle(x - 3, y - 5, r * 0.88)); g.fillStyle(0xffffff, 0.9).fillEllipse(110, 34, 30, 12);
  g.generateTexture('nube', 260, 124); g.destroy();
}
function drawScenery(sc) {
  // la escena se coloca con su camino bajo los pies de las unidades y cubre todo lo que enseña la cámara:
  // se completa en espejo a los lados y, si sobra cielo (móvil en vertical), con el color del cielo y nubes que pasan
  escObjs.forEach(o => o.destroy()); escObjs = []; clouds = [];
  const f = ESC[escena], tw = sc.textures.get(escena).getSourceImage().width, base = (W + 8) / tw, pc = (f.t + f.b) / 2;
  const z = cam.zoom, cx = cam.scrollX + cam.width / 2, cy = cam.scrollY + cam.height / 2, vw = cam.width / z, vh = cam.height / z, top = cy - vh / 2, bot = cy + vh / 2;
  const ih0 = f.h * tw / f.w * base, k = Math.max(1, Math.min(1.25, (GROUND - top) / pc / ih0)), s = base * k, ih = ih0 * k, iw = tw * s, y0 = GROUND + 2 - pc * ih;
  const col = h => Phaser.Display.Color.HexStringToColor(h).color, add = o => (escObjs.push(o), o);
  add(sc.add.rectangle(cx, (top - 60 + y0) / 2, vw + 200, y0 - top + 64, col(f.top)).setDepth(-31));
  drawSubsuelo(sc, y0 + ih, add, cx, vw, bot, col(f.bot));
  for (let i = -3; i <= 3; i++) {
    const x = W / 2 + i * iw; if (x + iw / 2 < cx - vw / 2 - 10 || x - iw / 2 > cx + vw / 2 + 10) continue;
    add(sc.add.image(x, y0, escena).setOrigin(0.5, 0).setScale(s).setFlipX(i % 2 !== 0).setDepth(-30));
  }
  const free = y0 + ih * 0.12 - top;   // cielo que no cubre la imagen: nubes que pasan despacio
  if (free > 200) {
    makeCloud(sc);
    const tint = Phaser.Display.Color.Interpolate.ColorWithColor(Phaser.Display.Color.ValueToColor(0xffffff), Phaser.Display.Color.ValueToColor(col(f.top)), 100, 18);
    const n = Math.max(2, Math.round(vw * free / 900000));
    for (let i = 0; i < n; i++) {
      const sz = rand(2.2, 3.6), img = add(sc.add.image(cx - vw / 2 + rand(0, vw), top + 90 + rand(0, Math.max(10, free - 260)), 'nube').setScale(sz).setDepth(-29)
        .setTint(Phaser.Display.Color.GetColor(tint.r, tint.g, tint.b)).setFlipX(Math.random() < 0.5));
      clouds.push({ img, v: rand(8, 18), x0: cx - vw / 2 - 400, x1: cx + vw / 2 + 400 });
    }
  }
}
/* ---- subsuelo: bajo el camino, la tierra con las dos criptas (la tuya a la izquierda, bajo tu castillo, y la del rival a la
   derecha), dibujada para cada aspecto del castillo (img/subsuelo). Se coloca para que tu cripta quepa entera en lo que se ve:
   en vertical, entre el camino y el panel de cartas; en horizontal, en la esquina libre. Si el dibujo no llega a cubrir todo
   el ancho, la tierra del medio se repite en espejo. Mientras se carga, uno provisional hecho aquí. ---- */
const SUBSUELO = __SUBSUELO__;
let SUB_Y = GROUND + 200, SUB_TEMA = 'piedra', SUB_TEMA_P = 'piedra', SUB_L = null, subColorKey = null, subParKey = null;   // dónde empieza, su tema y cómo se ha colocado (lo usa la cripta)
const subCarga = {};
function subTex(tema, cb) {   // carga el dibujo de un tema con sus tres franjas: cripta, tierra y cripta
  const key = 'sub_' + tema; if (!scene || !SUBSUELO.temas[tema]) return;
  if (scene.textures.exists(key)) { if (cb) cb(); return; }
  if (subCarga[tema]) { if (cb) subCarga[tema].push(cb); return; }
  subCarga[tema] = cb ? [cb] : [];
  const im = new Image();
  im.onload = () => { if (!scene.textures.exists(key)) subFranjas(scene.textures.addImage(key, im)); const l = subCarga[tema] || []; delete subCarga[tema]; l.forEach(f => f()); };
  im.onerror = () => { delete subCarga[tema]; };
  im.src = 'img/subsuelo/' + tema + '.jpg';
}
function subFranjas(tex) {
  const w = tex.source[0].width, h = tex.source[0].height, { xa, xb } = SUBSUELO;
  tex.add('L', 0, 0, 0, xa, h); tex.add('M', 0, xa, 0, xb - xa, h); tex.add('R', 0, xb, 0, w - xb, h); return tex;
}
function subPar(sc, a, b) {   // tu mitad con tu tema y la del rival con el suyo; la tierra del medio pasa de uno a otro poco a poco
  if (a === b || !sc.textures.exists('sub_' + b)) return 'sub_' + a;
  const key = 'subp_' + a + '|' + b; if (sc.textures.exists(key)) return key;
  if (subParKey && sc.textures.exists(subParKey)) sc.textures.remove(subParKey);
  const A = sc.textures.get('sub_' + a).getSourceImage(), Bi = sc.textures.get('sub_' + b).getSourceImage(), w = A.width, h = A.height, { xa, xb } = SUBSUELO;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
  c.drawImage(A, 0, 0); c.drawImage(Bi, xb, 0, w - xb, h, xb, 0, w - xb, h);
  const m = document.createElement('canvas'); m.width = xb - xa; m.height = h; const mc = m.getContext('2d');
  mc.drawImage(Bi, xa, 0, xb - xa, h, 0, 0, xb - xa, h); mc.globalCompositeOperation = 'destination-in';
  const g = mc.createLinearGradient(0, 0, xb - xa, 0); g.addColorStop(0.15, 'rgba(0,0,0,0)'); g.addColorStop(0.85, 'rgba(0,0,0,1)'); mc.fillStyle = g; mc.fillRect(0, 0, xb - xa, h);
  c.drawImage(m, xa, 0);
  subParKey = key; subFranjas(sc.textures.addCanvas(key, cv)); return key;
}
function subColor(sc, base, TL, TR) {   // las gemas de cada cripta, con el color de su bando (cian y morado son los de siempre)
  const cb = TEAM_COLOR.blue, cp = TEAM_COLOR.purple;
  if (cb === 'azul' && cp === 'morado') return base;
  const key = base + '@' + cb + ',' + cp; if (sc.textures.exists(key)) return key;
  if (subColorKey && sc.textures.exists(subColorKey)) sc.textures.remove(subColorKey);   // solo se guarda la última
  const src = sc.textures.get(base).getSourceImage(), cv = document.createElement('canvas'); cv.width = src.width; cv.height = src.height;
  const c = cv.getContext('2d', { willReadFrequently: true }), T = { L: TL.L, R: TR.R }; c.drawImage(src, 0, 0);
  for (const [lado, col, def, h0, h1] of [['L', cb, 'azul', 0.44, 0.58], ['R', cp, 'morado', 0.70, 0.86]]) {
    if (col === def || !COLORES[col]) continue;
    const t = [1, 3, 5].map(i => parseInt(COLORES[col][1].slice(i, i + 2), 16) / 255), dark = Math.max(...t) < 0.25, light = Math.min(...t) > 0.85;
    for (const [x, y, w, h] of T[lado].gemas) {
      const d = c.getImageData(x, y, w, h), p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        const r = p[i] / 255, g = p[i + 1] / 255, b = p[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), dd = mx - mn + 1e-9;
        if ((mx - mn) / (mx + 1e-9) < 0.3 || mx < 0.25) continue;   // los brillos blancos y el contorno se quedan
        const hu = (mx === r ? (((g - b) / dd) % 6 + 6) % 6 : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4) / 6;
        if (hu < h0 || hu > h1) continue;
        const l = mx / 0.85;
        for (let q = 0; q < 3; q++) p[i + q] = 255 * Math.min(1, dark ? 0.1 + 0.13 * l + t[q] * 0.3 : light ? t[q] * (0.55 + 0.42 * l) : t[q] * l);
      }
      c.putImageData(d, x, y);
    }
  }
  subColorKey = key; subFranjas(sc.textures.addCanvas(key, cv)); return key;
}
let subRedKey = null;
function subReducido(sc, key, wDev) {   // el dibujo ya encogido al tamaño con que se ve: así sus contornos no salen dentados
  const src = sc.textures.get(key).getSourceImage(), IW = src.width;
  if (wDev >= IW * 0.85) return { key, f: 1 };
  const w = Math.min(IW, Math.ceil(wDev)), rk = key + '~' + w;   // justo al ancho con que se ve: sin volver a reescalar
  if (!sc.textures.exists(rk)) {
    if (subRedKey && sc.textures.exists(subRedKey)) sc.textures.remove(subRedKey);   // solo se guarda el último
    let cv = src, cw = IW, ch = src.height;
    while (cw > w) {   // a mitades, con suavizado: queda limpio aunque se encoja mucho
      const nw = Math.max(w, Math.round(cw / 2)), nh = Math.round(ch * nw / cw), c2 = document.createElement('canvas'); c2.width = nw; c2.height = nh;
      const x = c2.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(cv, 0, 0, nw, nh);
      cv = c2; cw = nw; ch = nh;
    }
    const tex = sc.textures.addCanvas(rk, cv), f = w / IW, xa = Math.round(SUBSUELO.xa * f), xb = Math.round(SUBSUELO.xb * f);
    tex.add('L', 0, 0, 0, xa, ch); tex.add('M', 0, xa, 0, xb - xa, ch); tex.add('R', 0, xb, 0, w - xb, ch);
    subRedKey = rk;
  }
  return { key: rk, f: w / IW };
}
function subBorde(sc) {   // el borde de hierba que cuelga sobre la tierra (blanco: se tiñe con el césped de cada escena)
  if (sc.textures.exists('sub_borde')) return;
  const CW = 1084, CH = 44, cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
  const c = cv.getContext('2d'), e = x => 15 + Math.sin(x / CW * Math.PI * 14) * 5 + Math.sin(x / CW * Math.PI * 46 + 1) * 2.5;
  c.beginPath(); c.moveTo(0, 0); for (let x = 0; x <= CW; x += 4) c.lineTo(x, e(x)); c.lineTo(CW, 0); c.closePath(); c.fillStyle = '#fff'; c.fill();
  c.beginPath(); for (let x = 0; x <= CW; x += 4) c[x ? 'lineTo' : 'moveTo'](x, e(x)); c.lineWidth = 6; c.strokeStyle = '#1e2235'; c.stroke();
  sc.textures.addCanvas('sub_borde', cv);
}
function drawSubsuelo(sc, ytop, add, cx, vw, bot, grass) {
  SUB_Y = ytop; SUB_L = null;
  const T = SUBSUELO.temas[SUB_TEMA];
  if (!T || !sc.textures.exists('sub_' + SUB_TEMA)) { subTex(SUB_TEMA, () => drawScenery(scene)); return subsueloProv(sc, ytop, add, cx, vw, bot, grass); }
  const TP = SUBSUELO.temas[SUB_TEMA_P] && sc.textures.exists('sub_' + SUB_TEMA_P) ? SUBSUELO.temas[SUB_TEMA_P] : T;
  const key = subColor(sc, subPar(sc, SUB_TEMA, TP === T ? SUB_TEMA : SUB_TEMA_P), T, TP), src = sc.textures.get(key).getSourceImage(), IW = src.width, IH = src.height, { xa, xb } = SUBSUELO;
  // lo que se ve del subsuelo (en píxeles css): en batalla, hasta el panel de cartas o, en horizontal, la esquina libre a su lado
  const z = cam.zoom, k = DPR / z, left = cx - vw / 2, top = bot - cam.height / z, ug = (ytop - top) / k, ih = window.innerHeight;
  let Hc = (ih - ug) * k, Wc = vw, esq = false;
  if (!$('hud').hidden && $('menu').hidden) {
    const d = $('dock').getBoundingClientRect(), enBanda = d.top - ug, enEsq = d.left >= 74 ? ih - ug : 0;
    esq = enEsq > enBanda * 1.25; Hc = Math.max(40, esq ? enEsq : enBanda) * k; if (esq) Wc = d.left * k;
  }
  // tamaño: todo el ancho si cabe tu cripta entera (de la clave del arco a la losa del suelo); si no, más pequeño
  const [x0, y0, x1, y1] = T.L.muro, arriba = y0 - 75, abajo = y1 + 16;
  const s = Math.max(0.25, Math.min((vw + 4) / IW, Hc * 0.97 / (abajo - arriba), esq ? Wc * 1.08 / (x1 - x0) : Infinity));
  const yi = Math.min(ytop - 2, ytop + Hc - abajo * s - 3 * k);   // el suelo de la cripta, justo encima del panel
  const Lx = esq ? Math.min(left - 2, left + Wc / 2 - (x0 + x1) / 2 * s) : left - 2;   // en la esquina, la cripta en su centro
  const Rx = Math.max(left + vw + 2, Lx + IW * s) - (IW - xb) * s, mx0 = Lx + xa * s, Mw = (xb - xa) * s, r = (Rx - mx0) / Mw;
  let n = 1; while (Math.abs(Math.log(r / (n + 2))) < Math.abs(Math.log(r / n))) n += 2;   // un número impar de tramos: así encajan los bordes
  const red = subReducido(sc, key, IW * s * z), sf = s / red.f;
  const pon = (x, f, sx, flip) => add(sc.add.image(x, yi, red.key, f).setOrigin(0, 0).setScale(sx / red.f, sf).setFlipX(!!flip).setDepth(-30));
  pon(Lx, 'L', s); for (let i = 0; i < n; i++) pon(mx0 + i * Mw * r / n, 'M', s * r / n, i % 2); pon(Rx, 'R', s);
  const fondo = Phaser.Display.Color.HexStringToColor(T.fondo).color;
  if (yi + IH * s < bot + 60) add(sc.add.rectangle(cx, (yi + IH * s + bot + 60) / 2 - 2, vw + 200, bot + 64 - yi - IH * s, fondo).setDepth(-31));
  subBorde(sc); const sb = (W + 8) / 1084;
  for (let x = W / 2 - 3 * 1084 * sb; x < cx + vw / 2 + 1084 * sb; x += 1084 * sb) if (x + 1084 * sb > cx - vw / 2) add(sc.add.image(x, ytop - 3, 'sub_borde').setOrigin(0, 0).setScale(sb).setTint(grass).setDepth(-29.5));
  SUB_L = { s, yi, Lx, Rx, T, esq };
}
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function subsueloTex(sc) {
  if (sc.textures.exists('subsuelo')) return;
  const CW = 1084, CH = 900, cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
  const c = cv.getContext('2d'), R = rng(7), r = (a, b) => a + R() * (b - a), O = '#1e2235';
  const edge = x => 22 + Math.sin(x / 47) * 6 + Math.sin(x / 13 + 1) * 3;   // borde de arriba: la hierba cuelga un poco
  const capa = (y0, amp, f, ph) => x => y0 + Math.sin(x / f + ph) * amp + Math.sin(x / (f * 0.37) + ph * 2) * amp * 0.35;
  const fill = (top, color) => { c.beginPath(); c.moveTo(0, CH); for (let x = 0; x <= CW; x += 6) c.lineTo(x, top(x)); c.lineTo(CW, CH); c.closePath(); c.fillStyle = color; c.fill(); c.lineWidth = 5; c.strokeStyle = 'rgba(30,34,53,.55)'; c.beginPath(); for (let x = 0; x <= CW; x += 6) c[x ? 'lineTo' : 'moveTo'](x, top(x)); c.stroke(); };
  fill(edge, '#94673f');
  fill(capa(300, 16, 70, 1), '#7c5434');
  fill(capa(560, 20, 90, 3), '#5f4132');
  fill(capa(770, 14, 60, 5), '#46323b');
  c.lineWidth = 7; c.strokeStyle = O; c.beginPath(); for (let x = 0; x <= CW; x += 6) c[x ? 'lineTo' : 'moveTo'](x, edge(x)); c.stroke();
  // raíces que bajan desde la hierba
  for (let i = 0; i < 9; i++) {
    let x = r(30, CW - 30), y = edge(x) - 2; const n = r(4, 8) | 0;
    const pts = [[x, y]]; for (let j = 0; j < n; j++) { x += r(-16, 16); y += r(14, 24); pts.push([x, y]); }
    for (const [w, col] of [[9, O], [5, '#6b4527']]) { c.lineWidth = w; c.lineCap = 'round'; c.strokeStyle = col; c.beginPath(); pts.forEach((p, k) => c[k ? 'lineTo' : 'moveTo'](p[0], p[1])); c.stroke(); }
  }
  // piedras (más grandes cuanto más hondo), huesos y cristales en la roca
  const piedras = [], libre = (x, y, rr) => piedras.every(([a, b, q]) => Math.hypot(a - x, b - y) > q + rr + 10);
  for (let k = 0; k < 400 && piedras.length < 46; k++) {
    const y = r(70, CH - 30), rr = 8 + y / CH * 26 * r(0.6, 1.2), x = r(rr + 4, CW - rr - 4); if (!libre(x, y, rr)) continue; piedras.push([x, y, rr]);
    const sq = r(0.6, 0.85), col = ['#b9a68a', '#a99880', '#958fa0', '#c4b08f'][(R() * 4) | 0], rot = r(-0.5, 0.5);
    c.save(); c.translate(x, y); c.rotate(rot);
    c.beginPath(); c.ellipse(0, 0, rr, rr * sq, 0, 0, Math.PI * 2); c.fillStyle = col; c.fill(); c.lineWidth = 5; c.strokeStyle = O; c.stroke();
    c.beginPath(); c.ellipse(0, rr * sq * 0.35, rr * 0.82, rr * sq * 0.5, 0, 0, Math.PI); c.fillStyle = 'rgba(30,34,53,.22)'; c.fill();
    c.beginPath(); c.ellipse(-rr * 0.35, -rr * sq * 0.4, rr * 0.28, rr * sq * 0.16, -0.4, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill();
    c.restore();
  }
  const hueso = (x, y, l, a) => {
    c.save(); c.translate(x, y); c.rotate(a);
    for (const [w, col] of [[5, O], [0, '#efe6d2']]) {
      c.fillStyle = col; const e = w / 2;
      c.fillRect(-l / 2, -5 - e, l, 10 + w); [[-l / 2, -6], [-l / 2, 6], [l / 2, -6], [l / 2, 6]].forEach(([a2, b2]) => { c.beginPath(); c.arc(a2, b2, 7 + e, 0, Math.PI * 2); c.fill(); });
    }
    c.restore();
  };
  hueso(r(150, 400), r(380, 480), 46, r(-0.6, 0.6)); hueso(r(650, 950), r(420, 520), 38, r(-0.6, 0.6)); hueso(r(300, 800), r(640, 700), 52, r(-0.4, 0.4));
  for (let i = 0; i < 4; i++) {   // cristales en la roca del fondo
    const x = r(80, CW - 80), y = r(800, 860), col = i % 2 ? ['#b48cff', '#e2d1ff'] : ['#6fc8ff', '#d4f1ff'];
    [[-14, 0.8], [0, 1.15], [13, 0.7]].forEach(([dx, k]) => {
      const h = 46 * k, w = 13 * k; c.beginPath(); c.moveTo(x + dx - w, y); c.lineTo(x + dx - w, y - h * 0.7); c.lineTo(x + dx, y - h); c.lineTo(x + dx + w, y - h * 0.7); c.lineTo(x + dx + w, y); c.closePath();
      c.fillStyle = col[0]; c.fill(); c.lineWidth = 5; c.strokeStyle = O; c.stroke();
      c.beginPath(); c.moveTo(x + dx - w * 0.4, y - 6); c.lineTo(x + dx - w * 0.4, y - h * 0.68); c.lineWidth = 4; c.strokeStyle = col[1]; c.stroke();
    });
  }
  sc.textures.addCanvas('subsuelo', cv);
}
function subsueloProv(sc, ytop, add, cx, vw, bot, grass) {   // el provisional, mientras llega el dibujo
  subsueloTex(sc);
  const key = 'subsuelo', src = sc.textures.get(key).getSourceImage(), s = (W + 8) / src.width, iw = src.width * s, ih = src.height * s;
  add(sc.add.rectangle(cx, ytop + 40, vw + 200, 90, grass).setDepth(-31));   // la hierba se ve por el borde ondulado
  for (let i = -3; i <= 3; i++) {
    const x = W / 2 + i * iw; if (x + iw / 2 < cx - vw / 2 - 10 || x - iw / 2 > cx + vw / 2 + 10) continue;
    add(sc.add.image(x, ytop - 3, key).setOrigin(0.5, 0).setScale(s).setFlipX(i % 2 !== 0).setDepth(-30));
  }
  if (ytop + ih < bot + 60) add(sc.add.rectangle(cx, (ytop + ih + bot + 60) / 2 - 4, vw + 200, bot + 64 - ytop - ih, 0x46323b).setDepth(-31));
}
function setScenery(e) {
  escena = e || escena;
  try { localStorage.setItem('bg-escena', escena); } catch (er) {}
  if (scene.textures.exists(escena)) return drawScenery(scene);
  scene.load.image(escena, 'img/esc/' + escena + '.jpg'); scene.load.once('complete', () => drawScenery(scene)); scene.load.start();
}
window.__setScenery = setScenery;

/* ---- cámara: el campo entero cabe entre el marcador y el panel de cartas, en vertical y en horizontal ---- */
const DPR = Math.min(3, window.devicePixelRatio || 1);   // a la densidad real de la pantalla (hasta 3): si no, el navegador estira el dibujo y se ve borroso
let zoomCss = 0.5, TXT_K = 1;
function frameCamera() {
  if (!cam) return;
  const gm = window.__game, cw = gm.scale.width, ch = gm.scale.height, battle = !$('hud').hidden;
  if (!$('menu').hidden) {   // menú: un tramo del camino, entre la barra de arriba y el botón de batalla, con las unidades más grandes
    const t = $('hubtop').getBoundingClientRect().bottom + 40, bt = $('hubbot').getBoundingClientRect().top - 4, Y1 = GROUND + 110, Y0 = GROUND - H * 2.2;
    const z = Math.min(cw / 860, Math.max(60, bt - t) * DPR / (Y1 - Y0), 0.7 * DPR);   // en pantallas grandes, sin pasarse de tamaño
    cam.setZoom(z); cam.centerOn(W / 2, Y1 - (bt * DPR - ch / 2) / z);
    zoomCss = z / DPR; TXT_K = Math.max(1, Math.min(3, 0.5 / zoomCss)); drawScenery(scene); return;
  }
  const topCss = battle ? $('hudtop').getBoundingClientRect().bottom + 6 : 0, botCss = battle ? $('dock').getBoundingClientRect().top - 2 : window.innerHeight;
  const X0 = 20, X1 = W - 20, Y0 = THRONE.y - 150, Y1 = GROUND + 120;   // de los tronos al borde del camino
  const z = Math.min(cw / (X1 - X0), Math.max(60, botCss - topCss) * DPR / (Y1 - Y0));
  // si sobra alto (móvil en vertical), el camino sube hasta un tercio de la pantalla y debajo se ve el subsuelo
  // en vertical sube más si hace falta para que se vea el subsuelo entero (con sus dos criptas): sobra cielo
  const ih = window.innerHeight, pano = ((cw / z + 4) * 1024 / 1536 + Math.max(60, SUB_Y - Y1)) * z / DPR;
  const quiere = ih > window.innerWidth ? botCss - pano : ih * 2 / 3;
  const yCss = battle ? Math.max(Math.min(botCss, ih * 2 / 3, quiere), topCss + (Y1 - Y0) * z / DPR) : botCss;
  cam.setZoom(z); cam.centerOn(W / 2, Y1 - (yCss * DPR - ch / 2) / z);
  zoomCss = z / DPR; TXT_K = Math.max(1, Math.min(3, 0.5 / zoomCss));
  drawScenery(scene);
}
// los números de daño y los avisos se agrandan cuando la cámara se aleja (móvil en vertical)
floatText = function (x, y, txt, color) {
  if (B && B.sim) return;
  const k = TXT_K, t = scene.add.text(x, y, txt, { fontFamily: 'Lilita One, Trebuchet MS, sans-serif', fontSize: Math.round(30 * k) + 'px', color: color || '#ffffff', stroke: '#1e2235', strokeThickness: Math.round(7 * k) }).setOrigin(0.5).setDepth(1000);
  scene.tweens.add({ targets: t, y: y - 46 * k, alpha: { from: 1, to: 0 }, scale: { from: 1.25, to: 0.9 }, duration: 750 / timeScale, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
};
function resizeGame() {
  const gm = window.__game, g = $('game'); if (!gm || !g.clientWidth) return;
  gm.scale.resize(Math.round(g.clientWidth * DPR), Math.round(g.clientHeight * DPR)); frameCamera();
}
let rzT = 0;
window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(resizeGame, 80); });

/* ---- Phaser ---- */
function create() {
  scene = this; mode = 'fight';
  cam = this.cameras.main;
  makeAuraTextures(this); makeChainEdge(this); hookUltInput(this);
  flashG = this.add.graphics().setDepth(5);
  for (const team of ['blue', 'purple']) {
    const A = CASTLE_ART[team], im = this.add.image(team === 'blue' ? CASTLE_VX : W - CASTLE_VX, THRONE.y - 4, A.key);
    im.setOrigin(A.plat[0] / im.width, A.plat[1] / im.height).setScale(CASTLE_W / im.width).setDepth(300); castleImg[team] = im;
  }
  throneImg = this.add.image(THRONE.x, THRONE.y, 'trono_aldric').setOrigin(0.5, 0.92).setDepth(302); throneImg.setScale(THRONE.w / throneImg.width);
  throneImgP = this.add.image(W - THRONE.x, THRONE.y, 'trono_aldric').setOrigin(0.5, 0.92).setDepth(302).setFlipX(true); throneImgP.setScale(THRONE.w / throneImgP.width);
  castleG = this.add.graphics().setDepth(990);
  fxG = this.add.graphics().setDepth(980);
  frameCamera(); startDemo();
  loaded();
}
function battleStep(dt) {
  if (B && B.idle && !paused) idleStep(dt);   // la expedición del menú (hub.js)
  else if (B && !B.over && !paused) {
    B.t += dt;
    const rate = EREGEN * (B.t >= DOUBLE_AT ? 2 : 1);   // a partir de los 2 minutos, energía doble
    if (B.t >= DOUBLE_AT && !B.doubled) { B.doubled = true; if (!B.auto) floatText(W / 2, GROUND - H * 2.4, '¡Energía doble!', '#d8b4ff'); }
    for (const team of ['blue', 'purple']) B[team].energy = Math.min(EMAX, B[team].energy + rate * dt * B[team].regenK);
    aiLogic(dt, 'purple'); if (B.auto) aiLogic(dt, 'blue');
    towers(dt); fightLogic(dt);
    for (const hr of [B.hero, B.heroP]) if (hr.state === 'field') { if (!hr.unit.alive || hr.unit.state === 'die') hr.state = 'dead'; else if (hr.unit.state !== 'heroJump') hr.skillT = Math.max(0, hr.skillT - dt); }
    heroAI('purple'); if (B.auto) heroAI('blue');
  }
  units.forEach(u => { if (u.alive && u.root.visible) u.update(B && B.over ? 0 : dt); });
  // nadie pisa un castillo: todos se quedan en el tramo entre las dos murallas (embestidas, saltos y empujones incluidos)
  for (const u of units) {
    if (!u.alive || u.state === 'heroJump') continue;
    if (u.x < FIELD_L) u.x = FIELD_L; else if (u.x > FIELD_R) u.x = FIELD_R;
  }
  updateArrows(dt);
  fx = fx.filter(p => (p.life -= dt) > 0);
}
function update(_, deltaMs) {
  const dt = paused ? 0 : Math.min(0.05, deltaMs / 1000) * timeScale;
  for (const c of clouds) { c.img.x += c.v * deltaMs / 1000; if (c.img.x > c.x1) c.img.x = c.x0; }
  battleStep(dt);
  fxG.clear();
  for (const p of fx) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g === undefined ? 420 : p.g) * dt; fxG.fillStyle(p.color, Math.min(1, p.life / p.t * 1.5)).fillCircle(p.x, p.y, p.r * (0.5 + p.life / p.t)); }
  loose = loose.filter(l => { l.life -= dt; if (l.life <= 0) { l.img.destroy(); return false; } return true; });
  for (const l of loose) {
    l.vy += 1300 * dt; l.img.x += l.vx * dt; l.img.y += l.vy * dt; l.img.rotation += l.spin * dt;
    if (l.img.y > l.floor) { l.img.y = l.floor; l.vy *= -0.35; l.vx *= 0.6; l.spin *= 0.5; }
    l.img.setAlpha(Math.min(1, l.life / 0.4));
  }
  if (B) { drawCastleUI(dt); if (!B.auto) { uiTick(); colocaAnillos(); } }
}
function start() {
  const g = $('game');
  window.__game = new Phaser.Game({
    type: Phaser.AUTO, parent: 'game', width: Math.round(g.clientWidth * DPR), height: Math.round(g.clientHeight * DPR), backgroundColor: '#161b2b',
    scale: { mode: Phaser.Scale.NONE, zoom: 1 / DPR },
    scene: { preload() {
      this.load.on('progress', v => { $('loadfill').style.width = (v * 100) + '%'; $('loadtxt').textContent = 'Cargando… ' + Math.round(v * 100) + ' %'; });
__PRELOAD__
      escPreload(this.load);
    }, create, update }
  });
}

/* ---- pantallas: carga → menú (con una partida de la IA contra sí misma de fondo) → mazo → batalla → pausa / final ---- */
const SCREENS = ['carga', 'menu', 'deck', 'mundo', 'reino', 'nivel', 'pausa', 'over', 'ejercito', 'taberna', 'arena', 'perfil', 'tienda', 'hogar', 'edif', 'eventos', 'abismo'];
// pantallas con la barra de pestañas abajo y la pestaña que se ilumina en cada una
const TAB_OF = { tienda: 'tienda', hogar: 'hogar', edif: 'hogar', taberna: 'hogar', menu: 'menu', mundo: 'menu', ejercito: 'menu', arena: 'arena', eventos: 'eventos', abismo: 'eventos' };
const TABS = Object.keys(TAB_OF);
function show(id) {
  SCREENS.forEach(s => { $(s).hidden = s !== id; });
  const hud = id === null || id === 'pausa' || id === 'over', changed = $('hud').hidden === hud;
  $('hud').hidden = !hud;
  if (changed) requestAnimationFrame(frameCamera);
  document.body.classList.toggle('nav', TABS.includes(id)); $('nav').hidden = !TABS.includes(id);
  document.querySelectorAll('#nav button').forEach(b => { if (b.dataset.tab === TAB_OF[id]) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  paintGold(); if (typeof paintHub === 'function') paintHub();
  if (id === 'menu') requestAnimationFrame(frameCamera);
  // en las pantallas opacas no se ve el campo: se detiene el bucle del juego para ahorrar batería
  const gm = window.__game; if (gm && gm.loop) { if (['mundo', 'reino', 'ejercito', 'taberna', 'arena', 'perfil', 'tienda', 'hogar', 'edif', 'eventos', 'abismo', 'celdas'].includes(id)) gm.loop.sleep(); else if (!gm.loop.running) gm.loop.wake(); }
}
function startDemo() { resetBattle({ demo: true }); }
function setPaused(on) { $('coach').hidden = true; paused = on; if (scene) on ? scene.tweens.pauseAll() : scene.tweens.resumeAll(); show(on ? 'pausa' : null); }
const TIPS = ['Toca una carta para sacar la unidad delante de tu castillo.', 'Arrastra a un asesino desde su carta y suéltalo en tu mitad del campo.', 'A las 15 bajas tu héroe salta del trono: tócalo y luego usa su habilidad.',
  'La energía se recarga sola; a partir de los 2 minutos, el doble de rápido.', 'Las torres del castillo disparan a quien se acerca.', 'Espera a que una unidad se adelante y lánzale apoyo por detrás.',
  'Cada castillo vasallo que conquistas libera a un prisionero de sus mazmorras.', 'Gana con tu castillo casi intacto para llevarte las tres estrellas.'];
let tipI = Math.floor(Math.random() * TIPS.length);
$('tip').textContent = TIPS[tipI];
const tipTimer = setInterval(() => { tipI = (tipI + 1) % TIPS.length; $('tip').textContent = TIPS[tipI]; }, 3500);
function loaded() {
  $('loadfill').style.width = '100%'; $('loadtxt').textContent = '¡Listo!';
  if (location.hash === '#menu') { clearInterval(tipTimer); show('menu'); return; }   // vuelta desde la práctica
  $('tap').hidden = false; $('tap').focus();
}
function fullscreen() {
  // en el navegador del móvil, a pantalla completa; instalada en la pantalla de inicio ya se abre así
  const inApp = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone;
  const el = document.documentElement;
  if (inApp || document.fullscreenElement) return;
  try { const p = (el.requestFullscreen || el.webkitRequestFullscreen).call(el, { navigationUI: 'hide' }); if (p && p.catch) p.catch(() => {}); } catch (e) {}
}
$('tap').onclick = () => { clearInterval(tipTimer); fullscreen(); show('menu'); };
$('pause').onclick = () => { if (B && !B.over) setPaused(true); };
$('resume').onclick = () => setPaused(false);
$('speed').onclick = e => { timeScale = timeScale === 1 ? 2 : 1; e.currentTarget.textContent = 'x' + timeScale; e.currentTarget.setAttribute('aria-pressed', timeScale === 2); };
$('hero').onclick = () => heroClick();
document.addEventListener('visibilitychange', () => { if (document.hidden && B && !B.over && !B.auto && !paused) setPaused(true); });

/* ---- panel de cartas ---- */
function renderHand() {
  const h = $('hand'); h.innerHTML = '';
  B.blue.hand.forEach((t, i) => {
    if (!t) return;
    const b = document.createElement('button');
    b.className = 'hc ' + (RARITY[t] || 'comun'); b.dataset.i = i; b.setAttribute('aria-label', NAMES[t] + ', coste ' + COST[t]);
    b.innerHTML = '<span class="cost">' + COST[t] + '</span><img src="img/' + t + '_carta.png" alt=""><span class="nm">' + LABEL[t] + '</span>';
    b.onclick = () => play('blue', i);
    h.appendChild(b);
  });
  const nx = B.blue.queue[0];
  $('nextwrap').hidden = !nx;
  if (nx) { $('next').src = 'img/' + nx + '_carta.png'; $('next').alt = 'Siguiente: ' + LABEL[nx]; }
}
let lastUI = 0;
function uiTick() {
  const now = performance.now(); if (now - lastUI < 80) return; lastUI = now;
  const e = B.blue.energy;
  $('efill').style.width = (e / EMAX * 100) + '%'; $('enum').textContent = Math.floor(e);
  document.querySelectorAll('.hc').forEach(b => b.classList.toggle('poor', COST[B.blue.hand[+b.dataset.i]] > e));
  $('clock').textContent = (B.doubled ? '×2 ' : '') + Math.floor(B.t / 60) + ':' + String(Math.floor(B.t % 60)).padStart(2, '0');
  $('clock').classList.toggle('x2', !!B.doubled);
  for (const [t, id] of [['blue', 'hpb'], ['purple', 'hpp']]) { const c = castles[t]; $(id).textContent = Math.max(0, Math.ceil(c.hp)); $(id + 'f').style.width = Math.max(0, c.hp / c.max * 100) + '%'; }
  heroUI();
}
$('selfondo').innerHTML = Object.keys(ESC).map((k, i) => '<option value="' + k + '">' + (i + 1) + '. ' + (ESC_NAME[k] || k) + '</option>').join('');
$('selfondo').value = escena;
$('selfondo').onchange = e => { if (scene) setScenery(e.target.value); };

/* ---- ganchos para las pruebas ---- */
window.__debugBattle = () => ({ t: B.t, demo: B.demo, run: B.run, blue: { e: B.blue.energy, hand: B.blue.hand, hp: castles.blue.hp, kills: B.blue.kills }, purple: { e: B.purple.energy, hp: castles.purple.hp, max: castles.purple.max, deck: B.purple.deck }, heroP: B.heroP.type, units: units.map(u => u.type + ':' + u.team + ':' + Math.round(u.hp) + ':' + Math.round(u.x)), over: B.over, zoom: zoomCss });
window.__play = (team, i) => play(team, i);
window.__addUnitB = (type, team, x) => { units.push(new Unit(scene, type, team, x)); };
window.__units = () => units;
window.__castleHp = (team, hp) => { castles[team].hp = hp; if (hp <= 0) castles[team].damage(1); };
window.__show = show;
