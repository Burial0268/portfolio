import { contours } from 'd3-contour';

// Build-time only: procedural topographic contour lines (Endfield-loader style).
// Output is an SVG path string in a `W x H` viewBox; render it once and <use> it elsewhere.

export const TOPO_W = 160;
export const TOPO_H = 100;

const PAD = 4; // grid margin so rings closing along the border fall outside the viewBox

function hash(x: number, y: number, seed: number) {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function valueNoise(x: number, y: number, seed: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, seed), b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed), d = hash(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, seed: number) {
  let sum = 0, amp = 0.5, freq = 1;
  for (let o = 0; o < 3; o++) {
    sum += amp * valueNoise(x * freq, y * freq, seed + o * 17);
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum;
}

export function topoPath({ seed = 7, levels = 18, scale = 0.035 } = {}) {
  const w = TOPO_W + PAD * 2, h = TOPO_H + PAD * 2;
  const values = new Float64Array(w * h);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      // domain warp gives the ridged, wandering look of real terrain instead of round blobs
      const wx = fbm(i * scale + 3.1, j * scale, seed + 99) * 2.2;
      const wy = fbm(i * scale, j * scale + 7.7, seed + 199) * 2.2;
      values[j * w + i] = fbm(i * scale + wx, j * scale + wy, seed);
    }
  }

  const r = (n: number) => Math.round((n - PAD) * 10) / 10;
  return contours()
    .size([w, h])
    .thresholds(levels)(Array.from(values))
    .flatMap(c => c.coordinates.flat())
    .filter(ring => ring.length > 14) // drop tiny specks
    .map(ring => 'M' + ring.map(([x, y]) => `${r(x)} ${r(y)}`).join('L'))
    .join('');
}
