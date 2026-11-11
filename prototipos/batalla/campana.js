
/* ==== Campaña: el señor de un reino pequeño conquista el mundo, reino a reino.
   Cada reino tiene 10 castillos: del 1 al 9 sus vasallos y el 10 el de su rey (o reina), que se une a ti al caer.
   Cada vasallo conquistado libera a un prisionero de sus mazmorras. El progreso se guarda en este navegador. ==== */
const STARTERS = ['legionario', 'arquera', 'tercio'];   // los guerreros originales de tu reino: Tulio, Ailin y Rodrigo
// niveles del Reino de las Praderas. deck: ejército del castillo rival; hp: vida de su castillo; aiK: ritmo de energía del rival;
// prize: prisionero que liberas la primera vez; hero: héroe en el trono rival (solo el castillo real).
// hp y aiK ajustados simulando: la IA que juega tu bando (con el ejército que tendrías al llegar) gana de ~90 % en el 1 a ~30 % en el 10
const PRADERAS = [
  { name: 'Granja del Camino', esc: 'cerezos', deck: ['legionario', 'arquera'], hp: 800, aiK: 0.77, gold: 60, prize: 'lobo' },
  { name: 'Torre del Cartel', esc: 'pinos', deck: ['legionario', 'arquera', 'tercio'], hp: 900, aiK: 1.16, gold: 70, prize: null },
  { name: 'Fortín del Molino', esc: 'otono', deck: ['legionario', 'tercio', 'lobo', 'arquera'], hp: 1000, aiK: 1.3, gold: 80, prize: 'valkiria' },
  { name: 'Torre del Pozo', esc: 'cerezos', deck: ['legionario', 'arquera', 'lobo', 'valkiria'], hp: 1100, aiK: 1.5, gold: 90, prize: null },
  { name: 'Granja Fortificada', esc: 'oasis', deck: ['tercio', 'lobo', 'valkiria', 'ninja', 'arquera'], hp: 1200, aiK: 1.89, gold: 100, prize: 'ninja' },
  { name: 'Castillo del Lago', esc: 'pinos', deck: ['legionario', 'arquera', 'ninja', 'samurai', 'tercio'], hp: 1300, aiK: 1.4, gold: 110, prize: 'samurai' },
  { name: 'Bastión del Otoño', esc: 'otono', deck: ['lobo', 'valkiria', 'samurai', 'acorazado', 'arquera', 'ninja'], hp: 1400, aiK: 1.25, gold: 120, prize: null },
  { name: 'Atalaya del Alba', esc: 'oasis', deck: ['legionario', 'fraile', 'acorazado', 'samurai', 'arquera', 'valkiria'], hp: 1500, aiK: 1.28, gold: 130, prize: 'fraile' },
  { name: 'Muralla de los Pinos', esc: 'pinos', deck: ['acorazado', 'fraile', 'samurai', 'ninja', 'pistolero', 'arquera', 'valkiria', 'tercio'], hp: 1600, aiK: 1.67, gold: 140, prize: 'acorazado' },
  { name: 'Castillo Real de las Praderas', esc: 'cerezos', deck: ['valkiria', 'samurai', 'acorazado', 'fraile', 'pistolero', 'catapulta', 'ninja', 'arquera'], hp: 2200, aiK: 1.12, gold: 300, prize: null, hero: 'lyra', royal: true },
];
// reinos 2 a 6: castillos con nombre propio y ejércitos que crecen. Provisional: su dificultad aún no está ajustada con simulaciones
const ESCENAS = ['cerezos', 'otono', 'oasis', 'pinos'];
const FUERZA = ['legionario', 'honderillo', 'ivo', 'kubi', 'rufo', 'arquera', 'tercio', 'lobo', 'valkiria', 'rhea', 'odo', 'torque', 'nivea', 'ninja', 'samurai', 'anubek', 'fraile', 'acorazado', 'pistolero', 'morgana', 'tormund', 'grises', 'catapulta', 'kungfu', 'muerte', 'abaddon', 'aurelion', 'kaiju', 'desencadenado'];
function genReino(n, nombres, premios, rey) {
  // n: orden del reino (2 = Bosque … 6 = Volcán). premios: { nivel: unidad } prisioneros que liberas
  return nombres.map((name, i) => {
    const royal = i === 9, top = Math.min(FUERZA.length, 6 + n + Math.floor(i / 2)), pool = FUERZA.slice(Math.max(0, top - 9), top);
    const deck = []; for (let k = 0; deck.length < Math.min(8, 4 + Math.floor((i + n) / 2)) && k < 60; k++) { const u = pool[(k * 5 + i * 3 + n) % pool.length]; if (!deck.includes(u)) deck.push(u); }
    if (royal && n >= 5) deck[deck.length - 1] = n === 6 ? 'imparable' : 'centinela';
    return { name, esc: ESCENAS[(i * 3 + n * 7) % ESCENAS.length], deck, hp: royal ? 2200 + Math.min(300 * (n - 1), 1500 + 120 * (n - 6)) : 1300 + Math.min(120 * n, 720 + 40 * n) + 80 * i, aiK: +(royal ? 1.1 + 0.05 * n : 1 + 0.04 * n + 0.03 * i).toFixed(2),
      gold: royal ? 300 + 100 * (n - 1) : 80 + 30 * n + 10 * i, prize: premios[i] || null, hero: royal ? rey : undefined, royal: royal || undefined };
  });
}
const BOSQUE = genReino(2, ['Claro del Leñador', 'Torre del Musgo', 'Puente de Troncos', 'Cabaña del Cazador', 'Fortín de las Setas', 'Atalaya del Roble', 'Empalizada del Arroyo', 'Bastión de los Helechos', 'Muralla del Jabalí', 'Castillo Real del Bosque'], { 2: 'pistolero', 6: 'catapulta' }, 'gull');
const DESIERTO = genReino(3, ['Oasis de las Palmas', 'Torre de Arena', 'Fortín de las Dunas', 'Pozo del Caravanero', 'Atalaya del Sol', 'Bastión de Adobe', 'Puerta del Cañón', 'Fuerte del Escorpión', 'Muralla Dorada', 'Palacio Real del Desierto'], { 4: 'kungfu' }, null);
const NIEVE = genReino(4, ['Refugio del Pino', 'Torre de Escarcha', 'Fortín del Glaciar', 'Lago Helado', 'Atalaya de Cristal', 'Paso de la Ventisca', 'Bastión Blanco', 'Fuerte de la Aurora', 'Muralla de Hielo', 'Castillo Real de las Nieves'], { 5: 'muerte' }, null);
const PANTANO = genReino(5, ['Embarcadero Hundido', 'Torre del Lodo', 'Fortín de los Juncos', 'Ciénaga Brumosa', 'Atalaya del Sauce', 'Isla de las Ranas', 'Bastión del Musgo', 'Fuerte de la Niebla', 'Muralla Podrida', 'Castillo Real del Pantano'], { 6: 'desencadenado' }, null);
const VOLCAN = genReino(6, ['Paso de la Ceniza', 'Torre de Basalto', 'Fortín del Azufre', 'Río de Lava', 'Atalaya del Cráter', 'Forja Ardiente', 'Bastión de Obsidiana', 'Fuerte del Humo', 'Muralla de Fuego', 'Fortaleza Real del Volcán'], {}, null);
// de momento todos los reinos y castillos están abiertos para poder recorrer los mapas (poner a false para jugar en orden)
const CAMPANA_ABIERTA = true;
// MUNDO 2: siete reinos al otro lado del mar (de abajo arriba). Ejércitos de nivel más alto; dificultad provisional
const PLAYA = genReino(7, ['Muelle de las Conchas', 'Torre del Coral', 'Fortín de la Marea', 'Cala de las Perlas', 'Atalaya del Faro', 'Bastión de Arena', 'Puerto de las Gaviotas', 'Fuerte del Arrecife', 'Muralla de Nácar', 'Palacio Real de la Playa'], {}, null);
const SETAS = genReino(8, ['Claro de los Hongos', 'Torre del Champiñón', 'Fortín de las Esporas', 'Prado del Musgo', 'Atalaya del Helecho', 'Bastión del Sombrerillo', 'Puente de Raíces', 'Fuerte de la Seta Roja', 'Muralla del Moho', 'Castillo Real de las Setas'], {}, null);
const HUESOS = genReino(9, ['Paso del Colmillo', 'Torre de Costillas', 'Fortín del Cráneo', 'Barranco Rojo', 'Atalaya de Arenisca', 'Bastión del Fósil', 'Puerta de las Vértebras', 'Fuerte del Dragón Muerto', 'Muralla de Hueso', 'Fortaleza Real de los Huesos'], {}, null);
const ENGRANAJES = genReino(10, ['Taller del Vapor', 'Torre del Engranaje', 'Fortín de las Tuberías', 'Fundición de Latón', 'Atalaya del Reloj', 'Bastión de Remaches', 'Puente de Cadenas', 'Fuerte de la Caldera', 'Muralla de Acero', 'Ciudadela Real de los Engranajes'], {}, null);
const CRISTAL = genReino(11, ['Mina de Amatista', 'Torre del Cuarzo', 'Fortín del Prisma', 'Cascada Violeta', 'Atalaya de la Geoda', 'Bastión Reluciente', 'Paso del Brillo', 'Fuerte de la Gema', 'Muralla de Cristal', 'Castillo Real de Cristal'], {}, null);
const CEMENTERIO = genReino(12, ['Verja Oxidada', 'Torre de las Lápidas', 'Fortín del Fuego Fatuo', 'Cripta Olvidada', 'Atalaya del Cuervo', 'Bastión de las Ánimas', 'Arco de la Niebla', 'Fuerte del Sepulturero', 'Muralla del Silencio', 'Castillo Real del Cementerio'], {}, null);
const CIELO = genReino(13, ['Escalera de Nubes', 'Torre del Viento', 'Fortín de las Cascadas', 'Isla Flotante', 'Atalaya del Sol', 'Bastión Dorado', 'Arco Celeste', 'Fuerte del Trueno', 'Muralla de Oro', 'Palacio Real del Cielo'], {}, null);
// mapa del mundo (de abajo arriba). pos en % del mapa (ancho, alto). art: imagen del mapa cuando llegue (si no, se dibuja uno provisional)
const KINGDOMS = [
  { id: 'hogar', name: 'Tu reino', pos: [50, 89.8], biome: '#7fcf6a', home: true },
  { id: 'praderas', name: 'Reino de las Praderas', ruler: 'lyra', pos: [50, 73.6], biome: '#a6dd5c', color: ['morado', 'rojo'], emb: 'pluma', levels: PRADERAS },
  { id: 'bosque', name: 'Reino del Bosque', ruler: 'gull', pos: [50, 58.6], biome: '#3f8f55', color: ['verde', 'naranja'], emb: 'jabali', levels: BOSQUE },
  { id: 'desierto', name: 'Reino del Desierto', pos: [50, 44.9], biome: '#efc66a', color: ['dorado', 'morado'], emb: 'sol', levels: DESIERTO },
  { id: 'nieve', name: 'Reino de las Nieves', pos: [50, 33.2], biome: '#d6ecf7', color: ['blanco', 'azul'], emb: 'copo', levels: NIEVE },
  { id: 'pantano', name: 'Reino del Pantano', pos: [50, 20.8], biome: '#7f9a62', color: ['negro', 'verde'], emb: 'cobra', levels: PANTANO },
  { id: 'volcan', name: 'Reino del Volcán', pos: [50, 9.8], biome: '#d9603a', color: ['rojo', 'negro'], emb: 'dragon', levels: VOLCAN },
  { id: 'playa', world: 2, name: 'Reino de la Playa', pos: [44, 86], biome: '#f3dfa8', color: ['rosa', 'morado'], emb: 'ancla', levels: PLAYA },
  { id: 'setas', world: 2, name: 'Reino de las Setas', pos: [50, 70.5], biome: '#7fcf6a', color: ['rojo', 'naranja'], emb: 'flor', levels: SETAS },
  { id: 'huesos', world: 2, name: 'Reino de los Huesos', pos: [52, 56.5], biome: '#d9713a', color: ['naranja', 'negro'], emb: 'calavera', levels: HUESOS },
  { id: 'engranajes', world: 2, name: 'Reino de los Engranajes', pos: [52, 42.5], biome: '#8a90b8', color: ['dorado', 'azul'], emb: 'yunque', levels: ENGRANAJES },
  { id: 'cristal', world: 2, name: 'Reino de Cristal', pos: [52, 31], biome: '#a76ad9', color: ['morado', 'rosa'], emb: 'copo', levels: CRISTAL },
  { id: 'cementerio', world: 2, name: 'Reino del Cementerio', pos: [54, 19.5], biome: '#4b4d75', color: ['negro', 'verde'], emb: 'buho', levels: CEMENTERIO },
  { id: 'cielo', world: 2, name: 'Reino del Cielo', pos: [53, 7.5], biome: '#f2d36a', color: ['blanco', 'dorado'], emb: 'sol', levels: CIELO },
];
KINGDOMS.forEach(k => { k.world = k.world || 1; });
const WORLDS = { 1: { name: 'Mundo 1', art: 'img/campana/mapa_mundo.jpg', castles: true }, 2: { name: 'Mundo 2', art: 'img/campana/mapa_mundo2_b.jpg', castles: false } };
let curWorld = 1;
// mapas pintados (herramientas/campana/preparar.py). El mapamundi trae los castillos de cada reino dibujados;
// los mapas de reino comparten el mismo camino con 10 claros y una colina arriba
const MAP_ART = { mundo: 'img/campana/mapa_mundo.jpg' };
for (const k of ['hogar', 'praderas', 'bosque', 'desierto', 'nieve', 'pantano', 'volcan', 'playa', 'setas', 'huesos', 'engranajes', 'cristal', 'cementerio', 'cielo']) MAP_ART[k] = 'img/campana/mapa_' + k + '.jpg';
// iconos de castillo del mapa (texturas con banderas moradas que se repintan del color de su dueño).
// Mientras no lleguen los dibujos se usan los castillos de batalla; tu castillo de origen es el azul.
const ICON = { vasallo: 'cas_piedra', real: 'cas_piedra', casa: 'cas_piedra' };
// castillos dibujados de cada reino para su mapa (img/campana/icono_<reino>_<vasallo|real>.png); banners = estandartes donde va el emblema
const ICONOS = __ICONOS__;
const iconFor = (kid, royal) => { const k = 'icono_' + kid + '_' + (royal ? 'real' : 'vasallo'); return ICONOS[k] ? k : royal ? ICON.real : ICON.vasallo; };
// posiciones de los 10 castillos en el mapa del reino (% ancho, % alto), de abajo arriba por el camino
const LV_POS = [[74.1, 85.7], [42, 80.4], [27.2, 68.6], [57.7, 64.6], [69.8, 53.3], [39, 49.6], [28.3, 37.8], [59.7, 34.2], [59.4, 21.2], [48.4, 9.9]];
const CAMP_POS = [52.6, 96];   // primer claro del camino: el campamento de tu ejército
const KD = id => KINGDOMS.find(k => k.id === id);

/* ---- colores: el jugador elige el de su reino; cada reino rival tiene el suyo (y otro de reserva si coinciden) ---- */
const COLORES = { azul: ['Azul', '#3b82f6'], rojo: ['Rojo', '#dc3232'], negro: ['Negro', '#2b2b33'], verde: ['Verde', '#2faa52'], dorado: ['Dorado', '#f2b41e'],
  rosa: ['Rosa', '#ec5aa8'], naranja: ['Naranja', '#f2781e'], blanco: ['Blanco', '#eef0f5'], morado: ['Morado', '#8b5cf6'] };
// tono de las banderas en cada dibujo original (fracción del círculo de color): azul en lo del jugador, morado en lo del rival
const SRC_HUE = { torre_: [0.53, 0.70, 'azul'], cas_: [0.58, 0.69, 'azul', 0.72, 0.62], icono_: [0.70, 0.86, 'morado'], flecha_azul: [0.53, 0.70, 'azul'], flecha_morada: [0.70, 0.86, 'morado'] };
// emblemas para el estandarte (img/emb) y dónde está el estandarte grande de cada castillo (fracciones: x, y, ancho, alto)
const EMBLEMAS = ['leon', 'aguila', 'ciervo', 'jabali', 'dragon', 'lobo', 'zarpa', 'pluma', 'corona', 'espadas', 'martillo', 'torre', 'arbol', 'lis', 'sol', 'luna',
  'buho', 'caballo', 'cobra', 'carnero', 'hacha', 'arco', 'llave', 'ancla', 'caliz', 'reloj', 'calavera', 'yunque', 'flor', 'copo', 'llama', 'montanas'];
const BANNERS = {};   // dónde va el emblema en cada castillo (los pone reino.js con sus aspectos)
const bannersOf = base => BANNERS[base] ? [BANNERS[base]] : ICONOS[base] ? ICONOS[base].banners : [];
function recolorImage(img, [h0, h1, , s0 = 0.35, v0 = 0.2], hex, base, emb) {
  // cambia solo los píxeles del tono de las banderas, conservando sus luces y sombras
  const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
  const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0);
  const d = cx.getImageData(0, 0, cv.width, cv.height), p = d.data, idx = [], vals = [];
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3] === 0) continue;
    const r = p[i] / 255, g = p[i + 1] / 255, b = p[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), dd = mx - mn + 1e-9;
    if ((mx - mn) / (mx + 1e-9) <= s0 || mx <= v0) continue;
    const h = (mx === r ? (((g - b) / dd) % 6 + 6) % 6 : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4) / 6;
    if (h >= h0 && h <= h1) { idx.push(i); vals.push(mx); }
  }
  const ref = vals.slice().sort((a, b) => a - b)[Math.floor(vals.length * 0.75)] || 1;
  const t = [1, 3, 5].map(k => parseInt(hex.slice(k, k + 2), 16) / 255), dark = Math.max(...t) < 0.25, light = Math.min(...t) > 0.85;
  idx.forEach((i, n) => {
    const l = vals[n] / ref;
    for (let k = 0; k < 3; k++) p[i + k] = 255 * Math.min(1, dark ? 0.1 + 0.13 * l + t[k] * 0.3 : light ? t[k] * (0.55 + 0.42 * l) : t[k] * l);
  });
  cx.putImageData(d, 0, 0);
  for (const bn of bannersOf(base)) if (emb && scene.textures.exists('emb_' + emb)) {   // el emblema, centrado en la parte alta del estandarte grande
    const e = scene.textures.get('emb_' + emb).getSourceImage(), w = bn[2] * cv.width * 1.15, x = (bn[0] + bn[2] / 2) * cv.width - w / 2, y = (bn[1] + bn[3] * 0.4) * cv.height - w / 2;
    cx.drawImage(e, x, y, w, w);
  }
  return cv;
}
function colorTex(base, color, emb) {
  // textura de un castillo o una flecha con las banderas del color pedido y su emblema (se crea una vez y se reutiliza)
  const fam = Object.keys(SRC_HUE).find(f => base.startsWith(f)); if (!fam || !color || !scene) return base;
  emb = bannersOf(base).length && EMBLEMAS.includes(emb) ? emb : '';
  if (SRC_HUE[fam][2] === color && !emb) return base;
  const key = base + '@' + color + (emb ? '#' + emb : ''); if (scene.textures.exists(key)) return key;
  scene.textures.addCanvas(key, recolorImage(scene.textures.get(base).getSourceImage(), SRC_HUE[fam], COLORES[color][1], base, emb)); return key;
}
const colorURLs = {};
function colorURL(base, color, emb) {
  const key = colorTex(base, color, emb); if (key === base) return base.startsWith('cas_') ? 'img/castillos/' + base.slice(4) + '.png' : (base.startsWith('icono_') ? 'img/campana/' : 'img/esc/') + base + '.png';
  return colorURLs[key] || (colorURLs[key] = scene.textures.get(key).getSourceImage().toDataURL());
}
let TEAM_COLOR = { blue: 'azul', purple: 'morado' }, TEAM_EMB = { blue: '', purple: '' };
const myColor = () => COLORES[perfil.color] ? perfil.color : 'azul';
const myEmb = () => EMBLEMAS.includes(perfil.emblema) ? perfil.emblema : '';
const rivalEmb = kid => { const k = kid && KD(kid); return k && k.emb || 'calavera'; };
function rivalColor(kid) { const k = kid && KD(kid), [c1, c2] = k && k.color ? k.color : ['morado', 'rojo']; return c1 === myColor() ? c2 : c1; }
function battleColors(run) { const k = run && run.kind === 'nivel' ? run.k : null; return { blue: myColor(), purple: rivalColor(k), embBlue: myEmb(), embPurple: rivalEmb(k) }; }
function applyColors(cols) {
  TEAM_COLOR = { blue: cols.blue, purple: cols.purple }; TEAM_EMB = { blue: cols.embBlue || '', purple: cols.embPurple || '' };
  // en las barras de vida, el negro se aclara un poco para que se vea sobre el fondo oscuro
  const ui = k => k === 'negro' ? '#6b6f80' : COLORES[k][1];
  BLUE = Phaser.Display.Color.HexStringToColor(ui(cols.blue)).color; PURPLE = Phaser.Display.Color.HexStringToColor(ui(cols.purple)).color;
  document.documentElement.style.setProperty('--blue', ui(cols.blue)); document.documentElement.style.setProperty('--purple', ui(cols.purple));
  for (const t of ['blue', 'purple']) if (castleImg[t]) { castleImg[t].state = undefined; }   // el castillo se vuelve a pintar con su color
}

/* ---- tributo: cada castillo conquistado te paga oro por hora (hasta 12 horas guardadas); más estrellas, más tributo ---- */
const TRIB = { cap: 12, starK: [0, 1, 1.25, 1.5] };
const tribBase = (kid, i) => KD(kid).levels[i].royal ? 40 : 10 + i;
const tribRate = (kid, i) => Math.round(tribBase(kid, i) * TRIB.starK[starsOf(kid)[i]]);
const tribOf = kid => perfil.trib[kid] || (perfil.trib[kid] = Array(10).fill(0));
function tribPending(kid, i) {
  if (!(starsOf(kid)[i] > 0)) return 0;
  const t0 = tribOf(kid)[i] || (tribOf(kid)[i] = Date.now()), h = Math.min(TRIB.cap, Math.max(0, (Date.now() - t0) / 3.6e6));
  return Math.floor(h * tribRate(kid, i));
}
const tribFull = (kid, i) => starsOf(kid)[i] > 0 && Date.now() - (tribOf(kid)[i] || Date.now()) >= TRIB.cap * 3.6e6;
function tribKingdom(kid) { const k = KD(kid); return k.levels ? k.levels.reduce((s, _, i) => s + tribPending(kid, i), 0) : 0; }
function collect(kid, list, fromEl) {
  let got = 0; const now = Date.now();
  for (const i of list) { const p = tribPending(kid, i); if (p > 0) { got += p; tribOf(kid)[i] = now; } }
  if (!got) return 0;
  perfil.gold += got; savePerfil(); coinFly(fromEl, got);
  return got;
}
function coinFly(fromEl, amount) {
  // monedas que vuelan hasta tu oro
  const to = [...document.querySelectorAll('.oro')].find(e => e.offsetParent), a = fromEl && fromEl.getBoundingClientRect(), b = to && to.getBoundingClientRect();
  if (!a || !b) return paintGold();
  const n = Math.min(10, 3 + Math.floor(amount / 40));
  for (let k = 0; k < n; k++) {
    const c = document.createElement('i'); c.className = 'coinfly'; document.body.appendChild(c);
    c.style.left = (a.left + a.width / 2 - 11 + (Math.random() - 0.5) * 30) + 'px'; c.style.top = (a.top + a.height / 2 - 11 + (Math.random() - 0.5) * 20) + 'px';
    c.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(' + (b.left + 12 - a.left - a.width / 2) + 'px,' + (b.top + 10 - a.top - a.height / 2) + 'px) scale(.6)' }],
      { duration: 650 + k * 60, delay: k * 50, easing: 'cubic-bezier(.5,-0.3,.7,1)', fill: 'forwards' }).onfinish = () => c.remove();
  }
  setTimeout(() => { paintGold(); if (to) to.animate([{ transform: 'scale(1.25)' }, { transform: 'none' }], { duration: 250 }); }, 650 + n * 60);
}

/* ---- perfil del jugador ---- */
const PERFIL_KEY = 'bg-perfil';
function newPerfil() { return { v: 1, owned: STARTERS.slice(), heroes: ['aldric'], gold: 0, stars: {}, trib: {}, color: 'azul', all: false, pending: null }; }
let perfil = (() => { try { const p = JSON.parse(localStorage.getItem(PERFIL_KEY) || 'null'); if (p && p.v === 1 && Array.isArray(p.owned)) return Object.assign(newPerfil(), p); } catch (e) {} return newPerfil(); })();
function savePerfil() { try { localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil)); } catch (e) {} }
const owned = () => perfil.all ? ALL.slice() : ALL.filter(k => perfil.owned.includes(k));
const heroesOwned = () => Object.keys(HEROES).filter(h => perfil.all || perfil.heroes.includes(h));
const starsOf = kid => perfil.stars[kid] || (perfil.stars[kid] = Array(10).fill(0));
const kingdomDone = kid => { const k = KD(kid); return !!(k.home || (k.levels && starsOf(kid)[9] > 0)); };
const levelOpen = (kid, i) => perfil.all || CAMPANA_ABIERTA || i === 0 || starsOf(kid)[i - 1] > 0;
function kingdomState(i) {   // 'home' | 'done' | 'open' | 'soon' (sin niveles aún) | 'locked'
  const k = KINGDOMS[i];
  if (k.home) return 'home';
  if (k.levels && kingdomDone(k.id)) return 'done';
  const prevDone = kingdomDone(KINGDOMS[i - 1].id);
  if (!prevDone && !perfil.all && !CAMPANA_ABIERTA) return 'locked';
  return k.levels ? 'open' : 'soon';
}
function prizeWhere(unit) {   // dónde se libera una unidad que aún no tienes
  for (const k of KINGDOMS) if (k.levels) { const i = k.levels.findIndex(l => l.prize === unit); if (i >= 0) return k.levels[i].name + ' (' + k.name + ')'; }
  return null;
}
function playerDeck() {
  const own = owned(), d = myDeck.filter(k => own.includes(k));
  for (const k of own) if (d.length < Math.min(8, own.length) && !d.includes(k)) d.push(k);
  return d.slice(0, 8);
}
const playerHero = () => heroesOwned().includes(myHero) ? myHero : 'aldric';
function paintGold() {
  document.querySelectorAll('.oro-n').forEach(e => { e.textContent = perfil.gold; });
  const all = KINGDOMS.reduce((s, k) => s + tribKingdom(k.id), 0), bd = $('m-badge');
  if (bd) { bd.hidden = all < 1; bd.textContent = '+' + all; }
}
let toastT = 0;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.hidden = false; t.classList.remove('in'); void t.offsetWidth; t.classList.add('in'); clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600); }

/* ---- empezar una batalla: nivel de campaña o batalla rápida ---- */
let RUN = null, deckFrom = 'menu';
function useScene(name, cb) {
  // cambia el escenario sin tocar el que eliges para la batalla rápida
  const go = () => { escena = name; drawScenery(scene); cb(); };
  if (scene.textures.exists(name)) return go();
  scene.load.image(name, 'img/esc/' + name + '.jpg'); scene.load.once('complete', go); scene.load.start();
}
function levelOpts(kid, i) { const lv = KD(kid).levels[i]; return { enemyDeck: lv.deck, enemyHp: lv.hp, aiK: lv.aiK, heroP: lv.hero || null }; }
function startRun(run) {
  RUN = run;
  const begin = () => {
    show(null); timeScale = 1; $('speed').textContent = 'x1'; $('speed').setAttribute('aria-pressed', 'false');
    const base = { run, deck: playerDeck(), hero: playerHero(), colors: battleColors(run) };
    resetBattle(run.kind === 'nivel' ? Object.assign(base, levelOpts(run.k, run.i)) : Object.assign(base, { enemyDeck: aiDeck(owned()) }));
    coachStart();
  };
  if (run.kind === 'nivel') useScene(KD(run.k).levels[run.i].esc, begin);
  else { let pref = escena; try { pref = localStorage.getItem('bg-escena') || escena; } catch (e) {} useScene(ESC[pref] ? pref : escena, begin); }
}
function leaveRun() {   // volver al mapa del reino tras un nivel, o al menú tras una batalla rápida
  if (RUN && RUN.kind === 'nivel') openKingdom(RUN.k); else show('menu');
  startDemo();
}

/* ---- resultado: estrellas, oro, prisionero liberado y reino conquistado ---- */
function battleResult(win) {
  const run = B.run || { kind: 'rapida' }, res = { win, run, gold: 0, stars: 0, prize: null, hero: null, conquered: false, first: false };
  if (run.kind === 'nivel') {
    const kd = KD(run.k), lv = kd.levels[run.i], st = starsOf(run.k);
    if (win) {
      const f = Math.max(0, castles.blue.hp) / castles.blue.max;
      res.stars = f >= 0.8 ? 3 : f >= 0.5 ? 2 : 1;
      res.first = st[run.i] === 0;
      res.gold = res.first ? lv.gold : Math.round(lv.gold / 4);
      st[run.i] = Math.max(st[run.i], res.stars);
      if (res.first) tribOf(run.k)[run.i] = Date.now();   // desde hoy, este castillo te paga tributo
      if (res.first && lv.prize && !perfil.owned.includes(lv.prize)) { perfil.owned.push(lv.prize); res.prize = lv.prize; }
      if (res.first && lv.royal) {
        res.conquered = true; perfil.pending = run.k;
        if (kd.ruler && !perfil.heroes.includes(kd.ruler)) { perfil.heroes.push(kd.ruler); res.hero = kd.ruler; }
      }
    }
  } else if (win) res.gold = 20;
  perfil.gold += res.gold; savePerfil();
  return res;
}
function starsHtml(n, big) { return '<span class="stars' + (big ? ' big' : '') + '" aria-label="' + n + ' de 3 estrellas">' + [0, 1, 2].map(i => '<i class="' + (i < n ? 'on' : '') + '" style="--d:' + (i * 0.25) + 's">★</i>').join('') + '</span>'; }
function cardHtml(k, cls = '') { return '<span class="dk mini ' + (RARITY[k] || 'comun') + ' ' + cls + '"><span class="cost">' + COST[k] + '</span><img src="img/' + k + '_carta.png" alt=""><span class="nm">' + LABEL[k] + '</span></span>'; }
function showResult(res) {
  coach(null);
  const run = res.run, lv = run.kind === 'nivel' ? KD(run.k).levels[run.i] : null;
  const time = Math.floor(B.t / 60) + ':' + String(Math.floor(B.t % 60)).padStart(2, '0');
  $('over-title').textContent = !res.win ? 'Derrota' : res.conquered ? '¡Reino conquistado!' : lv ? '¡Castillo conquistado!' : '¡Victoria!';
  $('over-stars').innerHTML = res.win && lv ? starsHtml(res.stars, true) : '';
  $('over-text').textContent = (lv ? lv.name + ' · ' : '') + (res.win ? 'Victoria en ' : 'Has caído en ') + time + ' · ' + B.blue.kills + ' enemigos abatidos'
    + (res.win && lv && res.stars < 3 ? '. Para 3 estrellas, gana con tu castillo por encima del 80 %.' : '.');
  let pr = '';
  if (res.gold) pr += '<div class="loot"><span class="oro"><i></i><b>+' + res.gold + '</b></span></div>';
  if (res.prize) pr += '<div class="freed">' + cardHtml(res.prize, 'reveal') + '<p><b>¡Has liberado a ' + NAMES[res.prize] + '!</b><br>Estaba preso en las mazmorras del castillo. Ya puedes llevarlo en tu mazo.</p></div>';
  if (res.first) pr += '<p class="tribnote">Este castillo ya es tuyo: te pagará <b>' + tribRate(run.k, run.i) + ' de oro por hora</b>. Recógelo en el mapa del reino.</p>';
  if (res.hero) pr += '<div class="freed"><img class="hport reveal" src="img/' + HEROES[res.hero].portrait + '.png" alt=""><p><b>' + NAMES_H[res.hero] + ' se une a tu ejército.</b><br>' + (RULER_TXT[res.hero] || ['', 'Ya puedes elegirlo como héroe.'])[1] + '</p></div>';
  $('over-prize').innerHTML = pr;
  const a = $('over-a'), b = $('over-b');
  if (lv) {
    a.textContent = res.win ? 'Repetir' : 'Mapa'; a.onclick = res.win ? () => startRun(run) : leaveRun;
    b.textContent = res.win ? 'Continuar' : 'Reintentar'; b.onclick = res.win ? () => { if (res.conquered) { openWorld(); startDemo(); } else leaveRun(); } : () => startRun(run);
  } else {
    a.textContent = 'Menú'; a.onclick = leaveRun;
    b.textContent = 'Revancha'; b.onclick = () => startRun(run);
  }
  show('over'); paintGold();
}
const RULER_TXT = { lyra: ['la reina de las praderas', 'La reina de las praderas jura lealtad a tu corona. Ya puedes elegirla como heroína.'], gull: ['el rey del bosque', 'El rey del bosque jura lealtad a tu corona. Ya puedes elegirlo como héroe.'] };
const NAMES_H = { aldric: 'El Rey Aldric', lyra: 'Lyra, Ojo de Halcón', gull: 'Gūll, el Puerco' };

/* ---- mapa del mundo ---- */
function curve(a, b) {   // camino curvo entre dos puntos del mapa (coordenadas del viewBox 0 0 100 150)
  const [x1, y1] = [a[0], a[1] * 1.5], [x2, y2] = [b[0], b[1] * 1.5], mx = (x1 + x2) / 2 + (y2 - y1) * 0.18, my = (y1 + y2) / 2 - (x2 - x1) * 0.18;
  return 'M' + x1 + ' ' + y1 + ' Q' + mx + ' ' + my + ' ' + x2 + ' ' + y2;
}
// banderín con tu color y tu emblema: marca lo que es tuyo en los mapas pintados
const pennant = () => '<span class="pennant" style="--c:' + COLORES[myColor()][1] + '" aria-hidden="true">' + (myEmb() ? '<img src="img/emb/' + myEmb() + '.png" alt="">' : '') + '</span>';
function worldArt() {
  if (WORLDS[curWorld].art) return '<img class="mapart" src="' + WORLDS[curWorld].art + '" alt="">';
  // mapa provisional: un continente en el mar, con una mancha de color por reino
  const blobs = KINGDOMS.map(k => '<ellipse cx="' + k.pos[0] + '" cy="' + k.pos[1] * 1.5 + '" rx="19" ry="12" fill="' + k.biome + '" stroke="#1e2235" stroke-width=".6" opacity=".95"/>').join('');
  return '<svg class="mapart" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true"><defs><radialGradient id="mar" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#5fb4f0"/><stop offset="1" stop-color="#2f6fc0"/></radialGradient></defs>'
    + '<rect width="100" height="150" fill="url(#mar)"/>'
    + '<path d="M18 145 C4 120 10 96 8 80 C6 60 14 40 22 26 C30 10 52 2 70 5 C88 9 96 26 92 46 C88 64 96 84 90 104 C84 126 74 144 52 147 C38 149 26 149 18 145Z" fill="#cfe9a0" stroke="#1e2235" stroke-width=".9"/>'
    + blobs + '</svg>';
}
function openWorld(w) {
  curWorld = WORLDS[w] ? w : curWorld;
  const W = WORLDS[curWorld], m = $('mundo-map'), states = KINGDOMS.map((k, i) => kingdomState(i));
  const idx = KINGDOMS.map((k, i) => i).filter(i => KINGDOMS[i].world === curWorld);
  const pend = perfil.pending ? KINGDOMS.findIndex(k => k.id === perfil.pending) : -1;
  document.querySelectorAll('#mundo-tabs button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.w === curWorld));
  // líneas: los tramos ya recorridos, y el que lleva al reino que toca conquistar (punteado)
  let lines = '';
  for (let n = 0; n < idx.length - 1; n++) {
    const i = idx[n], from = states[i], next = states[idx[n + 1]];
    if (!(from === 'home' || from === 'done')) break;
    const d = curve(KINGDOMS[i].pos, KINGDOMS[idx[n + 1]].pos), fresh = i === pend;
    lines += '<path class="route' + (next === 'done' ? ' done' : ' next') + (fresh ? ' fresh' : '') + '" d="' + d + '" pathLength="100"/>';
  }
  const nodes = idx.map(i => {
    const k = KINGDOMS[i], st = states[i], mine = st === 'home' || st === 'done';
    const icon = W.castles ? '' : colorURL(iconFor(k.id, true), mine ? myColor() : rivalColor(k.id), mine ? myEmb() : rivalEmb(k.id));
    const sub = st === 'home' ? 'Tu castillo' : st === 'done' ? 'Conquistado' : st === 'open' ? (starsOf(k.id).filter(s => s > 0).length + '/10 castillos') : st === 'soon' ? 'Próximamente' : 'Bloqueado';
    return '<button class="knode ' + st + ' art' + (W.castles ? '' : ' ico' + (idx.indexOf(i) % 2 ? ' alt' : '')) + (i === pend ? ' fresh' : '') + '" data-i="' + i + '" style="left:' + k.pos[0] + '%;top:' + k.pos[1] + '%" aria-label="' + k.name + ': ' + sub + '">'
      + '<span class="kico">' + (icon ? '<img src="' + icon + '" alt="">' : '') + (st === 'done' ? '<span class="cross" aria-hidden="true"></span>' : '') + (st === 'locked' || st === 'soon' ? '<span class="lock" aria-hidden="true"></span>' : '')
      + (mine ? pennant() : '') + '</span>'
      + '<span class="klbl"><b>' + k.name + '</b><small>' + sub + '</small></span></button>';
  }).join('');
  const bubbles = idx.map(i => KINGDOMS[i]).map(k => k.levels ? '<button class="tribb" data-k="' + k.id + '" style="left:' + (k.pos[0] + 17) + '%;top:' + (k.pos[1] - 1) + '%" hidden></button>' : '').join('');
  m.innerHTML = worldArt() + '<svg class="routes" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">' + lines + '</svg>' + nodes + bubbles;
  m.querySelectorAll('.knode').forEach(b => { b.onclick = () => tapKingdom(+b.dataset.i); });
  m.querySelectorAll('.tribb').forEach(b => { b.onclick = () => { const k = KD(b.dataset.k); collect(k.id, k.levels.map((_, i) => i), b); tribTick(); }; });
  tribTick();
  show('mundo');
  // céntralo en el reino que toca
  const target = idx.find(i => states[i] === 'open'), sc = $('mundo-scroll');
  requestAnimationFrame(() => { const n = m.querySelector('.knode[data-i="' + (target !== undefined ? target : idx[0]) + '"]'); if (n) sc.scrollTop = n.offsetTop - sc.clientHeight / 2; });
  if (pend >= 0) {
    perfil.pending = null; savePerfil();
    const nx = KINGDOMS[pend + 1];
    setTimeout(() => toast('¡' + KINGDOMS[pend].name + ' es tuyo!' + (nx ? ' Tu ejército marcha hacia el ' + nx.name + (nx.world !== KINGDOMS[pend].world ? ', al otro lado del mar' : '') + '.' : ' Has conquistado el mundo entero.')), 900);
  }
}
function tapKingdom(i) {
  const k = KINGDOMS[i], st = kingdomState(i);
  if (st === 'home') return toast('Tu reino. De aquí partió tu ejército a conquistar el mundo.');
  if (st === 'locked') return toast('Primero conquista el ' + KINGDOMS[i - 1].name + '.');
  if (st === 'soon') return toast('El ' + k.name + ' llegará pronto.');
  openKingdom(k.id);
}

/* ---- mapa de un reino: el camino con sus 10 castillos ---- */
function kingdomArt(kid) {
  if (MAP_ART[kid]) return '<img class="mapart" src="' + MAP_ART[kid] + '" alt="">';
  // mapa provisional: prado con árboles y el camino de tierra que une los castillos
  const P = LV_POS.map(([x, y]) => [x, y * 1.5]);
  let d = 'M' + P[0][0] + ' ' + (P[0][1] + 14);
  for (let i = 0; i < P.length; i++) { const a = i ? P[i - 1] : [P[0][0], P[0][1] + 14], b = P[i]; d += ' C' + a[0] + ' ' + (a[1] - 6) + ' ' + b[0] + ' ' + (b[1] + 6) + ' ' + b[0] + ' ' + b[1]; }
  let trees = '';
  for (let i = 0; i < 46; i++) {
    const x = (i * 37.3) % 100, y = (i * 53.7) % 150;
    if (P.some(p => Math.hypot(p[0] - x, p[1] - y) < 13)) continue;
    trees += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"><rect x="-.7" y="0" width="1.4" height="3" fill="#7a4b2a" stroke="#1e2235" stroke-width=".35"/><circle r="3.2" fill="' + (i % 5 === 0 ? '#f6a6c9' : i % 3 ? '#5fae4a' : '#4c9a3d') + '" stroke="#1e2235" stroke-width=".45"/></g>';
  }
  return '<svg class="mapart" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="prado" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd36a"/><stop offset="1" stop-color="#6cbf4c"/></linearGradient></defs>'
    + '<rect width="100" height="150" fill="url(#prado)"/>' + trees
    + '<path d="' + d + '" fill="none" stroke="#1e2235" stroke-width="7" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#e8c48a" stroke-width="5.4" stroke-linecap="round"/>'
    + P.map(([x, y], i) => '<ellipse cx="' + x + '" cy="' + (y + 2) + '" rx="' + (i === 9 ? 13 : 9) + '" ry="' + (i === 9 ? 5 : 3.6) + '" fill="#e8c48a" stroke="#1e2235" stroke-width=".6"/>').join('') + '</svg>';
}
let CUR_KID = null;
function openKingdom(kid) {
  CUR_KID = kid; curWorld = KD(kid).world || 1;
  const kd = KD(kid), st = starsOf(kid), m = $('reino-map');
  $('reino-name').textContent = kd.name;
  const cur = st.findIndex(s => s === 0);
  m.innerHTML = kingdomArt(kid) + kd.levels.map((lv, i) => {
    const open = levelOpen(kid, i), done = st[i] > 0, icon = colorURL(iconFor(kid, lv.royal), done ? myColor() : rivalColor(kid), done ? myEmb() : rivalEmb(kid));
    return '<button class="lnode' + (MAP_ART[kid] ? ' art' : '') + (lv.royal ? ' royal' : '') + (done ? ' done' : '') + (open ? '' : ' locked') + (i === cur && open ? ' cur' : '') + '" data-i="' + i + '" style="left:' + LV_POS[i][0] + '%;top:' + LV_POS[i][1] + '%"'
      + ' aria-label="Nivel ' + (i + 1) + ': ' + lv.name + (done ? ', ' + st[i] + ' estrellas' : open ? '' : ', bloqueado') + '">'
      + '<img src="' + icon + '" alt="">' + (lv.royal ? '<span class="crown" aria-hidden="true">♛</span>' : '')
      + '<span class="lnum">' + (i + 1) + '</span>' + (done ? starsHtml(st[i]) : '') + '</button>'
      + (done ? '<button class="tribb" data-i="' + i + '" style="left:' + LV_POS[i][0] + '%;top:' + (LV_POS[i][1] - (lv.royal ? 8 : 6)) + '%" hidden></button>' : '');
  }).join('') + '<span class="camp" style="left:' + CAMP_POS[0] + '%;top:' + CAMP_POS[1] + '%" aria-hidden="true">' + pennant() + '</span>';
  m.querySelectorAll('.lnode').forEach(b => { b.onclick = () => { const i = +b.dataset.i; if (levelOpen(kid, i)) openLevel(kid, i); else toast('Conquista antes el castillo ' + i + '.'); }; });
  m.querySelectorAll('.tribb').forEach(b => { b.onclick = () => { collect(kid, [+b.dataset.i], b); tribTick(); }; });
  tribTick();
  show('reino');
  const sc = $('reino-scroll');
  requestAnimationFrame(() => { const n = m.querySelector('.lnode[data-i="' + Math.max(0, cur) + '"]'); if (n) sc.scrollTop = n.offsetTop - sc.clientHeight / 2; });
}
function tribTick() {
  document.querySelectorAll('#mundo-map .tribb').forEach(b => { const n = tribKingdom(b.dataset.k), full = KD(b.dataset.k).levels.some((_, i) => tribFull(b.dataset.k, i)); b.hidden = n < 1; b.classList.toggle('full', full); b.innerHTML = '<i></i>' + n; b.setAttribute('aria-label', 'Recoger ' + n + ' de oro de tributo'); });
  const kid = CUR_KID && KD(CUR_KID);
  if (kid) document.querySelectorAll('#reino-map .tribb').forEach(b => { const i = +b.dataset.i, n = tribPending(kid.id, i); b.hidden = n < 1; b.classList.toggle('full', tribFull(kid.id, i)); b.innerHTML = '<i></i>' + n; b.setAttribute('aria-label', 'Recoger ' + n + ' de oro de tributo'); });
  const all = KINGDOMS.reduce((s, k) => s + tribKingdom(k.id), 0); $('mundo-all').hidden = all < 1; $('mundo-all').innerHTML = 'Recaudar <b>' + all + '</b>';
}
setInterval(() => { if (!$('mundo').hidden || !$('reino').hidden) tribTick(); }, 4000);
$('mundo-all').onclick = e => { let got = 0; KINGDOMS.forEach(k => { if (k.levels) got += collect(k.id, k.levels.map((_, i) => i), null); }); if (got) coinFly(e.currentTarget, got); tribTick(); };

let LV = null;
function openLevel(kid, i) {
  const kd = KD(kid), lv = kd.levels[i], st = starsOf(kid)[i];
  LV = { k: kid, i };
  $('nv-k').textContent = kd.name + ' · ' + (lv.royal ? 'Castillo del rey' : 'Castillo vasallo ' + (i + 1) + ' de 9');
  $('nv-name').textContent = lv.name;
  $('nv-stars').innerHTML = starsHtml(st);
  $('nv-desc').textContent = 'Muralla de ' + lv.hp + ' de vida' + (lv.hero ? '. En el trono te espera ' + NAMES_H[lv.hero] + ', ' + (RULER_TXT[lv.hero] || [''])[0] + '.' : lv.royal ? '. Su rey aún no ha mostrado la cara: de momento, sin héroe en el trono.' : '. Sin héroe en el trono.');
  $('nv-army').innerHTML = lv.deck.map(k => cardHtml(k)).join('');
  let pr = '<span class="oro"><i></i><b>' + (st ? Math.round(lv.gold / 4) : lv.gold) + '</b></span>';
  if (lv.prize) pr += perfil.owned.includes(lv.prize) && !perfil.all ? '<span class="pz">Prisionero ya liberado: ' + LABEL[lv.prize] + '</span>' : cardHtml(lv.prize, 'shadow') + '<span class="pz">Un prisionero espera en sus mazmorras</span>';
  if (lv.hero) pr += '<img class="hport shadow" src="img/' + HEROES[lv.hero].portrait + '.png" alt=""><span class="pz">' + (lv.hero === 'lyra' ? 'Si la vences, se une a ti' : 'Si lo vences, se une a ti') + '</span>';
  $('nv-prize').innerHTML = pr;
  const rate = tribRate(kid, i);
  $('nv-trib').textContent = st ? 'Ya es tuyo: te paga ' + rate + ' de oro por hora' + (st < 3 ? ' (con 3 estrellas, ' + Math.round(tribBase(kid, i) * TRIB.starK[3]) + ').' : ', el máximo.') + ' Guarda hasta 12 horas.'
    : 'Cuando lo conquistes te pagará ' + tribBase(kid, i) + ' de oro por hora, y más con más estrellas.';
  show('nivel');
}

/* ---- mazo y héroe (solo lo que tienes; lo demás se ve bloqueado y dice dónde conseguirlo) ---- */
let picking = [];
const deckNeed = () => Math.min(8, owned().length);
function openDeck(from = 'menu') {
  deckFrom = from;
  picking = playerDeck();
  const g = $('deckgrid'), own = owned(); g.innerHTML = '';
  ALL.slice().sort((a, b) => (own.includes(b) - own.includes(a)) || COST[a] - COST[b] || LABEL[a].localeCompare(LABEL[b])).forEach(k => {
    const has = own.includes(k), b = document.createElement('button'); b.type = 'button'; b.className = 'dk ' + (RARITY[k] || 'comun') + (has ? '' : ' lock'); b.dataset.k = k;
    b.setAttribute('aria-label', NAMES[k] + ', coste ' + COST[k] + (has ? '' : ', bloqueada'));
    b.innerHTML = '<span class="cost">' + COST[k] + '</span><img src="img/' + k + '_carta.png" alt=""><span class="nm">' + (has ? LABEL[k] : '¿?') + '</span>';
    b.onclick = () => {
      if (!has) { const w = prizeWhere(k); return toast(w ? 'Prisionero en ' + w + '. Conquista ese castillo para liberarlo.' : 'Se recluta en la Taberna del Multiverso o en las jaulas (pronto).'); }
      const i = picking.indexOf(k); if (i >= 0) picking.splice(i, 1); else if (picking.length < 8) picking.push(k); syncDeck();
    };
    g.appendChild(b);
  });
  const hs = heroesOwned();
  $('heroes').innerHTML = Object.entries(HEROES).map(([k, h]) => { const has = hs.includes(k); return '<button type="button" class="hpick' + (has ? '' : ' lock') + '" data-h="' + k + '"><img src="img/' + h.portrait + '.png" alt=""><span><b>' + h.name + '</b><span>' + (has ? h.skillName : 'Conquista el ' + (KINGDOMS.find(q => q.ruler === k) || { name: 'reino de su rey' }).name) + '</span></span></button>'; }).join('');
  document.querySelectorAll('.hpick').forEach(b => { b.onclick = () => { if (!hs.includes(b.dataset.h)) { const q = KINGDOMS.find(z => z.ruler === b.dataset.h); return toast('Vence a ' + NAMES_H[b.dataset.h] + ' en el castillo real del ' + (q ? q.name : 'reino') + ' para que se una a ti.'); } myHero = b.dataset.h; try { localStorage.setItem('bg-hero', myHero); } catch (er) {} syncDeck(); }; });
  paintColors();
  $('deckgo').textContent = from === 'nivel' ? '¡Atacar!' : '¡A luchar!';
  $('deckall').setAttribute('aria-pressed', perfil.all); $('deckall').textContent = perfil.all ? 'Pruebas: todo desbloqueado' : 'Pruebas: desbloquear todo';
  $('deckwipe').dataset.sure = ''; $('deckwipe').textContent = 'Borrar progreso';
  syncDeck(); show('deck');
}
function paintColors() {
  $('colores').innerHTML = Object.entries(COLORES).map(([k, [n, hex]]) => '<button type="button" class="sw" data-c="' + k + '" style="--c:' + hex + '" aria-label="' + n + '" aria-pressed="' + (k === myColor()) + '"></button>').join('');
  $('colorprev').src = colorURL(ICON.casa, myColor(), myEmb()); $('colorname').textContent = COLORES[myColor()][0];
  $('emblemas').innerHTML = ['', ...EMBLEMAS].map(e => '<button type="button" class="emb" data-e="' + e + '" aria-pressed="' + (e === myEmb()) + '" aria-label="' + (e || 'Sin emblema') + '" style="--c:' + COLORES[myColor()][1] + '">' + (e ? '<img src="img/emb/' + e + '.png" alt="">' : '—') + '</button>').join('');
  document.querySelectorAll('#emblemas .emb').forEach(b => { b.onclick = () => { perfil.emblema = b.dataset.e; savePerfil(); paintColors(); if (B && B.demo) applyColors(battleColors(null)); }; });
  document.querySelectorAll('#colores .sw').forEach(b => { b.onclick = () => { perfil.color = b.dataset.c; savePerfil(); paintColors(); if (B && B.demo) applyColors(battleColors(null)); }; });
}
function syncDeck() {
  document.querySelectorAll('.dk:not(.mini)').forEach(b => b.setAttribute('aria-pressed', picking.includes(b.dataset.k)));
  document.querySelectorAll('.hpick').forEach(b => b.setAttribute('aria-pressed', b.dataset.h === playerHero()));
  const avg = picking.length ? picking.reduce((s, k) => s + COST[k], 0) / picking.length : 0, need = deckNeed();
  $('deckcount').textContent = picking.length + '/' + need + ' · coste medio ' + avg.toFixed(1).replace('.', ',');
  $('decknote').textContent = need < 8 ? 'Tu ejército aún es pequeño: llevas todas las cartas que tienes (' + need + '). Libera prisioneros en la campaña para llenar el mazo hasta 8.' : 'Elige 8 cartas.';
  $('deckgo').disabled = picking.length !== need;
}
function keepDeck() { if (picking.length === deckNeed()) { myDeck = picking.slice(); try { localStorage.setItem('bg-deck', JSON.stringify(myDeck)); } catch (e) {} } }
$('deckrand').onclick = () => { picking = shuffle(owned()).slice(0, deckNeed()); syncDeck(); };
$('deckgo').onclick = () => { keepDeck(); if (deckFrom === 'nivel' && LV) startRun({ kind: 'nivel', k: LV.k, i: LV.i }); else startRun({ kind: 'rapida' }); };
$('deckback').onclick = () => { keepDeck(); if (deckFrom === 'nivel' && LV) show('nivel'); else show('menu'); };
$('deckall').onclick = () => { perfil.all = !perfil.all; savePerfil(); openDeck(deckFrom); };
$('deckwipe').onclick = e => {
  const b = e.currentTarget;
  if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = '¿Seguro? Toca otra vez'; return; }
  perfil = newPerfil(); savePerfil(); myDeck = STARTERS.slice(); myHero = 'aldric'; toast('Progreso borrado: vuelves a empezar con Tulio, Ailin y Rodrigo.'); openDeck(deckFrom);
};

/* ---- botones del menú, la pausa y los mapas ---- */
$('mundo-back').onclick = () => show('menu');
$('reino-back').onclick = () => openWorld();
$('nv-close').onclick = () => show('reino');
$('nv-deck').onclick = () => openDeck('nivel');
$('nv-go').onclick = () => { if (LV) startRun({ kind: 'nivel', k: LV.k, i: LV.i }); };
$('restart').onclick = () => { setPaused(false); startRun(RUN); };
$('quit').onclick = () => { setPaused(false); leaveRun(); };
$('pause').addEventListener('click', () => {
  const lv = RUN && RUN.kind === 'nivel' ? KD(RUN.k).levels[RUN.i] : null;
  $('pausa-info').textContent = lv ? 'Nivel ' + (RUN.i + 1) + ' · ' + lv.name : 'Batalla rápida';
  $('quit').textContent = lv ? 'Volver al mapa' : 'Salir al menú';
});

/* ---- primeros pasos: burbujas que enseñan a jugar en la primera batalla de la campaña ---- */
let CO = null;
function coach(target, text, below = false) {
  const c = $('coach');
  if (!target || $('hud').hidden || paused) { c.hidden = true; return; }
  const r = $(target).getBoundingClientRect(); if (!r.width) { c.hidden = true; return; }
  if (c.textContent !== text) c.textContent = text;
  c.hidden = false;
  const w = c.offsetWidth, x = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2));
  c.classList.toggle('down', below);
  c.style.left = x + 'px'; c.style.top = (below ? r.bottom + 16 : r.top - c.offsetHeight - 16) + 'px'; c.style.setProperty('--ax', (r.left + r.width / 2 - x) + 'px');
}
function coachStart() {
  if (!perfil.tut) perfil.tut = {};
  CO = !perfil.tut.carta && RUN && RUN.kind === 'nivel' ? { step: 'carta' } : null;
  coach(null);
}
function coachTick() {
  if (!B || B.auto || B.over) return coach(null);
  if (CO && CO.step === 'carta') return B.t > 0.8 ? coach('hand', 'Toca una carta para sacar a la unidad. Cada carta cuesta la energía que marca su círculo.') : null;
  if (CO && CO.step === 'avanza') {
    if (B.t - CO.t0 < 6) return coach('clock', '¡Bien! Tus unidades avanzan solas y atacan lo que encuentran. Sigue sacando cartas hasta derribar la muralla rival.', true);
    CO = null;
  }
  if (!perfil.tut.heroe && B.hero.state === 'throne' && B.blue.kills >= HERO_GOAL) return coach('hero', '¡Tu héroe está listo! Tócalo para que salte del trono al campo.');
  coach(null);
}
const _play = play;
play = function (team, idx) {
  const ok = _play(team, idx);
  if (ok && team === 'blue' && CO && CO.step === 'carta') { perfil.tut.carta = true; savePerfil(); CO = { step: 'avanza', t0: B.t }; }
  return ok;
};
const _heroAct = heroAct;
heroAct = function (team) { const ok = _heroAct(team); if (ok && team === 'blue' && B && !B.auto && perfil.tut && !perfil.tut.heroe) { perfil.tut.heroe = true; savePerfil(); } return ok; };
const _heroUI = heroUI;
heroUI = function () { _heroUI(); coachTick(); };

/* ---- simulación de niveles (para ajustar la dificultad): la IA juega tu bando con el ejército que tendrías al llegar ---- */
function deckAtLevel(kid, i) { const kd = KD(kid), d = STARTERS.slice(); kd.levels.slice(0, i).forEach(l => { if (l.prize) d.push(l.prize); }); return d.slice(-8); }
window.__simLevel = (kid, i, n = 10, maxT = 420, dt = 1 / 30, over = {}) => {
  const out = [];
  for (let g = 0; g < n; g++) {
    resetBattle(Object.assign({ sim: true, run: { kind: 'sim' }, deck: deckAtLevel(kid, i), hero: 'aldric' }, levelOpts(kid, i), over));
    while (!B.over && B.t < maxT) battleStep(dt);
    out.push({ win: !!B.win, t: Math.round(B.t), myHp: Math.round(Math.max(0, castles.blue.hp)), foeHp: Math.round(Math.max(0, castles.purple.hp)) });
  }
  startDemo();
  return out;
};
window.__perfil = () => perfil;
window.__setPerfil = p => { perfil = Object.assign(newPerfil(), p); savePerfil(); };
window.__levels = () => PRADERAS;
window.__openKingdom = openKingdom; window.__openWorld = openWorld; window.__openLevel = openLevel; window.__startRun = startRun;
window.__startBattle = deck => { if (deck) myDeck = deck; perfil.all = true; startRun({ kind: 'rapida' }); };
document.querySelectorAll('#mundo-tabs button').forEach(b => { b.onclick = () => openWorld(+b.dataset.w); });
