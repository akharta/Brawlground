/* ==== Capa de batalla: castillos, torres, energía, mazo, IA y estadísticas.
   Se monta sobre el código de unidades del campo de pruebas (construir.py). ==== */
const COST = __COST__;
const LABEL = Object.fromEntries(Object.entries(NAMES).map(([k, v]) => [k, v.split(',')[0]]));
LABEL.aldric = 'Rey Aldric'; LABEL.lyra = 'Lyra'; LABEL.guardia = 'Guardián'; LABEL.esqueleto = 'Esqueleto';
const ALL = Object.keys(NAMES);
const EMAX = 10, EREGEN = 1 / 3.5, DOUBLE_AT = 120, CASTLE_HP = 1500, HERO_GOAL = CH.aldric.goal, TOWER = { range: H * 3.2, cd: 1.3, dmg: 8 };
let B = null, castles = {}, castleG, flashG, hpText = {}, throneImg = null, throneImgP = null;
const THRONE = { x: 140, y: 200, w: 140 };
// héroes que se pueden llevar a la batalla
const HEROES = {
  aldric: { name: 'Rey Aldric', skill: 'seismic', skillName: 'Golpe sísmico', throne: 'trono_aldric', empty: 'trono_vacio', portrait: 'aldric_retrato' },
  lyra: { name: 'Lyra', skill: 'storm', skillName: 'Tormenta de plumas', throne: 'trono_lyra', empty: 'trono_lyra_vacio', portrait: 'lyra_retrato' },
};
let myHero = (() => { try { const h = localStorage.getItem('bg-hero'); return HEROES[h] ? h : 'aldric'; } catch (e) { return 'aldric'; } })();   // trono sobre el torreón de tu castillo
// castillos dibujados: centro en CASTLE_VX, el suelo del torreón (plat) queda a la altura del trono; arch = arquero de la torre delantera
const CASTLE_VX = 140, CASTLE_W = 360, CASTLE_FRONT = CASTLE_VX + CASTLE_W * 0.47;   // frente de la muralla
// el terreno de juego va de FIELD_L a FIELD_R: nadie pisa ningún castillo (al aparecer, al ser empujado o al lanzarse)
const FIELD_L = CASTLE_FRONT + H * 0.5, FIELD_R = W - FIELD_L;
const CASTLE_ART = { blue: { key: 'castillo_azul', plat: [260, 105], arch: [490, 150] }, purple: { key: 'castillo_morado', plat: [260, 95], arch: [30, 162] } };
let castleImg = {};
const ZOOM = VW / W, CAM_Y = 15;   // cámara fija y alejada: se ve el campo entero (1440 px) de un castillo al otro
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
  return { isCastle: true, type: 'castle', team, x: team === 'blue' ? CASTLE_FRONT - H * 0.2 : W - CASTLE_FRONT + H * 0.2, lane: 0,   // como objetivo, un poco detrás del frente: todos los de cuerpo a cuerpo llegan a golpearlo desde FIELD_L
     get gy() { return GROUND; }, alive: true, state: 'idle',
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
  units.push(new Unit(scene, type, team, team === 'blue' ? FIELD_L : FIELD_R));   // aparecen justo delante de su muralla
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
    const ci = castleImg[team], A = CASTLE_ART[team], k = ci.scaleX, sx = ci.x + (A.arch[0] - A.plat[0]) * k, sy = ci.y + (A.arch[1] - A.plat[1]) * k;
    const tx = tg.x, ty = tg.gy - H * 0.45, T = Math.max(0.35, Math.abs(tx - sx) / 700), g = 900;
    const img = scene.add.image(sx, sy, team === 'blue' ? 'flecha_azul' : 'flecha_morada').setOrigin(0.85, 0.5).setScale(0.55 * H / 512).setDepth(950);
    arrows.push({ img, x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy - 0.5 * g * T * T) / T, g, t: 0, T, target: tg, dmg: TOWER.dmg, stuck: 0 });
    s.towerT = TOWER.cd;
  }
}
function drawCastleUI(dt) {
  castleG.clear(); flashG.clear();
  for (const team of ['blue', 'purple']) {
    const c = castles[team], bw = 120, by = THRONE.y - 158, x0 = (team === 'blue' ? CASTLE_VX : W - CASTLE_VX) - bw / 2;
    const ci = castleImg[team], st = !c.alive ? '_destruido' : c.hp / c.max <= 0.5 ? '_danado' : '';
    if (ci.state !== st) {   // cambia de aspecto: polvo y cascotes
      if (ci.state !== undefined && B && B.t > 0.1) burst(ci.x, GROUND - 40, 0xbfc4d4, st === '_destruido' ? 30 : 14, st === '_destruido' ? 320 : 200);
      ci.state = st; ci.setTexture(CASTLE_ART[team].key + st);
      const th = team === 'blue' ? throneImg : throneImgP;   // sin castillo no hay trono: cae entre los cascotes
      if (th) { scene.tweens.killTweensOf(th); if (st === '_destruido') scene.tweens.add({ targets: th, y: THRONE.y + 110, alpha: 0, angle: team === 'blue' ? 25 : -25, duration: 700, ease: 'Quad.in' }); else th.setPosition(team === 'blue' ? THRONE.x : W - THRONE.x, THRONE.y).setAlpha(1).setAngle(0); }
    }
    if (c.flash > 0) { c.flash -= dt; ci.setTint(0xffd0d0); } else if (ci.isTinted) ci.clearTint();
    castleG.fillStyle(OUT, 1).fillRoundedRect(x0 - 3, by - 3, bw + 6, 18, 7);
    castleG.fillStyle(0x3a3f55, 1).fillRoundedRect(x0, by, bw, 12, 5);
    castleG.fillStyle(team === 'blue' ? BLUE : PURPLE, 1).fillRoundedRect(x0, by, Math.max(4, bw * c.hp / c.max), 12, 5);
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
  B = { blue: newSide(myDeck), purple: newSide(aiDeck()), over: false, aiT: 2.5, t: 0, stats: { blue: {}, purple: {} }, hero: { type: myHero, state: 'throne', unit: null, skillT: 0 }, heroP: { type: Math.random() < 0.5 ? 'aldric' : 'lyra', state: 'throne', unit: null, skillT: 0 } };
  if (throneImg) { setThrone(throneImg, HEROES[B.hero.type].throne); setThrone(throneImgP, HEROES[B.heroP.type].throne); }
  castles = { blue: makeCastle('blue'), purple: makeCastle('purple') };
  $('over').hidden = true; renderHand();
}
const enemyCastle = u => { const c = castles[u.team === 'blue' ? 'purple' : 'blue']; return c && c.alive ? [c] : []; };

/* ---- héroe ---- */
function setThrone(img, key) { img.setTexture(key); img.setScale(THRONE.w / img.width); }
function heroAct(team) {
  // el héroe de un bando: si está en el trono y tiene las bajas, salta; si está en el campo y la habilidad está lista, la lanza
  const hr = team === 'blue' ? B.hero : B.heroP; if (!hr || B.over) return false;
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
function heroAI() {
  // la IA: salta en cuanto puede y usa el Golpe sísmico cuando tiene al menos dos enemigos a su alcance
  const hr = B.heroP;
  if (hr.state === 'throne') heroAct('purple');
  else if (hr.state === 'field' && hr.skillT <= 0) {
    const u = hr.unit, foes = enemiesOf(u).filter(v => !v.isCastle);
    if (hr.type === 'lyra') {   // Lyra: con dos enemigos por delante, o cerca del castillo rival
      const ahead = foes.filter(v => (v.x - u.x) * u.dir > 0).length, nearCastle = enemiesOf(u).some(v => v.isCastle && Math.abs(v.x - u.x) < H * 6);
      if (ahead >= 2 || nearCastle) heroAct('purple');
    } else if (foes.filter(v => Math.abs(v.x - (u.x + u.dir * H * 0.9)) <= CH.aldric.seismic.r).length >= 2) heroAct('purple');
  }
}
function heroUI() {
  const hr = B.hero, btn = $('hero'), k = B.blue.kills;
  let title, sub, on = false, ready = false;
  const HD = HEROES[hr.type];
  if (hr.state === 'throne') { ready = on = k >= HERO_GOAL; title = ready ? '¡' + HD.name + '!' : HD.name; sub = ready ? 'Toca para saltar' : Math.min(k, HERO_GOAL) + '/' + HERO_GOAL + ' bajas'; }
  else if (hr.state === 'field') { ready = on = hr.skillT <= 0; title = HD.skillName; sub = ready ? '¡Listo!' : Math.ceil(hr.skillT) + ' s'; }
  else { title = HD.name; sub = 'Ha caído'; }
  btn.disabled = !on; btn.classList.toggle('ready', ready);
  if (btn.dataset.t !== title + sub) { btn.dataset.t = title + sub; btn.innerHTML = '<img src="img/' + HD.portrait + '.png" alt="">' + title + '<span>' + sub + '</span>'; }
}
$('hero').onclick = () => heroClick();
window.__heroClick = () => heroClick();
window.__hero = () => B.hero && { state: B.hero.state, skillT: B.hero.skillT, kills: B.blue.kills, hp: B.hero.unit && Math.round(B.hero.unit.hp) };
window.__setKills = (n, team = 'blue') => { B[team].kills = n; };
window.__heroP = () => B.heroP && { state: B.heroP.state, skillT: B.heroP.skillT, kills: B.purple.kills };

/* ---- escenario del campo largo: fondo + camino + decoración (arte en img/esc, datos en esc.json) ---- */
const ESC = __ESC__;   // escenas completas: fondo, camino y objetos en una sola imagen; t/b = franja de tierra (fracción del alto)
let escena = (() => { try { const v = localStorage.getItem('bg-escena'); return ESC[v] ? v : 'escena_07'; } catch (e) { return 'escena_07'; } })(), escObjs = [];
function escPreload(L) {
  L.image(escena, 'img/esc/' + escena + '.jpg');
  for (const c of ['azul', 'morado']) for (const st of ['', '_danado', '_destruido']) L.image('castillo_' + c + st, 'img/esc/castillo_' + c + st + '.png');
  L.image('flecha_azul', 'img/esc/flecha_azul.png'); L.image('flecha_morada', 'img/esc/flecha_morada.png');
}
function drawScenery(sc) {
  escObjs.forEach(o => o.destroy()); escObjs = [];
  const f = ESC[escena], top = CAM_Y - HGT / ZOOM / 2 - 12, bot = CAM_Y + HGT / ZOOM / 2 + 12;
  // la escena ocupa el ancho del campo y su camino queda bajo los pies de las unidades
  const tw = sc.textures.get(escena).getSourceImage().width, s = (W + 8) / tw, ih = f.h * tw / f.w * s, y0 = GROUND + 2 - (f.t + f.b) / 2 * ih;
  const col = h => Phaser.Display.Color.HexStringToColor(h).color;
  escObjs.push(sc.add.rectangle(W / 2, (top + y0) / 2, W + 40, y0 - top + 4, col(f.top)).setDepth(-31));          // cielo por encima
  escObjs.push(sc.add.rectangle(W / 2, (y0 + ih + bot) / 2, W + 40, bot - y0 - ih + 4, col(f.bot)).setDepth(-31)); // prado por debajo
  escObjs.push(sc.add.image(W / 2, y0, escena).setOrigin(0.5, 0).setScale(s).setDepth(-30));
}
function setScenery(e) {
  escena = e || escena;
  try { localStorage.setItem('bg-escena', escena); } catch (er) {}
  if (scene.textures.exists(escena)) return drawScenery(scene);
  scene.load.image(escena, 'img/esc/' + escena + '.jpg'); scene.load.once('complete', () => drawScenery(scene)); scene.load.start();
}
window.__setScenery = setScenery;
/* ---- Phaser ---- */
function create() {
  scene = this; mode = 'fight';
  drawScenery(this);
  cam = this.cameras.main; cam.setZoom(ZOOM); cam.centerOn(W / 2, CAM_Y);
  makeAuraTextures(this); makeChainEdge(this); hookUltInput(this);
  flashG = this.add.graphics().setDepth(5);
  for (const team of ['blue', 'purple']) {
    const A = CASTLE_ART[team], im = this.add.image(team === 'blue' ? CASTLE_VX : W - CASTLE_VX, THRONE.y - 4, A.key);
    im.setOrigin(A.plat[0] / im.width, A.plat[1] / im.height).setScale(CASTLE_W / im.width).setDepth(300); castleImg[team] = im;
  }
  throneImg = this.add.image(THRONE.x, THRONE.y, 'trono_aldric').setOrigin(0.5, 0.92).setDepth(302); throneImg.setScale(THRONE.w / throneImg.width);
  throneImgP = this.add.image(W - THRONE.x, THRONE.y, 'trono_aldric').setOrigin(0.5, 0.92).setDepth(302).setFlipX(true); throneImgP.setScale(THRONE.w / throneImgP.width);
  castleG = this.add.graphics().setDepth(990);
  for (const team of ['blue', 'purple']) hpText[team] = this.add.text(team === 'blue' ? CASTLE_VX : W - CASTLE_VX, THRONE.y - 152, '', { fontFamily: 'Lilita One, Trebuchet MS, sans-serif', fontSize: '13px', color: '#ffffff', stroke: '#1e2235', strokeThickness: 4 }).setOrigin(0.5).setDepth(995);
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
  // nadie se sube al castillo rival: se queda delante de su muralla (embestidas, saltos y empujones incluidos)
  for (const u of units) {
    if (!u.alive || u.state === 'heroJump') continue;
    if (u.x < FIELD_L) u.x = FIELD_L; else if (u.x > FIELD_R) u.x = FIELD_R;
  }
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
$('selhero').innerHTML = Object.entries(HEROES).map(([k, h]) => '<option value="' + k + '">' + h.name + '</option>').join('');
$('selhero').value = myHero;
$('selhero').onchange = e => { myHero = e.target.value; try { localStorage.setItem('bg-hero', myHero); } catch (er) {} if (B && scene) { B.hero.type = myHero; if (B.hero.state === 'throne') setThrone(throneImg, HEROES[myHero].throne); } };
$('selfondo').innerHTML = Object.keys(ESC).map((k, i) => '<option value="' + k + '">' + (i + 1) + '</option>').join('');
$('selfondo').value = escena;
$('selfondo').onchange = e => { if (scene) setScenery(e.target.value); };
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
window.__addUnitB = (type, team, x) => { units.push(new Unit(scene, type, team, x)); };
window.__castleHp = (team, hp) => { castles[team].hp = hp; if (hp <= 0) castles[team].damage(1); };
(document.fonts ? document.fonts.ready : Promise.resolve()).then(start, start);
})();

/* ---- pantalla completa (con o sin la API del navegador: en iPhone se ajusta igualmente) ---- */
function fitGame() {
  const g = document.getElementById('game'); if (!g) return;
  g.style.width = '';
  if (document.body.classList.contains('fs')) {
    // alto libre: lo que queda de pantalla menos lo que hay debajo del campo en su misma columna
    const r = g.getBoundingClientRect(), below = [...document.querySelectorAll('.wrap > *')].filter(el => el.classList.contains('dock') && el.offsetParent && el.getBoundingClientRect().top >= r.bottom - 2 && el.getBoundingClientRect().left < r.right - 10)
      .reduce((s, el) => s + el.getBoundingClientRect().height + 6, 0);
    const avail = window.innerHeight - (r.top + window.scrollY) - below - 6;
    g.style.width = Math.max(240, Math.min(g.parentElement.clientWidth, avail * 16 / 9)) + 'px';
  }
  if (window.__game && window.__game.scale) window.__game.scale.refresh();
}
function setFs(on) {
  document.body.classList.toggle('fs', on);
  const b = document.getElementById('fsbtn'); if (b) { b.setAttribute('aria-pressed', on); b.textContent = on ? 'Salir de pantalla completa' : 'Pantalla completa'; }
  requestAnimationFrame(fitGame); setTimeout(fitGame, 300);
}
document.getElementById('fsbtn').onclick = () => {
  const on = !document.body.classList.contains('fs'), el = document.documentElement;
  try {
    if (on && el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (on && el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (!on && document.fullscreenElement) document.exitFullscreen();
    else if (!on && document.webkitFullscreenElement) document.webkitExitFullscreen();
  } catch (e) {}
  setFs(on);
};
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && document.body.classList.contains('fs')) setFs(false); });
window.addEventListener('resize', () => { if (document.body.classList.contains('fs')) fitGame(); });
