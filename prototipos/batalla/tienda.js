
/* ==== Tienda: ofertas de cartas que se renuevan cada día, celdas, oro, diamantes y lotes varios.
   Los diamantes con dinero real llegarán cuando el juego tenga pagos: de momento se ven, pero no se compran. ==== */
const TI = {
  cartas: { comun: [10, { oro: 300 }], poco: [8, { oro: 500 }], rara: [5, { oro: 900 }], epica: [3, { gemas: 60 }], legendaria: [2, { gemas: 120 }], ascendida: [1, { gemas: 250 }] },
  peso: [['comun', 30], ['poco', 26], ['rara', 22], ['epica', 13], ['legendaria', 7], ['ascendida', 2]],
  renovar: 20,
  oro: [[30, 500], [120, 2500], [400, 10000]],
  gemas: [[80, '0,99 €'], [500, '4,99 €'], [1200, '9,99 €', 'Popular'], [6500, '49,99 €', 'Mejor valor']],
  varios: [
    { id: 'explorador', img: ['abismo/cuerda', 'abismo/antorcha'], name: 'Lote del explorador', txt: '3 cuerdas y 2 antorchas para el Abismo', p: { gemas: 40 }, give: { cuerdas: 3, antorchas: 2 } },
    { id: 'insignias', img: ['insignia'], name: 'Insignias de mando ×5', txt: 'Para los saltos de nivel de tus unidades', p: { gemas: 60 }, give: { insignias: 5 } },
    { id: 'bienvenida', img: ['esc/gema', 'esc/moneda'], name: 'Pack de bienvenida', txt: '500 diamantes, 5.000 de oro y una celda de oro', real: '2,99 €', once: true },
  ],
};
function tiRoll() {
  const out = [], pick = () => { let r = Math.random() * 100, rar = 'comun'; for (const [k, w] of TI.peso) { if (r < w) { rar = k; break; } r -= w; } return rar; };
  while (out.length < 5) {
    const rar = pick(), pool = ALL.filter(k => (RARITY[k] || 'comun') === rar && !out.some(o => o.k === k));
    if (pool.length) out.push({ k: pool[Math.floor(Math.random() * pool.length)], sold: false });
  }
  return out;
}
function tiHoy(force) {
  if (force || !perfil.tienda || perfil.tienda.f !== hoy()) { perfil.tienda = { f: hoy(), slots: tiRoll(), regalo: false }; savePerfil(); }
  return perfil.tienda;
}
const hastaManana = () => { const d = new Date(), m = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1), s = (m - d) / 1000; return Math.floor(s / 3600) + ' h ' + Math.floor(s % 3600 / 60) + ' min'; };
function openTienda() {
  const t = tiHoy(), own = owned();
  const carta = (o, i) => {
    const r = RARITY[o.k] || 'comun', [n, p] = TI.cartas[r], nueva = !own.includes(o.k);
    return '<div class="offer' + (o.sold ? ' sold' : '') + '">' + (nueva ? '<span class="tag">¡Nueva!</span>' : '') + cardHtml(o.k) + '<b class="t">' + LABEL[o.k] + '</b><span class="cpx">×' + n + '</span><small>' + RAREZA[r] + (nueva ? ' · se une a tu ejército' : ' · copias') + '</small>'
      + (o.sold ? '<span class="chip">Comprado</span>' : '<button class="btn gold" data-c="' + i + '">' + costeHtml(p) + '</button>') + '</div>';
  };
  $('ti-body').innerHTML =
    '<div class="shsec"><h3>Ofertas del día <small>se renuevan en ' + hastaManana() + '</small></h3><div class="offers">'
    + '<div class="offer' + (t.regalo ? ' sold' : '') + '"><span class="tag">Gratis</span><span class="pile"><img src="img/esc/moneda.png" alt=""></span><b class="t">Regalo del día</b><span class="cpx">100 de oro</span>' + (t.regalo ? '<span class="chip">Recogido</span>' : '<button class="btn gold" id="ti-regalo">Recoger</button>') + '</div>'
    + t.slots.map(carta).join('') + '</div><div class="acts start"><button class="btn small" id="ti-renovar">Renovar ofertas · ' + gemBtn(TI.renovar) + '</button></div></div>'
    + '<div class="shsec"><h3>Celdas <small>se abren en Campaña → Celdas</small></h3><div class="offers">' + CELDAS.map(c => '<div class="offer"><span class="pile"><img src="img/celdas/celda_' + c.id + '_0.png" alt=""></span><b class="t">' + c.name + '</b><small>' + c.cartas + ' cartas · tienes ' + (celdasDe()[c.id] || 0) + '</small><button class="btn gold" data-cel="' + c.id + '">' + gemBtn(c.precio) + '</button></div>').join('') + '</div></div>'
    + '<div class="shsec"><h3>Oro</h3><div class="offers">' + TI.oro.map(([g, o], i) => '<div class="offer"><span class="pile pack"><img src="img/tienda/oro_' + (i + 1) + '.png" alt=""></span><span class="big">' + fmt(o) + '</span><small>de oro</small><button class="btn gold" data-oro="' + i + '">' + gemBtn(g) + '</button></div>').join('') + '</div></div>'
    + '<div class="shsec"><h3>Diamantes <small>los pagos llegarán más adelante</small></h3><div class="offers">' + TI.gemas.map(([g, e, tag], i) => '<div class="offer">' + (tag ? '<span class="tag">' + tag + '</span>' : '') + '<span class="pile pack"><img src="img/tienda/gemas_' + (i + 1) + '.png" alt=""></span><span class="big">' + fmt(g) + '</span><small>diamantes</small><button class="btn" disabled>' + e + '</button></div>').join('') + '</div></div>'
    + '<div class="shsec"><h3>Ofertas varias</h3><div class="offers">' + TI.varios.map(v => '<div class="offer"><span class="pile' + (v.img.length > 1 ? ' two' : '') + '">' + v.img.map(n => '<img src="img/' + n + '.png" alt="">').join('') + '</span><b class="t">' + v.name + '</b><small>' + v.txt + '</small>'
      + (v.real ? '<button class="btn" disabled>' + v.real + '</button><small>Próximamente</small>' : '<button class="btn gold" data-v="' + v.id + '">' + costeHtml(v.p) + '</button>') + '</div>').join('') + '</div></div>';
  if ($('ti-regalo')) $('ti-regalo').onclick = e => { t.regalo = true; perfil.gold += 100; savePerfil(); coinFly(e.currentTarget, 100); openTienda(); };
  $('ti-renovar').onclick = () => { if (paga({ gemas: TI.renovar })) { tiHoy(true); toast('Ofertas nuevas.'); openTienda(); } };
  document.querySelectorAll('#ti-body [data-c]').forEach(b => { b.onclick = () => {
    const o = t.slots[+b.dataset.c], [n, p] = TI.cartas[RARITY[o.k] || 'comun']; if (o.sold || !paga(p)) return;
    o.sold = true;
    if (!perfil.owned.includes(o.k)) { perfil.owned.push(o.k); if (n > 1) addCopias(o.k, n - 1); savePerfil(); pop('<div class="freed">' + cardHtml(o.k, 'reveal') + '<p><b>¡' + NAMES[o.k] + ' se une a tu ejército!</b><br>Y ' + (n - 1) + ' copias más de su carta.</p></div>'); }
    else { addCopias(o.k, n); savePerfil(); toast('+' + n + ' copias de ' + LABEL[o.k] + '.'); }
    openTienda();
  }; });
  document.querySelectorAll('#ti-body [data-cel]').forEach(b => { b.onclick = () => { const c = CELDA(b.dataset.cel); if (paga({ gemas: c.precio })) { darCelda(c.id); savePerfil(); toast('Has conseguido una ' + c.name.toLowerCase() + '.'); openTienda(); } }; });
  document.querySelectorAll('#ti-body [data-oro]').forEach(b => { b.onclick = () => { const [g, o] = TI.oro[+b.dataset.oro]; if (paga({ gemas: g })) { perfil.gold += o; savePerfil(); coinFly(b, o); openTienda(); } }; });
  document.querySelectorAll('#ti-body [data-v]').forEach(b => { b.onclick = () => {
    const v = TI.varios.find(x => x.id === b.dataset.v); if (!paga(v.p)) return;
    const g = v.give; if (g.cuerdas) perfil.cuerdas = (perfil.cuerdas || 0) + g.cuerdas; if (g.antorchas) perfil.antorchas = (perfil.antorchas || 0) + g.antorchas; if (g.insignias) addInsignias(g.insignias);
    savePerfil(); toast(v.name + ': comprado.'); openTienda();
  }; });
  paintGold(); show('tienda');
}
window.__openTienda = openTienda;
