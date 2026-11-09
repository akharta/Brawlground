
/* ==== Deslizar entre las pestañas de la barra (Tienda · Reino · Campaña · Ejército · Eventos): la pantalla sigue al dedo
   1:1 (si lo mueves despacio y poco, se mueve despacio y poco) y la de al lado entra a la vez. Al soltar, si pasaste
   un tercio o lo lanzaste rápido, termina de entrar a la velocidad del gesto; si no, vuelve a su sitio. ==== */
const SW_TABS = ['tienda', 'hogar', 'menu', 'arena', 'eventos'];
const SW_UMBRAL = 12;
let SW = null, swClick = 0;
const swPaginas = id => id === 'menu' ? [$('menu'), $('game')] : [$(id)];   // la campaña lleva el campo de fondo
const swActual = () => SW_TABS.find(id => !$(id).hidden);
function swNav(id) { document.querySelectorAll('#nav button').forEach(b => { if (b.dataset.tab === id) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); }); }
function swEvita(t) {
  // no se cambia de pestaña desde la barra, un campo de texto, algo que se desplaza de lado o con una ventana encima
  if (document.querySelector('.screen.pop:not([hidden]), .screen.dim:not([hidden])')) return true;
  for (let e = t; e && e !== document.body; e = e.parentElement) {
    if (e.id === 'nav' || e.matches('input, select, textarea, [data-nodesliza]')) return true;
    const cs = getComputedStyle(e);
    if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && e.scrollWidth > e.clientWidth + 2) return true;
  }
  return false;
}
function swPon(off) {
  const d = SW, w = innerWidth;
  swPaginas(d.cur).forEach(el => { el.style.transform = 'translate3d(' + off + 'px,0,0)'; });
  if (d.nb) swPaginas(d.nb).forEach(el => { el.style.transform = 'translate3d(' + (off + d.dir * w) + 'px,0,0)'; });
}
function swLimpia(ids) { ids.forEach(id => swPaginas(id).forEach(el => { el.style.transition = ''; el.style.transform = ''; el.style.willChange = ''; })); }
function swEmpieza() {
  const d = SW; d.on = true;
  d.dir = d.dx < 0 ? 1 : -1;                                   // 1: entra la de la derecha
  const i = SW_TABS.indexOf(d.cur); d.nb = SW_TABS[i + d.dir] || null;
  if (d.nb) {
    goTab(d.nb);                                              // prepara la de al lado (la pinta) …
    $(d.cur).hidden = false; swNav(d.cur);                     // … pero aún estás en la tuya
    if (d.cur === 'menu' || d.nb === 'menu') { const gm = window.__game; if (gm && gm.loop && !gm.loop.running) gm.loop.wake(); }
    swPaginas(d.nb).forEach(el => { el.style.willChange = 'transform'; el.style.transition = 'none'; });
  }
  swPaginas(d.cur).forEach(el => { el.style.willChange = 'transform'; el.style.transition = 'none'; });
}
function swOff() {
  const d = SW; let off = d.dx - Math.sign(d.dx) * SW_UMBRAL;
  if (!d.nb || Math.sign(off) === d.dir) off = d.nb ? 0 : off * 0.25;   // sin pestaña a ese lado: tira con resistencia
  return off;
}
document.addEventListener('pointerdown', e => {
  if (SW || e.button > 0 || !e.isPrimary) return;
  const cur = swActual(); if (!cur || !$('hud').hidden || swEvita(e.target)) return;
  SW = { id: e.pointerId, cur, x0: e.clientX, y0: e.clientY, dx: 0, on: false, muestras: [[performance.now(), e.clientX]] };
}, true);
document.addEventListener('pointermove', e => {
  const d = SW; if (!d || e.pointerId !== d.id || d.anim) return;
  d.dx = e.clientX - d.x0; const dy = e.clientY - d.y0;
  if (!d.on) {
    if (Math.abs(dy) > SW_UMBRAL && Math.abs(dy) > Math.abs(d.dx)) { SW = null; return; }   // es un desplazamiento vertical
    if (Math.abs(d.dx) < SW_UMBRAL || Math.abs(d.dx) < Math.abs(dy) * 1.3) return;
    swEmpieza();
  }
  const now = performance.now(); d.muestras.push([now, e.clientX]); while (d.muestras.length > 2 && now - d.muestras[0][0] > 90) d.muestras.shift();
  swPon(swOff());
}, true);
function swSuelta(cancel) {
  const d = SW; if (!d) return;
  if (!d.on) { SW = null; return; }
  swClick = performance.now(); d.anim = true;
  const w = innerWidth, off = swOff(), m = d.muestras, a = m[0], b = m[m.length - 1];
  const v = b[0] > a[0] ? (b[1] - a[1]) / (b[0] - a[0]) : 0;          // px/ms; hacia la nueva pestaña es -dir
  const hacia = -d.dir * v, prog = -d.dir * off / w;
  const pasa = !cancel && d.nb && (prog > 0.33 || (hacia > 0.35 && prog > 0.04)) && hacia > -0.3;
  const fin = pasa ? -d.dir * w : 0, falta = Math.abs(fin - off);
  const ms = Math.max(120, Math.min(340, falta / Math.max(Math.abs(v), 1.4)));   // sigue a la velocidad del gesto
  const ids = [d.cur].concat(d.nb ? [d.nb] : []);
  ids.forEach(id => swPaginas(id).forEach(el => { el.style.transition = 'transform ' + Math.round(ms) + 'ms cubic-bezier(.2,.75,.3,1)'; }));
  requestAnimationFrame(() => swPon(fin));
  setTimeout(() => {
    swLimpia(ids); SW = null;
    if (pasa) show(d.nb);                                    // ya estás en la nueva (barra, bucle del juego…)
    else if (d.nb) show(d.cur);                              // vuelves a la tuya
  }, ms + 30);
}
document.addEventListener('pointerup', e => { if (SW && e.pointerId === SW.id) swSuelta(false); }, true);
document.addEventListener('pointercancel', e => { if (SW && e.pointerId === SW.id) swSuelta(!SW.on); }, true);
// lo que empieza en un botón y acaba en deslizar no es un toque
document.addEventListener('click', e => { if (performance.now() - swClick < 400) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
