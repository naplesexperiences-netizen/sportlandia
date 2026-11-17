/* =====================================================================
   SFONDO: FUOCO DEL CAMINO
   Fiamme generate in tempo reale con WebGL: nessun video da scaricare,
   nessun diritto da verificare, funziona offline.
   - Disegnato a 1/3 della risoluzione e ingrandito dal CSS: il fuoco e'
     morbido per natura, e cosi' anche un PC modesto regge senza fatica.
   - Massimo 30 fotogrammi al secondo, fermo a pagina nascosta.
   - Senza WebGL o con "riduci movimento" resta lo sfondo caldo statico.
   Se questo file manca o fallisce, il totem gira lo stesso.
   ===================================================================== */
(() => {
'use strict';
const host = document.querySelector('.ambient');
if (!host || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

const cv = document.createElement('canvas');
cv.className = 'fire';
const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
if (!gl) return;

const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS = `
precision mediump float;
uniform vec2 res; uniform float t;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ v += a * n(p); p *= 2.03; a *= .5; } return v; }

void main(){
  vec2 uv = gl_FragCoord.xy / res;               // 0,0 in basso a sinistra
  float asp = res.x / res.y;
  vec2 q = vec2((uv.x - .5) * asp, uv.y);

  // turbolenza che sale: due strati a velocita' diverse
  float rise = t * 1.15;
  float w = fbm(vec2(q.x * 3.2, q.y * 2.6 - rise));
  float w2 = fbm(vec2(q.x * 6.5 + 3.1, q.y * 5. - rise * 1.7));
  float turb = w * .65 + w2 * .35;

  // sagoma del fuoco: larga e intensa alla base, si stringe e svanisce salendo
  float width = .62 - uv.y * .32;
  float side = 1. - smoothstep(width * .35, width, abs(q.x + (w - .5) * .25));
  float height = 1. - smoothstep(.02, .62, uv.y + (turb - .5) * .5);
  float flame = clamp(side * height * (.5 + turb * 1.05), 0., 1.) * .82;   // mai bruciato: i controlli sopra devono restare leggibili
  flame = pow(flame, 1.35);

  // rampa del fuoco: brace -> rosso -> arancio -> giallo -> quasi bianco
  vec3 c = vec3(0.);
  c = mix(c, vec3(.45, .04, .01), smoothstep(.0, .25, flame));
  c = mix(c, vec3(.95, .28, .03), smoothstep(.2, .55, flame));
  c = mix(c, vec3(1., .66, .15), smoothstep(.5, .8, flame));
  c = mix(c, vec3(1., .82, .45), smoothstep(.72, .82, flame));

  // ciocchi di legna alla base, scuri con brace che pulsa
  float logs = 0.;
  logs = max(logs, 1. - smoothstep(.0, .028, abs(q.y - .05 - q.x * .09) ) );
  logs = max(logs, 1. - smoothstep(.0, .028, abs(q.y - .07 + q.x * .11) ) );
  logs *= 1. - smoothstep(.34, .42, abs(q.x));
  float glow = n(vec2(q.x * 18., t * 1.6)) * n(vec2(q.x * 7. + 9., t * .7));
  c = mix(c, vec3(.08, .03, .02) + vec3(1., .3, .05) * glow * .9, logs);

  // faville: una per cella, salgono ondeggiando e si spengono
  vec2 g = vec2(q.x * 7., uv.y * 9. - t * 1.1);
  vec2 id = floor(g), f = fract(g) - .5;
  float r = h(id);
  if (r > .55) {
    vec2 o = vec2(sin(t * 2. + r * 40.) * .25, (h(id + 7.) - .5) * .6);
    float d = length(f - o);
    float life = smoothstep(1.02, .3, uv.y) * smoothstep(.0, .12, uv.y);
    c += vec3(1., .55, .15) * smoothstep(.09, .0, d) * life * (.6 + .4 * sin(t * 9. + r * 60.));
  }

  // alone caldo diffuso sul resto dello schermo + vignettatura
  c += vec3(.32, .08, .02) * (1. - smoothstep(0., 1.1, uv.y)) * .55;
  // riverbero del fuoco in alto, che tremola con le fiamme
  c += vec3(.35, .1, .02) * smoothstep(.6, 1., uv.y) * (.35 + .25 * n(vec2(q.x * 2., t * 1.3)));
  c *= 1. - .45 * smoothstep(.45, 1.15, length((uv - vec2(.5, .3)) * vec2(1.4, 1.)));
  gl_FragColor = vec4(c, 1.);
}`;

function sh(type, src) {
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
let prog;
try {
  prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
} catch (e) { console.warn('fuoco: WebGL non disponibile', e); return; }

gl.useProgram(prog);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, 'p');
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const uRes = gl.getUniformLocation(prog, 'res'), uT = gl.getUniformLocation(prog, 't');

const SCALE = 1 / 3, FPS = 30;
function size() {
  cv.width = Math.max(1, Math.round(innerWidth * SCALE));
  cv.height = Math.max(1, Math.round(innerHeight * SCALE));
  gl.viewport(0, 0, cv.width, cv.height);
  gl.uniform2f(uRes, cv.width, cv.height);
}
size();
addEventListener('resize', size);
host.appendChild(cv);
document.documentElement.classList.add('has-fire');

let raf = null, last = 0;
const t0 = performance.now();
function frame(now) {
  raf = requestAnimationFrame(frame);
  if (now - last < 1000 / FPS - 2) return;
  last = now;
  gl.uniform1f(uT, (now - t0) / 1000);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
const run = () => { if (!raf) raf = requestAnimationFrame(frame); };
const halt = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };
document.addEventListener('visibilitychange', () => document.hidden ? halt() : run());
run();
})();
