/* ==== Capa de batalla: castillos, torres, energía, mazo, IA y estadísticas.
   Se monta sobre el código de unidades del campo de pruebas (construir.py). ==== */
const COST = __COST__;
const LABEL = Object.fromEntries(Object.entries(NAMES).map(([k, v]) => [k, v.split(',')[0]]));
LABEL.aldric = 'Rey Aldric'; LABEL.lyra = 'Lyra'; LABEL.gull = 'Gūll'; LABEL.guardia = 'Guardián'; LABEL.esqueleto = 'Esqueleto'; LABEL.rata_puno = 'Rata'; LABEL.rata_cuchillo = 'Rata'; LABEL.rata_palanca = 'Rata';
const ALL = Object.keys(NAMES);
const EMAX = 10, EREGEN = 1 / 3.5, DOUBLE_AT = 120, CASTLE_HP = 1500, HERO_GOAL = CH.aldric.goal, TOWER = { range: H * 3.2, cd: 1.3, dmg: 8 };
let B = null, castles = {}, castleG, flashG, throneImg = null, throneImgP = null, paused = false;
// héroes que se pueden llevar a la batalla
const HEROES = {
  // throne: el héroe sentado que se pone sobre el trono del castillo (sin dibujo propio sentado, su trono de antes); al saltar, el trono queda vacío
  aldric: { name: 'Rey Aldric', skill: 'seismic', skillName: 'Golpe sísmico', throne: 'aldric_sentado', empty: null, portrait: 'aldric_retrato', tw: 2.1, oy: 0.74 },
  lyra: { name: 'Lyra', skill: 'storm', skillName: 'Tormenta de plumas', throne: 'trono_lyra', empty: null, portrait: 'lyra_retrato', tw: 1.15, oy: 0.95 },
  gull: { name: 'Gūll', skill: 'charge', skillName: 'Embestida porcina', throne: 'trono_gull', empty: null, portrait: 'gull_retrato', tw: 1.6, oy: 0.95 },
};
let myHero = (() => { try { const h = localStorage.getItem('bg-hero'); return HEROES[h] ? h : 'aldric'; } catch (e) { return 'aldric'; } })();   // trono sobre el torreón de tu castillo
/* ---- castillos (vista aérea): el dibujo, recortado a 865x1180, con el trono dentro y dos torres con arqueros mirando al
   camino. El tuyo a la izquierda; el del rival, volteado a la derecha y con su color. Cuatro aspectos: piedra, roble, hielo y hierro ---- */
let ROADW = 1250;                                        // anchura del camino (de hierba a hierba), en unidades del mundo (la fija la escena)
const CAS = { k: 1.0, x0: -230, oy: 560, front: 860, seat: [385, 560], arch: [[790, 132], [795, 776]], w: 865, h: 1180 };
const CASTLE_FRONT = CAS.x0 + CAS.front * CAS.k;            // frente de las torres
const THRONE = { x: CAS.x0 + CAS.seat[0] * CAS.k, y: GROUND - 10 + (CAS.seat[1] - CAS.oy) * CAS.k, w: 165 };
// el terreno de juego va de FIELD_L a FIELD_R: nadie pisa ningún castillo (al aparecer, al ser empujado o al lanzarse)
const FIELD_L = CASTLE_FRONT + H * 0.5, FIELD_R = W - FIELD_L;
// las unidades a distancia atacan a todo lo que esté a tres cuartos del terreno de juego (el fraile y Cole conservan su alcance de siempre; el centinela solo gana alcance con el francotirador: su minigun sigue usando close)
const RANGO_LEJOS = 0.75 * (FIELD_R - FIELD_L);
for (const k in CH) if (CH[k].ranged && k !== 'fraile' && k !== 'pistolero') CH[k].range = Math.max(CH[k].range, RANGO_LEJOS);
const CASTILLOS = ['piedra', 'roble', 'hielo', 'hierro'];
let castleImg = {};
let CASTLE_SKIN = { blue: null, purple: null };          // aspecto de cada bando (reino.js); sin él, el de piedra
function castleArt(team, st = '') {
  const id = CASTLE_SKIN[team] && CASTILLOS.includes(CASTLE_SKIN[team].id) ? CASTLE_SKIN[team].id : 'piedra';
  return { key: 'cas_' + id + (st === '_danado' ? '_d' : st === '_destruido' ? '_r' : ''), flip: team === 'purple' };
}
function castleVariants(sc) {
  // dañado y en ruinas, hechos a partir del dibujo: más oscuro, con grietas y hollín (en ruinas, mucho más)
  for (const id of CASTILLOS) for (const [suf, n, dark] of [['_d', 8, 0.18], ['_r', 18, 0.45]]) {
    const key = 'cas_' + id + suf; if (sc.textures.exists(key) || !sc.textures.exists('cas_' + id)) continue;
    const im = sc.textures.get('cas_' + id).getSourceImage(), cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
    const c = cv.getContext('2d'), Wd = cv.width, Hd = cv.height; let sd = [...id + suf].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
    const rn = () => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296;
    c.drawImage(im, 0, 0); c.globalCompositeOperation = 'source-atop';
    c.fillStyle = 'rgba(40,28,28,' + dark + ')'; c.fillRect(0, 0, Wd, Hd);
    for (let i = 0; i < n; i++) {
      const x = Wd * (0.08 + rn() * 0.84), y = Hd * (0.1 + rn() * 0.8), r = 40 + rn() * 60, g = c.createRadialGradient(x, y, 2, x, y, r);
      g.addColorStop(0, 'rgba(20,16,18,.6)'); g.addColorStop(1, 'rgba(20,16,18,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    c.strokeStyle = '#1e2235'; c.lineJoin = 'round'; c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      let x = Wd * (0.1 + rn() * 0.8), y = Hd * (0.1 + rn() * 0.8), a = rn() * Math.PI * 2;
      c.lineWidth = 6 + rn() * 5; c.beginPath(); c.moveTo(x, y);
      for (let j = 0; j < 5; j++) { a += (rn() - 0.5) * 1.6; x += Math.cos(a) * (18 + rn() * 26); y += Math.sin(a) * (18 + rn() * 26); c.lineTo(x, y); }
      c.stroke();
    }
    sc.textures.addCanvas(key, cv);
  }
}
const archPos = (team, i) => { const [ax, ay] = CAS.arch[i], x = CAS.x0 + ax * CAS.k; return [team === 'blue' ? x : W - x, GROUND - 10 + (ay - CAS.oy) * CAS.k]; };
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
/* ---- carriles: el camino tiene cinco carriles invisibles; cada unidad sale en uno al azar (con un poco de holgura) y, cuando
   se acerca a su rival, se va desviando hacia el carril de él para pelear cara a cara ---- */
let ROAD_HALF = H;
const LANES = 5, LANE_DRIFT = 75;   // px por segundo de cambio de carril
function laneRand() { const i = Math.floor(Math.random() * LANES), sp = ROAD_HALF * 0.42; return Math.round((i - (LANES - 1) / 2) / ((LANES - 1) / 2) * sp + rand(-6, 6)); }
function laneTick(dt) {
  const lim = ROAD_HALF * 0.6;
  for (const u of units) {
    if (!u.alive || u.isCastle || !['walk', 'attack', 'idle'].includes(u.state)) continue;
    const o = nearestEnemy(u);
    if (o && !o.isCastle && Math.abs(o.x - u.x) < H * 7) {   // empiezan a buscarse de lejos: llegan al choque en el mismo carril
      const d = o.lane - u.lane, step = Math.min(Math.abs(d) / 2, LANE_DRIFT * dt);   // los dos van hacia el medio
      if (Math.abs(d) > 6) u.lane += Math.sign(d) * step;
    }
    u.lane = Math.max(-lim, Math.min(lim, u.lane));
    u.root.y = u.gy; u.root.setDepth(u.gy);
  }
}
let PLAY_AT = null; RHY_ALL = false;   // en batalla Rhysida solo usa las skins de su rango
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
    s.towerI = ((s.towerI || 0) + 1) % 2; const [sx, sy] = archPos(team, s.towerI);   // dispara el arquero de una torre y luego el de la otra
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
      ci.setOrigin(A.flip ? 1 : 0, CAS.oy / CAS.h).setScale(CAS.k).setPosition(team === 'blue' ? CAS.x0 : W - CAS.x0, GROUND - 10);
      const th = team === 'blue' ? throneImg : throneImgP;   // sin castillo no hay trono: cae entre los cascotes
      if (th) { scene.tweens.killTweensOf(th); if (st === '_destruido') scene.tweens.add({ targets: th, y: THRONE.y + 40, alpha: 0, angle: team === 'blue' ? 25 : -25, duration: 700, ease: 'Quad.in' }); else th.setPosition(team === 'blue' ? THRONE.x : W - THRONE.x, THRONE.y).setAlpha(1).setAngle(0); }
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
function setThrone(img, key) {
  // el héroe sentado en el trono del castillo; sin key (ha saltado al campo), el trono queda vacío
  if (!key || !scene.textures.exists(key)) { img.setVisible(false); return; }
  const h = Object.values(HEROES).find(x => x.throne === key) || {};
  img.setTexture(key).setVisible(true).setAlpha(1).setAngle(0).setOrigin(0.5, h.oy || 0.92); img.setScale(THRONE.w * (h.tw || 1) / img.width);
}
function heroAct(team) {
  // el héroe de un bando: si está en el trono y tiene las bajas, salta; si está en el campo y la habilidad está lista, la lanza
  const hr = team === 'blue' ? B.hero : B.heroP; if (!hr || !hr.type || B.over) return false;
  if (hr.state === 'throne' && B[team].kills >= HERO_GOAL) {
    const blue = team === 'blue', x = blue ? FIELD_L + H * 0.3 : FIELD_R - H * 0.3, tx = blue ? THRONE.x : W - THRONE.x;
    const u = new Unit(scene, hr.type, team, x); units.push(u);
    u.jumpFromX = tx; u.jumpToX = x; u.jumpFromY = Math.max(40, GROUND - THRONE.y + 60); u.set('heroJump');
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
const ESC_NAME = { cerezos: 'Cerezos', otono: 'Otoño', oasis: 'Oasis', pinos: 'Pinos' };
let escena = (() => { try { const v = localStorage.getItem('bg-escena'); return ESC[v] ? v : 'cerezos'; } catch (e) { return 'cerezos'; } })(), escObjs = [], clouds = [];
function escPreload(L) {
  L.image(escena, 'img/esc/' + escena + '.jpg');
  for (const id of CASTILLOS) L.image('cas_' + id, 'img/castillos/' + id + '.png');
  L.image('aldric_sentado', 'img/aldric_sentado.png');
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
  // la escena (vertical) cubre el ancho del campo, con su camino centrado en GROUND; por encima, su cielo y por debajo, su prado
  escObjs.forEach(o => o.destroy()); escObjs = []; clouds = [];
  const f = ESC[escena]; if (!f || !sc.textures.exists(escena)) return;
  const s = W / f.w, iw = f.w * s, ih = f.h * s, y0 = GROUND - (f.t + f.b) / 2 * ih;
  ROADW = (f.b - f.t) * ih; ROAD_HALF = ROADW / 2;
  const z = cam.zoom, cx = cam.scrollX + cam.width / 2, cy = cam.scrollY + cam.height / 2, vw = cam.width / z, vh = cam.height / z, top = cy - vh / 2, bot = cy + vh / 2;
  const col = h => Phaser.Display.Color.HexStringToColor(h).color, add = o => (escObjs.push(o), o);
  if (top < y0) add(sc.add.rectangle(cx, (top - 60 + y0) / 2 + 2, vw + 200, y0 - top + 64, col(f.top)).setDepth(-2001));
  if (bot > y0 + ih) add(sc.add.rectangle(cx, (y0 + ih + bot + 60) / 2 - 2, vw + 200, bot + 64 - y0 - ih, col(f.bot)).setDepth(-2001));
  for (let i = -2; i <= 2; i++) { const x = W / 2 + i * iw; if (x + iw / 2 >= cx - vw / 2 - 10 && x - iw / 2 <= cx + vw / 2 + 10) add(sc.add.image(x, y0, escena, '__BASE').setOrigin(0.5, 0).setScale(s).setFlipX(i % 2 !== 0).setDepth(-2000)); }
}
// sin subsuelo: lo que queda de él, vacío (lo usan la cripta de la bestia y las pruebas)
let SUB_Y = GROUND + 700, SUB_TEMA = 'piedra', SUB_TEMA_P = 'piedra', SUB_L = null;
const SUBSUELO = { temas: {} };
function subTex() {}
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
    const t = $('hubtop').getBoundingClientRect().bottom + 40, bt = $('hubbot').getBoundingClientRect().top - 4, Y1 = GROUND + ROADW / 2 + 30, Y0 = GROUND - ROADW / 2 - H * 1.2;
    const z = Math.min(cw / 860, Math.max(60, bt - t) * DPR / (Y1 - Y0), 0.7 * DPR);   // en pantallas grandes, sin pasarse de tamaño
    cam.setZoom(z); cam.centerOn(W / 2, Y1 - (bt * DPR - ch / 2) / z);
    zoomCss = z / DPR; TXT_K = Math.max(1, Math.min(3, 0.5 / zoomCss)); drawScenery(scene); return;
  }
  const topCss = battle ? $('hudtop').getBoundingClientRect().bottom + 6 : 0, botCss = battle ? $('dock').getBoundingClientRect().top - 2 : window.innerHeight;
  const X0 = 20, X1 = W - 20, Y0 = GROUND - 10 - CAS.oy * CAS.k - 20, Y1 = GROUND - 10 + (CAS.h - CAS.oy) * CAS.k + 10;   // los dos castillos enteros
  const z = Math.min(cw / (X1 - X0), Math.max(60, botCss - topCss) * DPR / (Y1 - Y0));   // solo vertical: manda el ancho
  // el campo, en el centro del hueco entre el marcador y el panel de cartas (en vertical sobra alto: cielo arriba y prado abajo)
  const yCss = battle ? (topCss + botCss) / 2 : window.innerHeight / 2, mid = (Y0 + Y1) / 2;
  cam.setZoom(z); cam.centerOn(W / 2, mid - (yCss * DPR - ch / 2) / z);
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
  castleVariants(this);
  for (const team of ['blue', 'purple']) {
    const A = castleArt(team), im = this.add.image(team === 'blue' ? CAS.x0 : W - CAS.x0, GROUND - 10, A.key).setFlipX(A.flip);
    im.setOrigin(A.flip ? 1 : 0, CAS.oy / CAS.h).setScale(CAS.k).setDepth(-1500); castleImg[team] = im;   // detrás de las unidades
  }
  throneImg = this.add.image(THRONE.x, THRONE.y, 'aldric_sentado').setDepth(-1499);
  throneImgP = this.add.image(W - THRONE.x, THRONE.y, 'aldric_sentado').setDepth(-1499).setFlipX(true);
  setThrone(throneImg, 'aldric_sentado'); setThrone(throneImgP, 'aldric_sentado');
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
    towers(dt); fightLogic(dt); laneTick(dt);
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
  const real = paused ? 0 : Math.min(0.05, deltaMs / 1000) * timeScale;
  if (slowBy && (!slowBy.alive || slowBy.state !== 'ultR' || !units.includes(slowBy))) slowBy = null;   // definitiva de Rhysida: el tiempo va al 1 %
  slowReal = real; const dt = slowBy ? real * 0.01 : real;
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
  try { const p = (el.requestFullscreen || el.webkitRequestFullscreen).call(el, { navigationUI: 'hide' }); if (p && p.then) p.then(() => { try { screen.orientation.lock('portrait').catch(() => {}); } catch (e) {} }, () => {}); } catch (e) {}
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
window.__castles = () => castles;
window.__debugBattle = () => ({ t: B.t, demo: B.demo, run: B.run, blue: { e: B.blue.energy, hand: B.blue.hand, hp: castles.blue.hp, kills: B.blue.kills }, purple: { e: B.purple.energy, hp: castles.purple.hp, max: castles.purple.max, deck: B.purple.deck }, heroP: B.heroP.type, units: units.map(u => u.type + ':' + u.team + ':' + Math.round(u.hp) + ':' + Math.round(u.x)), over: B.over, zoom: zoomCss });
window.__play = (team, i) => play(team, i);
window.__addUnitB = (type, team, x) => { units.push(new Unit(scene, type, team, x)); };
window.__units = () => units;
window.__castleHp = (team, hp) => { castles[team].hp = hp; if (hp <= 0) castles[team].damage(1); };
window.__show = show;
