
/* ==== Reino: tu castillo y sus lugares. Taberna, Murallas (estandarte, aspecto y defensas), Sanctum Arcano (hechizos),
   El Trono (héroes; se abre al terminar la campaña del Mundo 1), Cripta (bestias), Cuartel (entrenamiento que da copias)
   y Alto Consulado Bélico (clan). Hechizo y bestia van contigo a la batalla. ==== */
const ICO = {
  taberna: '<path d="M5 7h10v13H5z"/><path d="M15 10h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/><path d="M5 7c0-3 10-3 10 0"/><path d="M8 11v6M12 11v6"/>',
  murallas: '<path d="M3 21V9h3V6h3v3h2V6h2v3h2V6h3v3h3v12z"/><path d="M10 21v-5a2 2 0 0 1 4 0v5"/><path d="M3 13h18"/>',
  sanctum: '<path d="M12 2l3 7-3 13-3-13z"/><path d="M5 9h14"/><path d="M4 18l3-2M20 18l-3-2M6 5l2 2M18 5l-2 2"/>',
  trono: '<path d="M4 8l4 3 4-6 4 6 4-3-2 9H6z"/><path d="M6 20h12"/>',
  cripta: '<path d="M4 21V11a8 8 0 0 1 16 0v10z"/><circle cx="9.5" cy="12" r="1.6"/><circle cx="14.5" cy="12" r="1.6"/><path d="M10 17h4M12 15v2"/>',
  cuartel: '<path d="M4 20L16 8M8 20l12-12"/><path d="M14 6l2-2 4 4-2 2M4 16l4 4"/><path d="M3 4l7 7M21 20l-7-7" opacity=".5"/>',
  consulado: '<path d="M4 21h16M5 18h14M6 18V10M10 18V10M14 18V10M18 18V10M3 10h18L12 4z"/>',
  rayos: '<path d="M13 2L5 13h6l-1 9 8-12h-6z"/>',
  cuerno: '<path d="M4 15c6 0 10-4 12-10l4 2c-1 8-7 13-15 13z"/><path d="M4 15v5"/>',
  luz: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  ventisca: '<path d="M12 2v20M4 6l16 12M20 6L4 18"/><path d="M9 3l3 2 3-2M9 21l3-2 3 2"/>',
  meteoro: '<circle cx="15" cy="15" r="5"/><path d="M11 11L3 3M13 9L7 3M9 13L3 7"/>',
  grifo: '<path d="M3 13c3-1 5-4 6-8 2 3 4 4 7 4l5-2-2 5c0 5-4 9-9 9-3 0-5-2-5-4z"/><circle cx="16" cy="11" r="1"/>',
  basilisco: '<path d="M3 17c3 3 7 3 9 0s6-3 9 0"/><path d="M5 13c2-6 12-6 14 0"/><circle cx="9" cy="10" r="1.3"/><circle cx="15" cy="10" r="1.3"/>',
  dragon: '<path d="M3 20c2-6 6-9 11-9l3-6 2 5 3 1-4 3c0 4-4 6-8 6z"/><path d="M9 14c-2 1-3 3-3 5"/>',
  huargo: '<path d="M4 20l2-9-3-6 5 2 4-3 4 3 5-2-3 6 2 9z"/><circle cx="9.5" cy="12" r="1"/><circle cx="14.5" cy="12" r="1"/><path d="M11 16h2"/>',
};
const svg = (k, cls = '') => '<svg viewBox="0 0 24 24"' + (cls ? ' class="' + cls + '"' : '') + ' aria-hidden="true">' + (ICO[k] || '') + '</svg>';
const oroBtn = n => '<span class="oro"><i></i><b>' + fmt(n) + '</b></span>';
const gemBtn = n => '<span class="oro gema"><i></i><b>' + fmt(n) + '</b></span>';
const costeHtml = c => [c.oro ? oroBtn(c.oro) : '', c.gemas ? gemBtn(c.gemas) : ''].join(' ');
function paga(c) {   // cobra oro y diamantes si llegan; si no, avisa
  if ((c.oro || 0) > perfil.gold) { toast('Te faltan ' + fmt(c.oro - perfil.gold) + ' de oro.'); return false; }
  if ((c.gemas || 0) > (perfil.gemas || 0)) { toast('Te faltan ' + fmt(c.gemas - (perfil.gemas || 0)) + ' diamantes.'); return false; }
  perfil.gold -= c.oro || 0; perfil.gemas = (perfil.gemas || 0) - (c.gemas || 0); savePerfil(); paintGold(); paintHub(); return true;
}
const lordLv = () => nivelDe(perfil.xp || 0).lv;
const campana1 = () => perfil.all || kingdomDone('volcan');

/* ---- el mapa del reino: el dibujo entero de fondo; cada lugar es una zona que se toca (hit: rectángulo en %)
   y lleva su cartel (lbl: centro en %) en los huecos de hierba que deja el dibujo ---- */
const EDIFICIOS = [
  { id: 'trono', name: 'El Trono', hit: [25.0,  5.4,  74.4,  30.2], lbl: [50,  31.8], txt: 'Tus héroes: quién te acompaña a la batalla y, más adelante, sus niveles y su equipo.' },
  { id: 'murallas', name: 'Murallas', hit: [25.5,  53.8,  74.4,  69.4], lbl: [50,  70.9], txt: 'El estandarte y el aspecto de tu castillo, y sus defensas: vida de la muralla y fuerza de las torres.' },
  { id: 'sanctum', name: 'Sanctum Arcano', hit: [67.0,  16.4,  89.8,  33.5], lbl: [76,  35.1], txt: 'Crea hechizos y elige uno para llevarlo a la batalla.' },
  { id: 'cripta', name: 'Cripta', hit: [11.7,  26.6,  39.9,  33.5], lbl: [23.5,  35.1], txt: 'Las bestias del reino. Elige una para que te acompañe en las batallas.' },
  { id: 'taberna', name: 'Taberna', hit: [8.0,  36.8,  35.6,  50.8], lbl: [22,  52.5], txt: 'Mercenarios de otros mundos. Se pagan con oro.' },
  { id: 'cuartel', name: 'Cuartel', hit: [63.2,  37.4,  92.5,  52.9], lbl: [78,  54.2], txt: 'Hasta tres unidades en entrenamiento intensivo: ganan copias de su carta con el tiempo.' },
  { id: 'consulado', name: 'Alto Consulado Bélico', hit: [36.1,  35.0,  63.2,  50.5], lbl: [49.6,  51.9], txt: 'Tu clan: miembros, donaciones y guerras de clanes.' },
  { id: 'mercado', name: 'Mercado negro', hit: [8.5,  71.5,  45.7,  88.5], lbl: [27,  90.6], txt: 'Un comerciante que no hace preguntas. Tres ofertas que cambian cada 8 horas.' },
  { id: 'retorno', name: 'Altar del Retorno', hit: [54.7,  69.1,  91.9,  87.9], lbl: [73,  90.1], txt: 'Devuelve una unidad al nivel 1 y recuperas el 60 % del oro y las insignias que gastaste en subirla.' },
];
const HOGAR_ART = 'img/reino/reino.jpg';
// cada lugar recortado del propio fondo (encaja al píxel): al tocarlo se ilumina su contorno y crece un poco
const SEL_POS = {trono:  [24.973,  5.383,  49.416,  24.821],  cripta:  [11.69,  26.615,  28.162,  6.878],  sanctum:  [66.95,  16.447,  22.848,  17.045],  taberna:  [7.97,  36.782,  27.418,  14.055],  consulado:  [36.132,  34.988,  27.099,  15.371],  cuartel:  [63.231,  37.38,  29.224,  15.55],  murallas:  [25.505,  53.828,  48.884,  15.55],  mercado:  [8.82,  71.471,  36.876,  17.045],  retorno:  [54.729,  69.079,  37.194,  18.84]};
// los tejados, banderas y estandartes azules del dibujo se pintan del color de tu reino (el cielo y los contornos, no)
const reColURL = {};
function reinoColor(src, color, cb) {
  // los tejados, banderas y estandartes azules se pintan del color de tu reino. Si el dibujo trae su máscara (<nombre>_m.png)
  // solo se pinta lo que marca, con los bordes suaves; si no, todo el azul intenso
  if (color === 'azul') return cb(src);
  const key = src + '@' + color; if (reColURL[key]) return cb(reColURL[key]);
  const img = new Image(), msk = new Image(), msrc = src.replace(/\.(jpg|png)$/, '_m.png');
  let n = 2, conMask = true;
  const listo = () => { if (--n) return;
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0);
    const d = cx.getImageData(0, 0, cv.width, cv.height), p = d.data, hex = COLORES[color][1];
    let m = null;
    if (conMask) { const mc = document.createElement('canvas'); mc.width = img.width; mc.height = img.height; const mx2 = mc.getContext('2d', { willReadFrequently: true }); mx2.drawImage(msk, 0, 0, img.width, img.height); m = mx2.getImageData(0, 0, img.width, img.height).data; }
    const t = [1, 3, 5].map(k => parseInt(hex.slice(k, k + 2), 16) / 255), dark = Math.max(...t) < 0.25, light = Math.min(...t) > 0.85;
    for (let i = 0; i < p.length; i += 4) {
      if (p[i + 3] < 8) continue;
      const r = p[i] / 255, g = p[i + 1] / 255, b = p[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), dd = mx - mn + 1e-9;
      let w;
      if (m) { w = m[i] / 255; if (w < 0.02) continue; }
      else { if ((mx - mn) / (mx + 1e-9) <= 0.4 || mx <= 0.3) continue; const h = (mx === r ? (((g - b) / dd) % 6 + 6) % 6 : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4) / 6; if (h < 0.59 || h > 0.7) continue; w = 1; }
      for (let k = 0; k < 3; k++) { const v = 255 * Math.min(1, dark ? 0.1 + 0.13 * mx + t[k] * 0.3 : light ? t[k] * (0.55 + 0.42 * mx) : t[k] * mx); p[i + k] = p[i + k] * (1 - w) + v * w; }
    }
    cx.putImageData(d, 0, 0);
    cv.toBlob(bl => { reColURL[key] = URL.createObjectURL(bl); cb(reColURL[key]); }, src.endsWith('.jpg') ? 'image/jpeg' : 'image/png', 0.95);
  };
  img.onload = listo; img.onerror = () => cb(src); img.src = src;
  msk.onload = listo; msk.onerror = () => { conMask = false; listo(); }; msk.src = msrc;
}
function openHogar() {
  $('hg-name').textContent = perfil.nombre || 'Tu reino';
  const m = $('hg-map'); m.className = 'hgmap art';
  const selSrc = id => reColURL['img/reino/sel_' + id + '.png@' + myColor()] || 'img/reino/sel_' + id + '.png';
  m.innerHTML = '<img class="hgbg" src="' + (reColURL[HOGAR_ART + '@' + myColor()] || HOGAR_ART) + '" alt="Tu reino"><span class="hgdim"></span>'
    + EDIFICIOS.map(e => { const [x, y, w, h] = SEL_POS[e.id]; return '<img class="bsel" data-sel="' + e.id + '" src="' + selSrc(e.id) + '" alt="" style="left:' + x + '%;top:' + y + '%;width:' + w + '%;height:' + h + '%">'; }).join('')
    + EDIFICIOS.map(e => {
      const lock = e.id === 'trono' && !campana1(), dot = edifDot(e.id), [x0, y0, x1, y1] = e.hit;
      return '<button type="button" class="bzone" data-e="' + e.id + '" style="left:' + x0 + '%;top:' + y0 + '%;width:' + (x1 - x0) + '%;height:' + (y1 - y0) + '%" aria-label="' + e.name + (lock ? ', bloqueado' : '') + '"></button>'
        + '<button type="button" class="blabel' + (lock ? ' lock' : '') + '" data-e="' + e.id + '" style="left:' + e.lbl[0] + '%;top:' + e.lbl[1] + '%" tabindex="-1" aria-hidden="true">'
        + '<img src="img/reino/ico_' + e.id + '.png" alt=""><span>' + e.name + '</span>' + (dot ? '<i class="dot"></i>' : '') + (lock ? '<i class="lk">🔒</i>' : '') + '</button>';
    }).join('');
  reinoColor(HOGAR_ART, myColor(), url => { const bg = m.querySelector('.hgbg'); if (bg && bg.getAttribute('src') !== url) bg.src = url; });
  EDIFICIOS.forEach(e => reinoColor('img/reino/sel_' + e.id + '.png', myColor(), url => { const im = m.querySelector('[data-sel="' + e.id + '"]'); if (im && im.getAttribute('src') !== url) im.src = url; }));
  m.querySelectorAll('[data-e]').forEach(b => { b.onclick = () => entraEdif(b.dataset.e); });
  show('hogar');
}
let entrando = false;
function entraEdif(id) {
  // el lugar elegido se ilumina por su contorno y crece un poco; el resto del reino se oscurece un momento
  if (entrando) return;
  const m = $('hg-map'), im = m.querySelector('[data-sel="' + id + '"]');
  if (!im || matchMedia('(prefers-reduced-motion: reduce)').matches) return openEdif(id);
  entrando = true; m.classList.add('picking'); im.classList.add('on');
  setTimeout(() => { entrando = false; m.classList.remove('picking'); im.classList.remove('on'); openEdif(id); }, 430);
}
function edifDot(id) {
  if (id === 'mercado') return mnNuevo();
  if (id === 'cuartel') return cuartelListo() > 0;
  if (id === 'cripta') return !Object.keys(perfil.bestias || {}).length;
  return false;
}
/* ---- el arrabal (dibujado en el propio fondo del reino, bajo las murallas): Mercado negro y Altar del Retorno.
   Mercado negro: tres ofertas que cambian cada 8 horas (copias de cartas, insignias y celdas, con oro o diamantes).
   Altar del Retorno: devuelve una unidad al nivel 1 y te da el 60 % del oro y las insignias que gastaste en subirla. ---- */
// mercado negro
const MN_H = 8, mnTanda = () => Math.floor(Date.now() / (MN_H * 3600e3));
function mnRoll() {
  const own = owned(), rnd = arr => arr[Math.floor(Math.random() * arr.length)], out = [];
  const k1 = rnd(own.filter(k => ['epica', 'legendaria', 'ascendida'].includes(RARITY[k])).concat(own).slice(0, Math.max(1, own.length)));
  out.push({ t: 'copias', k: k1, n: ['epica', 'legendaria', 'ascendida'].includes(RARITY[k1]) ? 6 : 12, p: { gemas: ['legendaria', 'ascendida'].includes(RARITY[k1]) ? 90 : 45 } });
  const k2 = rnd(own.filter(k => k !== k1)) || k1;
  out.push({ t: 'copias', k: k2, n: 8, p: { oro: Math.round(260 * 8 * (LV_RAR[RARITY[k2]] || 1) / 10) * 10 } });
  out.push(Math.random() < 0.5 ? { t: 'insignias', n: 3, p: { oro: 2400 } } : { t: 'celda', id: Math.random() < 0.7 ? 'runica' : 'oro', p: { oro: Math.random() < 0.7 ? 2600 : 5200 } });
  return out.map(o => Object.assign(o, { sold: false }));
}
function mnHoy() { if (!perfil.mercado || perfil.mercado.f !== mnTanda()) { perfil.mercado = { f: mnTanda(), ofs: mnRoll(), visto: false }; savePerfil(); } return perfil.mercado; }
const mnNuevo = () => !perfil.mercado || perfil.mercado.f !== mnTanda() || !perfil.mercado.visto;
const mnQueda = () => { const s = ((mnTanda() + 1) * MN_H * 3600e3 - Date.now()) / 1000; return Math.floor(s / 3600) + ' h ' + Math.floor(s % 3600 / 60) + ' min'; };
function mercado(el) {
  const m = mnHoy(); if (!m.visto) { m.visto = true; savePerfil(); }
  const pre = p => p.gemas ? gemBtn(p.gemas) : oroBtn(p.oro);
  el.innerHTML = '<h3>Ofertas <small>cambian en ' + mnQueda() + '</small></h3><div class="offers">' + m.ofs.map((o, i) => {
    const img = o.t === 'copias' ? 'img/' + o.k + '_carta.png' : o.t === 'insignias' ? 'img/insignia.png' : 'img/celdas/celda_' + o.id + '_0.png';
    const t = o.t === 'copias' ? LABEL[o.k] + ' ×' + o.n : o.t === 'insignias' ? 'Insignias de mando ×' + o.n : CELDA(o.id).name;
    const sub = o.t === 'copias' ? 'copias de su carta, para subir de rango' : o.t === 'insignias' ? 'para los saltos de nivel' : 'se abre en Campaña → Celdas';
    return '<div class="offer' + (o.sold ? ' sold' : '') + '"><span class="pile pack"><img src="' + img + '" alt=""></span><b class="t">' + t + '</b><small>' + sub + '</small>'
      + (o.sold ? '<span class="chip">Vendido</span>' : '<button class="btn gold" data-mn="' + i + '">' + pre(o.p) + '</button>') + '</div>';
  }).join('') + '</div>';
  el.querySelectorAll('[data-mn]').forEach(b => { b.onclick = () => {
    const o = m.ofs[+b.dataset.mn]; if (o.sold || !paga(o.p)) return;
    if (o.t === 'copias') addCopias(o.k, o.n); else if (o.t === 'insignias') addInsignias(o.n); else darCelda(o.id);
    o.sold = true; savePerfil(); toast('Trato hecho.'); reEdif();
  }; });
}
// altar del retorno
function gastoNivel(k) {   // oro e insignias que costó llevar la unidad del nivel 1 a su nivel actual
  let oro = 0, ins = 0; for (let l = 1; l < lvOf(k); l++) { const s = SALTO_INS[l] || 0; oro += oroNivel(k, l) * (s ? 3 : 1); ins += s; }
  return { oro, ins };
}
function retorno(el) {
  const us = owned().filter(k => lvOf(k) > 1).sort((a, b) => lvOf(b) - lvOf(a));
  el.innerHTML = '<p class="note">Elige una unidad: vuelve al nivel 1 y el altar te devuelve el 60 %. Su rango y sus copias no cambian.</p>'
    + (us.length ? '<div class="col full">' + us.map(k => { const g = gastoNivel(k), o = Math.floor(g.oro * 0.6), i = Math.floor(g.ins * 0.6);
      return '<div class="uprow"><b><img class="mini" src="img/' + k + '_carta.png" alt=""> ' + LABEL[k] + ' <span class="lvl">Nv ' + lvOf(k) + '</span></b><button class="btn small" data-rt="' + k + '">Devolver</button><small>Recuperas ' + fmt(o) + ' de oro' + (i ? ' y ' + i + ' insignia' + (i > 1 ? 's' : '') : '') + '</small></div>';
    }).join('') + '</div>' : '<div class="infocard"><p>Aún no has subido de nivel a ninguna unidad.</p></div>');
  el.querySelectorAll('[data-rt]').forEach(b => { b.onclick = () => {
    const k = b.dataset.rt, g = gastoNivel(k), o = Math.floor(g.oro * 0.6), i = Math.floor(g.ins * 0.6);
    pop('<p class="eyebrow">Altar del Retorno</p><h2>' + LABEL[k] + '</h2><p>Vuelve del nivel ' + lvOf(k) + ' al 1. Recuperas <b>' + fmt(o) + ' de oro</b>' + (i ? ' y <b>' + i + ' insignias</b>' : '') + '.</p>', 'Devolver', () => {
      perfil.niveles[k] = 1; perfil.gold += o; addInsignias(i); savePerfil(); paintGold(); paintHub(); $('pop').hidden = true; toast(LABEL[k] + ' vuelve al nivel 1. +' + fmt(o) + ' de oro.'); reEdif();
    });
  }; });
}
const ESTANDARTE = $('seg-estandarte');
let EDIF = null;
function openEdif(id) {
  if (id === 'taberna') return openTaberna();
  const e = EDIFICIOS.find(x => x.id === id);
  if (id === 'trono' && !campana1()) return pop('<p class="eyebrow">Bloqueado</p><h2>El Trono</h2><p class="note">Se abre al conquistar los siete reinos del Mundo 1. Hasta entonces eliges a tu héroe en la pantalla del mazo.</p>');
  EDIF = id; ESTANDARTE.remove();
  $('ed-title').textContent = e.name;
  $('ed-body').innerHTML = '<div class="bhead"><img class="bimg" src="img/reino/' + id + '.png" alt=""><p>' + e.txt + '</p></div><div id="ed-in" class="sheet" style="width:100%"></div>';
  reinoColor('img/reino/' + id + '.png', myColor(), url => { const im = document.querySelector('#ed-body .bimg'); if (im) im.src = url; });
  ({ murallas, sanctum, trono, cripta, cuartel, consulado, mercado, retorno })[id]($('ed-in'));
  show('edif');
}
$('ed-back').onclick = () => openHogar();
const reEdif = () => { if (EDIF && !$('edif').hidden) openEdif(EDIF); };

/* ---- Murallas: estandarte, aspecto del castillo y defensas ---- */
const DEFENSAS = {
  muralla: { name: 'Muralla', txt: lv => 'Vida del castillo: +' + lv * 6 + ' %', max: 20, base: 150 },
  torres: { name: 'Arqueros de las torres', txt: lv => 'Daño de las torres: +' + lv * 10 + ' %', max: 20, base: 180 },
  atalaya: { name: 'Atalaya', txt: lv => 'Cadencia de las torres: +' + lv * 2 + ' %', max: 20, base: 220 },
};
const defLv = k => (perfil.def || {})[k] || 0;
const defCoste = k => Math.round(DEFENSAS[k].base * Math.pow(1.32, defLv(k)) / 10) * 10;
// aspectos del castillo: dibujos propios (img/castillos) con el suelo del torreón, el arquero y el estandarte grande de cada uno
const ASPECTOS_POS = __ASPECTOS__;
const ASPECTOS = [['piedra', 'Castillo de piedra'], ['roble', 'Fortaleza del Roble'], ['luna', 'Castillo Lunar'], ['vitral', 'Catedral de Vitrales'], ['marea', 'Alcázar de las Mareas'],
  ['dragon', 'Fortaleza del Dragón'], ['engranaje', 'Castillo de Engranajes'], ['hielo', 'Fortaleza de Hielo'], ['grifo', 'Alcázar del Grifo'], ['arena', 'Fortaleza de Arena'],
  ['trueno', 'Castillo del Trueno'], ['pagoda', 'Castillo Pagoda'], ['farol', 'Castillo de los Faroles'], ['carnero', 'Fortín del Carnero'], ['escarabajo', 'Templo del Escarabajo'],
  ['golem', 'Fortaleza Gólem'], ['murcielago', 'Castillo del Murciélago'], ['loto', 'Palacio del Loto'], ['sol', 'Ciudadela del Sol'],
  ['candado', 'Fortaleza del Candado'], ['setas', 'Castillo de las Setas']];
const ASP_PRECIO = 150;
for (const [id, v] of Object.entries(ASPECTOS_POS)) if (v.ban) { BANNERS['cas_' + id] = v.ban; BANNERS['cas_' + id + '_d'] = (v.d && v.d.ban) || v.ban; }
const aspTiene = id => id === 'piedra' || perfil.all || (perfil.aspectos || []).includes(id);
const mySkin = () => perfil.aspecto && ASPECTOS_POS[perfil.aspecto] && aspTiene(perfil.aspecto) ? perfil.aspecto : null;
const skinCarga = {};
function skinTex(id, cb) {   // carga el dibujo (sin pasar por el cargador de Phaser) con sus versiones dañada y en ruinas
  if (!id || !scene) return; const k = 'cas_' + id, P = ASPECTOS_POS[id] || {};
  if (scene.textures.exists(k)) { if (cb) cb(); return; }
  if (skinCarga[id]) { if (cb) skinCarga[id].push(cb); return; }   // ya se está cargando: avisa a todos al terminar
  skinCarga[id] = cb ? [cb] : [];
  const pide = (suf, ok, mal) => { const im = new Image(); im.onload = () => ok(im); im.onerror = mal; im.src = 'img/castillos/' + id + suf + '.png'; };
  let falta = 1 + !!P.d + !!P.r;
  const listo = () => { if (--falta) return; const l = skinCarga[id] || []; delete skinCarga[id]; l.forEach(f => f()); };
  const pon = (key, im) => { if (!scene.textures.exists(key)) scene.textures.addImage(key, im); };
  pide('', im => { pon(k, im); if (!P.d) castilloDanado(id, im); listo(); }, () => { delete skinCarga[id]; });
  if (P.d) pide('_d', im => { pon(k + '_d', im); listo(); }, listo);   // si falla, el castillo sigue entero hasta caer
  if (P.r) pide('_r', im => { pon(k + '_r', im); listo(); }, listo);   // si falla, las ruinas genéricas
}
function castilloDanado(id, im) {
  // dañado sin dibujo propio: más oscuro, con grietas y hollín (hasta que llegue el suyo)
  let sd = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7); const rn = () => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296;
  const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const cx = cv.getContext('2d'), Wd = cv.width, Hd = cv.height;
  cx.drawImage(im, 0, 0); cx.globalCompositeOperation = 'source-atop';
  cx.fillStyle = 'rgba(40,28,28,.2)'; cx.fillRect(0, 0, Wd, Hd);
  for (let i = 0; i < 7; i++) {
    const x = Wd * (0.12 + rn() * 0.76), y = Hd * (0.3 + rn() * 0.55), r = 22 + rn() * 30, g = cx.createRadialGradient(x, y, 2, x, y, r);
    g.addColorStop(0, 'rgba(20,16,18,.55)'); g.addColorStop(1, 'rgba(20,16,18,0)'); cx.fillStyle = g; cx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  cx.strokeStyle = '#1e2235'; cx.lineJoin = 'round'; cx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    let x = Wd * (0.1 + rn() * 0.8), y = Hd * (0.25 + rn() * 0.6), a = rn() * Math.PI * 2;
    cx.lineWidth = 4 + rn() * 3; cx.beginPath(); cx.moveTo(x, y);
    for (let j = 0; j < 4; j++) { a += (rn() - 0.5) * 1.6; x += Math.cos(a) * (12 + rn() * 16); y += Math.sin(a) * (12 + rn() * 16); cx.lineTo(x, y); }
    cx.stroke();
  }
  scene.textures.addCanvas('cas_' + id + '_d', cv);
}
const aspSrc = id => id === 'piedra' ? colorURL(ICON.casa, myColor(), myEmb()) : scene && scene.textures.exists('cas_' + id) ? colorURL('cas_' + id, myColor(), myEmb()) : 'img/castillos/' + id + '.png';
function elegirAspecto(id) {
  const n = ASPECTOS.find(a => a[0] === id)[1];
  const usar = () => { perfil.aspecto = id === 'piedra' ? null : id; savePerfil(); if (id !== 'piedra') skinTex(id); toast(n + ': ahora es tu castillo.'); reEdif(); };
  if (aspTiene(id)) return usar();
  pop('<p class="eyebrow">Aspecto del castillo</p><h2>' + n + '</h2><img class="aspbig" src="' + aspSrc(id) + '" alt=""><p class="note">Con tu color y tu emblema. Se ve en todas tus batallas.</p>',
    'Comprar · ' + ASP_PRECIO + ' diamantes', () => { if (!paga({ gemas: ASP_PRECIO })) return; perfil.aspectos = (perfil.aspectos || []).concat(id); $('pop').hidden = true; usar(); });
}
function murallas(el) {
  const cur = mySkin() || 'piedra';
  el.innerHTML = '<h3>Defensas <small>solo en tu castillo; las del rival dependen de su reino</small></h3><div class="col full" id="mu-def"></div>'
    + '<h3>Aspecto del castillo <small>con tu color y tu emblema; se ve en las batallas</small></h3><div class="aspgrid">' + ASPECTOS.map(([id, n]) => {
      const has = aspTiene(id), sel = id === cur;
      return '<button type="button" class="asp' + (sel ? ' sel' : '') + (has ? '' : ' lock') + '" data-a="' + id + '"><img data-asp="' + id + '" src="' + aspSrc(id) + '" alt=""><b>' + n + '</b>'
        + (sel ? '<span class="kind">En uso</span>' : has ? '<small>Tuyo</small>' : gemBtn(ASP_PRECIO)) + '</button>';
    }).join('') + '</div>'
    + '<div id="mu-est"></div>';
  ASPECTOS.forEach(([id]) => { if (id !== 'piedra' && !scene.textures.exists('cas_' + id)) skinTex(id, () => { const im = el.querySelector('[data-asp="' + id + '"]'); if (im) im.src = aspSrc(id); }); });
  el.querySelectorAll('[data-a]').forEach(b => { b.onclick = () => elegirAspecto(b.dataset.a); });
  $('mu-def').innerHTML = Object.entries(DEFENSAS).map(([k, d]) => {
    const lv = defLv(k), max = lv >= d.max;
    return '<div class="uprow"><b>' + d.name + ' <span class="lvl">Nv ' + lv + '</span></b>' + (max ? '<span class="chip">Máx.</span>' : '<button class="btn gold small" data-d="' + k + '">' + oroBtn(defCoste(k)) + '</button>')
      + '<small>' + d.txt(lv) + (max ? '' : ' → ' + d.txt(lv + 1).split(': ').pop()) + '</small></div>';
  }).join('');
  el.querySelectorAll('[data-d]').forEach(b => { b.onclick = () => { const k = b.dataset.d; if (paga({ oro: defCoste(k) })) { perfil.def = perfil.def || {}; perfil.def[k] = defLv(k) + 1; savePerfil(); toast(DEFENSAS[k].name + ' sube a nivel ' + defLv(k) + '.'); reEdif(); } }; });
  $('mu-est').appendChild(ESTANDARTE); ESTANDARTE.hidden = false; paintColors();
}

/* ---- Sanctum Arcano: hechizos (se crean una vez y luego se suben de nivel; uno va contigo a la batalla) ---- */
const HECHIZOS = {
  cuerno: { name: 'Cuerno de la victoria', c: '#ffc83d', cd: 40, t0: 12, crear: { oro: 300 }, haste: 0.35, t: 8,
    txt: k => 'Tus unidades andan y atacan un ' + Math.round(35 * k) + ' % más rápido durante 8 s.' },
  rayos: { name: 'Tormenta de rayos', c: '#7fb2ff', cd: 35, t0: 15, crear: { oro: 500 }, n: 5, dmg: 70, stun: 0.7,
    txt: k => 'Caen 5 rayos sobre los enemigos más adelantados: ' + Math.round(70 * k) + ' de daño cada uno y los aturden.' },
  luz: { name: 'Luz sagrada', c: '#7dffa0', cd: 45, t0: 20, crear: { oro: 700 }, heal: 0.3,
    txt: k => 'Cura a todas tus unidades un ' + Math.round(30 * k) + ' % de su vida.' },
  ventisca: { name: 'Ventisca', c: '#a8e8ff', cd: 40, t0: 15, crear: { oro: 900, gemas: 20 }, slow: 0.5, t: 6,
    txt: k => 'Los enemigos van a la mitad de velocidad durante ' + (6 * k).toFixed(1).replace('.0', '').replace('.', ',') + ' s.' },
  meteoro: { name: 'Meteoro', c: '#ff7a3a', cd: 55, t0: 25, crear: { oro: 1500, gemas: 50 }, dmg: 160, r: H * 1.6,
    txt: k => 'Cae donde más enemigos hay: ' + Math.round(160 * k) + ' de daño en área y, si lo alcanza, al castillo rival.' },
};
const SP_MAX = 10, spLv = id => (perfil.hechizos || {})[id] || 0, spK = id => 1 + 0.1 * (Math.max(1, spLv(id)) - 1);
const spUp = id => Math.round(250 * Math.pow(spLv(id), 1.6) / 10) * 10;
const myHechizo = () => spLv(perfil.hechizo) ? perfil.hechizo : null;
function sanctum(el) {
  el.innerHTML = '<p class="note">El hechizo elegido sale en la batalla como un botón encima de tus cartas. Se carga solo con el tiempo.</p><div class="cards3">' + Object.entries(HECHIZOS).map(([id, h]) => {
    const lv = spLv(id), sel = myHechizo() === id;
    return '<div class="kcard' + (sel ? ' sel' : '') + (lv ? '' : ' lock') + '"><header><img class="kcimg" src="img/hechizos/' + id + '.png" alt=""><div><b>' + h.name + '</b><small>' + (lv ? 'Nivel ' + lv + ' · recarga ' + h.cd + ' s' : 'Sin crear · recarga ' + h.cd + ' s') + '</small></div></header>'
      + '<p>' + h.txt(spK(id)) + '</p><div class="acts">'
      + (!lv ? '<button class="btn gold small" data-c="' + id + '">Crear · ' + costeHtml(h.crear) + '</button>'
        : (sel ? '<span class="kind">En batalla</span>' : '<button class="btn small" data-s="' + id + '">Llevar a la batalla</button>') + (lv < SP_MAX ? '<button class="btn gold small" data-u="' + id + '">Nv ' + (lv + 1) + ' · ' + oroBtn(spUp(id)) + '</button>' : '<span class="chip">Máx.</span>'))
      + '</div></div>';
  }).join('') + '</div>';
  el.querySelectorAll('[data-c]').forEach(b => { b.onclick = () => { const id = b.dataset.c; if (paga(HECHIZOS[id].crear)) { perfil.hechizos = perfil.hechizos || {}; perfil.hechizos[id] = 1; if (!myHechizo()) perfil.hechizo = id; savePerfil(); toast('Has creado ' + HECHIZOS[id].name + '.'); reEdif(); } }; });
  el.querySelectorAll('[data-s]').forEach(b => { b.onclick = () => { perfil.hechizo = b.dataset.s; savePerfil(); reEdif(); }; });
  el.querySelectorAll('[data-u]').forEach(b => { b.onclick = () => { const id = b.dataset.u; if (paga({ oro: spUp(id) })) { perfil.hechizos[id]++; savePerfil(); toast(HECHIZOS[id].name + ' sube a nivel ' + spLv(id) + '.'); reEdif(); } }; });
}

/* ---- El Trono: héroes, con su nivel (como las unidades: +3 % de vida y daño por nivel), que se sube con oro ---- */
const HERO_MAX = 30;
const heroLv = h => Math.max(1, Math.min(HERO_MAX, (perfil.heroLv || {})[h] || 1));
const heroCoste = h => Math.round(400 * Math.pow(1.22, heroLv(h) - 1) / 10) * 10;
function trono(el) {
  const hs = heroesOwned();
  el.innerHTML = '<div class="hgrid">' + Object.entries(HEROES).map(([k, h]) => {
    const has = hs.includes(k), c = CH[k], q = KINGDOMS.find(z => z.ruler === k), sel = playerHero() === k;
    return '<div class="hcard' + (has ? '' : ' lock') + '"><header><img class="hport" src="img/' + h.portrait + '.png" alt=""><div><b>' + NAMES_H[k] + '</b><span class="note">' + (has ? (sel ? 'Tu héroe en batalla' : 'Disponible') : 'Conquista el ' + (q ? q.name : 'reino de su rey')) + '</span></div></header>'
      + '<div class="statrow"><span class="lvl">Nv ' + heroLv(k) + '</span><span>Vida ' + Math.round(c.hp * lvK(heroLv(k))) + '</span><span>Daño ' + Math.round(c.dmg[0] * lvK(heroLv(k))) + '–' + Math.round(c.dmg[1] * lvK(heroLv(k))) + '</span><span>Salta a las ' + c.goal + ' bajas</span></div>'
      + '<p><em>Pasiva.</em> ' + HERO_TXT[k][0] + '</p><p><em>Activa.</em> ' + HERO_TXT[k][1] + '</p>'
      + '<div class="acts">' + (has && !sel ? '<button class="btn small" data-h="' + k + '">Llevar a la batalla</button>' : '')
      + (has ? (heroLv(k) >= HERO_MAX ? '<span class="chip">Nivel máximo</span>' : '<button class="btn gold small" data-hl="' + k + '">Subir a Nv ' + (heroLv(k) + 1) + ' · ' + oroBtn(heroCoste(k)) + '</button>') : '') + '</div></div>';
  }).join('') + '</div><div class="infocard"><h3>Próximamente</h3><p>Rangos de los héroes, su equipo y sus talentos.</p></div>';
  el.querySelectorAll('[data-h]').forEach(b => { b.onclick = () => { myHero = b.dataset.h; try { localStorage.setItem('bg-hero', myHero); } catch (e) {} reEdif(); }; });
  el.querySelectorAll('[data-hl]').forEach(b => { b.onclick = () => { const h = b.dataset.hl; if (paga({ oro: heroCoste(h) })) { perfil.heroLv = perfil.heroLv || {}; perfil.heroLv[h] = heroLv(h) + 1; savePerfil(); toast(NAMES_H[h] + ' sube a nivel ' + heroLv(h) + '.'); reEdif(); } }; });
}
// en la batalla, los héroes saltan con su nivel: el tuyo, el que le has subido; el rival, el poder de su reino
const _heroActLv = heroAct;
heroAct = function (team) {
  const hr = team === 'blue' ? B.hero : B.heroP, antes = hr && hr.state, ok = _heroActLv(team);
  if (ok && antes === 'throne' && hr.unit && !B.sim) {
    const lv = team === 'blue' ? (B.auto ? 1 : heroLv(hr.type)) : (B.heroPLv || 1);
    if (lv > 1) applyPromo(hr.unit, lv, 0);
  }
  return ok;
};

/* ---- Cripta: bestias. Una va contigo: bendice a los tuyos, maldice al rival, lanza su habilidad o lucha a tu lado ---- */
const BESTIAS = {
  grifo: { name: 'Grifo real', kind: 'Bendición', c: '#ffc83d', v: lv => 0.10 + 0.02 * (lv - 1),
    txt: v => 'Tus unidades salen con un ' + Math.round(v * 100) + ' % más de vida y daño.' },
  basilisco: { name: 'Basilisco', kind: 'Maldición', c: '#5fcf6a', v: lv => 0.12 + 0.015 * (lv - 1),
    txt: v => 'Las unidades enemigas andan y atacan un ' + Math.round(v * 100) + ' % más lento.' },
  dragon: { name: 'Dragón de ceniza', kind: 'Habilidad', c: '#ff7a3a', cd: 30, t0: 20, v: lv => Math.round(80 * (1 + 0.12 * (lv - 1))),
    txt: v => 'Aliento de fuego (cada 30 s, tú decides cuándo): ' + v + ' de daño a todos los enemigos de tu mitad del campo.' },
  huargo: { name: 'Huargo de la cripta', kind: 'Lucha', c: '#9aa4c7', every: 25, v: lv => lv,
    txt: v => 'Cada 25 s se une a la batalla un lobo de la cripta de nivel ' + huargoPw(v)[0] + ', rango ' + RANGOS[huargoPw(v)[1]] + '.' },
};
// dibujos de cada bestia: retrato (Cripta), reposo, preparada (ready, cuando le quedan readyAt s) y acción en batalla
const BEAST_ART = {
  grifo: { port: 'grifo_sentado', idle: 'grifo_sentado', alt: 'grifo_pie', act: 'grifo_vuelo', h: 1.15 },
  basilisco: { port: 'basilisco_sentado', idle: 'basilisco_sentado', act: 'basilisco_pie', h: 1.15 },
  dragon: { port: 'dragon_sentado', idle: 'dragon_sentado', ready: 'dragon_pie', readyAt: 0, act: 'dragon_fuego', h: 1.25, mouth: [0.6, 0.57] },
  huargo: { port: 'huargo_aullido', idle: 'huargo_pie', ready: 'huargo_ataque', readyAt: 2.5, act: 'huargo_aullido', h: 1.25 },
};
const POSE_H = { huargo_ataque: 0.66, basilisco_pie: 0.8, dragon_fuego: 0.9 };   // poses agachadas o tumbadas: más bajas
function beastTex(names, cb) {   // como los castillos: imágenes sueltas que se añaden a Phaser al llegar
  let left = 0; const done = () => { if (--left <= 0 && cb) cb(); };
  for (const n of names) {
    const k = 'bst_' + n; if (!scene || scene.textures.exists(k)) continue;
    left++; const im = new Image(); im.onload = () => { if (!scene.textures.exists(k)) scene.textures.addImage(k, im); done(); }; im.onerror = done; im.src = 'img/bestias/' + n + '.png';
  }
  if (!left && cb) cb();
}
const beastNames = id => [...new Set(Object.values(BEAST_ART[id]).filter(v => typeof v === 'string'))];
const huargoPw = lv => [1 + (lv - 1) * 8, Math.min(4, Math.floor((lv - 1) / 2))];
const BE_MAX = 10, beLv = id => (perfil.bestias || {})[id] || 0, beUp = id => Math.round(300 * Math.pow(beLv(id), 1.6) / 10) * 10, BE_PRECIO = 150;
const myBestia = () => beLv(perfil.bestia) ? perfil.bestia : null;
function cripta(el) {
  const first = !Object.keys(perfil.bestias || {}).length;
  el.innerHTML = (first ? '<div class="infocard"><h3>Elige tu primera bestia</h3><p>La primera es gratis. Las demás se pueden despertar con diamantes.</p></div>' : '') + '<div class="cards3">' + Object.entries(BESTIAS).map(([id, b]) => {
    const lv = beLv(id), sel = myBestia() === id;
    return '<div class="kcard' + (sel ? ' sel' : '') + (lv ? '' : ' lock') + '"><header><img class="kcimg bst" src="img/bestias/' + BEAST_ART[id].port + '.png" alt=""><div><b>' + b.name + '</b><small>' + (lv ? 'Nivel ' + lv : 'Dormida') + '</small></div></header>'
      + '<span class="kind">' + b.kind + '</span><p>' + b.txt(b.v(Math.max(1, lv))) + '</p><div class="acts">'
      + (!lv ? '<button class="btn gold small" data-w="' + id + '">' + (first ? 'Elegir · gratis' : 'Despertar · ' + gemBtn(BE_PRECIO)) + '</button>'
        : (sel ? '<span class="kind">Contigo en batalla</span>' : '<button class="btn small" data-s="' + id + '">Llevar a la batalla</button>') + (lv < BE_MAX ? '<button class="btn gold small" data-u="' + id + '">Nv ' + (lv + 1) + ' · ' + oroBtn(beUp(id)) + '</button>' : '<span class="chip">Máx.</span>'))
      + '</div></div>';
  }).join('') + '</div><p class="note">Las bestias tendrán su dibujo y aparecerán en el campo; de momento se notan por su efecto.</p>';
  el.querySelectorAll('[data-w]').forEach(b => { b.onclick = () => { const id = b.dataset.w; if (first || paga({ gemas: BE_PRECIO })) { perfil.bestias = perfil.bestias || {}; perfil.bestias[id] = 1; perfil.bestia = id; savePerfil(); toast(BESTIAS[id].name + ' despierta y te acompañará en batalla.'); reEdif(); } }; });
  el.querySelectorAll('[data-s]').forEach(b => { b.onclick = () => { perfil.bestia = b.dataset.s; savePerfil(); reEdif(); }; });
  el.querySelectorAll('[data-u]').forEach(b => { b.onclick = () => { const id = b.dataset.u; if (paga({ oro: beUp(id) })) { perfil.bestias[id]++; savePerfil(); toast(BESTIAS[id].name + ' sube a nivel ' + beLv(id) + '.'); reEdif(); } }; });
}

/* ---- Cuartel: hasta tres unidades entrenando; dan copias de su carta con el tiempo (se guardan hasta 12 h) ---- */
const CU = { slots: [1, 5, 12], horas: { comun: 1, poco: 1.5, rara: 2, epica: 3, legendaria: 5, ascendida: 8 }, cap: 12 };
const cuSlots = () => { perfil.cuartel = perfil.cuartel || [null, null, null]; return perfil.cuartel; };
const cuRate = k => CU.horas[RARITY[k] || 'comun'];
function cuPend(s) { if (!s) return 0; const h = Math.min(CU.cap, (Date.now() - s.t0) / 3.6e6); return Math.floor(h / cuRate(s.k)); }
const cuartelListo = () => cuSlots().reduce((n, s) => n + cuPend(s), 0);
function cuCobra(i) {
  const s = cuSlots()[i], n = cuPend(s); if (!n) return 0;
  addCopias(s.k, n);
  const h = (Date.now() - s.t0) / 3.6e6; s.t0 = h >= CU.cap ? Date.now() : s.t0 + n * cuRate(s.k) * 3.6e6;
  savePerfil(); return n;
}
function cuartel(el) {
  const lv = lordLv(), sl = cuSlots();
  el.innerHTML = '<div class="trslots">' + sl.map((s, i) => {
    if (lv < CU.slots[i]) return '<div class="trslot lock"><b>Puesto ' + (i + 1) + '</b><small>Se abre con tu reino a nivel ' + CU.slots[i] + '</small></div>';
    if (!s) return '<button type="button" class="trslot empty" data-p="' + i + '"><b>Puesto libre</b><small>Toca para poner una unidad a entrenar</small></button>';
    const n = cuPend(s), h = (Date.now() - s.t0) / 3.6e6, prog = Math.min(1, (h % cuRate(s.k)) / cuRate(s.k)), full = h >= CU.cap;
    return '<div class="trslot">' + cardHtml(s.k) + '<b>' + LABEL[s.k] + '</b><small>1 copia cada ' + String(cuRate(s.k)).replace('.', ',') + ' h' + (full ? ' · ¡lleno!' : '') + '</small>'
      + '<span class="cpbar wide"><i style="width:' + (full ? 100 : prog * 100) + '%"></i><b>' + n + ' listas</b></span>'
      + '<div class="acts start"><button class="btn gold small" data-c="' + i + '"' + (n ? '' : ' disabled') + '>Recoger</button><button class="btn small" data-x="' + i + '">Cambiar</button></div></div>';
  }).join('') + '</div><p class="note">Cuanto más rara la unidad, más tarda cada copia. El entrenamiento se para a las 12 horas si no recoges. Las unidades siguen pudiendo luchar mientras entrenan.</p>';
  el.querySelectorAll('[data-p],[data-x]').forEach(b => { b.onclick = () => cuElegir(+(b.dataset.p ?? b.dataset.x)); });
  el.querySelectorAll('[data-c]').forEach(b => { b.onclick = () => { const i = +b.dataset.c, k = cuSlots()[i].k, n = cuCobra(i); if (n) { toast('+' + n + ' copias de ' + LABEL[k] + '.'); paintGold(); reEdif(); } }; });
}
function cuElegir(i) {
  const usados = cuSlots().filter((s, j) => s && j !== i).map(s => s.k), lista = owned().filter(k => !usados.includes(k));
  pop('<p class="eyebrow">Cuartel · puesto ' + (i + 1) + '</p><h2>¿Quién entrena?</h2><div class="pickgrid">' + lista.map(k => '<button type="button" class="dk ' + (RARITY[k] || 'comun') + '" data-k="' + k + '"><span class="cost">' + COST[k] + '</span><img src="img/' + k + '_carta.png" alt=""><span class="nm">' + LABEL[k] + '</span></button>').join('') + '</div><p class="note">Si cambias a una unidad, primero recoges lo que lleve entrenado.</p>');
  document.querySelectorAll('#pop-body [data-k]').forEach(b => { b.onclick = () => { if (cuSlots()[i]) cuCobra(i); cuSlots()[i] = { k: b.dataset.k, t0: Date.now() }; savePerfil(); $('pop').hidden = true; reEdif(); }; });
}
setInterval(() => { if (EDIF === 'cuartel' && !$('edif').hidden && $('pop').hidden) reEdif(); }, 30000);

/* ---- Alto Consulado Bélico: el clan (necesita servidor: de momento, cómo será) ---- */
function consulado(el) {
  el.innerHTML = '<div class="grid2">' + [['Tu clan', 'Crea un clan con tu estandarte o únete al de otros señores (hasta 30 miembros).'], ['Donaciones', 'Pide copias de cartas y dalas a tus compañeros: cada donación te da oro y experiencia.'],
    ['Guerra de clanes', 'Tres días de batallas contra otro clan. Cada victoria suma estandartes; el clan ganador se lleva celdas.'], ['Asedio cooperativo', 'Todo el clan contra un rey gigante, sumando el daño de todos.']]
    .map(([t, p]) => '<div class="infocard"><h3>' + t + '</h3><p>' + p + '</p><span class="chip">Próximamente</span></div>').join('') + '</div>';
}

/* ==== en batalla: defensas, hechizo y bestia ==== */
function moveK(u) {
  let k = u.perk && u.perk.veloz ? 1 + u.perk.veloz : 1;
  const bf = B && B.buff && B.buff[u.team]; if (bf) { if (bf.hasteT > 0) k *= 1 + bf.haste; if (bf.slowT > 0) k *= bf.slow; }
  if (B && B.curse && B.curse.team === u.team) k *= 1 - B.curse.k;
  return k;
}
function atkK(u) { return moveK(u); }   // la velocidad de ataque sigue a la de movimiento (cuerno, ventisca, basilisco, veloz)
const _ghR = gullHaste;
gullHaste = function (u) { return _ghR(u) * (mode === 'fight' && B && !B.idle ? moveK(u) : 1); };
const teamBuffK = team => team === 'blue' && B && B.beast && B.beast.id === 'grifo' ? 1 + B.beast.v : 1;
// aspecto de los castillos rivales: los vasallos de cada reino alternan dos de su tema y el castillo real lleva el suyo;
// en la batalla rápida (y en la del menú), uno al azar. 'piedra' es el castillo de siempre
const RIVAL_ASP = { praderas: [['piedra', 'roble'], 'grifo'], bosque: [['roble', 'pagoda'], 'golem'], desierto: [['arena', 'escarabajo'], 'sol'],
  nieve: [['hielo', 'luna'], 'trueno'], pantano: [['loto', 'murcielago'], 'golem'], volcan: [['farol', 'dragon'], 'dragon'], playa: [['marea', 'vitral'], 'marea'],
  setas: [['setas', 'loto'], 'setas'], huesos: [['carnero', 'murcielago'], 'dragon'], engranajes: [['engranaje', 'candado'], 'engranaje'],
  cristal: [['vitral', 'luna'], 'vitral'], cementerio: [['murcielago', 'candado'], 'murcielago'], cielo: [['grifo', 'sol'], 'pagoda'] };
function rivalAspecto(o) {
  if (o.run && o.run.kind === 'nivel') { const r = RIVAL_ASP[o.run.k], lv = KD(o.run.k).levels[o.run.i]; return !r ? null : lv.royal ? r[1] : r[0][o.run.i % r[0].length]; }
  const ids = ASPECTOS.map(a => a[0]); return ids[Math.floor(Math.random() * ids.length)];
}
const _resetR = resetBattle;
resetBattle = function (o = {}) {
  _resetR(o);
  const sk = mySkin(); CASTLE_SKIN.blue = sk && scene && scene.textures.exists('cas_' + sk) ? Object.assign({ id: sk }, ASPECTOS_POS[sk]) : null;
  SUB_TEMA = SUBSUELO.temas[sk] ? sk : 'piedra';   // el subsuelo, con las criptas a juego con tu castillo
  if (!o.sim && scene) subTex(SUB_TEMA, () => drawScenery(scene));
  // el rival, con su aspecto, su subsuelo y su cripta
  B.heroPLv = o.run && o.run.kind === 'nivel' ? Math.min(HERO_MAX, enemyLevel(o.run.k, o.run.i)) : Math.min(HERO_MAX, heroLv(myHero));   // nivel del héroe rival
  const ps = o.sim ? null : rivalAspecto(o), esta = B; CASTLE_SKIN.purple = null; if (castleImg.purple) castleImg.purple.state = undefined;
  SUB_TEMA_P = SUBSUELO.temas[ps] ? ps : 'piedra';
  if (ps && ps !== 'piedra' && ASPECTOS_POS[ps] && scene) skinTex(ps, () => { if (B !== esta) return; CASTLE_SKIN.purple = Object.assign({ id: ps }, ASPECTOS_POS[ps]); if (castleImg.purple) castleImg.purple.state = undefined; });
  if (!o.sim && scene) subTex(SUB_TEMA_P, () => { if (B === esta) drawScenery(scene); });
  if (sk && !CASTLE_SKIN.blue) skinTex(sk);
  if (castleImg.blue) castleImg.blue.state = undefined;   // se vuelve a pintar con su aspecto
  const real = !o.demo && !o.sim;
  B.buff = { blue: {}, purple: {} }; B.curse = null; B.spell = null; B.beast = null;
  if (real) {
    castles.blue.max = castles.blue.hp = Math.round(CASTLE_HP * (1 + 0.06 * defLv('muralla')));
    B.blue.towerK = 1 + 0.1 * defLv('torres'); B.blue.towerCd = 1 / (1 + 0.02 * defLv('atalaya'));
    const sp = myHechizo(); if (sp) B.spell = { id: sp, k: spK(sp), t: HECHIZOS[sp].t0 };
    const be = myBestia(); if (be) { const lv = beLv(be); B.beast = { id: be, lv, v: BESTIAS[be].v(lv), t: BESTIAS[be].t0 || BESTIAS[be].every || 0 }; if (be === 'basilisco') B.curse = { team: 'purple', k: B.beast.v }; }
  }
  if (BST) { scene.tweens.killTweensOf(BST); if (BST.sombra) BST.sombra.destroy(); BST.destroy(); BST = null; }
  colocaCripta();
  if (B.beast && !B.sim) beastTex(beastNames(B.beast.id), () => { if (B && B.beast && !BST) bestiaEnCampo(B.beast.id); });
  abilUI(true);
};
let BST = null, CRIPTA = null;
/* ---- la cripta: una sala de piedra bajo tu castillo, en el subsuelo, donde vive tu bestia ----
   Viene dibujada en el subsuelo de cada aspecto (la de la izquierda, con gemas de tu color); mientras se carga, una
   provisional hecha aquí, en el trozo de subsuelo que se ve: en vertical, entre el camino y el panel de cartas; en
   horizontal, en la esquina libre a la izquierda del panel. */
function criptaTex() {
  if (scene.textures.exists('cripta')) return;
  const CW = 640, CH = 520, cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
  const c = cv.getContext('2d'), O = '#1e2235', R = rng(11), r = (a, b) => a + R() * (b - a);
  const sala = g => { c.beginPath(); c.moveTo(70 - g, CH + 10); c.lineTo(70 - g, 250); c.ellipse(320, 250, 250 + g, 130 + g, 0, Math.PI, Math.PI * 2); c.lineTo(570 + g, CH + 10); c.closePath(); };
  const pozo = g => { c.beginPath(); c.rect(152 - g, -10, 64 + g * 2, 175); };   // la escalera que sube a tu castillo
  const union = (g, lw, fill) => { c.lineWidth = lw; c.strokeStyle = O; sala(g); c.stroke(); pozo(g); c.stroke(); c.fillStyle = fill; sala(g); c.fill(); pozo(g); c.fill(); };
  union(30, 12, '#8b8fa5');
  // juntas de los sillares: en la bóveda, radiales; en los muros y en el pozo, en hileras
  c.strokeStyle = 'rgba(30,34,53,.55)'; c.lineWidth = 4;
  for (let a = Math.PI + 0.12; a < Math.PI * 2 - 0.05; a += 0.2) { c.beginPath(); c.moveTo(320 + Math.cos(a) * 250, 250 + Math.sin(a) * 130); c.lineTo(320 + Math.cos(a) * 280, 250 + Math.sin(a) * 160); c.stroke(); }
  for (let y = 280, i = 0; y < CH; y += 46, i++) for (const x0 of [40, 570]) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + 30, y); c.stroke(); c.beginPath(); c.moveTo(x0 + (i % 2 ? 12 : 20), y); c.lineTo(x0 + (i % 2 ? 12 : 20), y + 46); c.stroke(); }
  for (let y = 18; y < 150; y += 34) for (const x0 of [122, 216]) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + 30, y); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.ellipse(320, 250, 268, 148, 0, Math.PI * 1.08, Math.PI * 1.4); c.ellipse(320, 250, 258, 138, 0, Math.PI * 1.4, Math.PI * 1.08, true); c.fill();
  // dentro: oscuro, con el muro del fondo y un brillo verde detrás de la bestia
  const gr = c.createLinearGradient(0, 120, 0, CH); gr.addColorStop(0, '#2e2947'); gr.addColorStop(1, '#1c1a2d');
  union(0, 10, gr);
  c.save(); sala(0); c.clip();
  c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = 3;
  for (let y = 140, i = 0; y < 440; y += 38, i++) { c.beginPath(); c.moveTo(60, y); c.lineTo(580, y); c.stroke(); for (let x = 60 + (i % 2) * 40; x < 580; x += 80) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 38); c.stroke(); } }
  const gl = c.createRadialGradient(320, 380, 10, 320, 380, 240); gl.addColorStop(0, 'rgba(110,230,130,.30)'); gl.addColorStop(1, 'rgba(110,230,130,0)'); c.fillStyle = gl; c.fillRect(0, 0, CW, CH);
  // cadenas que cuelgan de la bóveda
  for (const [x, n] of [[255, 6], [420, 4]]) for (let i = 0; i < n; i++) {
    const y = 132 + i * 22 + (x > 300 ? 8 : 0); c.beginPath(); if (i % 2) c.ellipse(x, y, 4, 11, 0, 0, Math.PI * 2); else c.ellipse(x, y, 9, 11, 0, 0, Math.PI * 2);
    c.lineWidth = 7; c.strokeStyle = O; c.stroke(); c.lineWidth = 3.5; c.strokeStyle = '#a3a9bf'; c.stroke();
  }
  // telarañas en las esquinas de la bóveda
  c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 2;
  for (const [x, y, d] of [[96, 196, 1], [544, 196, -1]]) { for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + d * (20 + k * 16), y - 60 + k * 20); c.stroke(); } for (const q of [18, 34]) { c.beginPath(); c.arc(x, y, q, d > 0 ? -1.4 : Math.PI + 0.3, d > 0 ? -0.3 : Math.PI + 1.4); c.stroke(); } }
  // suelo de losas
  c.fillStyle = '#6c6d85'; c.fillRect(0, 446, CW, CH); c.fillStyle = '#9a9cb3'; c.fillRect(0, 446, CW, 9);
  c.strokeStyle = O; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 446); c.lineTo(CW, 446); c.stroke();
  c.lineWidth = 4; c.strokeStyle = 'rgba(30,34,53,.6)'; for (let x = 100; x < CW; x += 92) { c.beginPath(); c.moveTo(x, 455); c.lineTo(x - 10, CH); c.stroke(); }
  c.beginPath(); c.moveTo(0, 488); c.lineTo(CW, 488); c.stroke();
  c.restore();
  // escalones del pozo
  c.save(); pozo(0); c.clip(); for (let y = 10; y < 165; y += 26) { c.fillStyle = '#4a4664'; c.fillRect(150, y, 70, 9); c.fillStyle = '#6f6a8f'; c.fillRect(150, y, 70, 3); } c.restore();
  // huesos y una calavera en el suelo
  const hueso = (x, y, l, a) => { c.save(); c.translate(x, y); c.rotate(a); for (const [e, col] of [[3, O], [0, '#efe6d2']]) { c.fillStyle = col; c.fillRect(-l / 2, -4 - e, l, 8 + e * 2); [[-l / 2, -5], [-l / 2, 5], [l / 2, -5], [l / 2, 5]].forEach(([a2, b2]) => { c.beginPath(); c.arc(a2, b2, 6 + e, 0, Math.PI * 2); c.fill(); }); } c.restore(); };
  hueso(130, 452, 40, -0.15); hueso(505, 455, 34, 0.3); hueso(530, 446, 30, -0.5);
  c.beginPath(); c.arc(112, 432, 17, 0, Math.PI * 2); c.fillStyle = '#efe6d2'; c.fill(); c.lineWidth = 5; c.strokeStyle = O; c.stroke();
  c.fillStyle = O; c.beginPath(); c.arc(106, 430, 4.5, 0, Math.PI * 2); c.arc(119, 430, 4.5, 0, Math.PI * 2); c.fill();
  // antorchas en los muros (la llama la pone la batalla)
  for (const x of [108, 532]) {
    c.lineWidth = 5; c.strokeStyle = O; c.fillStyle = '#7a5434'; c.beginPath(); c.rect(x - 7, 268, 14, 46); c.fill(); c.stroke();
    c.fillStyle = '#8f93a8'; c.beginPath(); c.moveTo(x - 16, 258); c.lineTo(x + 16, 258); c.lineTo(x + 10, 274); c.lineTo(x - 10, 274); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.rect(x - 12, 300, 24, 8); c.fill(); c.stroke();
  }
  scene.textures.addCanvas('cripta', cv);
}
const CRIPTA_TEX = { w: 640, h: 520, suelo: 450, antorchas: [[108, 256], [532, 256]] };
function colocaCripta() {
  if (CRIPTA) { CRIPTA.objs.forEach(o => o.destroy()); CRIPTA = null; }
  if (BST) { BST.setVisible(false); if (BST.sombra) BST.sombra.setVisible(false); }
  if (!scene || !cam || !B || !B.beast || B.sim || B.idle || $('hud').hidden || !$('menu').hidden) return;
  if (SUB_L) {   // la cripta dibujada en el subsuelo: la bestia, en el suelo de la tuya, a la izquierda de la escalera
    const { s, yi, Lx, T } = SUB_L, [x0, y0, x1, y1] = T.L.muro, base = (y1 - y0) * s * 0.72;
    CRIPTA = { objs: [], x: Lx + x0 * s, y: yi + y0 * s, w: (x1 - x0) * s, h: base / 0.47, s, antorchas: [] };
    if (BST) {
      BST.x0 = Lx + (x0 + (x1 - x0) * 0.42) * s; BST.y0 = yi + (y1 + 2) * s; BST.hh = base * BST.art.h;
      BST.minX = Lx + (x0 + (x1 - x0) * 0.24) * s; BST.maxX = Lx + (x0 + (x1 - x0) * 0.56) * s;   // se pasea por el suelo libre, sin subir la escalera
      BST.paseo = null; BST.setFlipX(false);
      BST.setPosition(BST.x0, BST.y0).setVisible(true); bestiaPose(BST.pose, BST.actT, true);
    }
    return;
  }
  criptaTex();
  const T = CRIPTA_TEX, gm = window.__game, z = cam.zoom, k = DPR / z;   // unidades del mundo por píxel css
  const left = cam.scrollX + cam.width / 2 - gm.scale.width / 2 / z, top = cam.scrollY + cam.height / 2 - gm.scale.height / 2 / z;
  const d = $('dock').getBoundingClientRect(), ih = window.innerHeight, ug = (SUB_Y - top) / k;
  const enBanda = d.top - ug, enEsquina = d.left >= 74 ? ih - ug : 0;
  const esquina = enEsquina > enBanda * 1.25, hCss = Math.max(64, Math.min(240, (esquina ? enEsquina : enBanda) * 0.94));
  const h = hCss * k, w = h * T.w / T.h, s = h / T.h;
  const cx = esquina ? left + d.left / 2 * k : Math.max(CASTLE_VX + 40, left + 12 * k + w / 2), y = SUB_Y - 6;
  const img = scene.add.image(cx, y, 'cripta').setOrigin(0.5, 0).setScale(s).setDepth(-28);
  CRIPTA = { objs: [img], x: cx - w / 2, y, w, h, s, antorchas: T.antorchas.map(([ax, ay]) => [cx - w / 2 + ax * s, y + ay * s]) };
  if (BST) {
    BST.x0 = cx + w * 0.02; BST.y0 = y + T.suelo * s; BST.hh = h * 0.47 * BST.art.h;
    BST.setPosition(BST.x0, BST.y0).setVisible(true); bestiaPose(BST.pose, BST.actT, true);
  }
}
function bestiaEnCampo(id) {
  const A = BEAST_ART[id];
  BST = scene.add.image(0, 0, 'bst_' + A.idle).setOrigin(0.5, 1).setDepth(-27).setVisible(false);
  BST.art = A; BST.pose = A.idle; BST.actT = 0; BST.tic = 2; BST.hh = 100; BST.k = 1; BST.paseoT = 2; BST.paseo = null;
  if (BST.sombra) BST.sombra.destroy();
  BST.sombra = scene.add.ellipse(0, 0, 10, 4, 0x000000, 0.28).setDepth(-27.5).setVisible(false);   // su sombra en el suelo de la cripta
  colocaCripta();
  scene.tweens.add({ targets: BST, alpha: { from: 0, to: 1 }, duration: 400 });
}
function bstRespira() {   // en reposo, respira (se estira un poco hacia arriba y vuelve)
  scene.tweens.killTweensOf(BST); BST.setScale(BST.k); if (!BST.paseo && BST.y0 !== undefined) BST.y = BST.y0;
  if (BST.alpha < 1) scene.tweens.add({ targets: BST, alpha: 1, duration: 300 });   // si se recolocó a medio aparecer, termina de aparecer
  scene.tweens.add({ targets: BST, scaleY: BST.k * 1.04, duration: 850, ease: 'Sine.inOut', yoyo: true, repeat: -1 });
}
function bestiaPose(n, t, quieta) {   // cambia de dibujo (con un pequeño salto) y vuelve al de reposo pasados t segundos
  if (!BST || !scene.textures.exists('bst_' + n)) return;
  if (BST.pose !== n || quieta) { BST.setTexture('bst_' + n); BST.k = BST.hh * (POSE_H[n] || 1) / BST.height; BST.pose = n; }
  BST.actT = t || 0;
  if (t) { BST.paseo = null; BST.setFlipX(false); BST.y = BST.y0; }
  if (quieta) return bstRespira();
  scene.tweens.killTweensOf(BST); BST.setAlpha(1);
  BST.setScale(BST.k * 1.12, BST.k * 0.92); scene.tweens.add({ targets: BST, scaleX: BST.k, scaleY: BST.k, duration: 260, ease: 'Back.out', onComplete: () => { if (BST) bstRespira(); } });
}
function criptaTick(dt) {   // llamas de las antorchas
  if (!CRIPTA) return;
  const q = CRIPTA.h / 300;
  for (const [x, y] of CRIPTA.antorchas) if (Math.random() < dt * 30) fx.push({ x: x + rand(-4, 4) * q, y: y + rand(-2, 4) * q, vx: rand(-8, 8) * q, vy: rand(-70, -40) * q, g: 0, r: rand(3.5, 6) * q, life: 0.35, t: 0.35, color: [0xff7a1a, 0xffc83d, 0xffe08a][(Math.random() * 3) | 0] });
}
function bstOnda(color, n = 1) {   // la bestia actúa: destello blanco, un salto y una onda de su color que se abre
  if (!BST || !BST.visible) return;
  const x = BST.x, y = BST.y - BST.displayHeight * 0.5, r = BST.displayHeight * 0.35;
  BST.setTintFill(0xffffff); scene.time.delayedCall(90, () => { if (BST) BST.clearTint(); });
  scene.tweens.add({ targets: BST, y: BST.y0 - BST.displayHeight * 0.12, duration: 150, ease: 'Quad.out', yoyo: true });
  for (let i = 0; i < n; i++) {
    const o = scene.add.circle(x, y, r, color, 0.18).setStrokeStyle(Math.max(2, r * 0.12), color, 0.9).setDepth(-26).setScale(0.4);
    scene.tweens.add({ targets: o, scale: 1.9, alpha: 0, duration: 650, delay: i * 160, ease: 'Cubic.out', onComplete: () => o.destroy() });
  }
  const q = CRIPTA ? CRIPTA.h / 300 : 1;
  for (let i = 0; i < 14; i++) { const a = Math.random() * Math.PI * 2, v = rand(60, 140) * q; fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30 * q, g: 0, r: rand(2.5, 5) * q, life: 0.6, t: 0.6, color }); }
}
function bstPasea(dt) {   // en reposo se pasea por la cripta a saltitos, se para, mira a un lado y a otro
  const S = BST, A = S.art; if (S.minX === undefined) return;
  if (S.sombra) S.sombra.setVisible(true).setPosition(S.x, S.y0 + 1).setSize(S.displayWidth * 0.6, S.displayWidth * 0.12);
  if (S.actT > 0 || (S.pose !== A.idle && S.pose !== A.ready)) return;
  if (S.paseo) {
    const d = S.paseo.to - S.x, st = Math.sign(d) * Math.min(Math.abs(d), S.paseo.v * dt); S.x += st; S.paseo.f += dt * 9;
    S.y = S.y0 - Math.abs(Math.sin(S.paseo.f)) * S.displayHeight * 0.06;
    if (Math.abs(d) < 1) { S.paseo = null; S.y = S.y0; S.paseoT = rand(1.8, 4.5); }
    return;
  }
  S.paseoT -= dt;
  if (S.paseoT <= 0) {
    if (Math.random() < 0.25) { S.setFlipX(!S.flipX); S.paseoT = rand(1, 2); return; }   // mira al otro lado
    const to = rand(S.minX, S.maxX); if (Math.abs(to - S.x) < (S.maxX - S.minX) * 0.15) { S.paseoT = 0.5; return; }
    S.setFlipX(to < S.x); S.paseo = { to, v: (S.maxX - S.minX) * 0.55, f: 0 };
  }
}
function bestiaTick(dt) {
  if (!BST || !B.beast || !BST.visible) return;
  bstPasea(dt);
  const id = B.beast.id, A = BST.art, q = CRIPTA ? CRIPTA.h / 300 : 1, listo = A.ready && B.beast.t <= A.readyAt;
  if (BST.actT > 0) { BST.actT -= dt; if (BST.actT <= 0) bestiaPose(listo ? A.ready : A.idle); return; }
  if (listo && BST.pose !== A.ready) bestiaPose(A.ready);   // el dragón se levanta con el fuego listo; el huargo se agazapa antes de mandar al lobo
  if (id === 'dragon' && BST.pose === A.ready && Math.random() < dt * 1.5) fx.push({ x: BST.x + BST.displayWidth * 0.3, y: BST.y - BST.displayHeight * 0.9, vx: rand(-10, 10) * q, vy: rand(-50, -30) * q, g: 0, r: rand(3, 6) * q, life: 0.9, t: 0.9, color: 0x9a9aa8 });
  BST.tic -= dt;
  if (id === 'basilisco' && BST.tic <= 0) {   // mirada: se levanta y los enemigos se ven envueltos en un brillo verde
    BST.tic = 7; bestiaPose(A.act, 1.6); bstOnda(0x8dff8a, 2);
    for (let i = 0; i < 10; i++) fx.push({ x: BST.x + BST.displayWidth * rand(0.2, 0.45), y: BST.y - BST.displayHeight * rand(0.5, 0.8), vx: rand(20, 90) * q, vy: rand(-60, -10) * q, g: 0, r: rand(2.5, 4.5) * q, life: 0.7, t: 0.7, color: 0x8dff8a });
    foesOf('blue').forEach(v => { for (let i = 0; i < 6; i++) fx.push({ x: v.x + rand(-20, 20), y: v.gy - rand(10, 90), vx: rand(-20, 20), vy: rand(-40, -10), g: 0, r: rand(3, 5), life: 0.9, t: 0.9, color: 0x5fcf6a }); });
  }
  if (id === 'grifo' && BST.tic <= 0) {   // se levanta a otear y vuelve a sentarse, o se sacude las alas
    BST.tic = rand(4, 7);
    if (BST.pose === A.idle && Math.random() < 0.5) bestiaPose(A.alt, rand(1.6, 2.6));
    else { BST.setScale(BST.k, BST.k * 0.88); scene.tweens.add({ targets: BST, scaleY: BST.k, duration: 220, ease: 'Back.out' }); }
  }
}
const _bsR = battleStep;
battleStep = function (dt) {
  _bsR(dt);
  if (!B || B.idle || B.over || paused) return;
  for (const t of ['blue', 'purple']) { const bf = B.buff[t]; if (bf.hasteT > 0) bf.hasteT -= dt; if (bf.slowT > 0) bf.slowT -= dt; }
  if (B.spell && B.spell.t > 0) B.spell.t -= dt;
  if (B.beast) {
    B.beast.t -= dt; bestiaTick(dt); criptaTick(dt);
    if (B.beast.id === 'huargo' && B.beast.t <= 0) {   // el huargo aúlla en la cripta y un lobo sale por la puerta del castillo
      B.beast.t = BESTIAS.huargo.every;
      const u = new Unit(scene, 'lobo', 'blue', FIELD_L); units.push(u); const [lv, r] = huargoPw(B.beast.lv); applyPromo(u, lv, r, teamBuffK('blue'));
      if (u.parts) u.parts.forEach(p => p.setTint(0xc4ccff));
      if (!B.auto) {
        burst(CASTLE_FRONT - H * 0.3, GROUND - 30, 0xc4ccff, 14, 220);
        if (BST && BST.visible) { floatText(BST.x, BST.y - BST.displayHeight * 1.1, '¡Auuu!', '#c4ccff'); bestiaPose('huargo_aullido', 1.3); bstOnda(0xc4ccff, 3); }
      }
    }
  }
};
// el botón del hechizo y el de la bestia (si su bestia tiene habilidad que se lanza)
function abilUI(reset) {
  const sb = $('ab-spell'), bb = $('ab-beast'); if (!sb) return;
  const real = B && !B.auto && !B.idle;
  const bid = real && B.beast && BST && BST.visible && (B.beast.id === 'dragon' || B.beast.id === 'huargo') ? B.beast.id : null;
  sb.hidden = !(real && B.spell); bb.hidden = !bid;
  if (!sb.hidden && sb.dataset.id !== B.spell.id) { const h = HECHIZOS[B.spell.id]; sb.dataset.id = B.spell.id; sb.style.setProperty('--c', h.c); sb.querySelector('.aico').innerHTML = '<img src="img/hechizos/' + B.spell.id + '.png" alt="">'; sb.setAttribute('aria-label', h.name); }
  if (!bb.hidden && bb.dataset.id !== bid) {
    const b = BESTIAS[bid]; bb.dataset.id = bid; bb.style.setProperty('--c', b.c); bb.classList.toggle('auto', bid !== 'dragon');
    bb.querySelector('.aico').innerHTML = '<img src="img/bestias/' + BEAST_ART[bid].port + '.png" alt="">'; bb.setAttribute('aria-label', b.name + (bid === 'dragon' ? ': aliento de fuego' : ': el próximo lobo'));
  }
  const one = (btn, t, cd, label) => { const ready = t <= 0; btn.disabled = !ready || B.over; btn.classList.toggle('ready', ready); btn.style.setProperty('--p', Math.max(0, Math.min(1, 1 - t / cd)).toFixed(3)); const txt = ready ? label : Math.ceil(t) + ' s'; if (btn.lastChild.textContent !== txt) btn.lastChild.textContent = txt; };
  if (!sb.hidden) one(sb, B.spell.t, HECHIZOS[B.spell.id].cd, '¡Hechizo!');
  if (!bb.hidden) { if (bid === 'dragon') one(bb, B.beast.t, BESTIAS.dragon.cd, '¡Fuego!'); else { one(bb, B.beast.t, BESTIAS.huargo.every, '¡Auuu!'); bb.disabled = true; } }
  colocaAbils();
}
// dónde van: en horizontal, en la esquina derecha junto al panel de cartas; en vertical, en el cielo encima de tu trono
function colocaAbils() {
  const ab = $('abils'), d = $('dock').getBoundingClientRect(), ih = window.innerHeight;
  // en horizontal, la esquina izquierda es para la cripta: los botones van a la derecha del panel
  if (d.left >= 74) { ab.style.top = ''; ab.style.left = 'auto'; ab.style.right = 'var(--sr)'; ab.style.bottom = (ih - d.bottom + 10) + 'px'; return; }
  ab.style.left = 'calc(var(--sl) + 66px)'; ab.style.right = '';   // a la derecha del círculo del héroe, que va sobre el trono
  const z = cam.zoom / DPR, y = (THRONE.y - 175 - cam.worldView.y) * z, top = $('hudtop').getBoundingClientRect().bottom + 8, hh = ab.offsetHeight || 130;
  const t = Math.max(top, y - hh);
  if (t + hh > d.top - 8) { ab.style.top = ''; ab.style.bottom = (ih - d.top + 10) + 'px'; } else { ab.style.bottom = ''; ab.style.top = t + 'px'; }
}
function w2css(x, y) { const z = cam.zoom / DPR; return [(x - cam.worldView.x) * z, (y - cam.worldView.y) * z]; }
function colocaAnillos() {
  if (!B || B.auto || B.idle || $('hud').hidden) return;
  const top = $('hudtop').getBoundingClientRect().bottom + 4, d = $('dock').getBoundingClientRect(), iw = window.innerWidth;
  const pon = (el, x, y, h) => {   // encima de (x, y) del mundo, sin salirse de la pantalla ni pisar el marcador
    const [cx, cy] = w2css(x, y), w = (el.offsetWidth || 48) / 2;
    el.style.left = Math.max(w + 2, Math.min(iw - w - 2, cx)) + 'px'; el.style.top = Math.max(top + h, cy) + 'px';
  };
  const hr = B.hero, he = $('hero');
  if (hr.state === 'field' && hr.unit && hr.unit.alive) { const u = hr.unit; pon(he, u.x, u.gy - H * (u.cfg.h || 1) * (u.bigK || 1) * 1.25 - 26, he.offsetHeight || 60); }
  else if (throneImg) pon(he, THRONE.x, THRONE.y - throneImg.displayHeight * 0.92 - 6, he.offsetHeight || 60);
  const bb = $('ab-beast');
  if (!bb.hidden && BST) pon(bb, BST.x, BST.y - BST.displayHeight - 4, bb.offsetHeight || 56);
}
const _playR = play;
play = function (team, idx) {
  const n = units.length, ok = _playR(team, idx);
  if (ok && team === 'blue' && BST && B.beast && B.beast.id === 'grifo' && units.length > n) {   // el grifo bate las alas y bendice a la que sale
    const u = units[units.length - 1]; burst(u.x, u.gy - H * 0.6, 0xffd36b, 12, 160);
    if (BST.visible) { bestiaPose(BST.art.act, 0.7); bstOnda(0xffd36b); }
  }
  return ok;
};
const _uiTickR = uiTick;
uiTick = function () { _uiTickR(); abilUI(false); };
$('ab-spell').onclick = () => { if (B && B.spell && B.spell.t <= 0 && !B.over && !paused) { lanzar(B.spell.id, 'blue', B.spell.k); B.spell.t = HECHIZOS[B.spell.id].cd; abilUI(); } };
$('ab-beast').onclick = () => { if (B && B.beast && B.beast.id === 'dragon' && B.beast.t <= 0 && !B.over && !paused) { alientoDragon('blue', B.beast.v); B.beast.t = BESTIAS.dragon.cd; abilUI(); } };

/* ---- efectos de los hechizos ---- */
const foesOf = team => units.filter(v => v.team !== team && v.alive && v.state !== 'die' && v.state !== 'spawn');
const alliesOf = team => units.filter(v => v.team === team && v.alive && v.state !== 'die');
function banner(txt, col) { if (!B.auto) floatText(W / 2, GROUND - H * 2.6, txt, col); }
function rayo(x, y) {
  const g = scene.add.graphics().setDepth(1500); let px = x + rand(-30, 30), py = y - 700;
  g.lineStyle(10, 0x7fb2ff, 0.5).beginPath().moveTo(px, py);
  const pts = []; for (let i = 0; i < 7; i++) { px = x + rand(-26, 26) * (1 - i / 7); py += (y - (y - 700)) / 7; pts.push([px, py]); }
  pts.forEach(p => g.lineTo(p[0], p[1])); g.strokePath();
  g.lineStyle(4, 0xffffff, 1).beginPath().moveTo(x, y - 700); pts.forEach(p => g.lineTo(p[0], p[1])); g.strokePath();
  scene.tweens.add({ targets: g, alpha: 0, duration: 380, ease: 'Quad.in', onComplete: () => g.destroy() });
  burst(x, y, 0xbfd8ff, 14, 240);
}
function lanzar(id, team, k = 1) {
  const h = HECHIZOS[id], dir = team === 'blue' ? 1 : -1;
  if (id === 'cuerno') { B.buff[team].hasteT = h.t; B.buff[team].haste = h.haste * k; alliesOf(team).forEach(u => burst(u.x, u.gy - H * 0.5, 0xffd36b, 8, 160)); banner('¡Cuerno de la victoria!', '#ffd36b'); }
  else if (id === 'luz') { alliesOf(team).forEach(u => { if (!u.isCastle) u.healBy(Math.round(u.max * h.heal * k)); }); banner('¡Luz sagrada!', '#7dffa0'); }
  else if (id === 'ventisca') {
    const o = team === 'blue' ? 'purple' : 'blue'; B.buff[o].slowT = h.t * k; B.buff[o].slow = h.slow;
    foesOf(team).forEach(u => { for (let i = 0; i < 6; i++) fx.push({ x: u.x + rand(-30, 30), y: u.gy - rand(20, 120), vx: rand(-60, -20) * dir, vy: rand(10, 40), g: 0, r: rand(2.5, 4.5), life: 1.2, t: 1.2, color: 0xe8f8ff }); });
    banner('¡Ventisca!', '#a8e8ff');
  } else if (id === 'rayos') {
    const tg = foesOf(team).sort((a, b) => (b.x - a.x) * -dir).slice(0, h.n);   // los más adelantados hacia tu castillo
    tg.forEach((u, i) => scene.time.delayedCall(i * 110, () => { if (!u.alive || u.state === 'die') return; rayo(u.x, u.gy - H * 0.3); u.damage(Math.round(h.dmg * k), null, u.x); if (u.stun) u.stun(h.stun); }));
    if (!tg.length) rayo(W / 2 + rand(-200, 200), GROUND);
    scene.cameras.main.flash(120, 200, 220, 255); banner('¡Tormenta de rayos!', '#bfd8ff');
  } else if (id === 'meteoro') {
    const fs = foesOf(team); let x = team === 'blue' ? W * 0.7 : W * 0.3, best = -1;
    for (const u of fs) { const n = fs.filter(v => Math.abs(v.x - u.x) <= h.r).length; if (n > best) { best = n; x = u.x; } }
    const m = scene.add.circle(x - dir * 400, GROUND - 900, 34, 0xff7a3a).setStrokeStyle(8, 0x1e2235).setDepth(1500);
    scene.tweens.add({ targets: m, x, y: GROUND - 20, duration: 650, ease: 'Quad.in', onComplete: () => {
      m.destroy(); burst(x, GROUND - 30, 0xff9a3a, 40, 380); burst(x, GROUND - 30, 0x3a3030, 20, 260); scene.cameras.main.shake(220, 0.008);
      if (!B || B.over) return;
      foesOf(team).filter(v => Math.abs(v.x - x) <= h.r).forEach(v => v.damage(Math.round(h.dmg * k), null, x));
      const c = castles[team === 'blue' ? 'purple' : 'blue']; if (c && Math.abs(c.x - x) <= h.r * 1.4) c.damage(Math.round(h.dmg * k * 0.6), null);
    } });
    banner('¡Meteoro!', '#ffb35a');
  }
}
function alientoDragon(team, dmg) {
  if (team === 'blue' && BST && BST.visible && BST.art === BEAST_ART.dragon) {   // ruge en la cripta y el fuego sale por la puerta del castillo
    bestiaPose('dragon_fuego', 1.3); bstOnda(0xff7a1a, 2);
    const q = CRIPTA.h / 300, mx = BST.x - BST.displayWidth / 2 + BST.displayWidth * BST.art.mouth[0], my = BST.y - BST.displayHeight + BST.displayHeight * BST.art.mouth[1];
    for (let i = 0; i < 24; i++) fx.push({ x: mx, y: my + rand(-4, 4) * q, vx: rand(220, 380) * q, vy: rand(-30, 30) * q, g: 0, r: rand(4, 8) * q, life: rand(0.25, 0.45), t: 0.45, color: [0xff7a1a, 0xffc83d, 0xff3a1a][i % 3] });
  }
  if (team === 'blue') for (let i = 0; i < 46; i++) fx.push({ x: CASTLE_FRONT - H * 0.3, y: GROUND - 45 + rand(-12, 12), vx: rand(700, 1100), vy: rand(-60, 60), g: 0, r: rand(6, 12), life: rand(0.35, 0.6), t: 0.6, color: [0xff7a1a, 0xffc83d, 0xff3a1a][i % 3] });
  const L = team === 'blue' ? FIELD_L : W / 2, R = team === 'blue' ? W / 2 : FIELD_R;
  for (let x = L; x < R; x += 38) for (let i = 0; i < 3; i++) fx.push({ x: x + rand(-15, 15), y: GROUND - rand(10, 150), vx: rand(-30, 30), vy: rand(-90, -30), g: -40, r: rand(5, 10), life: 0.8, t: 0.8, color: [0xff7a1a, 0xffc83d, 0xff3a1a][i] });
  foesOf(team).filter(v => v.x >= L && v.x <= R).forEach(v => v.damage(dmg, null, v.x));
  scene.cameras.main.shake(260, 0.006); banner('¡Aliento del dragón!', '#ff9a3a');
}

/* ---- enganches: pestaña Reino con aviso y perfil ---- */
const _phR = paintHub;
paintHub = function () {
  _phR();
  const d = document.querySelector('#nav [data-tab="hogar"] .ndot'); if (d) d.hidden = !(cuartelListo() > 0 || !Object.keys(perfil.bestias || {}).length);
};
// la taberna tiene su propia pantalla: también lleva su dibujo arriba
(() => { const tb = document.querySelector('#taberna .sheet-top'); if (tb) tb.insertAdjacentHTML('afterend', '<div class="bhead"><img class="bimg" src="img/reino/taberna.png" alt=""><p>Mercenarios llegados de otros mundos. Se pagan con oro.</p></div>'); })();
// al cambiar de color en las Murallas, el reino se repinta
const _pcR = paintColors;
paintColors = function () { _pcR(); if (EDIF === 'murallas' && !$('edif').hidden) reinoColor('img/reino/murallas.png', myColor(), url => { const im = document.querySelector('#ed-body .bimg'); if (im) im.src = url; }); };
// al arrancar, el aspecto elegido ya queda cargado para la primera batalla
const _loadedR = loaded;
loaded = function () { _loadedR(); skinTex(mySkin()); subTex(SUBSUELO.temas[mySkin()] ? mySkin() : 'piedra'); };
// la cripta se recoloca cada vez que la cámara cambia (al girar el móvil, al entrar en batalla…)
const _dsR = drawScenery;
drawScenery = function (sc) { _dsR(sc); colocaCripta(); };
window.__sub = () => { const gm = window.__game, z = cam.zoom, k = DPR / z; return { SUB_Y, k, left: cam.scrollX + cam.width / 2 - gm.scale.width / 2 / z, top: cam.scrollY + cam.height / 2 - gm.scale.height / 2 / z, vw: gm.scale.width / z, cripta: CRIPTA && { x: CRIPTA.x, y: CRIPTA.y, w: CRIPTA.w, h: CRIPTA.h }, tema: SUB_TEMA, capa: SUB_L && { s: SUB_L.s, yi: SUB_L.yi, Lx: SUB_L.Lx, Rx: SUB_L.Rx, esq: SUB_L.esq }, bst: BST && { x: BST.x, y: BST.y, h: BST.displayHeight, v: BST.visible } }; };
window.__B = () => B; window.__skin = () => CASTLE_SKIN.blue; window.__skinP = () => CASTLE_SKIN.purple && CASTLE_SKIN.purple.id; window.__openHogar = openHogar; window.__openEdif = openEdif; window.__lanzar = lanzar; window.__cuartel = () => cuSlots();
