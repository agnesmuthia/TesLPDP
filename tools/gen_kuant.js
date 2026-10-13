'use strict';
const L = require('./lib');
const { pick, shuffle, sample, ri, fmt, rp, buildOptions, numDistractors, gcd, lcm } = L;

const AL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function mk(t, q, correct, ds, e, d = 2, opt = {}) {
  const b = buildOptions(correct, ds, 5, opt);
  if (!b) return null;
  return { t, q, o: b.o, a: b.a, e, d, ...(opt.sortNumeric ? { fx: 1 } : {}) };
}
function numQ(t, q, v, e, d = 2, o = {}) {
  const ds = numDistractors(v, o).map(x => (o.f ? o.f(x) : fmt(x)));
  return mk(t, q, o.f ? o.f(v) : fmt(v), ds, e, d, { sortNumeric: true });
}

// ---------- DERET ANGKA ----------
function genDeretAngka() {
  const type = ri(0, 13);
  let seq, e, d = 2;
  const len = ri(6, 8);
  switch (type) {
    case 0: { const a = ri(2, 40), b = pick([2, 3, 4, 5, 6, 7, 9, 11, 13, -3, -4, -6]); seq = Array.from({ length: len }, (_, i) => a + b * i); if (b < 0 && seq[len - 1] < -20) return null; e = `Deret aritmetika dengan beda ${b > 0 ? '+' : ''}${b}.`; d = 1; break; }
    case 1: { const a = ri(1, 6), r = pick([2, 3]); seq = Array.from({ length: 6 }, (_, i) => a * r ** i); e = `Setiap suku dikali ${r}.`; d = 1; break; }
    case 2: { const a = ri(1, 10), b = ri(1, 4), c = ri(1, 3); seq = [a]; let diff = b; for (let i = 1; i < len; i++) { seq.push(seq[i - 1] + diff); diff += c; } e = `Selisih antarsuku bertambah ${c}: ${seq.slice(1).map((x, i) => x - seq[i]).join(', ')}.`; break; }
    case 3: { // dua deret berselang
      const a = ri(2, 30), b = pick([2, 3, 4, 5, 7]), c = ri(10, 60), dd = pick([-2, -3, -4, -5, 2, 3, 6]);
      seq = []; for (let i = 0; i < len; i++) seq.push(i % 2 === 0 ? a + b * (i / 2) : c + dd * ((i - 1) / 2));
      e = `Dua deret berselang: suku ganjil ${b > 0 ? '+' : ''}${b}, suku genap ${dd > 0 ? '+' : ''}${dd}.`; d = 2; break; }
    case 4: { const a = ri(1, 5), b = ri(1, 5); seq = [a, b]; for (let i = 2; i < len; i++) seq.push(seq[i - 1] + seq[i - 2]); e = 'Setiap suku adalah jumlah dua suku sebelumnya.'; d = 2; break; }
    case 5: { const m = pick([2, 3]), p = pick([1, 2, -1, 3]); seq = [ri(1, 5)]; for (let i = 1; i < 6; i++) seq.push(seq[i - 1] * m + p); e = `Pola: ×${m} lalu ${p > 0 ? '+' : '−'}${Math.abs(p)}.`; d = 2; break; }
    case 6: { const k = ri(0, 4), s = pick([1, -1, 2]); seq = Array.from({ length: len }, (_, i) => (i + 1 + k) ** 2 + (s === 2 ? 1 : 0)); e = `Bilangan kuadrat ${(1 + k)}², ${(2 + k)}², ...${s === 2 ? ' ditambah 1' : ''}.`; d = 2; break; }
    case 7: { const ops = [[pick([2, 3]), '×'], [pick([1, 2, 3, 4, 5]), '+']]; seq = [ri(2, 6)]; for (let i = 1; i < len; i++) { const [v, o] = ops[(i - 1) % 2]; seq.push(o === '×' ? seq[i - 1] * v : seq[i - 1] + v); } e = `Pola bergantian ${ops[0][1]}${ops[0][0]}, ${ops[1][1]}${ops[1][0]}.`; if (seq[len - 1] > 2000) return null; d = 2; break; }
    case 8: { const a = ri(30, 90), x = ri(2, 9), y = ri(1, x - 1); seq = [a]; for (let i = 1; i < len; i++) seq.push(i % 2 ? seq[i - 1] + x : seq[i - 1] - y); e = `Pola bergantian +${x}, −${y}.`; d = 1; break; }
    case 9: { const k = ri(1, 3); seq = Array.from({ length: 6 }, (_, i) => (i + k) ** 3); e = `Bilangan pangkat tiga: ${k}³, ${k + 1}³, ...`; d = 2; break; }
    case 10: { // tiga deret berselang
      const st = [ri(1, 20), ri(20, 40), ri(40, 60)], df = [pick([2, 3, 5]), pick([-1, -2, 4]), pick([3, 6, -3])];
      seq = []; for (let i = 0; i < 9; i++) seq.push(st[i % 3] + df[i % 3] * Math.floor(i / 3));
      e = `Tiga deret berselang (suku ke-1,4,7 | 2,5,8 | 3,6,9) dengan beda ${df.join(', ')}.`; d = 3; break; }
    case 11: { const a = ri(2, 9); seq = [a]; for (let i = 1; i < 6; i++) seq.push(seq[i - 1] * (i + 1)); e = 'Dikali 2, 3, 4, 5, ... secara berurutan.'; d = 2; if (seq[5] > 50000) return null; break; }
    case 12: { const a = ri(1, 6), b = ri(2, 5); seq = [a]; for (let i = 1; i < len; i++) seq.push(seq[i - 1] + b ** 1 * i); e = `Ditambah ${b}, ${2 * b}, ${3 * b}, ... (kelipatan ${b}).`; d = 2; break; }
    case 13: { const r = pick([2, 3]), a = ri(100, 300) * (r ** 4) / (r ** 4) ; let v = r ** 5 * ri(1, 4); seq = []; for (let i = 0; i < 6; i++) { seq.push(v); v = v / r; } e = `Setiap suku dibagi ${r}.`; d = 1; break; }
  }
  if (!seq || seq.some(x => !Number.isInteger(x))) return null;
  const mode = pick(['next', 'next', 'mid', 'two']);
  let shown, ans, q;
  if (mode === 'next') { shown = seq.slice(0, -1).join(', ') + ', ....'; ans = fmt(seq[seq.length - 1]); return numQ('deret_angka', `Bilangan selanjutnya dari deret <span class="seq">${shown}</span> adalah ....`, seq[seq.length - 1], e + ` Suku berikutnya = <b>${fmt(seq[seq.length - 1])}</b>.`, d, { integer: true, min: Math.min(...seq) >= 0 ? 0 : -Infinity }); }
  if (mode === 'mid') {
    const k = ri(1, seq.length - 2);
    shown = seq.map((x, i) => (i === k ? '....' : x)).join(', ');
    return numQ('deret_angka', `Bilangan yang tepat untuk melengkapi deret <span class="seq">${shown}</span> adalah ....`, seq[k], e + ` Bilangan yang hilang = <b>${fmt(seq[k])}</b>.`, d, { integer: true, min: Math.min(...seq) >= 0 ? 0 : -Infinity });
  }
  const s2 = seq.slice();
  const x = s2.pop(), y0 = s2.pop();
  shown = s2.join(', ') + ', ...., ....';
  const cor = `${fmt(y0)} dan ${fmt(x)}`;
  const ds = [`${fmt(x)} dan ${fmt(y0)}`];
  for (const a of numDistractors(y0).slice(0, 4)) ds.push(`${fmt(a)} dan ${fmt(x + (a - y0))}`);
  ds.push(`${fmt(y0)} dan ${fmt(x + ri(1, 3))}`, `${fmt(y0 + 1)} dan ${fmt(x)}`);
  return mk('deret_angka', `Dua bilangan selanjutnya dari deret <span class="seq">${shown}</span> adalah ....`, cor, shuffle(ds), e + ` Dua suku berikutnya: <b>${cor}</b>.`, d);
}

// ---------- DERET HURUF ----------
function genDeretHuruf() {
  const type = ri(0, 5);
  let idx, e, d = 2;
  const wrap = i => ((i % 26) + 26) % 26;
  switch (type) {
    case 0: { const s = ri(0, 10), b = pick([2, 3, 4, 5]); idx = Array.from({ length: 6 }, (_, i) => s + b * i); e = `Huruf melompat ${b} posisi (${b - 1} huruf dilewati).`; d = 1; break; }
    case 1: { const s = ri(0, 5); idx = []; let df = 1; let v = s; for (let i = 0; i < 6; i++) { idx.push(v); v += df; df++; } e = 'Lompatan bertambah: +1, +2, +3, ...'; break; }
    case 2: { const a = ri(0, 6), b = ri(19, 25); idx = []; for (let i = 0; i < 7; i++) idx.push(i % 2 === 0 ? a + i : b - (i - 1)); e = 'Dua deret berselang: maju dari depan alfabet dan mundur dari belakang alfabet.'; d = 2; break; }
    case 3: { const s = ri(18, 25), b = pick([2, 3]); idx = Array.from({ length: 6 }, (_, i) => s - b * i); e = `Huruf mundur ${b} posisi.`; d = 1; break; }
    case 4: { const a = ri(0, 4), x = pick([2, 3]), b = ri(10, 14), y = pick([1, 2]); idx = []; for (let i = 0; i < 8; i++) idx.push(i % 2 === 0 ? a + x * (i / 2) : b + y * ((i - 1) / 2)); e = `Dua deret berselang: +${x} dan +${y}.`; d = 2; break; }
    case 5: { const a = ri(0, 3), b = ri(23, 25); idx = []; let u = a, w = b; for (let i = 0; i < 7; i++) { if (i % 2 === 0) { idx.push(u); u += i / 2 + 1; } else { idx.push(w); w -= (i - 1) / 2 + 1; } } e = 'Dua pola berselang: dari depan alfabet +1, +2, +3, ... dan dari belakang alfabet −1, −2, −3, ...'; d = 3; break; }
  }
  if (idx.some(i => i < 0 || i > 25)) return null;
  const letters = idx.map(i => AL[i]);
  const ans = letters[letters.length - 1];
  const shown = letters.slice(0, -1).join(', ') + ', ....';
  const ds = [-2, -1, 1, 2, 3, -3, 4].map(k => AL[wrap(idx[idx.length - 1] + k)]);
  return mk('deret_huruf', `Huruf selanjutnya dari deret <span class="seq">${shown}</span> adalah ....`, ans, shuffle(ds),
    e + ` Posisi huruf: ${idx.map(i => i + 1).join(', ')}. Huruf berikutnya <b>${ans}</b> (urutan ke-${idx[idx.length - 1] + 1}).`, d, { sortNumeric: false });
}

// ---------- ARITMETIKA ----------
function genAritmetika() {
  const type = ri(0, 7);
  switch (type) {
    case 0: { const p = pick([5, 10, 12.5, 15, 20, 25, 30, 35, 40, 45, 60, 75]); const n = ri(2, 40) * 40; const v = p * n / 100; if (!Number.isInteger(v)) return null; return numQ('aritmetika', `${fmt(p)}% dari ${fmt(n)} adalah ....`, v, `${fmt(p)}% × ${fmt(n)} = ${fmt(p)}/100 × ${fmt(n)} = <b>${fmt(v)}</b>.`, 1); }
    case 1: { const a = pick([0.25, 0.5, 0.75, 0.125, 0.2, 0.4]); const n = ri(4, 40) * 8; const m = ri(2, 30); const v = a * n + m; if (!Number.isInteger(v)) return null; return numQ('aritmetika', `Nilai dari ${fmt(a)} × ${fmt(n)} + ${m} adalah ....`, v, `${fmt(a)} × ${fmt(n)} = ${fmt(a * n)}; ditambah ${m} = <b>${fmt(v)}</b>.`, 1); }
    case 2: { const b1 = pick([2, 3, 4, 5, 6, 8]), b2 = pick([3, 4, 5, 6, 9, 10, 12]); if (b1 === b2) return null; const a1 = ri(1, b1 - 1), a2 = ri(1, b2 - 1); const num = a1 * b2 + a2 * b1, den = b1 * b2, g = gcd(num, den);
      const f = (n, dn) => { const gg = gcd(n, dn); n /= gg; dn /= gg; return dn === 1 ? `${n}` : `${n}/${dn}`; };
      const cor = f(num, den); const ds = [f(a1 + a2, b1 + b2), f(num + den, den), f(num - b1, den), f(a1 * a2, den), f(num + 1, den), f(num, den + b1)];
      return mk('aritmetika', `Hasil dari ${a1}/${b1} + ${a2}/${b2} adalah ....`, cor, ds, `Samakan penyebut: ${a1 * b2}/${den} + ${a2 * b1}/${den} = ${num}/${den} = <b>${cor}</b>.`, 1); }
    case 3: { const x = ri(11, 35); const sq = x * x; const y = ri(2, 9); return numQ('aritmetika', `√${fmt(sq)} + ${y}² = ....`, x + y * y, `√${fmt(sq)} = ${x}; ${y}² = ${y * y}; jumlah = <b>${x + y * y}</b>.`, 1); }
    case 4: { const a = ri(12, 99), b = ri(12, 99), c = ri(2, 9); const v = a * c - b; return numQ('aritmetika', `${a} × ${c} − ${b} = ....`, v, `${a} × ${c} = ${a * c}; dikurangi ${b} = <b>${fmt(v)}</b>.`, 1); }
    case 5: { const base = pick([2, 3, 5]); const m = ri(2, 4), n = ri(2, 4); const v = base ** (m + n) / base ** n; return numQ('aritmetika', `Nilai dari (${base}<sup>${m + n}</sup>) ÷ (${base}<sup>${n}</sup>) adalah ....`, v, `a<sup>m</sup> ÷ a<sup>n</sup> = a<sup>m−n</sup> = ${base}<sup>${m}</sup> = <b>${fmt(v)}</b>.`, 1); }
    case 6: { // PDF 71: perkalian bentuk tersembunyi -> pecahan/desimal
      const p = pick([0.2, 0.4, 0.6, 0.8, 1.25, 2.5]); const n = ri(2, 30) * 20; const q = pick([0.5, 0.25, 1.5]); const v = p * n * q; if (!Number.isInteger(v * 10)) return null; return numQ('aritmetika', `${fmt(p)} × ${fmt(n)} × ${fmt(q)} = ....`, v, `${fmt(p)} × ${fmt(n)} = ${fmt(p * n)}; × ${fmt(q)} = <b>${fmt(v)}</b>.`, 2, { integer: Number.isInteger(v) }); }
    case 7: { const a = ri(2, 9) * 11, b = ri(2, 9) * 11; const v = (a + b) / 11; return numQ('aritmetika', `(${a} + ${b}) ÷ 11 = ....`, v, `${a} + ${b} = ${a + b}; ÷ 11 = <b>${v}</b>.`, 1); }
  }
}

// ---------- ALJABAR ----------
function genAljabar() {
  const type = ri(0, 7);
  switch (type) {
    case 0: { // SPLDV -> ekspresi
      const x = ri(-6, 9), y = ri(-6, 9); if (x === 0 || y === 0) return null;
      const a = ri(1, 7), b = ri(-5, 7), c = ri(-5, 7), d = ri(1, 8); if (!b || !c || a * d - b * c === 0) return null;
      const p = ri(-7, 7), q = ri(-7, 7); if (!p || !q) return null;
      const v = p * x + q * y;
      const t = (k, v, first) => `${k < 0 ? '− ' : first ? '' : '+ '}${Math.abs(k) === 1 ? '' : Math.abs(k)}${v}`;
      return numQ('aljabar', `Jika ${t(a, 'x', 1)} ${t(b, 'y')} = ${a * x + b * y} dan ${t(c, 'x', 1)} ${t(d, 'y')} = ${c * x + d * y}, maka nilai ${t(p, 'x', 1)} ${t(q, 'y')} adalah ....`, v,
        `Selesaikan SPLDV dengan eliminasi/substitusi: x = ${x}, y = ${y}. Maka ${p}(${x}) + ${q}(${y}) = <b>${fmt(v)}</b>.`, 2); }
    case 1: { // (x+y)^2 identity
      const s = ri(3, 12), p = ri(2, 20); const v = s * s - 2 * p;
      return numQ('aljabar', `Jika x + y = ${s} dan xy = ${p}, maka nilai x² + y² adalah ....`, v, `x² + y² = (x + y)² − 2xy = ${s * s} − ${2 * p} = <b>${v}</b>.`, 2, { extra: [s * s, s * s + 2 * p] }); }
    case 2: { const dd = ri(2, 9) + pick([0, 0.5]), p = ri(2, 9); const v = dd + 4 * p;
      return numQ('aljabar', `Jika (x − y)² = ${fmt(dd)} dan xy = ${p}, maka x² + y² = ....`, dd + 2 * p, `x² + y² = (x − y)² + 2xy = ${fmt(dd)} + ${2 * p} = <b>${fmt(dd + 2 * p)}</b>.`, 2, { integer: Number.isInteger(dd), extra: [v, dd - 2 * p] }); }
    case 3: { // operasi khusus
      const ops = [
        { def: 'p ∗ q = q² − p', f: (p, q) => q * q - p },
        { def: 'p ∗ q = 2p + q', f: (p, q) => 2 * p + q },
        { def: 'p ∗ q = p² − pq', f: (p, q) => p * p - p * q },
        { def: 'p ∗ q = pq − p − q', f: (p, q) => p * q - p - q },
        { def: 'p ∗ q = (p + q)/2 + 1', f: (p, q) => (p + q) / 2 + 1 },
      ];
      const o = pick(ops); const a = ri(1, 5), b = ri(1, 5), c = ri(1, 4);
      const inner = o.f(b, c), v = o.f(a, inner); if (!Number.isInteger(v) || Math.abs(v) > 5000) return null;
      return numQ('aljabar', `Jika ${o.def}, maka nilai dari ${a} ∗ (${b} ∗ ${c}) adalah ....`, v, `Hitung bagian dalam dulu: ${b} ∗ ${c} = ${fmt(inner)}. Lalu ${a} ∗ ${fmt(inner)} = <b>${fmt(v)}</b>.`, 2); }
    case 4: { // linear lalu kuadrat
      const x = ri(-5, 8); const a = ri(2, 6), c = ri(a + 1, 9), b = ri(-10, 10); const d = (a - c) * x + b; // a x + b = c x + d ... ax + b = cx + (b + (a-c)x)?? 
      const rhs = b + (a - c) * x; // a x + b = c x + rhs
      const k = ri(1, 6); const v = x * x - k * x + ri(0, 0) + 4;
      return numQ('aljabar', `Jika ${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${c}x ${rhs < 0 ? '−' : '+'} ${Math.abs(rhs)}, maka nilai x² − ${k}x + 4 adalah ....`, v, `${a}x − ${c}x = ${rhs} − (${b}) → ${(a - c)}x = ${rhs - b} → x = ${x}. Maka ${x}² − ${k}(${x}) + 4 = <b>${v}</b>.`, 2); }
    case 5: { // rata-rata x dan y dari dua persamaan simetris
      const x = ri(1, 9), y = ri(1, 9); const a = ri(2, 9), b = ri(1, 6); if (a === b) return null;
      const r1 = a * x + b * y, r2 = b * x + a * y; const v = (x + y) / 2;
      return numQ('aljabar', `Jika ${a}x + ${b}y = ${r1} dan ${b}x + ${a}y = ${r2}, berapakah rata-rata x dan y?`, v, `Jumlahkan: ${a + b}(x + y) = ${r1 + r2} → x + y = ${x + y}. Rata-rata = <b>${fmt(v)}</b>.`, 3, { integer: Number.isInteger(v) }); }
    case 6: { // fungsi
      const a = ri(2, 6), b = ri(-9, 9), x = ri(-4, 6); const fx = a * x + b; const g = ri(2, 5);
      const v = g * fx - 1;
      return numQ('aljabar', `Diketahui f(x) = ${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} dan g(x) = ${g}x − 1. Nilai (g ∘ f)(${x}) adalah ....`, v, `f(${fmt(x)}) = ${fmt(fx)}; g(${fmt(fx)}) = ${g} × (${fmt(fx)}) − 1 = <b>${fmt(v)}</b>.`, 2); }
    case 7: { // persamaan kuadrat jumlah akar
      const r1 = ri(-6, 8), r2 = ri(-6, 8); const b = -(r1 + r2), c = r1 * r2; if (!b || !c) return null;
      const v = r1 * r1 + r2 * r2;
      return numQ('aljabar', `Akar-akar persamaan x² ${b < 0 ? '−' : '+'} ${Math.abs(b)}x ${c < 0 ? '−' : '+'} ${Math.abs(c)} = 0 adalah x₁ dan x₂. Nilai x₁² + x₂² adalah ....`, v, `x₁ + x₂ = ${r1 + r2}, x₁x₂ = ${c}. x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂ = ${(r1 + r2) ** 2} − (${2 * c}) = <b>${v}</b>.`, 3); }
  }
}

// ---------- PERBANDINGAN KUANTITATIF (x vs y) ----------
const XY_OPS = ['x > y', 'x < y', 'x = y', 'Hubungan x dan y tidak dapat ditentukan'];
function xyItem(stem, x, y, e, undet = false, d = 2) {
  let a;
  if (undet) a = 3; else a = Math.abs(x - y) < 1e-9 ? 2 : x > y ? 0 : 1;
  return { t: 'perbandingan', q: stem + '<div class="ask">Hubungan yang tepat antara x dan y adalah ....</div>', o: XY_OPS.slice(), a, fx: 1, d,
    e: e + ` Jadi <b>${XY_OPS[a]}</b>.` };
}
function genXY() {
  const type = ri(0, 7);
  switch (type) {
    case 0: { const p = pick([5, 10, 20, 25, 40, 50]), f = pick([[1, 5], [1, 4], [1, 2], [2, 5], [1, 20], [1, 10], [3, 4]]); const x = p / 100, y = f[0] / f[1]; return xyItem(`<p>x = ${p}% dan y = ${f[0]}/${f[1]}</p>`, x, y, `x = ${fmt(x)}, y = ${fmt(y)}.`, false, 1); }
    case 1: { const n = ri(2, 9); return xyItem(`<p>x² = ${n * n}<br>y = ${n}</p>`, 0, 0, `x = ±${n}, sehingga x bisa lebih besar, sama, atau lebih kecil dari y.`, true, 2); }
    case 2: { const n = ri(2, 9); const s = pick([1, -1]); return xyItem(`<p>x = √${n * n * n * n}<br>y = ${s < 0 ? '−' : ''}${n}²</p>`, n * n, s * n * n, `√${n ** 4} = ${n * n} (akar kuadrat bernilai non-negatif), y = ${s * n * n}.`, false, 2); }
    case 3: { const a = ri(2, 9), b = ri(2, 9), c = ri(2, 6); const x = (a + b) * c, y = a * c + b * c + pick([0, 0, 1, -1]); return xyItem(`<p>x = (${a} + ${b}) × ${c}<br>y = ${a} × ${c} + ${b} × ${c}${y !== a * c + b * c ? (y > a * c + b * c ? ' + 1' : ' − 1') : ''}</p>`, x, y, `x = ${x}, y = ${y}.`, false, 1); }
    case 4: { const a = ri(2, 9), b = ri(2, 9); const x = (a + b) ** 2, y = a * a + b * b; return xyItem(`<p>x = (${a} + ${b})²<br>y = ${a}² + ${b}²</p>`, x, y, `x = ${x}, y = ${y} (selisihnya 2·${a}·${b}).`, false, 1); }
    case 5: { const pr = ri(5, 20) * 1000, dsc = pick([10, 20, 25, 30]), d2 = pick([10, 15, 20]); const x = pr * (1 - dsc / 100) * (1 - d2 / 100), y = pr * (1 - (dsc + d2) / 100);
      return xyItem(`<p>Harga sebuah barang ${rp(pr)}.<br>x = harga setelah diskon ${dsc}% lalu diskon lagi ${d2}%<br>y = harga setelah diskon ${dsc + d2}%</p>`, x, y, `x = ${rp(x)}, y = ${rp(y)}. Diskon bertingkat selalu menghasilkan harga lebih mahal daripada diskon tunggal sebesar jumlahnya.`, false, 2); }
    case 6: { const a = ri(1, 9), b = ri(1, 9); const x = a / b, y = (a + 1) / (b + 1); return xyItem(`<p>x = ${a}/${b}<br>y = ${a + 1}/${b + 1}</p>`, x, y, `x = ${fmt(x, 3)}, y = ${fmt(y, 3)}.`, false, 2); }
    case 7: { const r = ri(2, 10); const x = Math.PI * r * r, y = (2 * r) ** 2; return xyItem(`<p>x = luas lingkaran berjari-jari ${r} cm<br>y = luas persegi bersisi ${2 * r} cm</p>`, x, y, `x = π × ${r}² ≈ ${fmt(x, 1)} cm², y = ${y} cm².`, false, 2); }
  }
}
function genXY2() {
  // varian tambahan yang aman
  const type = ri(0, 4);
  switch (type) {
    case 0: { const k = ri(2, 8), m = ri(2, 7), y = m + pick([-1, 0, 1]); return xyItem(`<p>${k}a = ${k * m}<br>x = a<br>y = ${y}</p>`, m, y, `a = ${k * m}/${k} = ${m}, y = ${y}.`, false, 1); }
    case 1: { const t = ri(2, 6), v = ri(40, 80); const x = t * v, y = (t + 1) * (v - 10); return xyItem(`<p>x = jarak yang ditempuh dalam ${t} jam dengan kecepatan ${v} km/jam<br>y = jarak yang ditempuh dalam ${t + 1} jam dengan kecepatan ${v - 10} km/jam</p>`, x, y, `x = ${x} km, y = ${y} km.`, false, 2); }
    case 2: { const n = ri(3, 8); const y = (n - 2) * 180 + pick([-30, 0, 30]); return xyItem(`<p>x = jumlah sudut dalam segi-${n}<br>y = ${y}°</p>`, (n - 2) * 180, y, `x = (${n} − 2) × 180° = ${(n - 2) * 180}°, y = ${y}°.`, false, 2); }
    case 3: { const a = ri(3, 20); return xyItem(`<p>x adalah bilangan bulat dengan ${a} &lt; x &lt; ${a + 5}<br>y = ${a + 2}</p>`, 0, 0, `x dapat bernilai ${a + 1} sampai ${a + 4}, sehingga bisa lebih kecil, sama, atau lebih besar dari y.`, true, 2); }
    case 4: { const n = ri(4, 12), p = pick([2, 3]); const x = 2 ** n, y = n ** 2; return xyItem(`<p>x = 2<sup>${n}</sup><br>y = ${n}<sup>2</sup></p>`, x, y, `x = ${x}, y = ${y}.`, false, 1); }
  }
}

// ---------- SOAL CERITA ----------
const NAMA = ['Andi','Budi','Citra','Dina','Eko','Fitri','Gilang','Hesti','Irma','Joni','Kurnia','Lutfi','Mega','Nina','Oscar','Pandu','Rani','Sigit','Tika','Wawan','Yanti','Zaki'];
function genCerita() {
  const type = ri(0, 15);
  const [A, B, C] = sample(NAMA, 3);
  switch (type) {
    case 0: { // umur kelipatan
      const k1 = pick([2, 3]), k2 = pick([3, 4, 5]); if (k2 <= k1) return null; const t = ri(2, 8);
      // Y = k1 * A ; Y - t = k2 (A - t) -> k1 A - t = k2 A - k2 t -> A (k2 - k1) = t (k2 - 1)
      const num = t * (k2 - 1), den = k2 - k1; if (num % den) return null; const a = num / den, y = k1 * a; if (a - t <= 0) return null;
      return numQ('cerita', `Usia ${A} sekarang ${k1} kali usia ${B}. ${t} tahun yang lalu, usia ${A} ${k2} kali usia ${B}. Berapa usia ${A} sekarang?`, y,
        `Misal usia ${B} = b. ${k1}b − ${t} = ${k2}(b − ${t}) → ${k2 - k1}b = ${num} → b = ${a}. Usia ${A} = ${k1} × ${a} = <b>${y}</b> tahun.`, 2, { min: 1, f: x => fmt(x) + ' tahun' }); }
    case 1: { // jumlah umur tiga orang (PDF 107)
      const z = ri(3, 9), k = pick([2, 3]), dlt = ri(1, 4); const y = k * z, x = y - dlt; const tot = x + y + z;
      return numQ('cerita', `Jumlah usia ${A}, ${B}, dan ${C} adalah ${tot} tahun. Usia ${A} ${dlt} tahun lebih muda daripada ${B}, sedangkan usia ${B} ${k} kali usia ${C}. Usia ${B} adalah ....`, y,
        `Misal usia ${C} = c, maka ${B} = ${k}c dan ${A} = ${k}c − ${dlt}. Jumlah: ${2 * k + 1}c − ${dlt} = ${tot} → c = ${z}. Usia ${B} = <b>${y}</b> tahun.`, 2, { min: 1, f: x => fmt(x) + ' tahun' }); }
    case 2: { // papasan
      const v1 = ri(4, 9) * 10, v2 = ri(4, 9) * 10, t = pick([1.5, 2, 2.5, 3]); const s = (v1 + v2) * t; if (!Number.isInteger(s)) return null;
      const h = 7 + ri(0, 3); const end = h * 60 + t * 60; const fmtT = m => `${String(Math.floor(m / 60)).padStart(2, '0')}.${String(m % 60).padStart(2, '0')}`;
      const ds = [t - 0.5, t + 0.5, t + 1, t - 1, s / v1, s / v2].filter(x => x > 0 && x !== t).map(x => fmtT(h * 60 + Math.round(x * 60)));
      return mk('cerita', `Jarak kota P dan Q adalah ${fmt(s)} km. ${A} berangkat dari P menuju Q dengan kecepatan ${v1} km/jam, sedangkan ${B} berangkat dari Q menuju P dengan kecepatan ${v2} km/jam. Keduanya berangkat pukul ${fmtT(h * 60)}. Pukul berapa mereka berpapasan?`,
        fmtT(end), ds, `Waktu papasan = jarak ÷ (v₁ + v₂) = ${fmt(s)} ÷ ${v1 + v2} = ${fmt(t)} jam. Pukul ${fmtT(h * 60)} + ${fmt(t)} jam = <b>${fmtT(end)}</b>.`, 2, { sortNumeric: true }); }
    case 3: { // kerja bersama
      const pairs = [[6, 3, 2], [12, 6, 4], [10, 15, 6], [12, 4, 3], [20, 30, 12], [6, 12, 4], [24, 12, 8], [18, 9, 6], [30, 20, 12], [15, 10, 6], [28, 21, 12], [36, 18, 12], [40, 10, 8], [45, 30, 18]];
      const [a, b, c] = pick(pairs);
      return numQ('cerita', `${A} dapat menyelesaikan sebuah pekerjaan dalam ${a} hari, sedangkan ${B} dapat menyelesaikannya dalam ${b} hari. Jika bekerja bersama, pekerjaan itu selesai dalam ....`, c,
        `1/${a} + 1/${b} = ${b + a}/${a * b} per hari → waktu = ${a * b}/${a + b} = <b>${c} hari</b>.`, 2, { min: 1, f: x => fmt(x) + ' hari', extra: [(a + b) / 2, Math.abs(a - b)] }); }
    case 4: { // diskon & untung
      const pr = ri(10, 60) * 10000, d1 = pick([10, 15, 20, 25, 30]), d2 = pick([5, 10, 20]); const v = pr * (1 - d1 / 100) * (1 - d2 / 100);
      if (!Number.isInteger(v)) return null;
      return numQ('cerita', `Sebuah tas dijual seharga ${rp(pr)}. Toko memberikan diskon ${d1}% dan untuk anggota diberikan diskon tambahan ${d2}% dari harga setelah diskon pertama. Harga yang dibayar anggota adalah ....`, v,
        `${rp(pr)} × ${(100 - d1)}% = ${rp(pr * (1 - d1 / 100))}; × ${(100 - d2)}% = <b>${rp(v)}</b>.`, 2, { f: rp, extra: [pr * (1 - (d1 + d2) / 100)] }); }
    case 5: { // untung persen
      const buy = ri(20, 90) * 1000, p = pick([10, 15, 20, 25, 30, 40]); const sell = buy * (1 + p / 100); const n = ri(5, 30);
      const v = (sell - buy) * n;
      return numQ('cerita', `Pedagang membeli ${n} buah barang dengan harga ${rp(buy)} per buah dan menjualnya dengan keuntungan ${p}% per buah. Total keuntungan pedagang jika semua barang terjual adalah ....`, v,
        `Untung per buah = ${p}% × ${rp(buy)} = ${rp(sell - buy)}. Total = ${n} × ${rp(sell - buy)} = <b>${rp(v)}</b>.`, 1, { f: rp }); }
    case 6: { // KPK bertemu lagi
      const ps = sample([2, 3, 4, 5, 6, 8, 9, 10, 12], 3); const L3 = ps.reduce(lcm); if (L3 > 60) return null;
      const bl = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      const m = ri(0, 11), day = ri(1, 25), year = 2025 + ri(0, 2);
      const dt = new Date(Date.UTC(year, m, day)); const f = d => `${d.getUTCDate()} ${bl[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
      const add = k => new Date(dt.getTime() + k * 86400000);
      const ds = [ps[0] * ps[1] * ps[2], ps[0] + ps[1] + ps[2], L3 / 2, L3 + ps[0], L3 * 2, L3 - 1].filter(x => Number.isInteger(x) && x > 0 && x !== L3).map(k => f(add(k)));
      return mk('cerita', `${A}, ${B}, dan ${C} mengikuti les di tempat yang sama. ${A} datang setiap ${ps[0]} hari sekali, ${B} setiap ${ps[1]} hari sekali, dan ${C} setiap ${ps[2]} hari sekali. Jika mereka bertemu bersama pada ${f(dt)}, mereka akan bertemu bersama lagi pada tanggal ....`,
        f(add(L3)), ds, `KPK(${ps.join(', ')}) = ${L3}. ${f(dt)} + ${L3} hari = <b>${f(add(L3))}</b>.`, 2); }
    case 7: { // uang sisa/kurang (PDF 106)
      const price = ri(15, 60) * 100, n1 = ri(4, 9), n2 = n1 + ri(2, 4); const money = price * n1 + ri(1, 9) * 100 * (n2 - n1) ;
      const sisa = money - price * n1, kurang = price * n2 - money; if (kurang <= 0) return null;
      return numQ('cerita', `Jika ${A} membeli ${n1} bolpoin, uangnya bersisa ${rp(sisa)}. Jika ia membeli ${n2} bolpoin, uangnya kurang ${rp(kurang)}. Besar uang ${A} adalah ....`, money,
        `Selisih ${n2 - n1} bolpoin = ${rp(sisa)} + ${rp(kurang)} = ${rp(sisa + kurang)}, jadi harga 1 bolpoin = ${rp(price)}. Uang = ${n1} × ${rp(price)} + ${rp(sisa)} = <b>${rp(money)}</b>.`, 2, { f: rp }); }
    case 8: { // rata-rata nilai tambahan siswa
      const n = ri(20, 40), avg = ri(65, 80), k = ri(2, 5), newAvg = avg + pick([1, 2]); const tot = n * avg, tot2 = (n + k) * newAvg; const sumNew = tot2 - tot; if (sumNew % k) return null;
      const v = sumNew / k; if (v > 100) return null;
      return numQ('cerita', `Rata-rata nilai ${n} siswa adalah ${avg}. Setelah ${k} siswa baru bergabung, rata-ratanya menjadi ${newAvg}. Rata-rata nilai ${k} siswa baru tersebut adalah ....`, v,
        `Total awal = ${n} × ${avg} = ${tot}. Total baru = ${n + k} × ${newAvg} = ${tot2}. Jumlah nilai siswa baru = ${sumNew}, rata-rata = <b>${fmt(v)}</b>.`, 2); }
    case 9: { // tabungan (PDF 105)
      const b = ri(5, 20) * 1000, dlt = ri(1, 5) * 1000, k = pick([2, 3]); const a = b + dlt, c = k * (a + b); const tot = a + b + c;
      return numQ('cerita', `Tabungan ${A} ${rp(dlt)} lebih banyak daripada tabungan ${B}. Tabungan ${C} ${k} kali jumlah tabungan ${A} dan ${B}. Jika jumlah tabungan ketiganya ${rp(tot)}, tabungan ${C} adalah ....`, c,
        `Misal ${B} = b, ${A} = b + ${fmt(dlt)}, ${C} = ${k}(2b + ${fmt(dlt)}). Total: ${k + 1}(2b + ${fmt(dlt)}) = ${fmt(tot)} → 2b + ${fmt(dlt)} = ${fmt(a + b)}. Tabungan ${C} = <b>${rp(c)}</b>.`, 2, { f: rp }); }
    case 10: { // sewa bertingkat (PDF 101)
      const first = ri(15, 30) * 1000, next = first - ri(2, 6) * 1000, n = ri(2, 8), d = ri(2, 5); const v = n * (first + (d - 1) * next);
      return numQ('cerita', `Sewa tenda untuk hari pertama ${rp(first)} per tenda dan hari berikutnya ${rp(next)} per tenda per hari. Jika rombongan menyewa ${n} tenda selama ${d} hari, biaya sewa yang harus dibayar adalah ....`, v,
        `Per tenda: ${rp(first)} + ${d - 1} × ${rp(next)} = ${rp(first + (d - 1) * next)}. Untuk ${n} tenda = <b>${rp(v)}</b>.`, 1, { f: rp, extra: [n * first * d, n * next * d] }); }
    case 11: { // kecepatan rata-rata pulang pergi
      const pr = pick([[60, 40, 48], [30, 60, 40], [40, 60, 48], [20, 30, 24], [60, 90, 72], [45, 90, 60], [12, 6, 8], [80, 120, 96]]);
      return numQ('cerita', `${A} pergi ke kantor dengan kecepatan rata-rata ${pr[0]} km/jam dan pulang melalui jalan yang sama dengan kecepatan rata-rata ${pr[1]} km/jam. Kecepatan rata-rata perjalanan pulang-pergi ${A} adalah ....`, pr[2],
        `Kecepatan rata-rata = 2v₁v₂/(v₁ + v₂) = 2·${pr[0]}·${pr[1]}/${pr[0] + pr[1]} = <b>${pr[2]} km/jam</b> (bukan rata-rata biasa ${(pr[0] + pr[1]) / 2}).`, 3, { f: x => fmt(x) + ' km/jam', extra: [(pr[0] + pr[1]) / 2] }); }
    case 12: { // perbandingan uang
      const r1 = ri(1, 5), r2 = ri(1, 5), r3 = ri(1, 5); const unit = ri(2, 20) * 5000; const tot = (r1 + r2 + r3) * unit;
      return numQ('cerita', `Uang sebesar ${rp(tot)} dibagikan kepada ${A}, ${B}, dan ${C} dengan perbandingan ${r1} : ${r2} : ${r3}. Bagian ${B} adalah ....`, r2 * unit,
        `Satu bagian = ${rp(tot)} ÷ ${r1 + r2 + r3} = ${rp(unit)}. Bagian ${B} = ${r2} × ${rp(unit)} = <b>${rp(r2 * unit)}</b>.`, 1, { f: rp }); }
    case 13: { // ternak (PDF 104 versi sederhana)
      const bb = ri(5, 15) * 10, dlt = ri(5, 15) * 10; const ay = bb + dlt; const add = ri(1, 4) * 10;
      const tot = ay * 4 + bb + 2 * add; // ayam 2x tiap periode, 2 periode; bebek +add per periode
      return numQ('cerita', `Jumlah ayam di sebuah peternakan ${dlt} ekor lebih banyak dari jumlah bebek. Setiap 3 bulan, jumlah ayam menjadi 2 kali lipat dan jumlah bebek bertambah ${add} ekor. Jika setelah 6 bulan jumlah seluruh ternak ${fmt(tot)} ekor, jumlah bebek mula-mula adalah ....`, bb,
        `Misal bebek = b, ayam = b + ${dlt}. Setelah 6 bulan: ayam = 4(b + ${dlt}), bebek = b + ${2 * add}. Jumlah: 5b + ${4 * dlt + 2 * add} = ${tot} → b = <b>${bb}</b> ekor.`, 3, { f: x => fmt(x) + ' ekor' }); }
    case 14: { // campuran
      const v1 = ri(2, 6) * 10, p1 = pick([10, 20, 30]), v2 = ri(2, 6) * 10, p2 = pick([40, 50, 60]); const v = (v1 * p1 + v2 * p2) / (v1 + v2); if (!Number.isInteger(v * 10)) return null;
      return numQ('cerita', `${v1} liter larutan gula berkadar ${p1}% dicampur dengan ${v2} liter larutan gula berkadar ${p2}%. Kadar gula campuran adalah ....`, v,
        `Gula total = ${fmt(v1 * p1 / 100)} + ${fmt(v2 * p2 / 100)} = ${fmt((v1 * p1 + v2 * p2) / 100)} liter dari ${v1 + v2} liter → <b>${fmt(v)}%</b>.`, 2, { integer: Number.isInteger(v), f: x => fmt(x) + '%', extra: [(p1 + p2) / 2] }); }
    case 15: { // susul
      const v1 = ri(3, 6) * 10, v2 = v1 + ri(1, 3) * 10, dt = pick([0.5, 1]); const t = v1 * dt / (v2 - v1); if (!Number.isInteger(t * 60)) return null;
      return numQ('cerita', `${A} berangkat mengendarai motor dengan kecepatan ${v1} km/jam. ${fmt(dt * 60)} menit kemudian ${B} menyusul dari tempat yang sama dengan kecepatan ${v2} km/jam. ${B} dapat menyusul ${A} setelah berkendara selama ....`, t * 60,
        `Jarak awal = ${v1} × ${fmt(dt)} = ${fmt(v1 * dt)} km. Selisih kecepatan ${v2 - v1} km/jam → waktu = ${fmt(v1 * dt)}/${v2 - v1} jam = <b>${fmt(t * 60)} menit</b>.`, 3, { f: x => fmt(x) + ' menit', min: 1 }); }
  }
}

// ---------- GEOMETRI ----------
function genGeometri() {
  const type = ri(0, 6);
  switch (type) {
    case 0: { const r = pick([7, 14, 21, 28, 35]); const k = pick([2, 3]); const A1 = 22 / 7 * r * r, A2 = A1 * k * k;
      return numQ('geometri', `Sebuah roda memiliki luas ${fmt(A1)} cm². Roda lain memiliki jari-jari ${k} kali jari-jari roda tersebut. Luas roda kedua adalah .... (π = 22/7)`, A2,
        `Luas sebanding dengan kuadrat jari-jari: ${fmt(A1)} × ${k}² = <b>${fmt(A2)} cm²</b>.`, 2, { f: x => fmt(x) + ' cm²', extra: [A1 * k, A1 * 2 * k] }); }
    case 1: { const t = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29]]); const m = ri(1, 3);
      return numQ('geometri', `Sebuah tangga bersandar pada dinding. Kaki tangga berjarak ${t[0] * m} m dari dinding dan ujung atas tangga menyentuh dinding pada ketinggian ${t[1] * m} m. Panjang tangga adalah ....`, t[2] * m,
        `Pythagoras: √(${t[0] * m}² + ${t[1] * m}²) = √${(t[2] * m) ** 2} = <b>${t[2] * m} m</b>.`, 1, { f: x => fmt(x) + ' m', min: 1 }); }
    case 2: { const p = ri(5, 20), l = ri(3, p), t = ri(2, 10); const v = p * l * t;
      return numQ('geometri', `Sebuah bak berbentuk balok berukuran panjang ${p} dm, lebar ${l} dm, dan tinggi ${t} dm. Volume bak tersebut adalah ....`, v, `V = p × l × t = ${p} × ${l} × ${t} = <b>${fmt(v)} liter</b> (1 dm³ = 1 liter).`, 1, { f: x => fmt(x) + ' liter' }); }
    case 3: { const r = pick([7, 14, 21]), t = ri(2, 10) * 5; const v = 22 / 7 * r * r * t;
      return numQ('geometri', `Volume tabung dengan jari-jari ${r} cm dan tinggi ${t} cm adalah .... (π = 22/7)`, v, `V = πr²t = 22/7 × ${r}² × ${t} = <b>${fmt(v)} cm³</b>.`, 1, { f: x => fmt(x) + ' cm³' }); }
    case 4: { const s = ri(3, 15); const k = pick([2, 3]);
      return numQ('geometri', `Jika panjang rusuk sebuah kubus diperbesar ${k} kali, volumenya menjadi berapa kali volume semula?`, k ** 3, `Volume ∝ s³, jadi menjadi ${k}³ = <b>${k ** 3} kali</b>.`, 2, { f: x => fmt(x) + ' kali', min: 1, extra: [k, k * k, 3 * k] }); }
    case 5: { const p = ri(10, 40), l = ri(5, p - 1), w = pick([1, 2]); const v = (p + 2 * w) * (l + 2 * w) - p * l;
      return numQ('geometri', `Sebuah kolam berukuran ${p} m × ${l} m dikelilingi jalan selebar ${w} m. Luas jalan tersebut adalah ....`, v, `Luas total (${p + 2 * w} × ${l + 2 * w}) − luas kolam (${p} × ${l}) = ${(p + 2 * w) * (l + 2 * w)} − ${p * l} = <b>${v} m²</b>.`, 2, { f: x => fmt(x) + ' m²' }); }
    case 6: { const n = pick([5, 6, 8, 9, 10, 12]); const v = (n - 2) * 180 / n;
      if (!Number.isInteger(v)) return null; return numQ('geometri', `Besar setiap sudut dalam segi-${n} beraturan adalah ....`, v, `(n − 2) × 180° ÷ n = ${(n - 2) * 180}° ÷ ${n} = <b>${v}°</b>.`, 2, { f: x => fmt(x) + '°' }); }
  }
}

// ---------- STATISTIK & PELUANG ----------
function genStatPel() {
  const type = ri(0, 5);
  switch (type) {
    case 0: { // median dari frekuensi (PDF 103)
      const vals = sample([6, 7, 8, 9, 10, 11, 12], ri(4, 6)).sort((a, b) => a - b); const fr = vals.map(() => ri(1, 4));
      const arr = []; vals.forEach((v, i) => { for (let k = 0; k < fr[i]; k++) arr.push(v); });
      const n = arr.length; const med = n % 2 ? arr[(n - 1) / 2] : (arr[n / 2 - 1] + arr[n / 2]) / 2;
      const desc = shuffle(vals.map((v, i) => `${fr[i]} angka ${v}`)).join(', ');
      return numQ('statistik', `Nilai tengah (median) dari data berikut: ${desc} adalah ....`, med, `Urutkan ${n} data: ${arr.join(', ')}. Median = <b>${fmt(med)}</b>.`, 2, { integer: false, f: x => fmt(x) }); }
    case 1: { const n = ri(5, 8); const arr = Array.from({ length: n }, () => ri(50, 95)); const s = arr.reduce((a, b) => a + b, 0); if (s % n) return null;
      return numQ('statistik', `Rata-rata dari data ${arr.join(', ')} adalah ....`, s / n, `Jumlah = ${s}, banyak data = ${n}, rata-rata = <b>${s / n}</b>.`, 1); }
    case 2: { const r = ri(2, 6), b = ri(2, 6), h = ri(1, 5); const tot = r + b + h; const g = gcd(r, tot);
      const fr = (a, c) => { const gg = gcd(a, c); return `${a / gg}/${c / gg}`; };
      const ds = [fr(b, tot), fr(h, tot), fr(r, tot - r), fr(r + 1, tot), `1/${tot}`, fr(r, r + b)].filter(x => eval(x) < 1);
      return mk('peluang', `Dalam sebuah kotak terdapat ${r} bola merah, ${b} bola biru, dan ${h} bola hijau. Jika diambil satu bola secara acak, peluang terambil bola merah adalah ....`, fr(r, tot), ds, `P = ${r}/${tot} = <b>${fr(r, tot)}</b>.`, 1); }
    case 3: { const s = ri(3, 11); const cnt = [...Array(6)].flatMap((_, i) => [...Array(6)].map((_, j) => i + j + 2)).filter(x => x === s).length;
      const fr = (a, c) => { const gg = gcd(a, c); return `${a / gg}/${c / gg}`; };
      const ds = [fr(cnt + 1, 36), fr(Math.max(1, cnt - 1), 36), fr(cnt, 12), fr(cnt, 6), fr(6 - Math.abs(7 - s) + 2, 36), '1/2'];
      return mk('peluang', `Dua dadu dilempar bersamaan. Peluang muncul mata dadu berjumlah ${s} adalah ....`, fr(cnt, 36), ds, `Banyak pasangan berjumlah ${s} ada ${cnt} dari 36 kemungkinan → <b>${fr(cnt, 36)}</b>.`, 2); }
    case 4: { const n = ri(5, 9), k = pick([2, 3]); const C = (a, b) => { let r = 1; for (let i = 0; i < b; i++) r = r * (a - i) / (i + 1); return r; };
      const v = C(n, k); return numQ('peluang', `Dari ${n} orang kandidat akan dipilih ${k} orang untuk menjadi tim perwakilan (tanpa memperhatikan jabatan). Banyak cara memilih adalah ....`, v, `C(${n},${k}) = <b>${v}</b>.`, 2, { extra: [v * (k === 2 ? 2 : 6), n * k] }); }
    case 5: { const n = ri(4, 7); const P = [...Array(n)].reduce((a, _, i) => a * (i + 1), 1); const v = P / n;
      return numQ('peluang', `${n} orang duduk mengelilingi meja bundar. Banyak susunan duduk yang berbeda adalah ....`, v, `Permutasi siklis = (n − 1)! = ${n - 1}! = <b>${v}</b>.`, 3, { extra: [P, P / 2] }); }
  }
}

function collect(fn, target, t) {
  const out = []; const seen = new Set(); let guard = 0;
  while (out.length < target && guard++ < target * 60) {
    let it; try { it = fn(); } catch (e) { it = null; }
    if (!it || seen.has(it.q)) continue;
    if (it.o.length < 4) continue;
    seen.add(it.q); out.push(it);
  }
  if (out.length < target) console.warn(`[kuant] ${t}: hanya ${out.length}/${target}`);
  return out;
}

module.exports = function genKuant(c) {
  const xy = () => (L.rnd() < 0.55 ? genXY() : genXY2());
  return [
    ...collect(genDeretAngka, c.deret_angka, 'deret_angka'),
    ...collect(genDeretHuruf, c.deret_huruf, 'deret_huruf'),
    ...collect(genAritmetika, c.aritmetika, 'aritmetika'),
    ...collect(genAljabar, c.aljabar, 'aljabar'),
    ...collect(xy, c.perbandingan, 'perbandingan'),
    ...collect(genCerita, c.cerita, 'cerita'),
    ...collect(genGeometri, c.geometri, 'geometri'),
    ...collect(genStatPel, c.statistik, 'statistik'),
  ];
};
