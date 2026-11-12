
/* ==== Tropas: cada unidad en su tarjeta, viva. Las tarjetas son HTML (marco, nombre, coste y barra de nivel); la unidad de
   en medio es la de verdad, en reposo y con su animación, dibujada por una segunda escena de Phaser sobre el lienzo del
   juego. Mientras la pestaña de Tropas está abierta, el lienzo pasa por encima de la pantalla (sin recibir toques), la escena
   de la batalla se oculta y esta escena coloca cada unidad en el hueco de su tarjeta y la recorta a la zona visible. ==== */
// marcos propios de cada unidad (img/marcos/<unidad>.png, 2:3, con el nombre dibujado y el hueco vacío). Por marco: el hueco
// donde va la unidad [izquierda, arriba, ancho, alto] en % de la tarjeta, y opcionalmente z (cuánto se agranda la figura) y dx, dy
// (cuánto se mueve, en % del hueco). El muslo del coste va siempre en la esquina de arriba a la izquierda de la carta, simétrico a la
// flecha de ascenso. Las que no tienen marco llevan el provisional, con rayos del color de su rareza
const MARCOS = {
  legionario: { st: [16, 44, 68, 40], z: 1.15 },
  arquera: { st: [20, 22, 60, 54], z: 1.12 },
  valkiria: { st: [19, 27, 62, 46], z: 1.15 },
  ninja: { st: [16, 33, 68, 46], z: 1.12 },
  odo: { st: [16.4, 20.1, 66.9, 54.8] },
  kubi: { st: [15.8, 35.5, 67.9, 50.1] },
  imparable: { st: [15.9, 17.7, 66.7, 61.5], dy: -7 },
  desencadenado: { st: [18.3, 36.0, 63.1, 51.2], z: 2.1, dx: -25, dy: 7, clip: true },
  tercio: { st: [13.2, 28.7, 73.2, 49.2], z: 1.15 },
  fraile: { st: [17.3, 16.2, 65.2, 59.7], z: 1.01 },
  catapulta: { st: [16.0, 32.3, 68.0, 49.4] },
  acorazado: { st: [20.9, 37.1, 58.1, 45.0], z: 1.36 },
  kungfu: { st: [14.2, 28.2, 71.5, 55.6] },
  samurai: { st: [22.3, 24.2, 55.3, 52.5], z: 1.12 },
  muerte: { st: [16.4, 15.9, 67.4, 56.1], dx: 8 },
  lobo: { st: [17.2, 19.0, 65.5, 54.8] },
  pistolero: { st: [17.3, 33.5, 65.3, 55.0], z: 1.12 },
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
    + '<span class="tc-stage"' + (marco ? ' style="left:' + marco.st[0] + '%;top:' + marco.st[1] + '%;width:' + marco.st[2] + '%;height:' + marco.st[3] + '%"' : '') + '></span></span>'
    + '<span class="tc-cost"><img src="img/tarjetas/coste.png" alt=""><b>' + COST[k] + '</b></span>'
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
  filtrosHtml();
  const lista = tropasFiltradas();
  $('ej-grid').innerHTML = lista.length ? lista.map(tarjetaHtml).join('') : '<p class="note">Ninguna unidad cumple los filtros.</p>';
  document.querySelectorAll('#ej-grid .tc').forEach(b => { b.onclick = () => openUnit(b.dataset.k); });
  galStart();
};
/* ---- filtros y orden de Tropas (se recuerdan en este móvil) ---- */
const RAR_ORD = ['comun', 'poco', 'rara', 'epica', 'legendaria', 'ascendida'];
let FILTRO = { rar: '', rk: '', tipo: '', est: '', cost: '', ord: 'coste', inv: false };
try { Object.assign(FILTRO, JSON.parse(localStorage.getItem('bg-filtro') || '{}')); } catch (e) {}
function statsDe(k) {   // lo que vale ahora la unidad (con su nivel y rango si la tienes)
  const c = CH[k] || {}, has = owned().includes(k), K = has ? poderK(lvOf(k), rangoF(k)) : 1, d = c.dmg || c.snipe || c.heal;
  return { hp: (c.hp || 0) * K, dmg: d ? (d[0] + d[1]) / 2 * K : 0, dps: d ? (d[0] + d[1]) / 2 * K / ((c.cd[0] + c.cd[1]) / 2) : 0, range: c.range || 0, speed: c.speed || 0 };
}
const tipoDe = k => { const c = CH[k] || {}; return c.heal || c.support || !(c.dmg || c.snipe) ? 'apoyo' : c.ranged ? 'distancia' : 'cuerpo'; };
const ORDENES = { coste: ['Coste', k => COST[k]], rareza: ['Rareza', k => RAR_ORD.indexOf(RARITY[k] || 'comun')], nivel: ['Nivel', k => owned().includes(k) ? lvOf(k) : 0],
  rango: ['Rango', k => owned().includes(k) ? rangoF(k) : -1], vida: ['Vida', k => statsDe(k).hp], dano: ['Daño por golpe', k => statsDe(k).dmg], dps: ['Daño por segundo', k => statsDe(k).dps],
  alcance: ['Alcance', k => statsDe(k).range], velocidad: ['Velocidad', k => statsDe(k).speed], copias: ['Copias', k => copiasOf(k)], nombre: ['Nombre', k => LABEL[k] || k] };
function tropasFiltradas() {
  const own = owned(), F = FILTRO;
  const l = ALL.filter(k => (!F.rar || (RARITY[k] || 'comun') === F.rar) && (F.rk === '' || (own.includes(k) && rangoOf(k) === +F.rk))
    && (!F.tipo || tipoDe(k) === F.tipo) && (!F.cost || (F.cost === '6' ? COST[k] >= 6 : COST[k] === +F.cost))
    && (!F.est || (F.est === 'tengo' ? own.includes(k) : F.est === 'faltan' ? !own.includes(k) : own.includes(k) && puedeRango(k))));
  const f = (ORDENES[F.ord] || ORDENES.coste)[1], dir = F.inv ? -1 : 1;
  return l.sort((a, b) => { const x = f(a), y = f(b); return (typeof x === 'string' ? x.localeCompare(y) : x - y) * dir || COST[a] - COST[b] || (LABEL[a] || a).localeCompare(LABEL[b] || b); });
}
function filtrosHtml() {
  let el = $('ej-filtros');
  if (!el) { el = document.createElement('div'); el.id = 'ej-filtros'; el.className = 'filtros'; $('ej-grid').before(el); }
  const sel = (id, lab, ops) => '<label><span>' + lab + '</span><select data-f="' + id + '">' + ops.map(([v, t]) => '<option value="' + v + '"' + (String(FILTRO[id]) === v ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></label>';
  el.innerHTML = sel('ord', 'Ordenar', Object.entries(ORDENES).map(([v, [t]]) => [v, t]))
    + '<button type="button" class="btn small" id="f-inv" aria-label="Invertir el orden">' + (FILTRO.inv ? '↓ Mayor' : '↑ Menor') + '</button>'
    + sel('rar', 'Rareza', [['', 'Todas']].concat(RAR_ORD.map(r => [r, RAREZA[r]])))
    + sel('rk', 'Rango', [['', 'Todos']].concat(RANGOS.map((r, i) => [String(i), r])))
    + sel('tipo', 'Tipo', [['', 'Todos'], ['cuerpo', 'Cuerpo a cuerpo'], ['distancia', 'A distancia'], ['apoyo', 'Apoyo']])
    + sel('cost', 'Coste', [['', 'Todos'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6 o más']])
    + sel('est', 'Mostrar', [['', 'Todas'], ['tengo', 'Desbloqueadas'], ['faltan', 'Bloqueadas'], ['subir', 'Pueden ascender']])
    + '<button type="button" class="btn small" id="f-reset">Quitar filtros</button>';
  const guarda = () => { try { localStorage.setItem('bg-filtro', JSON.stringify(FILTRO)); } catch (e) {} openArmy('unidades'); };
  el.querySelectorAll('select').forEach(s => { s.onchange = () => { FILTRO[s.dataset.f] = s.value; guarda(); }; });
  $('f-inv').onclick = () => { FILTRO.inv = !FILTRO.inv; guarda(); };
  $('f-reset').onclick = () => { FILTRO = { rar: '', rk: '', tipo: '', est: '', cost: '', ord: 'coste', inv: false }; guarda(); };
}
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
  GAL.u.forEach(u => { u.root.destroy(); if (u.bar) u.bar.destroy(); if (u.clipG) u.clipG.destroy(); }); GAL.u.clear();
  if (scene) scene.scene.setVisible(true); if (GAL.sc) GAL.sc.scene.setVisible(false);
}
function galUnit(k) {
  // la unidad de la tarjeta: la misma que en batalla, en reposo; sin barra de vida y sin sacar ratas, abejas ni nada al campo
  const u = new Unit(GAL.sc, k, 'blue', 0);
  u.root.list.forEach(c => { if (c.type === 'ParticleEmitter') c.setVisible(false); });   // las partículas del aura van en coordenadas del campo: aquí no
  u.packDone = true; u.ultUsed = true; u.bar.setVisible(false); u.set('idle'); u.dir = 1; u.gal = true;
  if (k === 'rhysida') u.rhySkins = () => { const r = rangoOf(k); return RHY.skins.slice(0, perfil.all ? 10 : r >= 6 ? 10 : r >= 4 ? 7 : r >= 2 ? 4 : 1); };   // va turnando las skins que tengas
  if (!owned().includes(k)) { u.parts.forEach(pt => pt.setTintFill && pt.setTintFill(0x141826)); u.auraBack.setVisible(false); u.auraFront.setVisible(false); }
  u.update(0); u.root.setPosition(0, 0).setScale(1);
  const b = u.rig.getBounds(); u.galW = Math.max(1, b.width); u.galH = Math.max(1, b.height); const bh = u.body && u.body.displayHeight * Math.abs(u.rig.scaleY || 1); if (bh > 1 && isFinite(bh)) u.galH = Math.min(u.galH, bh * 1.3); u.galOy = b.bottom - u.root.y; u.galOx = b.centerX - u.root.x;   // su tamaño natural, para encajarla (el cuerpo manda: cadenas y armas largas no encogen la unidad)
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
    const hh = H * (u.cfg.h || 1) * (u.bigK || 1), ox = Math.max(-0.3 * hh, Math.min(0.3 * hh, u.galOx)), oy = Math.max(0, Math.min(0.15 * hh, u.galOy));   // cadenas, látigos y efectos sueltos no cuentan
    const M = MARCOS[k] || {}, s = Math.min(st.width * 0.95 / Math.min(u.galW, hh * 1.7), st.height * 0.95 / u.galH) * DPR * (M.z || 1);
    u.root.setVisible(true).setScale(s).setPosition((st.left + st.width * (0.5 + (M.dx || 0) / 100)) * DPR - ox * s, (st.bottom + st.height * (M.dy || 0) / 100) * DPR - oy * s);
    if (M.clip) {   // lo que sobresale (cadenas) se corta en los bordes del hueco y por abajo
      if (!u.clipG) { u.clipG = GAL.sc.make.graphics({}, false); u.root.setMask(u.clipG.createGeometryMask()); }
      u.clipG.clear().fillStyle(0xffffff).fillRect((st.left - 2) * DPR, (st.top - st.height) * DPR, (st.width + 4) * DPR, (st.height * 2 + 2) * DPR);
    }
  });
}
window.__gal = () => GAL;

/* ---- la tarjeta nueva en pequeño (mano de batalla, mazo, fichas, premios, tienda…): el marco de la unidad (o el
   provisional), su retrato y el muslo del coste. El retrato es una foto de la unidad de verdad en reposo, sacada una vez
   al arrancar con la escena de la batalla ---- */
const RETRATO = {}, PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const MARCO_PROV = { st: [12, 34, 76, 54] };
function tmInner(k, has = true) {
  const m = MARCOS[k] || MARCO_PROV, [nm, ep] = nombreEpiteto(k), pc = v => (+v.toFixed(2)) + '%', z = m.z || 1, [l, t, w, h] = m.st;
  const L = l - w * (z - 1) / 2 + w * (m.dx || 0) / 100, T = t - h * (z - 1) + h * (m.dy || 0) / 100;   // agrandada desde los pies
  return '<span class="tm-fr"' + (MARCOS[k] ? ' style="background-image:url(img/marcos/' + k + '.png)"' : '') + '></span>'
    + (MARCOS[k] ? '' : '<span class="tm-nm"><b>' + (has ? nm : '¿?') + '</b>' + (has && ep ? '<small>' + ep + '</small>' : '') + '</span>')
    + '<img class="tm-u" data-ret="' + k + '" src="' + (RETRATO[k] || PIXEL) + '" alt="" style="left:' + pc(L) + ';top:' + pc(T) + ';width:' + pc(w * z) + ';height:' + pc(h * z) + (z > 1.3 || m.clip ? ';clip-path:inset(0 ' + pc(Math.max(0, (L + w * z - l - w - 4) / (w * z) * 100)) + ' ' + pc(m.clip ? Math.max(0, (T + h * z - t - h) / (h * z) * 100) : 0) + ' ' + pc(Math.max(0, (l - 4 - L) / (w * z) * 100)) + ')' : '') + '">'
    + '<span class="tm-cost"><b>' + COST[k] + '</b></span>';
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
      const b0 = u.rig.getBounds(), hh = H * (u.cfg.h || 1) * (u.bigK || 1), bx0 = Math.max(b0.x, -0.9 * hh), bx1 = Math.min(b0.right, 0.9 * hh), by0 = Math.max(b0.y, -1.6 * hh), by1 = Math.min(b0.bottom, 0.15 * hh),
        b = { x: bx0, y: by0, width: Math.max(1, bx1 - bx0), height: Math.max(1, by1 - by0) }, s = Math.min(1, 320 / Math.max(1, b.height)), pad = 6, sh = H * 0.1 * s;
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
