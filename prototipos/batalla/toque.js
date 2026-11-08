
/* ==== Toque: todo lo que se pulsa (botones, cartas, castillos del mapa, pestañas…) se ilumina por su contorno y crece
   un poco, igual que los lugares del reino. Fuera de la batalla, la acción espera un instante para que se vea el gesto;
   en la batalla (cartas, héroe, hechizo, pausa) responde al momento. ==== */
const TAP_SEL = 'button, a[href], [role="button"]';
const TAP_PROPIO = '.bzone, .blabel';                      // los lugares del reino ya tienen su animación
const TAP_YA = '#hud, #abrir, #tap';                       // aquí la acción no espera
const TAP_GLOW = 'drop-shadow(0 0 2px #ffffff) drop-shadow(0 0 7px #ffd54a)';
const TAP_ESPERA = 130;
const tapMotion = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;
let tapEl = null, tapHold = null, tapPass = null;
function tapTarget(t) {
  const el = t && t.closest ? t.closest(TAP_SEL) : null;
  if (!el || el.disabled || el.matches(TAP_PROPIO) || el.getAttribute('aria-disabled') === 'true') return null;
  return el;
}
const tapBase = el => { const f = getComputedStyle(el).filter; return f && f !== 'none' ? f + ' ' : ''; };
function tapPress(el) {
  if (!tapMotion() || !el.animate) return;
  const b = tapBase(el);
  tapHold = el.animate([{ scale: '1', filter: b + 'drop-shadow(0 0 0 #fff0)' }, { scale: '1.07', filter: b + TAP_GLOW + ' brightness(1.05)' }], { duration: 110, easing: 'ease-out', fill: 'forwards' });
}
function tapPop(el) {
  if (!tapMotion() || !el.animate) return;
  if (tapHold) { tapHold.cancel(); tapHold = null; }
  const b = tapBase(el);
  el.animate([
    { scale: '1.07', filter: b + TAP_GLOW + ' brightness(1.05)' },
    { scale: '1.11', filter: b + TAP_GLOW + ' brightness(1.08)', offset: 0.4 },
    { scale: '1', filter: b + 'drop-shadow(0 0 0 #fff0)' },
  ], { duration: 340, easing: 'cubic-bezier(.3, 1.4, .5, 1)' });
}
document.addEventListener('pointerdown', e => {
  if (e.button > 0) return;
  const el = tapTarget(e.target); if (!el) return;
  tapEl = el; tapPress(el);
}, true);
const tapSuelta = () => { if (tapEl) { tapPop(tapEl); tapEl = null; } };
document.addEventListener('pointerup', tapSuelta, true);
document.addEventListener('pointercancel', () => { if (tapHold) { tapHold.cancel(); tapHold = null; } tapEl = null; }, true);
document.addEventListener('click', e => {
  const el = tapTarget(e.target); if (!el || tapPass === el) return;
  if (e.detail === 0 && e.isTrusted) tapPop(el);              // con teclado: también se ve
  if (!tapMotion() || el.closest(TAP_YA)) return;
  e.preventDefault(); e.stopImmediatePropagation();          // deja ver el gesto y luego hace lo suyo
  setTimeout(() => { tapPass = el; try { el.click(); } finally { tapPass = null; } }, TAP_ESPERA);
}, true);
