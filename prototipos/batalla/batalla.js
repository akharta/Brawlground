/* ==== Capa de batalla: castillos, torres, energía, mazo, IA y estadísticas.
   Se monta sobre el código de unidades del campo de pruebas (construir.py). ==== */
const COST = __COST__;
const LABEL = Object.fromEntries(Object.entries(NAMES).map(([k, v]) => [k, v.split(',')[0]]));
LABEL.aldric = 'Rey Aldric'; LABEL.guardia = 'Guardián'; LABEL.esqueleto = 'Esqueleto';
const ALL = Object.keys(NAMES);
const EMAX = 10, EREGEN = 1 / 3.5, DOUBLE_AT = 120, CASTLE_HP = 1500, HERO_GOAL = CH.aldric.goal, TOWER = { range: H * 3.2, cd: 1.3, dmg: 8 };
let B = null, castles = {}, castleG, flashG, hpText = {}, throneImg = null, throneImgP = null;
const THRONE = { x: 52, y: 192, w: 104 };   // trono sobre tu castillo
const ZOOM = VW / W, CAM_Y = 255;   // cámara fija y alejada: se ve el campo entero (1440 px) de un castillo al otro
let cam, db = null;
(async () => { try { db = await (window.claude?.use?.('db') ?? null); } catch (e) { db = null; } })();
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const $ = id => document.getElementById(id);

// mazo del jugador: se recuerda en este navegador
let myDeck = (() => { try { const d = JSON.parse(localStorage.getItem('bg-deck') || 'null'); if (Array.isArray(d) && d.length === 8 && d.every(k => COST[k])) return d; } catch (e) {} return ['legionario', 'arquera', 'lobo', 'tercio', 'valkiria', 'ninja', 'samurai', 'pistolero']; })();
function aiDeck() {
  // la IA arma un mazo variado: dos cartas baratas, cuatro medias y dos caras
  const by = (lo, hi) => shuffle(ALL.filter(k => COST[k] >= lo && COST[k] <= hi));
  const d = [...by(1, 2).slice(0, 2), ...by(3, 4).slice(0, 4), ...by(5, 7).slice(0, 2)];
  return d.length === 8 ? d : shuffle(ALL.slice()).slice(0, 8);
}
function newSide(deck) { const q = shuffle(deck.slice()); return { energy: 5, hand: q.splice(0, 4), queue: q, kills: 0, towerT: 1, deck: deck.slice() }; }

function makeCastle(team) {
  return { isCastle: true, type: 'castle', team, x: team === 'blue' ? 95 : W - 95, lane: 0, get gy() { return GROUND; }, alive: true, state: 'idle',
    hp: CASTLE_HP, max: CASTLE_HP, cfg: { ranged: false, h: 1.8 }, dir: team === 'blue' ? 1 : -1, flash: 0, bigK: 1,
    knock() { return false; }, shove() {}, healBy() {},
    damage(d, src) {
      if (!this.alive || !B || B.over) return;
      const dealt = Math.min(this.hp, d); this.hp -= d; this.flash = 0.12;
      if (src && src.team && src.type) stat(src.team, src.type).castle += dealt;
      floatText(this.x + this.dir * 20, GROUND - H * 1.7, '-' + d);
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
function play(team, idx) {
  const side = B[team], type = side.hand[idx];
  if (!type || B.over || side.energy < COST[type]) return false;
  side.energy -= COST[type];
  side.hand[idx] = side.queue.shift(); side.queue.push(type);
  units.push(new Unit(scene, type, team, team === 'blue' ? 150 : W - 150));
  stat(team, type).played++;
  if (team === 'blue') renderHand();
  return true;
}
function aiLogic(dt) {
  // juega lo que puede pagar; a veces ahorra para la carta más cara de su mano
  B.aiT -= dt; if (B.aiT > 0) return;
  const s = B.purple, ok = s.hand.map((t, i) => [t, i]).filter(([t]) => COST[t] <= s.energy);
  const priciest = Math.max(...s.hand.map(t => COST[t]));
  const saving = priciest > s.energy && priciest >= 5 && Math.random() < 0.6;
  if (ok.length && !saving && (s.energy >= 7 || Math.random() < 0.55)) {
    ok.sort((a, b) => COST[b[0]] - COST[a[0]]);
    const [, i] = Math.random() < 0.6 ? ok[0] : ok[Math.floor(Math.random() * ok.length)];
    play('purple', i); B.aiT = rand(1.2, 3.2);
  } else B.aiT = 0.5;
}
function towers(dt) {
  for (const team of ['blue', 'purple']) {
    const c = castles[team]; if (!c.alive) continue;
    const s = B[team]; s.towerT -= dt; if (s.towerT > 0) continue;
    const foes = units.filter(v => v.team !== team && v.alive && v.state !== 'die' && v.state !== 'spawn' && Math.abs(v.x - c.x) <= TOWER.range);
    if (!foes.length) { s.towerT = 0.2; continue; }
    const tg = foes.sort((a, b) => Math.abs(a.x - c.x) - Math.abs(b.x - c.x))[0];
    const sx = c.x + c.dir * 18, sy = 175, tx = tg.x, ty = tg.gy - H * 0.45, T = Math.max(0.35, Math.abs(tx - sx) / 700), g = 900;
    const img = scene.add.image(sx, sy, 'arq_flecha').setOrigin(0.85, 0.5).setScale(0.55 * H / 512).setDepth(950);
    arrows.push({ img, x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy - 0.5 * g * T * T) / T, g, t: 0, T, target: tg, dmg: TOWER.dmg, stuck: 0 });
    s.towerT = TOWER.cd;
  }
}
function drawCastleUI(dt) {
  castleG.clear(); flashG.clear();
  for (const team of ['blue', 'purple']) {
    const c = castles[team], bw = 120, by = 134, x0 = team === 'blue' ? 6 : W - bw - 6;
    castleG.fillStyle(OUT, 1).fillRoundedRect(x0 - 3, by - 3, bw + 6, 18, 7);
    castleG.fillStyle(0x3a3f55, 1).fillRoundedRect(x0, by, bw, 12, 5);
    castleG.fillStyle(team === 'blue' ? BLUE : PURPLE, 1).fillRoundedRect(x0, by, Math.max(4, bw * c.hp / c.max), 12, 5);
    if (c.flash > 0) { c.flash -= dt; const fx0 = team === 'blue' ? -10 : W - 110; flashG.fillStyle(0xffffff, 0.35).fillRect(fx0, 190, 120, 240); }
  }
}
function statsTable(team, title) {
  const rows = Object.entries(B.stats[team]).filter(([, s]) => s.played).sort((a, b) => (b[1].dmg + b[1].castle + b[1].heal) - (a[1].dmg + a[1].castle + a[1].heal));
  const tr = rows.map(([k, s]) => `<tr><td>${LABEL[k]}</td><td>${s.played}</td><td>${Math.round(s.dmg)}</td><td>${Math.round(s.castle)}</td><td>${s.kills}</td><td>${s.deaths}${s.firstDeath !== null ? ' (' + Math.round(s.firstDeath) + ' s)' : ''}</td>${s.heal ? `<td>+${Math.round(s.heal)}</td>` : '<td></td>'}</tr>`).join('');
  return `<div><h3>${title}</h3><table><thead><tr><th>Carta</th><th>Jugadas</th><th>Daño</th><th>Al castillo</th><th>Bajas</th><th>Caídas (1.ª)</th><th>Cura</th></tr></thead><tbody>${tr || '<tr><td colspan="7">Sin cartas jugadas</td></tr>'}</tbody></table></div>`;
}
function endGame(win) {
  B.over = true;
  $('over-title').textContent = win ? '¡Victoria!' : 'Derrota';
  $('over-text').textContent = (win ? 'Has derribado el castillo rival' : 'Han derribado tu castillo') + ' en ' + Math.round(B.t) + ' s. Enemigos abatidos: ' + B.blue.kills + '.';
  $('stats').innerHTML = statsTable('blue', 'Tu bando') + statsTable('purple', 'Rival');
  window.__lastStats = JSON.parse(JSON.stringify({ win, t: B.t, stats: B.stats, decks: { blue: B.blue.deck, purple: B.purple.deck } }));
  if (db && !B.saved) { B.saved = true; db.collection('partidas').add({ ...window.__lastStats, t: Math.round(B.t), fecha: new Date().toISOString(), castillos: { azul: Math.max(0, Math.round(castles.blue.hp)), morado: Math.max(0, Math.round(castles.purple.hp)) } }).catch(() => {}); }
  $('over').hidden = false;
}
function resetBattle() {
  clearUnits();
  B = { blue: newSide(myDeck), purple: newSide(aiDeck()), over: false, aiT: 2.5, t: 0, stats: { blue: {}, purple: {} }, hero: { state: 'throne', unit: null, skillT: 0 }, heroP: { state: 'throne', unit: null, skillT: 0 } };
  if (throneImg) { throneImg.setTexture('trono_aldric'); throneImgP.setTexture('trono_aldric'); }
  castles = { blue: makeCastle('blue'), purple: makeCastle('purple') };
  $('over').hidden = true; renderHand();
}
const enemyCastle = u => { const c = castles[u.team === 'blue' ? 'purple' : 'blue']; return c && c.alive ? [c] : []; };

/* ---- héroe ---- */
function heroAct(team) {
  // el héroe de un bando: si está en el trono y tiene las bajas, salta; si está en el campo y la habilidad está lista, la lanza
  const hr = team === 'blue' ? B.hero : B.heroP; if (!hr || B.over) return false;
  if (hr.state === 'throne' && B[team].kills >= HERO_GOAL) {
    const blue = team === 'blue', x = blue ? 200 : W - 200, tx = blue ? THRONE.x : W - THRONE.x;
    const u = new Unit(scene, 'aldric', team, x); units.push(u);
    u.jumpFromX = tx; u.jumpToX = x; u.jumpFromY = GROUND - (THRONE.y - 40); u.set('heroJump');
    hr.unit = u; hr.state = 'field'; hr.skillT = 3; (blue ? throneImg : throneImgP).setTexture('trono_vacio'); stat(team, 'aldric').played++;
    return true;
  } else if (hr.state === 'field' && hr.skillT <= 0 && ['idle', 'walk', 'attack'].includes(hr.unit.state)) {
    hr.unit.set('seismic'); hr.skillT = CH.aldric.skillCd; return true;
  }
  return false;
}
function heroClick() { heroAct('blue'); }
function heroAI() {
  // la IA: salta en cuanto puede y usa el Golpe sísmico cuando tiene al menos dos enemigos a su alcance
  const hr = B.heroP;
  if (hr.state === 'throne') heroAct('purple');
  else if (hr.state === 'field' && hr.skillT <= 0) {
    const u = hr.unit, r = CH.aldric.seismic.r;
    if (enemiesOf(u).filter(v => !v.isCastle && Math.abs(v.x - (u.x + u.dir * H * 0.9)) <= r).length >= 2) heroAct('purple');
  }
}
function heroUI() {
  const hr = B.hero, btn = $('hero'), k = B.blue.kills;
  let title, sub, on = false, ready = false;
  if (hr.state === 'throne') { ready = on = k >= HERO_GOAL; title = ready ? '¡Rey Aldric!' : 'Rey Aldric'; sub = ready ? 'Toca para saltar' : Math.min(k, HERO_GOAL) + '/' + HERO_GOAL + ' bajas'; }
  else if (hr.state === 'field') { ready = on = hr.skillT <= 0; title = 'Golpe sísmico'; sub = ready ? '¡Listo!' : Math.ceil(hr.skillT) + ' s'; }
  else { title = 'Rey Aldric'; sub = 'Ha caído'; }
  btn.disabled = !on; btn.classList.toggle('ready', ready);
  if (btn.dataset.t !== title + sub) { btn.dataset.t = title + sub; btn.innerHTML = '<img src="img/aldric_retrato.png" alt="">' + title + '<span>' + sub + '</span>'; }
}
$('hero').onclick = () => heroClick();
window.__heroClick = () => heroClick();
window.__hero = () => B.hero && { state: B.hero.state, skillT: B.hero.skillT, kills: B.blue.kills, hp: B.hero.unit && Math.round(B.hero.unit.hp) };
window.__setKills = (n, team = 'blue') => { B[team].kills = n; };
window.__heroP = () => B.heroP && { state: B.heroP.state, skillT: B.heroP.skillT, kills: B.purple.kills };

/* ---- escenario del campo largo: fondo + camino + decoración (arte en img/esc, datos en esc.json) ---- */
const ESC = __ESC__;
const PATH_T = 345, PATH_B = 478, HZ = 330;   // camino de tierra (franja) y línea del horizonte
const pick = (k, def) => { try { const v = localStorage.getItem('bg-' + k); return v && ESC[k + 's'][v] ? v : def; } catch (e) { return def; } };
let escFondo = pick('fondo', 'fondo_01'), escCamino = pick('camino', 'camino_02'), escObjs = [];
function escPreload(L) {
  L.image(escFondo, 'img/esc/' + escFondo + '.jpg'); L.image(escCamino, 'img/esc/' + escCamino + '.png');
  for (const k in ESC.deco) L.image('d_' + k, 'img/esc/' + k + '.png');
}
// decoración: [pieza, x, y del suelo, ancho, animación]
const DECO = [
  // lejos, sobre el horizonte
  ['caseta', 330, HZ - 34, 52], ['molino', 1060, HZ - 40, 62], ['pozo', 575, HZ - 26, 30],
  ['hierba_1', 450, PATH_T - 2, 24], ['roca_1', 880, PATH_T - 3, 30], ['arbusto_1', 1180, PATH_T, 44], ['flores', 690, PATH_T - 2, 34], ['hierba_2', 240, PATH_T - 2, 26],
  // junto a los castillos
  ['barril', 165, 520, 40], ['caja', 205, 532, 46], ['cartel', 262, 512, 50],
  ['caja', 1272, 520, 46], ['barril', 1236, 533, 40], ['raton', 1205, 546, 26, 'breath'],
  // prado de abajo
  ['roca_musgo', 330, 600, 88], ['erizo', 395, 612, 38, 'walk'], ['flores', 515, 540, 58], ['mariposa', 520, 500, 24, 'fly'],
  ['arbusto_1', 455, 652, 84], ['hierba_1', 610, 590, 36], ['conejo', 600, 648, 38, 'hop'],
  ['valla', 760, 572, 92], ['valla', 850, 572, 92], ['gorrion', 875, 520, 26, 'peck'],
  ['zorro', 790, 662, 46, 'breath'], ['hierba_2', 700, 545, 42], ['flores', 960, 525, 46], ['abeja', 965, 488, 22, 'fly'],
  ['arbusto_bayas', 1010, 630, 80], ['rana', 1090, 660, 34, 'hop'], ['roca_1', 1115, 552, 54], ['mariquita', 1110, 532, 16, 'crawl'],
  ['hierba_2', 1175, 600, 44], ['ardilla', 1290, 640, 40, 'breath'], ['arbusto_2', 200, 665, 90], ['roca_2', 690, 640, 46],
  ['carreta', 1150, 652, 100], ['banco', 905, 655, 70], ['muro', 105, 610, 84],
];
function drawScenery(sc) {
  escObjs.forEach(o => o.destroy()); escObjs = [];
  const add = o => (escObjs.push(o), o);
  const f = ESC.fondos[escFondo], top = CAM_Y - HGT / ZOOM / 2 - 12, bot = CAM_Y + HGT / ZOOM / 2 + 12;
  // prado: el color de la hierba del propio fondo
  add(sc.add.rectangle(W / 2, (top + bot) / 2, W + 40, bot - top, Phaser.Display.Color.HexStringToColor(f.grass).color).setDepth(-30));
  // fondo: escalado para que el horizonte quede en HZ y cubra hasta arriba; los lados se completan en espejo
  const tex = sc.textures.get(escFondo).getSourceImage(), s = (HZ - top) / (f.hz * tex.height);
  const bw = tex.width * s, y0 = HZ - f.hz * tex.height * s;
  for (let k = -2; k <= 2; k++) {
    const x = W / 2 + k * bw;
    if (x + bw / 2 < -20 || x - bw / 2 > W + 20) continue;
    add(sc.add.image(x, y0, escFondo).setOrigin(0.5, 0).setScale(s).setFlipX(k % 2 !== 0).setDepth(-29));
  }
  // camino: se repite en horizontal; la franja de tierra ocupa de PATH_T a PATH_B
  const c = ESC.caminos[escCamino], cs = (PATH_B - PATH_T) / ((c.b - c.t) * c.h), ch = c.h * cs;
  add(sc.add.tileSprite(W / 2, PATH_T - c.t * ch, W + 40, ch, escCamino).setOrigin(0.5, 0).setTileScale(cs).setDepth(-20));
  for (const [k, x, y, w, anim] of DECO) {
    const [iw, ih] = ESC.deco[k], sz = w / iw, far = y < PATH_T + 10;
    const im = add(sc.add.image(x, y, 'd_' + k).setOrigin(0.5, 0.94).setScale(sz).setDepth(far ? -19 + y / 1000 : y));
    if (x > W / 2 && /conejo|erizo|zorro|rana|gorrion|ardilla|raton/.test(k)) im.setFlipX(true);
    const r = () => 0.6 + Math.random() * 0.8;
    if (anim === 'breath') sc.tweens.add({ targets: im, scaleY: sz * 1.04, duration: 900 * r(), yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    if (anim === 'hop') sc.tweens.add({ targets: im, y: y - 16, duration: 230, yoyo: true, repeat: -1, repeatDelay: 2600 * r(), ease: 'Quad.out' });
    if (anim === 'peck') sc.tweens.add({ targets: im, angle: 22, duration: 160, yoyo: true, repeat: 1, loop: -1, loopDelay: 1800 * r() });
    if (anim === 'crawl') sc.tweens.add({ targets: im, x: x + 18, duration: 4000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    if (anim === 'walk') sc.tweens.add({ targets: im, x: x + 60, duration: 7000, yoyo: true, repeat: -1, ease: 'Sine.inOut', onYoyo: () => im.toggleFlipX(), onRepeat: () => im.toggleFlipX() });
    if (anim === 'fly') {
      const t0 = Math.random() * 10, sp = k === 'abeja' ? 1.6 : 1;
      sc.events.on('update', (_, ms) => { if (!im.active) return; const t = t0 + ms / 1000 * sp; im.x = x + Math.sin(t * 0.7) * 55; im.y = y + Math.sin(t * 1.3) * 18 - Math.abs(Math.sin(t * 6)) * 5; im.setFlipX(Math.cos(t * 0.7) < 0); im.scaleY = sz * (k === 'mariposa' ? 0.75 + Math.abs(Math.sin(t * 9)) * 0.25 : 1); });
    }
  }
}
function setScenery(fondo, camino) {
  escFondo = fondo || escFondo; escCamino = camino || escCamino;
  try { localStorage.setItem('bg-fondo', escFondo); localStorage.setItem('bg-camino', escCamino); } catch (e) {}
  const need = [[escFondo, 'img/esc/' + escFondo + '.jpg'], [escCamino, 'img/esc/' + escCamino + '.png']].filter(([k]) => !scene.textures.exists(k));
  if (!need.length) return drawScenery(scene);
  need.forEach(([k, u]) => scene.load.image(k, u)); scene.load.once('complete', () => drawScenery(scene)); scene.load.start();
}
window.__setScenery = setScenery;
function drawField(g) {
  const castle = (flip, col) => {
    const w = 120, top = 190, bot = 430, x0 = flip ? W - w + 10 : -10;
    g.fillStyle(OUT, 1).fillRect(x0 - 4, top - 4, w + 8, bot - top + 8);
    g.fillStyle(0xa3a9b8, 1).fillRect(x0, top, w, bot - top);
    g.fillStyle(0x8e94a4, 1);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) g.fillRect(x0 + 8 + c * 38 + (r % 2) * 14, top + 22 + r * 36, 26, 12);
    for (let c = 0; c < 5; c++) { g.fillStyle(OUT, 1).fillRect(x0 + c * 26 - 2, top - 24, 20, 24); g.fillStyle(0xa3a9b8, 1).fillRect(x0 + c * 26 + 2, top - 20, 12, 20); }
    const fx0 = flip ? x0 + 30 : x0 + w - 30;
    g.fillStyle(OUT, 1).fillRect(fx0 - 3, top - 90, 6, 70);
    g.fillStyle(col, 1).fillTriangle(fx0 + 2, top - 88, fx0 + 2, top - 58, fx0 + (flip ? -40 : 40), top - 73);
  };
  castle(false, BLUE); castle(true, PURPLE);
}

/* ---- Phaser ---- */
function create() {
  scene = this; mode = 'fight';
  drawScenery(this); drawField(this.add.graphics().setDepth(-10));
  cam = this.cameras.main; cam.setZoom(ZOOM); cam.centerOn(W / 2, CAM_Y);
  makeAuraTextures(this); makeChainEdge(this); hookUltInput(this);
  flashG = this.add.graphics().setDepth(5);
  throneImg = this.add.image(THRONE.x, THRONE.y, 'trono_aldric').setOrigin(0.5, 0.92).setDepth(7); throneImg.setScale(THRONE.w / throneImg.width);
  throneImgP = this.add.image(W - THRONE.x, THRONE.y, 'trono_aldric').setOrigin(0.5, 0.92).setDepth(7).setFlipX(true); throneImgP.setScale(THRONE.w / throneImgP.width);
  castleG = this.add.graphics().setDepth(990);
  for (const team of ['blue', 'purple']) hpText[team] = this.add.text(team === 'blue' ? 66 : W - 66, 140, '', { fontFamily: 'Lilita One, Trebuchet MS, sans-serif', fontSize: '13px', color: '#ffffff', stroke: '#1e2235', strokeThickness: 4 }).setOrigin(0.5).setDepth(995);
  fxG = this.add.graphics().setDepth(980);
  resetBattle(); B.over = true; openDeck();
}
function update(_, deltaMs) {
  const dt = Math.min(0.05, deltaMs / 1000) * timeScale;
  if (B && !B.over) {
    B.t += dt;
    const rate = EREGEN * (B.t >= DOUBLE_AT ? 2 : 1);   // a partir de los 2 minutos, energía doble
    if (B.t >= DOUBLE_AT && !B.doubled) { B.doubled = true; floatText(W / 2, 120, '¡Energía doble!', '#d8b4ff'); }
    for (const team of ['blue', 'purple']) B[team].energy = Math.min(EMAX, B[team].energy + rate * dt);
    aiLogic(dt); towers(dt); fightLogic(dt);
    for (const hr of [B.hero, B.heroP]) if (hr.state === 'field') { if (!hr.unit.alive || hr.unit.state === 'die') hr.state = 'dead'; else if (hr.unit.state !== 'heroJump') hr.skillT = Math.max(0, hr.skillT - dt); }
    heroAI();
  }
  units.forEach(u => { if (u.alive && u.root.visible) u.update(B && B.over ? 0 : dt); });
  updateArrows(dt);
  fxG.clear();
  fx = fx.filter(p => (p.life -= dt) > 0);
  for (const p of fx) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g === undefined ? 420 : p.g) * dt; fxG.fillStyle(p.color, Math.min(1, p.life / p.t * 1.5)).fillCircle(p.x, p.y, p.r * (0.5 + p.life / p.t)); }
  loose = loose.filter(l => { l.life -= dt; if (l.life <= 0) { l.img.destroy(); return false; } return true; });
  for (const l of loose) {
    l.vy += 1300 * dt; l.img.x += l.vx * dt; l.img.y += l.vy * dt; l.img.rotation += l.spin * dt;
    if (l.img.y > l.floor) { l.img.y = l.floor; l.vy *= -0.35; l.vx *= 0.6; l.spin *= 0.5; }
    l.img.setAlpha(Math.min(1, l.life / 0.4));
  }
  if (B) { drawCastleUI(dt); for (const t of ['blue', 'purple']) hpText[t].setText(Math.ceil(castles[t].hp)); uiTick(); }
}
function start() {
  window.__game = new Phaser.Game({
    type: Phaser.AUTO, parent: 'game', width: VW, height: HGT, backgroundColor: '#7fb85a',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: { preload() {
__PRELOAD__
      escPreload(this.load);
    }, create, update }
  });
}

/* ---- interfaz ---- */
function renderHand() {
  const h = $('hand'); h.innerHTML = '';
  B.blue.hand.forEach((t, i) => {
    const b = document.createElement('button');
    b.className = 'hc ' + (RARITY[t] || 'comun'); b.dataset.i = i; b.setAttribute('aria-label', NAMES[t] + ', coste ' + COST[t]);
    b.innerHTML = '<span class="cost">' + COST[t] + '</span><img src="img/' + t + '_carta.png" alt=""><span class="nm">' + LABEL[t] + '</span>';
    b.onclick = () => play('blue', i);
    h.appendChild(b);
  });
  $('next').src = 'img/' + B.blue.queue[0] + '_carta.png'; $('next').alt = 'Siguiente: ' + LABEL[B.blue.queue[0]];
}
let lastUI = 0;
function uiTick() {
  const now = performance.now(); if (now - lastUI < 80) return; lastUI = now;
  const e = B.blue.energy;
  $('efill').style.width = (e / EMAX * 100) + '%'; $('enum').textContent = Math.floor(e);
  document.querySelectorAll('.hc').forEach(b => b.classList.toggle('poor', COST[B.blue.hand[+b.dataset.i]] > e));
  $('clock').textContent = (B.doubled ? '×2 · ' : '') + Math.floor(B.t / 60) + ':' + String(Math.floor(B.t % 60)).padStart(2, '0');
  heroUI();
}
// selector de mazo
let picking = [];
function openDeck() {
  picking = myDeck.slice();
  const g = $('deckgrid'); g.innerHTML = '';
  ALL.slice().sort((a, b) => COST[a] - COST[b] || LABEL[a].localeCompare(LABEL[b])).forEach(k => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'dk ' + (RARITY[k] || 'comun'); b.dataset.k = k;
    b.setAttribute('aria-label', NAMES[k] + ', coste ' + COST[k]);
    b.innerHTML = '<span class="cost">' + COST[k] + '</span><img src="img/' + k + '_carta.png" alt=""><span class="nm">' + LABEL[k] + '</span>';
    b.onclick = () => { const i = picking.indexOf(k); if (i >= 0) picking.splice(i, 1); else if (picking.length < 8) picking.push(k); syncDeck(); };
    g.appendChild(b);
  });
  syncDeck(); $('over').hidden = true; $('deck').hidden = false; if (B) B.over = true;
}
function syncDeck() {
  document.querySelectorAll('.dk').forEach(b => b.setAttribute('aria-pressed', picking.includes(b.dataset.k)));
  const avg = picking.length ? picking.reduce((s, k) => s + COST[k], 0) / picking.length : 0;
  $('deckcount').textContent = picking.length + '/8 · coste medio ' + avg.toFixed(1).replace('.', ',');
  $('deckgo').disabled = picking.length !== 8;
}
for (const [id, kind] of [['selfondo', 'fondos'], ['selcamino', 'caminos']]) {
  const sel = $(id); sel.innerHTML = Object.keys(ESC[kind]).map((k, i) => '<option value="' + k + '">' + (i + 1) + '</option>').join('');
  sel.value = kind === 'fondos' ? escFondo : escCamino;
  sel.onchange = () => { if (scene) kind === 'fondos' ? setScenery(sel.value) : setScenery(null, sel.value); };
}
$('deckrand').onclick = () => { picking = shuffle(ALL.slice()).slice(0, 8); syncDeck(); };
$('deckgo').onclick = () => { myDeck = picking.slice(); try { localStorage.setItem('bg-deck', JSON.stringify(myDeck)); } catch (e) {} $('deck').hidden = true; resetBattle(); };
$('decked').onclick = () => { if (scene) openDeck(); };
$('redeck').onclick = () => { if (scene) openDeck(); };
$('speed').onclick = e => { timeScale = timeScale === 1 ? 2 : 1; e.currentTarget.textContent = 'x' + timeScale; e.currentTarget.setAttribute('aria-pressed', timeScale === 2); };
$('restart').onclick = () => { if (scene) { $('deck').hidden = true; resetBattle(); } };
$('again').onclick = () => { if (scene) resetBattle(); };
window.__debugBattle = () => ({ t: B.t, blue: { e: B.blue.energy, hand: B.blue.hand, hp: castles.blue.hp, kills: B.blue.kills }, purple: { e: B.purple.energy, hp: castles.purple.hp, deck: B.purple.deck }, units: units.map(u => u.type + ':' + u.team + ':' + Math.round(u.hp) + ':' + Math.round(u.x)), over: B.over });
window.__startBattle = deck => { if (deck) myDeck = deck; $('deck').hidden = true; resetBattle(); };
window.__play = (team, i) => play(team, i);
(document.fonts ? document.fonts.ready : Promise.resolve()).then(start, start);
})();
