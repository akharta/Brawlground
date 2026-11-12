
/* ==== Botón de bugs: al pulsarlo se hace al instante una captura de la pantalla tal cual; luego escribes una nota y se sube
   al repositorio (carpeta bugs/: la imagen .png y la nota .md) con la API de GitHub. Para subir hace falta un token de GitHub
   que se guarda solo en este móvil (se pide la primera vez). Si no hay conexión, el informe espera y se reintenta. ==== */
const BUG_REPO = 'akharta/brawlground', BUG_DIR = 'bugs';
const bugTok = () => { try { return localStorage.getItem('bg-gh-token') || ''; } catch (e) { return ''; } };
let bugShot = null;
(function cargaH2C() {   // librería para fotografiar la página (se carga al arrancar, sin frenar el juego)
  const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; s.async = true; document.head.appendChild(s);
})();
function bugContexto() {
  const scr = (typeof SCREENS !== 'undefined' ? SCREENS : []).find(id => $(id) && !$(id).hidden) || (B && !B.idle ? 'batalla' : 'menu');
  const d = { pantalla: scr, fecha: new Date().toISOString(), ancho: innerWidth, alto: innerHeight, dpr: devicePixelRatio, ua: navigator.userAgent };
  try { if (B) Object.assign(d, { batalla: !B.idle && !B.demo, tiempo: Math.round(B.t), run: B.run, mano: B.blue && B.blue.hand, unidades: units.map(u => u.type + ':' + u.team[0] + ':' + u.state + ':' + Math.round(u.hp)) }); } catch (e) {}
  return d;
}
async function bugCaptura() {
  const g = window.__game;
  if (g && g.renderer && g.renderer.snapshot) await new Promise(r => g.renderer.snapshot(() => r()));   // fuerza un dibujo fresco del lienzo
  if (window.html2canvas) {
    try { const c = await html2canvas(document.body, { backgroundColor: '#161b2b', scale: Math.min(2, devicePixelRatio), logging: false, useCORS: true, width: innerWidth, height: innerHeight, x: scrollX, y: scrollY, ignoreElements: el => el.id === 'bugdlg' || el.id === 'bugbtn' }); return c.toDataURL('image/png'); } catch (e) {}
  }
  try { return g.canvas.toDataURL('image/png'); } catch (e) { return null; }
}
async function bugSube(path, b64, msg) {
  const r = await fetch('https://api.github.com/repos/' + BUG_REPO + '/contents/' + path, { method: 'PUT',
    headers: { Authorization: 'Bearer ' + bugTok(), Accept: 'application/vnd.github+json' }, body: JSON.stringify({ message: msg, content: b64 }) });
  if (!r.ok) throw new Error('GitHub ' + r.status);
}
const b64txt = t => btoa(unescape(encodeURIComponent(t)));
async function bugEnvia(rep) {
  const id = rep.ctx.fecha.replace(/[:.]/g, '-'), base = BUG_DIR + '/' + id;
  if (rep.img) await bugSube(base + '.png', rep.img.split(',')[1], 'Bug: captura ' + id);
  await bugSube(base + '.md', b64txt('# Bug ' + rep.ctx.fecha + '\n\n' + rep.nota + '\n\n' + (rep.img ? '![captura](' + id + '.png)\n\n' : '') + '```json\n' + JSON.stringify(rep.ctx, null, 1) + '\n```\n'), 'Bug: ' + rep.nota.slice(0, 60));
}
function bugCola() { try { return JSON.parse(localStorage.getItem('bg-bugs') || '[]'); } catch (e) { return []; } }
function bugGuardaCola(q) { try { localStorage.setItem('bg-bugs', JSON.stringify(q)); return true; } catch (e) { return false; } }
async function bugReintenta() {
  if (!bugTok() || !navigator.onLine) return;
  const q = bugCola(); if (!q.length) return;
  const resto = [];
  for (const rep of q) { try { await bugEnvia(rep); } catch (e) { resto.push(rep); } }
  bugGuardaCola(resto); if (q.length > resto.length) toast('Enviados ' + (q.length - resto.length) + ' informes de bugs pendientes.');
}
window.addEventListener('online', bugReintenta); setTimeout(bugReintenta, 8000);
async function bugAbre() {
  const wasPaused = paused; if (B && !B.over && !B.idle && !B.auto && !paused) { paused = true; if (scene) scene.tweens.pauseAll(); }   // la batalla se para mientras escribes
  bugShot = { img: await bugCaptura(), ctx: bugContexto() };
  const dlg = $('bugdlg'); dlg.hidden = false;
  $('bug-prev').src = bugShot.img || ''; $('bug-prev').hidden = !bugShot.img;
  $('bug-nota').value = ''; $('bug-tok').hidden = !!bugTok(); $('bug-tokin').value = '';
  dlg.dataset.paused = wasPaused ? '1' : '';
  setTimeout(() => $('bug-nota').focus(), 50);
}
function bugCierra() {
  const dlg = $('bugdlg'); dlg.hidden = true; bugShot = null;
  if (!dlg.dataset.paused && B && !B.over && !B.idle && !B.auto && $('pausa').hidden) { paused = false; if (scene) scene.tweens.resumeAll(); }
}
$('bugbtn').onclick = () => { bugAbre(); };
$('bug-no').onclick = bugCierra;
$('bug-si').onclick = async () => {
  const nota = $('bug-nota').value.trim(); if (!nota) { $('bug-nota').focus(); return toast('Escribe qué ha pasado.'); }
  const t = $('bug-tokin').value.trim(); if (t) try { localStorage.setItem('bg-gh-token', t); } catch (e) {}
  const rep = Object.assign({ nota }, bugShot); bugCierra();
  if (!bugTok()) { bugGuardaCola(bugCola().concat([rep])); return toast('Guardado en el móvil: se subirá cuando pongas el token de GitHub.'); }
  toast('Subiendo el informe…');
  try { await bugEnvia(rep); toast('Bug enviado. ¡Gracias!'); }
  catch (e) { const ok = bugGuardaCola(bugCola().concat([rep])); toast(/401|403/.test(e.message) ? 'El token no vale (' + e.message + '). Bórralo y pon otro.' : ok ? 'Sin conexión: se enviará más tarde.' : 'No se pudo enviar ni guardar.'); }
};
$('bug-borra').onclick = () => { try { localStorage.removeItem('bg-gh-token'); } catch (e) {} $('bug-tok').hidden = false; toast('Token borrado de este móvil.'); };
window.__bugAbre = bugAbre;
