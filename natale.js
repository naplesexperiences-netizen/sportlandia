/* =====================================================================
   NATALE: ghirlanda, nevicata e musica. Indipendente dalla galleria:
   se qualcosa qui fallisce, il totem continua a girare.
   ===================================================================== */
(() => {
'use strict';
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const rnd = (a, b) => a + Math.random() * (b - a);
const gPx = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--g')) || 30;

/* ---------------- GHIRLANDA ---------------- */
const garland = document.getElementById('garland');
const gc = document.getElementById('garlandCanvas');

// percorso rettangolare lungo il centro della fascia, in senso orario
function perimeter(w, h, g) {
  const m = g / 2, pts = [];
  const seg = (x0, y0, x1, y1) => {
    const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(len / 3));
    for (let i = 0; i < n; i++) pts.push([x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n]);
  };
  seg(m, m, w - m, m); seg(w - m, m, w - m, h - m);
  seg(w - m, h - m, m, h - m); seg(m, h - m, m, m);
  return pts;
}

function drawGarland() {
  const w = innerWidth, h = innerHeight, g = gPx();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  gc.width = w * dpr; gc.height = h * dpr;
  const c = gc.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);
  const pts = perimeter(w, h, g);

  // ombra interna: stacca la cornice dal contenuto
  c.save();
  c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = g * .6;
  c.strokeStyle = 'rgba(8,30,18,.9)'; c.lineWidth = g * .55;
  c.strokeRect(g / 2, g / 2, w - g, h - g);
  c.restore();

  // aghi di abete: tre strati, dal piu' scuro al piu' chiaro
  const layers = [
    ['#0b3d22', '#0f4a2a', .62, 5], ['#14572f', '#1b6b3a', .52, 4], ['#2a8048', '#3d9a5a', .38, 2]
  ];
  c.lineCap = 'round';
  for (const [a, b, lenK, per] of layers) {
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i];
      for (let k = 0; k < per; k++) {
        const ang = Math.random() * Math.PI * 2, len = g * lenK * rnd(.55, 1);
        c.strokeStyle = Math.random() < .5 ? a : b;
        c.lineWidth = rnd(1, 2.1);
        c.beginPath(); c.moveTo(x + rnd(-2, 2), y + rnd(-2, 2));
        c.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); c.stroke();
      }
    }
  }
  // brina leggera sulle punte
  c.fillStyle = 'rgba(255,255,255,.55)';
  for (let i = 0; i < pts.length; i += 2) {
    if (Math.random() < .35) {
      const [x, y] = pts[i];
      c.beginPath(); c.arc(x + rnd(-g * .4, g * .4), y + rnd(-g * .4, g * .4), rnd(.6, 1.4), 0, 7); c.fill();
    }
  }

  // palline rosse e oro, a intervalli regolari
  const step = Math.round(g * 4.6 / 3);   // pts sono a 3px l'uno dall'altro
  const palette = [['#ff5252', '#b71c1c'], ['#ffe082', '#c79100'], ['#ef5350', '#8e1414'], ['#e0e0e0', '#8d99a6']];
  for (let i = Math.round(step / 2), n = 0; i < pts.length; i += step, n++) {
    const [x, y] = pts[i], r = g * rnd(.22, .3);
    const [hi, lo] = palette[n % palette.length];
    const gr = c.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
    gr.addColorStop(0, '#fff'); gr.addColorStop(.18, hi); gr.addColorStop(1, lo);
    c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  }

  // lucine (DOM, per l'animazione a costo zero)
  garland.querySelectorAll('.light,.bow').forEach(el => el.remove());
  const colors = ['#fff4c2', '#ff6b6b', '#ffd54f', '#7ee787', '#fff4c2', '#82b1ff'];
  const lstep = Math.round(g * 2.3 / 3);
  for (let i = 0, n = 0; i < pts.length; i += lstep, n++) {
    const [x, y] = pts[i], l = document.createElement('i');
    l.className = 'light';
    l.style.left = (x + rnd(-g * .18, g * .18)) + 'px';
    l.style.top = (y + rnd(-g * .18, g * .18)) + 'px';
    l.style.setProperty('--c', colors[n % colors.length]);
    l.style.setProperty('--t', rnd(1.4, 3.2).toFixed(2) + 's');
    l.style.setProperty('--d', (-rnd(0, 3)).toFixed(2) + 's');
    garland.appendChild(l);
  }

  // fiocchi in alto: agli angoli e al centro (in basso coprirebbero il footer)
  const tpl = document.getElementById('bowTpl');
  [[g * .1, g * -.35], [w - g * 3.1, g * -.35], [w / 2 - g * 1.5, g * -.45]]
    .forEach(([x, y]) => {
      const b = tpl.content.firstElementChild.cloneNode(true);
      b.classList.add('bow');
      b.style.left = x + 'px'; b.style.top = y + 'px';
      garland.appendChild(b);
    });
}
let rz;
addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { drawGarland(); sizeSnow(); }, 150); });
drawGarland();

/* ---------------- NEVICATA ---------------- */
// "Ogni tanto": episodi di ~25 s ogni 40-80 s, con entrata e uscita graduali.
// Il primo parte dopo pochi secondi, cosi' chi passa davanti lo vede subito.
const SNOW_FIRST = 6, SNOW_LEN = 25, SNOW_GAP = [40, 80];
const sc = document.getElementById('snow'), sx = sc.getContext('2d');
let flakes = [], snowing = false, snowT0 = 0, raf = null, last = 0, W = 0, H = 0;

function sizeSnow() {
  W = innerWidth; H = innerHeight;
  // risoluzione 1:1 anche su schermi densi: la neve e' morbida, non serve di piu'
  sc.width = W; sc.height = H;
}
sizeSnow();

function flake(top) {
  const z = Math.random();                 // profondita': vicini = grandi e veloci
  return { x: rnd(0, W), y: top ? rnd(-H * .15, -10) : rnd(-H * .2, H), r: 1.2 + z * z * 4.2,
           vy: 30 + z * 70, sway: rnd(.4, 1.4), ph: rnd(0, 6.3), a: .45 + z * .5 };
}

function startSnow() {
  if (reduce.matches || document.hidden) return scheduleSnow();
  snowing = true; snowT0 = performance.now();
  const n = Math.round(W * H / 9000);      // ~230 fiocchi su un 1080x1920
  flakes = Array.from({ length: n }, () => flake(false));
  last = performance.now();
  if (!raf) raf = requestAnimationFrame(frame);
}
function scheduleSnow(first) {
  setTimeout(startSnow, (first ? SNOW_FIRST : rnd(SNOW_GAP[0], SNOW_GAP[1])) * 1000);
}

function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  const t = (now - snowT0) / 1000;
  // intensita': 0 -> 1 nei primi 4 s, 1 -> 0 negli ultimi 5 s
  const k = Math.max(0, Math.min(1, t / 4, (SNOW_LEN - t) / 5));
  sx.clearRect(0, 0, W, H);
  sx.fillStyle = '#fff';
  let alive = 0;
  for (const f of flakes) {
    f.y += f.vy * dt; f.ph += dt * f.sway;
    f.x += Math.sin(f.ph) * 22 * dt;
    if (f.y > H + 10) {
      if (t < SNOW_LEN - 5) Object.assign(f, flake(true));   // ricicla finche' nevica
      else continue;                                         // poi lascia cadere gli ultimi
    }
    alive++;
    sx.globalAlpha = f.a * Math.max(k, t > SNOW_LEN - 5 ? .35 : 0);
    sx.beginPath(); sx.arc(f.x, f.y, f.r, 0, 7); sx.fill();
  }
  sx.globalAlpha = 1;
  if (t > SNOW_LEN && (!alive || t > SNOW_LEN + 12)) {
    snowing = false; raf = null; flakes = [];
    sx.clearRect(0, 0, W, H);
    return scheduleSnow();
  }
  raf = requestAnimationFrame(frame);
}
scheduleSnow(true);

/* ---------------- MUSICA ---------------- */
// Per usare registrazioni vere basta copiare dei file in musica/ (nella radice) e
// elencarli qui: suonano in ciclo al posto del carillon sintetizzato.
// Usare SOLO brani di cui si hanno i diritti (o di pubblico dominio anche
// nell'esecuzione): la diffusione in un locale aperto al pubblico e'
// soggetta a SIAE/SCF. Le melodie sotto sono tradizionali di pubblico dominio
// e il suono e' generato qui, quindi non c'e' alcuna registrazione di terzi.
const MUSIC_FILES = [];   // es. ['musica/brano1.mp3', 'musica/brano2.mp3']
const VOLUME = .32;

const btn = document.getElementById('music');
let wantOn = true;
try { wantOn = localStorage.getItem('sportlandia-natale-musica') !== 'off'; } catch (e) {}

// --- melodie (nota, durata in movimenti). Accordi: radice per battuta. ---
const SONGS = [
  { name: 'Jingle Bells', bpm: 168, bells: true,
    mel: 'D4 1 B4 1 A4 1 G4 1 D4 3 D4 .5 D4 .5 D4 1 B4 1 A4 1 G4 1 E4 4 E4 1 C5 1 B4 1 A4 1 F#4 4 D5 1 D5 1 C5 1 A4 1 B4 4 ' +
         'D4 1 B4 1 A4 1 G4 1 D4 4 D4 1 B4 1 A4 1 G4 1 E4 3 E4 1 E4 1 C5 1 B4 1 A4 1 D5 1 D5 1 D5 1 D5 1 E5 1 D5 1 C5 1 A4 1 G4 2 D5 2 ' +
         'B4 1 B4 1 B4 2 B4 1 B4 1 B4 2 B4 1 D5 1 G4 1.5 A4 .5 B4 4 C5 1 C5 1 C5 1.5 C5 .5 C5 1 B4 1 B4 1 B4 .5 B4 .5 B4 1 A4 1 A4 1 B4 1 A4 2 D5 2 ' +
         'B4 1 B4 1 B4 2 B4 1 B4 1 B4 2 B4 1 D5 1 G4 1.5 A4 .5 B4 4 C5 1 C5 1 C5 1 C5 1 C5 1 B4 1 B4 1 B4 .5 B4 .5 D5 1 D5 1 C5 1 A4 1 G4 4',
    bass: 'G2 4 G2 4 G2 4 C3 4 C3 4 D3 4 D3 4 G2 4 G2 4 G2 4 G2 4 C3 4 C3 4 D3 4 D3 4 G2 4 ' +
          'G2 4 G2 4 G2 4 G2 4 C3 4 G2 4 D3 4 D3 4 G2 4 G2 4 G2 4 G2 4 C3 4 G2 4 D3 4 G2 4' },
  { name: 'We Wish You a Merry Christmas', bpm: 150,
    mel: 'D4 1 G4 1 G4 .5 A4 .5 G4 .5 F#4 .5 E4 1 E4 1 E4 1 A4 1 A4 .5 B4 .5 A4 .5 G4 .5 F#4 1 D4 1 D4 1 ' +
         'B4 1 B4 .5 C5 .5 B4 .5 A4 .5 G4 1 E4 1 D4 .5 D4 .5 E4 1 A4 1 F#4 1 G4 2 D4 1 ' +
         'G4 1 G4 1 G4 1 F#4 2 F#4 1 G4 1 F#4 1 E4 1 D4 2 A4 1 B4 1 A4 .5 A4 .5 G4 .5 G4 .5 D5 1 D4 1 D4 .5 D4 .5 E4 1 A4 1 F#4 1 G4 3',
    bass: 'R 1 G2 3 C3 3 A2 3 D3 3 B2 3 E3 3 C3 1 D3 2 G2 3 G2 3 D3 3 E3 3 D3 3 G2 3 D3 3 C3 1 D3 2 G2 3' },
  { name: 'Silent Night', bpm: 132,
    mel: 'G4 1.5 A4 .5 G4 1 E4 3 G4 1.5 A4 .5 G4 1 E4 3 D5 2 D5 1 B4 3 C5 2 C5 1 G4 3 ' +
         'A4 2 A4 1 C5 1.5 B4 .5 A4 1 G4 1.5 A4 .5 G4 1 E4 3 A4 2 A4 1 C5 1.5 B4 .5 A4 1 G4 1.5 A4 .5 G4 1 E4 3 ' +
         'D5 2 D5 1 F5 1.5 D5 .5 B4 1 C5 3 E5 3 C5 1.5 G4 .5 E4 1 G4 1.5 F4 .5 D4 1 C4 6',
    bass: 'C3 6 C3 6 G2 6 C3 6 F2 6 C3 6 F2 6 C3 6 G2 6 C3 6 C3 3 G2 3 C3 6' },
  { name: 'Deck the Halls', bpm: 152,
    mel: 'D5 1.5 C5 .5 B4 1 A4 1 G4 1 A4 1 B4 1 G4 1 A4 .5 B4 .5 C5 .5 A4 .5 B4 1.5 A4 .5 G4 1 F#4 1 G4 2 ' +
         'D5 1.5 C5 .5 B4 1 A4 1 G4 1 A4 1 B4 1 G4 1 A4 .5 B4 .5 C5 .5 A4 .5 B4 1.5 A4 .5 G4 1 F#4 1 G4 2 ' +
         'A4 1.5 B4 .5 C5 1 A4 1 B4 1.5 C5 .5 D5 1 A4 1 B4 .5 C#5 .5 D5 1 E5 .5 F#5 .5 G5 1 F#5 1 E5 1 D5 2 ' +
         'D5 1.5 C5 .5 B4 1 A4 1 G4 1 A4 1 B4 1 G4 1 E5 .5 E5 .5 E5 .5 E5 .5 D5 1.5 C5 .5 B4 1 A4 1 G4 2',
    bass: 'G2 4 G2 4 D3 2 G2 2 C3 1 D3 1 G2 2 G2 4 G2 4 D3 2 G2 2 C3 1 D3 1 G2 2 ' +
          'D3 4 G2 2 D3 2 D3 4 A2 2 D3 2 G2 4 G2 4 C3 2 G2 2 D3 2 G2 2' }
];
const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const hz = n => { const m = n.match(/^([A-G]#?)(\d)$/); return 440 * Math.pow(2, (NOTE[m[1]] + (+m[2] + 1) * 12 - 69) / 12); };
const parse = str => { const a = str.trim().split(/\s+/), out = []; for (let i = 0; i < a.length; i += 2) out.push([a[i], +a[i + 1]]); return out; };
SONGS.forEach(s => { s.mel = parse(s.mel); s.bass = parse(s.bass); });

let ctx = null, master = null, verb = null, timer = null, songIdx = 0, nextTime = 0, queue = [];

function setupAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0;
  // riverbero sintetico: rumore che decade, un po' di "salone"
  verb = ctx.createConvolver();
  const len = ctx.sampleRate * 2.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  verb.buffer = ir;
  const wet = ctx.createGain(); wet.gain.value = .35;
  verb.connect(wet); wet.connect(master);
  master.connect(ctx.destination);
  return true;
}

// carillon: fondamentale + armoniche inarmoniche brevi, decadimento lungo
function bell(f, t, dur, vel) {
  const out = ctx.createGain(); out.connect(master); out.connect(verb);
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(vel, t + .008);
  out.gain.exponentialRampToValueAtTime(.0008, t + Math.max(1.2, dur * 1.6));
  [[1, 1], [2, .35], [3.01, .12], [4.2, .06]].forEach(([m, g]) => {
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f * m; og.gain.value = g;
    o.connect(og); og.connect(out); o.start(t); o.stop(t + Math.max(1.3, dur * 1.7));
  });
}
function bassNote(f, t, dur) {
  const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = f;
  lp.type = 'lowpass'; lp.frequency.value = 600;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.16, t + .03);
  g.gain.setTargetAtTime(.07, t + .05, .3); g.gain.setTargetAtTime(0, t + dur - .05, .06);
  o.connect(lp); lp.connect(g); g.connect(master); g.connect(verb);
  o.start(t); o.stop(t + dur + .4);
  // quinta morbida sopra: armonia piena senza rischiare terze sbagliate
  const o2 = ctx.createOscillator(), g2 = ctx.createGain();
  o2.type = 'sine'; o2.frequency.value = f * 3; g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(.035, t + .2); g2.gain.setTargetAtTime(0, t + dur - .1, .1);
  o2.connect(g2); g2.connect(master); g2.connect(verb); o2.start(t); o2.stop(t + dur + .4);
}
let noiseBuf = null;
function sleigh(t) {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * .2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noiseBuf; hp.type = 'highpass'; hp.frequency.value = 7000;
  g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.001, t + .14);
  s.connect(hp); hp.connect(g); g.connect(master); s.start(t);
}

function queueSong(start) {
  const s = SONGS[songIdx % SONGS.length], beat = 60 / s.bpm;
  let t = start;
  for (const [n, d] of s.mel) { if (n !== 'R') queue.push(['m', t, hz(n), d * beat]); t += d * beat; }
  const end = t; t = start;
  for (const [n, d] of s.bass) { if (n !== 'R') queue.push(['b', t, hz(n), d * beat]); t += d * beat; }
  if (s.bells) for (let b = start; b < end; b += beat) queue.push(['s', b]);
  queue.sort((a, b) => a[1] - b[1]);
  songIdx++;
  return end + 2.5;                       // pausa tra un brano e l'altro
}

// schedulatore con anticipo: robusto anche se il main thread ha un singhiozzo
function tick() {
  if (!queue.length) nextTime = queueSong(Math.max(nextTime, ctx.currentTime + .1));
  const horizon = ctx.currentTime + .4;
  while (queue.length && queue[0][1] < horizon) {
    const [k, t, f, d] = queue.shift();
    if (t < ctx.currentTime - .05) continue;
    if (k === 'm') bell(f, t, d, .22); else if (k === 'b') bassNote(f, t, d); else sleigh(t);
  }
}

// --- riproduzione da file, se configurata ---
let audioEl = null, fileIdx = 0, useFiles = MUSIC_FILES.length > 0;
function playFile() {
  if (!audioEl) {
    audioEl = new Audio(); audioEl.volume = VOLUME;
    audioEl.addEventListener('ended', () => { fileIdx++; playFile(); });
    audioEl.addEventListener('error', () => { useFiles = false; audioEl = null; if (wantOn) start(); });
  }
  audioEl.src = MUSIC_FILES[fileIdx % MUSIC_FILES.length];
  return audioEl.play();
}

let running = false;
function start() {
  if (useFiles) {
    const p = playFile();
    if (p && p.then) p.then(() => { running = true; }, () => { running = false; });
    return;
  }
  if (!ctx && !setupAudio()) return;
  const go = () => {
    running = ctx.state === 'running';
    if (!running) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(VOLUME, ctx.currentTime, .6);   // entrata dolce
    if (!timer) { nextTime = ctx.currentTime + .2; timer = setInterval(tick, 100); tick(); }
  };
  ctx.state === 'running' ? go() : ctx.resume().then(go, () => {});
}
function stop() {
  running = false;
  if (audioEl) audioEl.pause();
  if (ctx) {
    master.gain.setTargetAtTime(0, ctx.currentTime, .25);
    setTimeout(() => {
      if (wantOn) return;
      clearInterval(timer); timer = null; queue = []; ctx.suspend();
    }, 900);
  }
}

function paintBtn() {
  btn.classList.toggle('is-muted', !wantOn);
  btn.setAttribute('aria-pressed', wantOn ? 'true' : 'false');
  btn.setAttribute('aria-label', wantOn ? 'Disattiva la musica di Natale' : 'Attiva la musica di Natale');
  document.getElementById('icoSound').style.display = wantOn ? 'block' : 'none';
  document.getElementById('icoMute').style.display = wantOn ? 'none' : 'block';
}
btn.addEventListener('click', e => {
  e.stopPropagation();
  // musica voluta ma bloccata dal browser: il primo tocco qui la avvia
  if (wantOn && !running) return start();
  wantOn = !wantOn;
  try { localStorage.setItem('sportlandia-natale-musica', wantOn ? 'on' : 'off'); } catch (err) {}
  paintBtn(); wantOn ? start() : stop();
});

// I browser avviano l'audio solo dopo un gesto: si prova subito (un totem in
// modalita' kiosk con --autoplay-policy=no-user-gesture-required parte da
// solo), altrimenti al primo tocco su qualunque punto dello schermo.
function kick(e) { if (wantOn && !running && !btn.contains(e.target)) start(); }
['pointerdown', 'touchend', 'keydown'].forEach(ev => addEventListener(ev, kick, { capture: true, passive: true }));
paintBtn();
if (wantOn) start();
})();
