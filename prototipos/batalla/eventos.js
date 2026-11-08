
/* ==== Eventos. Fijo: el Abismo del Despertar. Cada día espera en el fondo una unidad distinta: si es legendaria hay que bajar
   50 niveles; si es ascendida, 60. En cada nivel hay 4 caminos: 3 bajan (y dan botín) y 1 lleva al vacío o a la lava.
   Cuerdas: si caes, te sujetan (y ya sabes cuál era la trampa). Antorchas: iluminan el nivel y enseñan la trampa.
   Cada 10 niveles hay un rellano con cuerdas, antorchas, insignias y una celda. Si caes sin cuerdas, se acaba el descenso
   del día (puedes volver al último rellano pagando diamantes). ==== */
const ABI = {
  cuerdas: 3, antorchas: 1, rellano: { cuerdas: 2, antorchas: 1, insignias: 2 },
  reintento: [50, 100, 200],
  premios: ['imparable', 'muerte', 'kungfu', 'centinela', 'desencadenado'],   // uno por día, en este orden
  prof: { legendaria: 50, ascendida: 60 }, copias: { legendaria: 15, ascendida: 8 },
  celda: { 10: 'hierro', 20: 'runica', 30: 'oro', 40: 'oro', 50: 'diamante', 60: 'diamante' },
};
const ABI_CAMINOS = ['Gruta', 'Cueva', 'Grieta', 'Túnel'], ABI_IDS = ['gruta', 'cueva', 'grieta', 'tunel'];   // dibujos en img/abismo
const ABI_PISTAS = ['húmeda', 'oscura', 'con eco', 'estrecha', 'con raíces', 'con huesos', 'cálida', 'ventosa', 'de cristal', 'con runas', 'silenciosa', 'con goteras'];
const diaN = () => { const d = new Date(); return Math.floor((d - d.getTimezoneOffset() * 6e4) / 864e5); };
const abiPremio = () => ABI.premios[diaN() % ABI.premios.length];
const abiMeta = k => ABI.prof[RARITY[k]] || 50;
function abiNivel(s) { s.trap = Math.floor(Math.random() * 4); s.luz = false; s.vista = false; s.pistas = shuffle(ABI_PISTAS.slice()).slice(0, 4); }
function abi() {
  if (!perfil.abismo || perfil.abismo.f !== hoy()) { perfil.abismo = { f: hoy(), prof: 0, cuerdas: ABI.cuerdas, antorchas: ABI.antorchas, caido: false, reint: 0, fin: false, oro: 0, gemas: 0 }; abiNivel(perfil.abismo); savePerfil(); }
  return perfil.abismo;
}
const abiPeligro = p => p < 20 ? ['el vacío', 'al vacío', 'vacio'] : p < 40 ? ['la lava', 'a la lava', 'lava'] : ['las sombras', 'a las sombras', 'sombras'];
const abiBoca = (i, trampa) => 'img/abismo/' + ABI_IDS[i] + (trampa ? '_' + trampa : '') + '.png';   // la entrada a oscuras o con su trampa a la vista
const abiIco = n => '<img class="abico" src="img/abismo/' + n + '.png" alt="">';
const cuerdasTot = s => s.cuerdas + (perfil.cuerdas || 0), antorchasTot = s => s.antorchas + (perfil.antorchas || 0);
function gasta(s, k) { if (s[k] > 0) s[k]--; else perfil[k] = (perfil[k] || 0) - 1; }
let abiMsg = ['', ''];

function openEventos() {
  const s = abi(), k = abiPremio(), meta = abiMeta(k);
  $('ev-body').innerHTML = '<div class="evcard abi"><div class="evban"><h3>Abismo del Despertar</h3>' + cardHtml(k) + '</div><p>Hoy espera en el fondo <b>' + NAMES[k] + '</b> (' + RAREZA[RARITY[k]].toLowerCase() + '). Baja ' + meta + ' niveles eligiendo bien el camino: uno de cada cuatro lleva ' + abiPeligro(0)[1] + '.</p>'
    + '<p>' + (s.fin ? '¡Premio conseguido! Mañana, otro.' : s.caido ? 'Has caído en el nivel ' + (s.prof + 1) + '.' : s.prof ? 'Vas por el nivel ' + s.prof + ' de ' + meta + '.' : 'Aún no has bajado hoy.') + '</p><button class="btn gold" id="ev-abismo">' + (s.fin ? 'Ver' : s.prof || s.caido ? 'Seguir' : 'Entrar') + '</button></div>'
    + '<div class="grid2"><div class="evcard soon"><h3>Invasión del Rey Exiliado</h3><p>Evento de fin de semana: un rey sin trono asalta tus castillos conquistados. Defiéndelos para ganar celdas.</p><span class="chip">Próximamente</span></div>'
    + '<div class="evcard soon"><h3>Torneo del Multiverso</h3><p>Mazos prestados y reglas especiales cada semana.</p><span class="chip">Próximamente</span></div></div>';
  $('ev-abismo').onclick = () => openAbismo();
  show('eventos');
}
function openAbismo() {
  const s = abi(), k = abiPremio(), meta = abiMeta(k), [pel, a_pel, tid] = abiPeligro(s.prof);
  $('abismo').style.setProperty('--p', Math.min(1, s.prof / meta).toFixed(3));   // el fondo baja contigo
  const marcas = Array.from({ length: Math.floor(meta / 10) - 1 }, (_, i) => '<i style="left:' + ((i + 1) * 10 / meta * 100) + '%"></i>').join('');
  let h = '<div class="abhud"><div class="abprize">' + cardHtml(k) + '<div><b>' + NAMES[k] + '</b><small>' + (perfil.owned.includes(k) ? ABI.copias[RARITY[k]] + ' copias' : 'Se une a tu ejército') + ' al llegar al fondo</small></div></div>'
    + '<div class="depth"><b>' + s.prof + '</b><small>de ' + meta + '</small></div><div class="abbar"><span style="width:' + (s.prof / meta * 100) + '%"></span>' + marcas + '</div></div>'
    + '<div class="abres"><span class="res">' + abiIco('cuerda') + cuerdasTot(s) + (cuerdasTot(s) === 1 ? ' cuerda' : ' cuerdas') + '</span><span class="res">' + abiIco('antorcha') + antorchasTot(s) + (antorchasTot(s) === 1 ? ' antorcha' : ' antorchas') + '</span>'
    + '<span class="note">Botín de hoy: ' + fmt(s.oro) + ' de oro' + (s.gemas ? ', ' + s.gemas + ' diamantes' : '') + '</span></div>';
  if (s.fin) h += '<p class="abmsg good">¡Has llegado al fondo! ' + NAMES[k] + ' es tuyo. Mañana espera otra unidad.</p>';
  else if (s.caido) {
    const c = ABI.reintento[s.reint];
    h += '<p class="abmsg bad">Has caído ' + a_pel + ' sin cuerdas.</p><p class="note" style="text-align:center">El descenso de hoy ha terminado. Te quedas con el botín.</p><div class="abacts">'
      + (c ? '<button class="btn gold" id="abi-re">Volver al nivel ' + (Math.floor(s.prof / 10) * 10) + ' con 2 cuerdas · ' + gemBtn(c) + '</button>' : '') + '<button class="btn" id="abi-sal">Volver mañana</button></div>';
  } else {
    h += '<p class="abmsg ' + (abiMsg[1] || '') + '">' + (abiMsg[0] || 'Nivel ' + (s.prof + 1) + ': uno de estos caminos lleva ' + a_pel + '.') + '</p><div class="paths" id="abi-paths">'
      + ABI_CAMINOS.map((n, i) => { const trap = (s.luz || s.vista) && i === s.trap; return '<button type="button" class="path' + (trap ? ' trap' : (s.luz ? ' safe' : '')) + '" data-i="' + i + '"' + (trap ? ' disabled' : '') + '><img class="mouth" src="' + abiBoca(i, trap && tid) + '" alt=""><b>' + n + '</b><small>' + (trap ? '¡Aquí está ' + pel + '!' : s.pistas[i]) + '</small></button>'; }).join('')
      + '</div><div class="abacts"><button class="btn" id="abi-luz"' + (s.luz || s.vista || !antorchasTot(s) ? ' disabled' : '') + '>' + abiIco('antorcha') + 'Encender antorcha</button></div>';
  }
  h += '<p class="note">Rellanos cada 10 niveles: +' + ABI.rellano.cuerdas + ' cuerdas, +' + ABI.rellano.antorchas + ' antorcha, +' + ABI.rellano.insignias + ' insignias y una celda. Cuerdas y antorchas también se compran en la Tienda.</p>';
  $('abi-body').innerHTML = h; abiMsg = ['', ''];
  document.querySelectorAll('#abi-paths .path:not([disabled])').forEach(b => { b.onclick = () => abiElige(+b.dataset.i, b); });
  if ($('abi-luz')) $('abi-luz').onclick = () => { gasta(s, 'antorchas'); s.luz = true; savePerfil(); abiMsg = ['La antorcha ilumina el nivel: ya ves la trampa.', 'good']; openAbismo(); };
  if ($('abi-re')) $('abi-re').onclick = () => { if (paga({ gemas: ABI.reintento[s.reint] })) { s.reint++; s.caido = false; s.prof = Math.floor(s.prof / 10) * 10; s.cuerdas += 2; abiNivel(s); savePerfil(); openAbismo(); } };
  if ($('abi-sal')) $('abi-sal').onclick = () => openEventos();
  show('abismo');
}
function abiElige(i, btn) {
  const s = abi(), k = abiPremio(), meta = abiMeta(k), [pel, a_pel, tid] = abiPeligro(s.prof);
  document.querySelectorAll('#abi-paths .path').forEach(b => { b.disabled = true; }); btn.classList.add('picked');
  if (i === s.trap) {   // se ve lo que había dentro y caes
    btn.classList.add('trap'); btn.querySelector('.mouth').src = abiBoca(i, tid); $('abi-paths').classList.add('falling');
    setTimeout(() => {
      if (cuerdasTot(s) > 0) { gasta(s, 'cuerdas'); s.vista = true; abiMsg = ['¡' + pel[0].toUpperCase() + pel.slice(1) + '! Tu cuerda te sujeta. Ya sabes dónde está la trampa: elige otro camino.', 'bad']; }
      else s.caido = true;
      savePerfil(); openAbismo();
    }, 900);
    return;
  }
  s.prof++;
  const oro = 10 + s.prof * 3; s.oro += oro; perfil.gold += oro; let extra = [];
  if (s.prof % 5 === 0) { s.gemas += 5; perfil.gemas = (perfil.gemas || 0) + 5; extra.push('5 diamantes'); }
  if (s.prof % 10 === 0) {
    const R = ABI.rellano; s.cuerdas += R.cuerdas; s.antorchas += R.antorchas; addInsignias(R.insignias); const c = ABI.celda[s.prof]; if (c) darCelda(c);
    extra.push(R.cuerdas + ' cuerdas, ' + R.antorchas + ' antorcha, ' + R.insignias + ' insignias' + (c ? ' y una ' + CELDA(c).name.toLowerCase() : ''));
  }
  if (s.prof >= meta) {
    s.fin = true;
    if (!perfil.owned.includes(k)) { perfil.owned.push(k); addCopias(k, ABI.copias[RARITY[k]] - 1); } else addCopias(k, ABI.copias[RARITY[k]]);
    savePerfil(); openAbismo();
    pop('<div class="freed">' + cardHtml(k, 'reveal') + '<p><b>¡Has llegado al fondo del Abismo!</b><br>' + NAMES[k] + ' despierta y se une a ti con ' + ABI.copias[RARITY[k]] + ' copias de su carta.</p></div>');
    return;
  }
  abiNivel(s); savePerfil();
  abiMsg = [(s.prof % 10 === 0 ? '¡Rellano! ' : 'Bajas al nivel ' + (s.prof + 1) + '. ') + '+' + oro + ' de oro' + (extra.length ? ', ' + extra.join(', ') : '') + '.', 'good'];
  openAbismo(); $('abi-paths') && $('abi-paths').classList.add('descend');
}
$('ab-back').onclick = () => openEventos();
const _phEv = paintHub;
paintHub = function () { _phEv(); const d = document.querySelector('#nav [data-tab="eventos"] .ndot'); if (d) { const s = perfil.abismo; d.hidden = !!(s && s.f === hoy() && (s.prof || s.caido || s.fin)); } };
window.__abi = () => abi(); window.__openAbismo = openAbismo; window.__abiElige = i => abiElige(i, document.querySelectorAll('#abi-paths .path')[i]);
