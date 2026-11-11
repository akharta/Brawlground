
/* ==== Tropas: cada unidad en su tarjeta, viva. Las tarjetas son HTML (marco, nombre, coste y barra de nivel); la unidad de
   en medio es la de verdad, en reposo y con su animación, dibujada por una segunda escena de Phaser sobre el lienzo del
   juego. Mientras la pestaña de Tropas está abierta, el lienzo pasa por encima de la pantalla (sin recibir toques), la escena
   de la batalla se oculta y esta escena coloca cada unidad en el hueco de su tarjeta y la recorta a la zona visible. ==== */
// marcos propios de cada unidad (img/marcos/<unidad>.png, 2:3, con el nombre dibujado y el hueco vacío). Por marco: el hueco
// donde va la unidad [izquierda, arriba, ancho, alto] y el muslo del coste [derecha, arriba, ancho], en % de la tarjeta: siempre
// dentro del hueco, en su esquina de arriba a la derecha y sin pisar el marco. Las que no
// tienen marco llevan el provisional, con rayos del color de su rareza
const MARCOS = {
  legionario: { st: [16, 44, 68, 40], cost: [17, 41.5, 27] },
  arquera: { st: [20, 22, 60, 54], cost: [20, 19, 27] },
  valkiria: { st: [19, 27, 62, 46], cost: [19.5, 24, 26] },
};
const BARRA_RAR = { comun: 'comun', poco: 'poco', rara: 'rara', epica: 'epica', legendaria: 'legendaria', ascendida: 'ascendida' };
const GAL = { on: false, sc: null, u: new Map() };
function nombreEpiteto(k) { const n = NAMES[k] || LABEL[k] || k, i = n.indexOf(', '); return i < 0 ? [n, ''] : [n.slice(0, i), n.slice(i + 2)]; }
function tarjetaHtml(k) {
  const has = owned().includes(k), rar = RARITY[k] || 'comun', [nm, ep] = nombreEpiteto(k), marco = MARCOS[k];
  const c = has ? rkCoste(k) : null, cp = has ? copiasOf(k) : 0, lv = has ? lvOf(k) : 1, r = has ? rangoOf(k) : 0;
  return '<button type="button" class="tc ' + rar + (has ? '' : ' lock') + (marco ? ' marco' : '') + (has && puedeRango(k) ? ' up' : '') + '" data-k="' + k + '" aria-label="' + (NAMES[k] || k) + (has ? ', nivel ' + lv + ', rango ' + RANGOS[r] : ', bloqueada') + '">'
    + '<span class="tc-fr"' + (marco ? ' style="background-image:url(img/marcos/' + k + '.png)"' : '') + '>'
    + (marco ? '' : '<span class="tc-nm"><b>' + (has ? nm : '¿?') + '</b>' + (has && ep ? '<small>' + ep + '</small>' : '') + '</span>')
    + '<span class="tc-cost"' + (marco ? ' style="right:' + marco.cost[0] + '%;top:' + marco.cost[1] + '%;width:' + marco.cost[2] + '%"' : '') + '><img src="img/tarjetas/coste.png" alt=""><b>' + COST[k] + '</b></span><span class="tc-stage"' + (marco ? ' style="left:' + marco.st[0] + '%;top:' + marco.st[1] + '%;width:' + marco.st[2] + '%;height:' + marco.st[3] + '%"' : '') + '></span></span>'
    + '<span class="tc-bar" style="background-image:url(img/tarjetas/barra_' + (BARRA_RAR[rar] || 'comun') + '.png)"><b class="tc-lv">' + (has ? lv : '?') + '</b>'
    + '<span class="tc-track"><i style="width:' + (has ? (c ? Math.min(100, cp / c.copias * 100) : 100) : 0) + '%"></i><b>' + (has ? (c ? cp + '/' + c.copias : 'Máx.') : '') + '</b></span>'
    + (has ? sello(r, 'tc-rk') : '') + '</span></button>';
}
const _openArmyGal = openArmy;
openArmy = function (seg) {
  _openArmyGal(seg);
  if (armySeg !== 'unidades') { galStop(); return; }
  const own = owned();
  $('ej-grid').classList.add('tcgrid');
  $('ej-grid').innerHTML = ALL.slice().sort((a, b) => (own.includes(b) - own.includes(a)) || COST[a] - COST[b]).map(tarjetaHtml).join('');
  document.querySelectorAll('#ej-grid .tc').forEach(b => { b.onclick = () => openUnit(b.dataset.k); });
  galStart();
};
const _showGal = show;
show = function (id) { _showGal(id); if (id !== 'ejercito') galStop(); else if (GAL.on) galWake(); };
function galWake() { const gm = window.__game; if (gm && gm.loop && !gm.loop.running) gm.loop.wake(); }
function galStart() {
  const gm = window.__game; if (!gm || !scene) return;
  if (!GAL.sc) GAL.sc = gm.scene.add('galeria', { update(_, ms) { galTick(Math.min(0.05, ms / 1000)); } }, true);
  GAL.u.forEach(u => u.root.destroy()); GAL.u.clear();
  GAL.on = true; document.body.classList.add('galeria'); scene.scene.setVisible(false); GAL.sc.scene.setVisible(true); galWake();
}
function galStop() {
  if (!GAL.on) return;
  GAL.on = false; document.body.classList.remove('galeria');
  GAL.u.forEach(u => { u.root.destroy(); if (u.bar) u.bar.destroy(); }); GAL.u.clear();
  if (scene) scene.scene.setVisible(true); if (GAL.sc) GAL.sc.scene.setVisible(false);
}
function galUnit(k) {
  // la unidad de la tarjeta: la misma que en batalla, en reposo; sin barra de vida y sin sacar ratas, abejas ni nada al campo
  const u = new Unit(GAL.sc, k, 'blue', 0);
  u.root.list.forEach(c => { if (c.type === 'ParticleEmitter') c.setVisible(false); });   // las partículas del aura van en coordenadas del campo: aquí no
  u.packDone = true; u.ultUsed = true; u.bar.setVisible(false); u.set('idle'); u.dir = 1; u.gal = true;
  if (!owned().includes(k)) { u.parts.forEach(pt => pt.setTintFill && pt.setTintFill(0x141826)); u.auraBack.setVisible(false); u.auraFront.setVisible(false); }
  u.update(0); u.root.setPosition(0, 0).setScale(1);
  const b = u.rig.getBounds(); u.galW = Math.max(1, b.width); u.galH = Math.max(1, b.height); u.galOy = b.bottom - u.root.y; u.galOx = b.centerX - u.root.x;   // su tamaño natural, para encajarla
  return u;
}
function galTick(dt) {
  if (!GAL.on) return;
  const cam = GAL.sc.cameras.main, scr = $('ejercito').getBoundingClientRect(), nav = $('nav').hidden ? null : $('nav').getBoundingClientRect();
  const top = Math.max(0, scr.top), bot = Math.min(scr.bottom, nav ? nav.top : innerHeight), lft = Math.max(0, scr.left), rgt = Math.min(scr.right, innerWidth);
  if (bot <= top || rgt <= lft || $('ejercito').hidden) return;
  cam.setViewport(lft * DPR, top * DPR, (rgt - lft) * DPR, (bot - top) * DPR).setScroll(lft * DPR, top * DPR);   // solo por encima de la barra de abajo
  const pop = !$('pop').hidden;
  document.querySelectorAll('#ej-grid .tc').forEach(el => {
    const k = el.dataset.k, st = el.querySelector('.tc-stage').getBoundingClientRect(), vis = !pop && st.bottom > top && st.top < bot;
    let u = GAL.u.get(k);
    if (!vis) { if (u) u.root.setVisible(false); return; }
    if (!u) { u = galUnit(k); GAL.u.set(k, u); }
    u.x = 0; u.dir = 1; if (u.state !== 'idle') u.set('idle');
    u.update(dt);
    const s = Math.min(st.width * 0.95 / u.galW, st.height * 0.95 / Math.min(u.galH, H * (u.cfg.h || 1) * (u.bigK || 1) * 1.15)) * DPR;   // por su altura de unidad (los efectos sueltos no la encogen)
    u.root.setVisible(true).setScale(s).setPosition((st.left + st.width / 2) * DPR - u.galOx * s, st.bottom * DPR - u.galOy * s);
  });
}
window.__gal = () => GAL;

/* ---- la tarjeta nueva en pequeño (mano de batalla, mazo, fichas, premios, tienda…): el marco de la unidad (o el
   provisional), su retrato y el muslo del coste. El retrato es una foto de la unidad de verdad en reposo, sacada una vez
   al arrancar con la escena de la batalla ---- */
const RETRATO = {}, PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const MARCO_PROV = { st: [12, 34, 76, 54], cost: [4, 22, 27] };
function tmInner(k, has = true) {
  const m = MARCOS[k] || MARCO_PROV, [nm, ep] = nombreEpiteto(k), pc = v => v + '%';
  return '<span class="tm-fr"' + (MARCOS[k] ? ' style="background-image:url(img/marcos/' + k + '.png)"' : '') + '></span>'
    + (MARCOS[k] ? '' : '<span class="tm-nm"><b>' + (has ? nm : '¿?') + '</b>' + (has && ep ? '<small>' + ep + '</small>' : '') + '</span>')
    + '<img class="tm-u" data-ret="' + k + '" src="' + (RETRATO[k] || PIXEL) + '" alt="" style="left:' + pc(m.st[0]) + ';top:' + pc(m.st[1]) + ';width:' + pc(m.st[2]) + ';height:' + pc(m.st[3]) + '">'
    + '<span class="tm-cost" style="right:' + pc(m.cost[0]) + ';top:' + pc(m.cost[1]) + ';width:' + pc(m.cost[2]) + '"><b>' + COST[k] + '</b></span>';
}
cardHtml = function (k, cls = '') { return '<span class="dk mini tm ' + (RARITY[k] || 'comun') + ' ' + cls + '">' + tmInner(k, !String(cls).includes('shadow')) + '</span>'; };
function retratos() {
  // una foto de cada unidad en reposo (mirando a la derecha), por turnos para no trabar el arranque
  const cola = ALL.filter(k => !RETRATO[k] && CH[k]);
  const una = () => {
    const k = cola.shift(); if (!k) return;
    try {
      const u = new Unit(scene, k, 'blue', 0);
      u.root.list.forEach(c => { if (c.type === 'ParticleEmitter') c.setVisible(false); });
      u.packDone = true; u.ultUsed = true; u.bar.setVisible(false); u.set('idle'); u.dir = 1; u.update(0);
      u.root.setPosition(0, 0).setScale(1);
      const b = u.rig.getBounds(), s = Math.min(1, 320 / Math.max(1, b.height)), pad = 6, sh = H * 0.1 * s;
      const w = Math.ceil(b.width * s) + pad * 2, h = Math.ceil(b.height * s + sh) + pad * 2, key = 'ret_' + k;
      u.root.setScale(s);
      const dt = scene.textures.addDynamicTexture(key, w, h); dt.draw(u.root, -b.x * s + pad, -b.y * s + pad);
      u.root.destroy(); u.bar.destroy();
      dt.snapshot(img => {
        RETRATO[k] = img.src; scene.textures.remove(key);
        document.querySelectorAll('img[data-ret="' + k + '"]').forEach(i => { i.src = img.src; });
        if (B && B.blue && $('nextwrap') && !$('nextwrap').hidden && B.blue.queue[0] === k) $('next').src = img.src;
        setTimeout(una, 16);
      });
    } catch (e) { setTimeout(una, 16); }
  };
  una();
}
(function esperaRetratos() {
  if (window.__game && scene && scene.sys && scene.sys.isActive() && scene.textures.exists('leg_cuerpo')) retratos(); else setTimeout(esperaRetratos, 400);
})();
window.__retratos = () => Object.keys(RETRATO).length;
