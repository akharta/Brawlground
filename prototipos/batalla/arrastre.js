
/* ==== Arrastrar una carta al campo ("pulsa y arrastra"): tocar la carta la saca del castillo como siempre; mantenerla y
   arrastrarla fuera del panel la convierte en la unidad, que cuelga de tu dedo como si la cogiera un gigante (se balancea
   y patalea agitando el arma). Al soltarla cae por su peso, levanta polvo y sigue su marcha. Se arrastran todas, pero:
   - solo se sueltan en TU mitad del campo (si la llevas más allá, se queda en la frontera);
   - nunca detrás de un enemigo que ya esté en tu mitad: siempre por delante de él (se queda justo delante);
   - salvo los asesinos, que sí pueden caer a la espalda de los enemigos (entre su primera línea y su retaguardia).
   Ninguna unidad ni habilidad permite aún soltarlas en la mitad rival. ==== */
const CLASE = { legionario: 'asesino', ninja: 'asesino' };            // clases de las unidades (de momento solo asesinos)
const ASESINO = t => CLASE[t] === 'asesino' && t !== 'ninja';       // Kazú es asesino, pero con su shuriken va aparte (de momento, como las demás)
const DR_UMBRAL = 9;                                                 // px que hay que mover el dedo para que sea arrastre
let DR = null, drClick = 0;
const drMid = () => W / 2 - H * 0.25;                                // hasta dónde llega tu mitad
function drLimite(t) {
  // lo más lejos que puede caer: tu mitad y, si no es asesina, por delante del primer enemigo que ya esté en ella
  let lim = drMid();
  if (!ASESINO(t)) for (const v of units) if (v.team === 'purple' && v.alive && v.state !== 'die' && !v.isCastle && v.x - H * 0.45 < lim) lim = v.x - H * 0.45;
  return lim;
}
const drWorld = (cx, cy) => { const z = cam.zoom / DPR; return [cx / z + cam.worldView.x, cy / z + cam.worldView.y]; };
function drDentro(x, y) { const r = $('dock').getBoundingClientRect(); return x >= r.left - 4 && x <= r.right + 4 && y >= r.top - 4 && y <= r.bottom + 4; }
function drFantasma(t) {
  // la unidad que cuelga del dedo: una de verdad, pero fuera de la batalla (no está en la lista de unidades)
  const g = new Unit(scene, t, 'blue', FIELD_L); g.set('held'); g.heldH = H * 0.6; g.swing = 0; g.w = 0;
  g.root.setDepth(1500); g.bar.clear(); g.root.setScale(0.2); g.pop = 0; g.nuevo = true;
  return g;
}
function drQuita(g) { if (!g) return; g.root.destroy(); g.bar.destroy(); ['laserG', 'ultIcon', 'plasmaG', 'beamG'].forEach(k => { if (g[k]) g[k].destroy(); }); }
function drFin(soltar) {
  const d = DR; if (!d) return; DR = null;
  const c = d.c; c.classList.remove('drag', 'fuera', 'nope'); c.style.transform = '';
  if (d.g2) d.g2.destroy();
  const lim = d.g ? drLimite(d.t) : 0;
  if (soltar && d.g && d.g.root.visible && lim >= FIELD_L && B && !B.over && !paused && B.blue.hand[d.i] === d.t) {
    PLAY_AT = { x: Math.min(d.g.x, lim), hop: d.g.heldH, lane: d.g.lane, swing: d.g.swing };
    try { play('blue', d.i); } finally { PLAY_AT = null; }
  }
  drQuita(d.g);
}
$('hand').addEventListener('pointerdown', e => {
  const c = e.target.closest('.hc');
  if (!c || e.button > 0 || DR || !B || B.over || B.auto || paused) return;
  DR = { c, i: +c.dataset.i, t: B.blue.hand[+c.dataset.i], id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, on: false, out: false, g: null, g2: null, avisado: false };
});
document.addEventListener('pointermove', e => {
  const d = DR; if (!d || e.pointerId !== d.id) return;
  d.x = e.clientX; d.y = e.clientY;
  const dx = d.x - d.x0, dy = d.y - d.y0;
  if (!d.on) { if (Math.hypot(dx, dy) < DR_UMBRAL) return; d.on = true; d.c.classList.add('drag'); }
  d.out = !drDentro(d.x, d.y);
  const vale = COST[d.t] <= B.blue.energy;
  // la carta sigue al dedo dentro del panel; fuera, si se puede, se convierte en la unidad
  d.c.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.08)';
  d.c.classList.toggle('fuera', d.out && vale); d.c.classList.toggle('nope', d.out && !vale);
  if (d.out && !vale && !d.avisado) {
    d.avisado = true; const [wx, wy] = drWorld(d.x, d.y - 70);
    floatText(wx, wy, 'Falta energía', '#ffb4b4');
  }
  if (d.out && vale && !d.g) d.g = drFantasma(d.t);
  if (d.g) d.g.root.setVisible(d.out && vale);
});
document.addEventListener('pointerup', e => { if (!DR || e.pointerId !== DR.id) return; if (DR.on) drClick = performance.now(); drFin(DR.on && DR.out); });
document.addEventListener('pointercancel', e => { if (DR && e.pointerId === DR.id) drFin(false); });
// tras un arrastre no cuenta como toque (la carta no sale del castillo)
$('hand').addEventListener('click', e => { if (performance.now() - drClick < 400) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);

function arrastreTick(dt) {
  const d = DR; if (!d) return;
  if (!B || B.over || paused || $('hud').hidden) { drFin(false); return; }
  const g = d.g; if (!g || !g.root.visible) { if (d.g2) d.g2.clear(); return; }
  const rdt = Math.max(dt, 1 / 120), z = cam.zoom / DPR;
  const [wx, wy] = drWorld(d.x, d.y), lim = drLimite(d.t), hueco = lim >= FIELD_L;
  // donde caería: entre tu muralla y el límite; cuelga un poco por encima del dedo para que se vea
  const tx = Math.max(FIELD_L, Math.min(lim, wx));
  if (g.nuevo) { g.nuevo = false; g.x = tx; } g.pop = Math.min(1, g.pop + rdt / 0.14);
  const ph = g.x; g.x += (tx - g.x) * (1 - Math.exp(-rdt * 22));
  g.heldH = Math.max(H * 0.45, Math.min(H * 4, g.gy - (wy - 26 / z)));
  // péndulo: al moverla, los pies se quedan atrás y luego se mece
  const vx = (g.x - ph) / rdt, tgt = Math.max(-0.7, Math.min(0.7, vx * 0.0016));
  g.w += ((tgt - g.swing) * 70 - g.w * 7) * rdt; g.swing += g.w * rdt;
  g.root.setScale(0.2 + 0.8 * ease(g.pop));
  g.update(rdt); g.root.y = g.gy;
  // en rojo, donde no se puede (más allá del límite), la línea del límite y la marca del suelo donde caerá
  if (!d.g2) d.g2 = scene.add.graphics().setDepth(8);
  const G = d.g2, top = GROUND - H * 4.5, x0 = hueco ? lim : FIELD_L - H, pegada = wx > lim;
  G.clear();
  G.fillStyle(0xff3b3b, 0.22).fillRect(x0, top, W - x0, GROUND + 40 - top);
  if (hueco) for (let y = top; y < GROUND + 30; y += 22) G.fillStyle(pegada ? 0xff6b6b : 0xffffff, pegada ? 0.85 : 0.5).fillRect(lim - 2, y, 4, 12);
  G.lineStyle(3, hueco ? 0xffffff : 0xff6b6b, 0.75).strokeEllipse(g.x, g.gy, H * 0.75, H * 0.2);
  G.fillStyle(hueco ? 0x4aa8ff : 0xff3b3b, 0.25).fillEllipse(g.x, g.gy, H * 0.75, H * 0.2);
}
const _battleStepDr = battleStep;
battleStep = function (dt) { _battleStepDr(dt); arrastreTick(dt); };
