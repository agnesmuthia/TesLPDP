'use strict';
// Utilitas bersama untuk generator bank soal.

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let rand = mulberry32(20261013);
function setSeed(s) { rand = mulberry32(s); }
function rnd() { return rand(); }
function ri(a, b) { return a + Math.floor(rand() * (b - a + 1)); }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample(arr, n) { return shuffle(arr).slice(0, n); }
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
function lcm(a, b) { return a / gcd(a, b) * b; }

// Format angka gaya Indonesia: 1.234.567,5
function fmt(n, dec) {
  if (typeof n !== 'number' || !isFinite(n)) return String(n);
  let s;
  if (dec === undefined) {
    const r = Math.round(n * 1000) / 1000;
    s = String(r);
  } else s = n.toFixed(dec);
  let neg = s.startsWith('-');
  if (neg) s = s.slice(1);
  let [i, d] = s.split('.');
  i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '−' : '') + i + (d ? ',' + d : '');
}
function rp(n) { return 'Rp' + fmt(n); }

// Bangun opsi 5 pilihan dari jawaban benar + kandidat pengecoh (string)
function buildOptions(correct, distractors, n = 5, opts = {}) {
  const seen = new Set([norm(correct)]);
  const out = [];
  for (const d of distractors) {
    const k = norm(d);
    if (seen.has(k)) continue;
    seen.add(k); out.push(d);
    if (out.length === n - 1) break;
  }
  if (out.length < n - 1) return null;
  let all = [correct, ...out];
  if (opts.sortNumeric) {
    all.sort((a, b) => parseNum(a) - parseNum(b));
  } else all = shuffle(all);
  return { o: all, a: all.indexOf(correct) };
}
function norm(s) { return String(s).toLowerCase().replace(/\s+/g, ' ').trim(); }
function parseNum(s) {
  const m = String(s).replace(/Rp/, '').replace(/−/g, '-').replace(/\./g, '').replace(',', '.').match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
}

// Pengecoh numerik yang masuk akal di sekitar nilai benar
function numDistractors(v, opts = {}) {
  const { integer = true, min = -Infinity, extra = [] } = opts;
  const c = new Set();
  extra.forEach(x => { if (Number.isFinite(x)) c.add(x); });
  const mag = Math.max(1, Math.abs(v));
  let steps;
  if (integer && mag > 60 && Number.isInteger(v)) {
    let unit = 1;
    while (v % (unit * 10) === 0 && unit * 10 <= mag / 5) unit *= 10;
    if (unit === 1 && mag > 1000) unit = Math.pow(10, Math.floor(Math.log10(mag)) - 2);
    const prop = [0.05, 0.1, 0.15, 0.2, 0.25, 0.5].map(p => Math.max(unit, Math.round(mag * p / unit) * unit));
    steps = [unit, 2 * unit, 3 * unit, 5 * unit, ...prop];
  } else if (integer) {
    steps = [1, 2, 3, 4, 5, 6, 10, Math.round(mag * 0.2), Math.round(mag * 0.5)];
  } else {
    steps = (mag > 40 ? [mag * 0.03, mag * 0.06, mag * 0.1, mag * 0.15, mag * 0.2, mag * 0.25] : [0.5, 1, 1.5, 2, mag * 0.1, mag * 0.2, mag * 0.25]).map(x => Math.round(x * 10) / 10);
  }
  for (const s of shuffle(steps)) {
    if (!s) continue;
    c.add(v + s); c.add(v - s);
  }
  return shuffle([...c].filter(x => x !== v && x >= min && (!integer || Number.isInteger(x))));
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

module.exports = { setSeed, rnd, ri, pick, shuffle, sample, gcd, lcm, fmt, rp, buildOptions, numDistractors, norm, parseNum, LETTERS };
