
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
  cuerda: '<path d="M6 3c8 0 8 6 0 6s-8 6 0 6 8 6 0 6"/>',
  antorcha: '<path d="M10 22l1-11h2l1 11z"/><path d="M12 10c-3-2-2-6 0-8 0 3 3 3 2 6-1 2-2 2-2 2z"/>',
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
  { id: 'trono', name: 'El Trono', hit: [28, 1, 73, 38], lbl: [50, 40.6], txt: 'Tus héroes: quién te acompaña a la batalla y, más adelante, sus niveles y su equipo.' },
  { id: 'murallas', name: 'Murallas', hit: [20, 75, 80, 97], lbl: [50, 95.4], txt: 'El estandarte y el aspecto de tu castillo, y sus defensas: vida de la muralla y fuerza de las torres.' },
  { id: 'sanctum', name: 'Sanctum Arcano', hit: [71, 17, 97, 44], lbl: [80.4, 45.6], txt: 'Crea hechizos y elige uno para llevarlo a la batalla.' },
  { id: 'cripta', name: 'Cripta', hit: [2, 30, 38, 43.5], lbl: [20, 45.6], txt: 'Las bestias del reino. Elige una para que te acompañe en las batallas.' },
  { id: 'taberna', name: 'Taberna', hit: [1, 48, 32, 70], lbl: [16.6, 72.4], txt: 'Mercenarios de otros mundos. Se pagan con oro.' },
  { id: 'cuartel', name: 'Cuartel', hit: [66, 48, 99.5, 72.5], lbl: [84.2, 74.4], txt: 'Hasta tres unidades en entrenamiento intensivo: ganan copias de su carta con el tiempo.' },
  { id: 'consulado', name: 'Alto Consulado Bélico', hit: [34, 45, 65.5, 69], lbl: [49.6, 71.1], txt: 'Tu clan: miembros, donaciones y guerras de clanes.' },
];
const HOGAR_ART = 'img/reino/reino.jpg';
// cada lugar recortado del propio fondo (encaja al píxel): al tocarlo se ilumina su contorno y crece un poco
const SEL_POS = { trono: [20.81, 0.138, 59.024, 38.605], cripta: [1.289, 30.663, 36.832, 12.914], sanctum: [72.099, 17.127, 24.586, 26.381], consulado: [33.149, 45.442, 33.425, 23.757],
  cuartel: [66.022, 49.171, 33.61, 24.102], taberna: [0.276, 48.412, 32.413, 21.616], murallas: [20.718, 74.724, 58.748, 22.307] };
// los tejados, banderas y estandartes azules del dibujo se pintan del color de tu reino (el cielo y los contornos, no)
const reColURL = {};
function reinoColor(src, color, cb) {
  if (color === 'azul') return cb(src);
  const key = src + '@' + color; if (reColURL[key]) return cb(reColURL[key]);
  const img = new Image();
  img.onload = () => {
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0);
    const d = cx.getImageData(0, 0, cv.width, cv.height), p = d.data, hex = COLORES[color][1];
    const t = [1, 3, 5].map(k => parseInt(hex.slice(k, k + 2), 16) / 255), dark = Math.max(...t) < 0.25, light = Math.min(...t) > 0.85;
    for (let i = 0; i < p.length; i += 4) {
      if (p[i + 3] < 8) continue;
      const r = p[i] / 255, g = p[i + 1] / 255, b = p[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), dd = mx - mn + 1e-9;
      if ((mx - mn) / (mx + 1e-9) <= 0.4 || mx <= 0.3) continue;
      const h = (mx === r ? (((g - b) / dd) % 6 + 6) % 6 : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4) / 6;
      if (h < 0.59 || h > 0.7) continue;
      for (let k = 0; k < 3; k++) p[i + k] = 255 * Math.min(1, dark ? 0.1 + 0.13 * mx + t[k] * 0.3 : light ? t[k] * (0.55 + 0.42 * mx) : t[k] * mx);
    }
    cx.putImageData(d, 0, 0);
    cv.toBlob(bl => { reColURL[key] = URL.createObjectURL(bl); cb(reColURL[key]); }, src.endsWith('.jpg') ? 'image/jpeg' : 'image/png', 0.9);
  };
  img.onerror = () => cb(src); img.src = src;
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
  if (id === 'cuartel') return cuartelListo() > 0;
  if (id === 'cripta') return !Object.keys(perfil.bestias || {}).length;
  return false;
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
  ({ murallas, sanctum, trono, cripta, cuartel, consulado })[id]($('ed-in'));
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
const ASPECTOS = [['piedra', 'Castillo de piedra', true], ['obsidiana', 'Fortaleza de obsidiana'], ['marfil', 'Alcázar de marfil'], ['bosque', 'Bastión del bosque']];
function murallas(el) {
  el.innerHTML = '<h3>Defensas <small>solo en tu castillo; las del rival dependen de su reino</small></h3><div class="col full" id="mu-def"></div>'
    + '<h3>Aspecto del castillo</h3><div class="cards3">' + ASPECTOS.map(([id, n, own]) => '<div class="kcard' + (id === 'piedra' ? ' sel' : ' lock') + '"><header><b>' + n + '</b></header>' + (own ? '<span class="kind">En uso</span>' : '<span class="chip">Próximamente</span>') + '</div>').join('') + '</div>'
    + '<div id="mu-est"></div>';
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
    return '<div class="kcard' + (sel ? ' sel' : '') + (lv ? '' : ' lock') + '"><header><span class="kico" style="--c:' + h.c + '">' + svg(id) + '</span><div><b>' + h.name + '</b><small>' + (lv ? 'Nivel ' + lv + ' · recarga ' + h.cd + ' s' : 'Sin crear · recarga ' + h.cd + ' s') + '</small></div></header>'
      + '<p>' + h.txt(spK(id)) + '</p><div class="acts">'
      + (!lv ? '<button class="btn gold small" data-c="' + id + '">Crear · ' + costeHtml(h.crear) + '</button>'
        : (sel ? '<span class="kind">En batalla</span>' : '<button class="btn small" data-s="' + id + '">Llevar a la batalla</button>') + (lv < SP_MAX ? '<button class="btn gold small" data-u="' + id + '">Nv ' + (lv + 1) + ' · ' + oroBtn(spUp(id)) + '</button>' : '<span class="chip">Máx.</span>'))
      + '</div></div>';
  }).join('') + '</div>';
  el.querySelectorAll('[data-c]').forEach(b => { b.onclick = () => { const id = b.dataset.c; if (paga(HECHIZOS[id].crear)) { perfil.hechizos = perfil.hechizos || {}; perfil.hechizos[id] = 1; if (!myHechizo()) perfil.hechizo = id; savePerfil(); toast('Has creado ' + HECHIZOS[id].name + '.'); reEdif(); } }; });
  el.querySelectorAll('[data-s]').forEach(b => { b.onclick = () => { perfil.hechizo = b.dataset.s; savePerfil(); reEdif(); }; });
  el.querySelectorAll('[data-u]').forEach(b => { b.onclick = () => { const id = b.dataset.u; if (paga({ oro: spUp(id) })) { perfil.hechizos[id]++; savePerfil(); toast(HECHIZOS[id].name + ' sube a nivel ' + spLv(id) + '.'); reEdif(); } }; });
}

/* ---- El Trono: héroes ---- */
function trono(el) {
  const hs = heroesOwned();
  el.innerHTML = '<div class="hgrid">' + Object.entries(HEROES).map(([k, h]) => {
    const has = hs.includes(k), c = CH[k], q = KINGDOMS.find(z => z.ruler === k), sel = playerHero() === k;
    return '<div class="hcard' + (has ? '' : ' lock') + '"><header><img class="hport" src="img/' + h.portrait + '.png" alt=""><div><b>' + NAMES_H[k] + '</b><span class="note">' + (has ? (sel ? 'Tu héroe en batalla' : 'Disponible') : 'Conquista el ' + (q ? q.name : 'reino de su rey')) + '</span></div></header>'
      + '<div class="statrow"><span>Vida ' + c.hp + '</span><span>Daño ' + c.dmg[0] + '–' + c.dmg[1] + '</span><span>Salta a las ' + c.goal + ' bajas</span></div>'
      + '<p><em>Pasiva.</em> ' + HERO_TXT[k][0] + '</p><p><em>Activa.</em> ' + HERO_TXT[k][1] + '</p>'
      + (has && !sel ? '<button class="btn gold small" data-h="' + k + '">Llevar a la batalla</button>' : '') + '</div>';
  }).join('') + '</div><div class="infocard"><h3>Próximamente</h3><p>Niveles y rangos de los héroes, su equipo y sus talentos.</p></div>';
  el.querySelectorAll('[data-h]').forEach(b => { b.onclick = () => { myHero = b.dataset.h; try { localStorage.setItem('bg-hero', myHero); } catch (e) {} reEdif(); }; });
}

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
const huargoPw = lv => [1 + (lv - 1) * 8, Math.min(4, Math.floor((lv - 1) / 2))];
const BE_MAX = 10, beLv = id => (perfil.bestias || {})[id] || 0, beUp = id => Math.round(300 * Math.pow(beLv(id), 1.6) / 10) * 10, BE_PRECIO = 150;
const myBestia = () => beLv(perfil.bestia) ? perfil.bestia : null;
function cripta(el) {
  const first = !Object.keys(perfil.bestias || {}).length;
  el.innerHTML = (first ? '<div class="infocard"><h3>Elige tu primera bestia</h3><p>La primera es gratis. Las demás se pueden despertar con diamantes.</p></div>' : '') + '<div class="cards3">' + Object.entries(BESTIAS).map(([id, b]) => {
    const lv = beLv(id), sel = myBestia() === id;
    return '<div class="kcard' + (sel ? ' sel' : '') + (lv ? '' : ' lock') + '"><header><span class="kico" style="--c:' + b.c + '">' + svg(id) + '</span><div><b>' + b.name + '</b><small>' + (lv ? 'Nivel ' + lv : 'Dormida') + '</small></div></header>'
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
const _resetR = resetBattle;
resetBattle = function (o = {}) {
  _resetR(o);
  const real = !o.demo && !o.sim;
  B.buff = { blue: {}, purple: {} }; B.curse = null; B.spell = null; B.beast = null;
  if (real) {
    castles.blue.max = castles.blue.hp = Math.round(CASTLE_HP * (1 + 0.06 * defLv('muralla')));
    B.blue.towerK = 1 + 0.1 * defLv('torres'); B.blue.towerCd = 1 / (1 + 0.02 * defLv('atalaya'));
    const sp = myHechizo(); if (sp) B.spell = { id: sp, k: spK(sp), t: HECHIZOS[sp].t0 };
    const be = myBestia(); if (be) { const lv = beLv(be); B.beast = { id: be, lv, v: BESTIAS[be].v(lv), t: BESTIAS[be].t0 || BESTIAS[be].every || 0 }; if (be === 'basilisco') B.curse = { team: 'purple', k: B.beast.v }; }
  }
  abilUI(true);
};
const _bsR = battleStep;
battleStep = function (dt) {
  _bsR(dt);
  if (!B || B.idle || B.over || paused) return;
  for (const t of ['blue', 'purple']) { const bf = B.buff[t]; if (bf.hasteT > 0) bf.hasteT -= dt; if (bf.slowT > 0) bf.slowT -= dt; }
  if (B.spell && B.spell.t > 0) B.spell.t -= dt;
  if (B.beast) {
    B.beast.t -= dt;
    if (B.beast.id === 'huargo' && B.beast.t <= 0) {   // llega un lobo de la cripta
      B.beast.t = BESTIAS.huargo.every;
      const u = new Unit(scene, 'lobo', 'blue', FIELD_L); units.push(u); const [lv, r] = huargoPw(B.beast.lv); applyPromo(u, lv, r, teamBuffK('blue'));
      if (u.parts) u.parts.forEach(p => p.setTint(0xc4ccff));
      if (!B.auto) floatText(FIELD_L, GROUND - H * 1.6, '¡Auuu!', '#c4ccff');
    }
  }
};
// el botón del hechizo y el de la bestia (si su bestia tiene habilidad que se lanza)
function abilUI(reset) {
  const sb = $('ab-spell'), bb = $('ab-beast'); if (!sb) return;
  const real = B && !B.auto && !B.idle;
  sb.hidden = !(real && B.spell); bb.hidden = !(real && B.beast && B.beast.id === 'dragon');
  if (!sb.hidden && sb.dataset.id !== B.spell.id) { const h = HECHIZOS[B.spell.id]; sb.dataset.id = B.spell.id; sb.style.setProperty('--c', h.c); sb.querySelector('.aico').innerHTML = svg(B.spell.id); sb.setAttribute('aria-label', h.name); }
  if (!bb.hidden && bb.dataset.id !== 'dragon') { const b = BESTIAS.dragon; bb.dataset.id = 'dragon'; bb.style.setProperty('--c', b.c); bb.querySelector('.aico').innerHTML = svg('dragon'); bb.setAttribute('aria-label', b.name + ': aliento de fuego'); }
  const one = (btn, t, cd, label) => { const ready = t <= 0; btn.disabled = !ready || B.over; btn.classList.toggle('ready', ready); btn.style.setProperty('--p', Math.max(0, Math.min(1, 1 - t / cd)).toFixed(3)); const txt = ready ? label : Math.ceil(t) + ' s'; if (btn.lastChild.textContent !== txt) btn.lastChild.textContent = txt; };
  if (!sb.hidden) one(sb, B.spell.t, HECHIZOS[B.spell.id].cd, '¡Hechizo!');
  if (!bb.hidden) one(bb, B.beast.t, BESTIAS.dragon.cd, '¡Fuego!');
  const d = $('dock').getBoundingClientRect(); $('abils').style.bottom = (window.innerHeight - d.top + 10) + 'px';
}
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
window.__B = () => B; window.__openHogar = openHogar; window.__openEdif = openEdif; window.__lanzar = lanzar; window.__cuartel = () => cuSlots();
