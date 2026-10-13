'use strict';
const L = require('./lib');
const { SINONIM, ANTONIM, ANALOGI, RANTAI, KATEGORI } = require('./data_verbal');
const { pick, shuffle, sample, ri, buildOptions } = L;

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const parseBank = txt => txt.trim().split('\n').map(l => l.split('=').map(x => x.trim())).filter(x => x.length === 2);

// ---------- SINONIM & ANTONIM ----------
function genWordPairs(bankTxt, type, target) {
  const bank = parseBank(bankTxt);
  const out = [];
  const label = type === 'sinonim' ? 'Sinonim (persamaan kata)' : 'Antonim (lawan kata)';
  const rel = type === 'sinonim' ? 'sama atau mirip artinya dengan' : 'berlawanan artinya dengan';
  const items = [];
  bank.forEach(([w, m], i) => {
    items.push({ w, m, i, dir: 0 });
    if (!m.includes(' ')) items.push({ w: m.toUpperCase(), m: w.toLowerCase(), i, dir: 1 });
  });
  for (const it of shuffle(items)) {
    if (out.length >= target) break;
    const pool = bank.filter((_, j) => j !== it.i).map(([w, m]) => (it.dir === 0 ? m : w.toLowerCase()));
    // gunakan pengecoh panjangnya mirip & beberapa dari daftar lawan (untuk sinonim: masukkan antonim sebagai jebakan bila ada)
    const ds = sample(pool, 12);
    if (type === 'sinonim') {
      const anto = parseBank(ANTONIM).find(([a]) => a.toLowerCase() === it.w.toLowerCase());
      if (anto) ds.unshift(anto[1]);
    } else {
      const sino = parseBank(SINONIM).find(([a]) => a.toLowerCase() === it.w.toLowerCase());
      if (sino) ds.unshift(sino[1]);
    }
    const b = buildOptions(it.m, ds);
    if (!b) continue;
    const q = type === 'sinonim'
      ? `Sinonim dari kata <b>${it.w.toUpperCase()}</b> adalah ....`
      : `Antonim (lawan kata) dari <b>${it.w.toUpperCase()}</b> adalah ....`;
    out.push({ t: type, q, o: b.o, a: b.a, d: it.w.length > 8 ? 2 : 1,
      e: `<b>${it.w.toUpperCase()}</b> ${rel} <b>${it.m}</b>. Pilihan lain tidak memiliki hubungan makna tersebut.` });
  }
  return out;
}

// ---------- ANALOGI ----------
function genAnalogi(target) {
  const out = [];
  const allB = ANALOGI.flatMap((g, gi) => g.pairs.map(p => ({ w: p[1], gi, fam: g.fam || 'g' + gi })));
  const allPairs = ANALOGI.flatMap((g, gi) => g.pairs.map(p => ({ p, gi, fam: g.fam || 'g' + gi })));
  const UP = s => s.toUpperCase();
  let guard = 0;
  const seen = new Set();
  while (out.length < target && guard++ < target * 30) {
    const gi = ri(0, ANALOGI.length - 1);
    const g = ANALOGI[gi];
    const gf = g.fam || 'g' + gi;
    const [p1, p2] = sample(g.pairs, 2);
    if (p1[1] === p2[1] || p1[0] === p2[0]) continue;
    const form = pick([0, 0, 0, 1, 2]);
    const key = form + '|' + p1.join() + '|' + p2.join();
    if (seen.has(key)) continue;
    seen.add(key);
    let q, b, e;
    if (form === 0) {
      // A : B = C : ...
      let ds = [];
      if (g.same) ds.push(...shuffle(g.pairs.filter(p => p[1] !== p2[1] && p[1] !== p1[1]).map(p => p[1])).slice(0, 2));
      ds.push(p2[0] === p1[1] ? '' : p1[1]);
      ds.push(...shuffle(allB.filter(x => x.fam !== gf).map(x => x.w)).slice(0, 6));
      ds = ds.filter(Boolean);
      b = buildOptions(p2[1], ds);
      q = `${UP(p1[0])} : ${UP(p1[1])} = ${UP(p2[0])} : ....`;
      e = `Hubungan <i>${g.rel}</i>: ${p1[0]} → ${p1[1]}. Dengan pola yang sama, ${p2[0]} → <b>${p2[1]}</b>.`;
    } else if (form === 1) {
      // A : ... = C : ...
      const correct = `${UP(p1[1])} : ${UP(p2[1])}`;
      let ds = [`${UP(p2[1])} : ${UP(p1[1])}`];
      const others = shuffle(allB.filter(x => x.fam !== gf));
      for (let k = 0; k + 1 < others.length && ds.length < 8; k += 2) {
        ds.push(pick([`${UP(p1[1])} : ${UP(others[k].w)}`, `${UP(others[k].w)} : ${UP(p2[1])}`, `${UP(others[k].w)} : ${UP(others[k + 1].w)}`]));
      }
      b = buildOptions(correct, ds);
      q = `${UP(p1[0])} : ... = ${UP(p2[0])} : ....`;
      e = `Hubungan <i>${g.rel}</i>: ${p1[0]} : ${p1[1]} dan ${p2[0]} : ${p2[1]}. Jawaban: <b>${correct}</b>.`;
    } else {
      // A : B = ... : ...
      const correct = `${UP(p2[0])} : ${UP(p2[1])}`;
      const ds = [`${UP(p2[1])} : ${UP(p2[0])}`];
      shuffle(allPairs.filter(x => x.fam !== gf)).slice(0, 6).forEach(x => ds.push(`${UP(x.p[0])} : ${UP(x.p[1])}`));
      b = buildOptions(correct, ds);
      q = `${UP(p1[0])} : ${UP(p1[1])} = ... : ....`;
      e = `Hubungan <i>${g.rel}</i>. Pasangan yang memiliki hubungan dan urutan sama adalah <b>${correct}</b>. Perhatikan urutan: pasangan yang dibalik tidak setara.`;
    }
    if (!b) continue;
    out.push({ t: 'analogi', q, o: b.o, a: b.a, e, d: form === 0 ? 1 : 2 });
  }
  return out;
}

// ---------- SILOGISME / LOGIKA ----------
function genSilogisme(target) {
  const out = [];
  const seen = new Set();
  const forms = ['MP', 'MT', 'HS', 'HSMP', 'HSMT', 'DS', 'DIL', 'AC', 'KONTRA', 'NEG', 'HSK'];
  const catForms = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];
  let guard = 0;
  while (out.length < target && guard++ < target * 20) {
    const useCat = L.rnd() < 0.45;
    let item;
    if (useCat) {
      const k = pick(KATEGORI), f = pick(catForms);
      const key = 'c' + f + k.A;
      if (seen.has(key)) continue; seen.add(key);
      item = catSyl(k, f);
    } else {
      const ch = pick(RANTAI), f = pick(forms);
      const ch2 = pick(RANTAI.filter(c => c !== ch));
      const key = f + ch[0][0] + (f === 'DIL' ? ch2[0][0] : '');
      if (seen.has(key)) continue; seen.add(key);
      item = condSyl(ch, f, ch2);
    }
    if (item) out.push(item);
  }
  return out;
}

function condSyl(ch, f, ch2) {
  const [P, Q, R] = ch;
  const p = P[0], np = P[1], q = Q[0], nq = Q[1], r = R[0], nr = R[1];
  const If = (a, b) => `Jika ${a}, maka ${b}.`;
  let prem, cor, ds, e, fixedLast = null, d = 2;
  switch (f) {
    case 'MP': prem = [If(p, q), cap(p) + '.']; cor = cap(q) + '.'; ds = [cap(nq) + '.', cap(np) + '.', If(q, p), If(np, nq)];
      e = 'Modus ponens: p → q, p benar ∴ q.'; d = 1; break;
    case 'MT': prem = [If(p, q), cap(nq) + '.']; cor = cap(np) + '.'; ds = [cap(p) + '.', cap(q) + '.', If(nq, p), If(np, nq)];
      e = 'Modus tollens: p → q, ~q ∴ ~p.'; d = 1; break;
    case 'HS': prem = [If(p, q), If(q, r)]; cor = If(p, r); ds = [If(r, p), If(np, nr), If(nr, p), If(p, nr)];
      e = 'Silogisme hipotetis: p → q, q → r ∴ p → r.'; break;
    case 'HSK': prem = [If(p, q), If(q, r)]; cor = If(nr, np); ds = [If(r, p), If(np, nr), If(nr, p), If(r, np)];
      e = 'p → q, q → r ∴ p → r, yang setara dengan kontraposisinya ~r → ~p.'; d = 3; break;
    case 'HSMP': prem = [If(p, q), If(q, r), cap(p) + '.']; cor = cap(r) + '.'; ds = [cap(nr) + '.', cap(nq) + '.', If(r, p), If(nq, r)];
      e = 'p → q → r dan p benar, maka q benar sehingga r benar.'; break;
    case 'HSMT': prem = [If(p, q), If(q, r), cap(nr) + '.']; cor = cap(np) + '.'; ds = [cap(p) + '.', cap(q) + '.', cap(r) + '.', If(np, nr)];
      e = 'p → q → r setara dengan p → r. Karena ~r, maka ~p (modus tollens).'; break;
    case 'DS': prem = [cap(p) + ' atau ' + q + '.', cap(np) + '.']; cor = cap(q) + '.'; ds = [cap(nq) + '.', cap(p) + '.', cap(p) + ' dan ' + q + '.', If(q, p)];
      e = 'Silogisme disjungtif: p ∨ q, ~p ∴ q.'; d = 1; break;
    case 'DIL': {
      const [S, T] = ch2; const s = S[0], t = T[0], nt = T[1], ns = S[1];
      prem = [If(p, q), If(s, t), cap(p) + ' atau ' + nt + '.'];
      cor = cap(q) + ' atau ' + ns + '.';
      ds = [cap(nq) + ' atau ' + s + '.', cap(q) + ' dan ' + ns + '.', cap(np) + ' atau ' + t + '.', If(q, p)];
      e = 'Dilema: p → q, s → t, dan p ∨ ~t. Karena ~t → ~s (kontraposisi), maka p ∨ ~t menghasilkan q ∨ ~s.'; d = 3; break;
    }
    case 'AC': prem = [If(p, q), cap(q) + '.']; cor = 'Tidak dapat ditarik kesimpulan yang pasti.';
      ds = [cap(p) + '.', cap(np) + '.', cap(nq) + '.', If(np, nq)]; fixedLast = cor;
      e = 'Bentuk p → q dan q benar adalah <i>kekeliruan menegaskan konsekuen</i>; p belum tentu benar atau salah.'; d = 2; break;
    case 'KONTRA': prem = null; cor = If(nq, np); ds = [If(q, p), If(np, nq), cap(p) + ' dan ' + nq + '.', If(p, nq)];
      e = 'p → q ekuivalen dengan kontraposisinya ~q → ~p (juga dengan ~p ∨ q). Konvers (q → p) dan invers (~p → ~q) tidak ekuivalen.'; break;
    case 'NEG': prem = null; cor = cap(p) + ' dan ' + nq + '.'; ds = [If(np, nq), If(p, nq), cap(np) + ' dan ' + q + '.', cap(np) + ' atau ' + q + '.'];
      e = 'Ingkaran p → q adalah p ∧ ~q.'; break;
  }
  let qq;
  if (f === 'KONTRA') qq = `Pernyataan yang setara (ekuivalen) dengan "<i>Jika ${p}, maka ${q}</i>" adalah ....`;
  else if (f === 'NEG') qq = `Ingkaran (negasi) dari pernyataan "<i>Jika ${p}, maka ${q}</i>" adalah ....`;
  else qq = prem.map(x => `<div class="prem">${x}</div>`).join('') + '<div class="ask">Kesimpulan yang tepat adalah ....</div>';
  const b = buildOptions(cor, ds);
  if (!b) return null;
  let o = b.o, a = b.a, fx;
  if (fixedLast) { o = o.filter(x => x !== fixedLast); o.push(fixedLast); a = o.length - 1; fx = 1; }
  return { t: 'silogisme', q: qq, o, a, e, d, fx };
}

function catSyl(k, f) {
  const { A, B, C, D, X } = k;
  let prem, cor, ds, e, d = 2;
  switch (f) {
    case 'c1': prem = [`Semua ${A} adalah ${B}.`, `${X} adalah ${A}.`]; cor = `${X} adalah ${B}.`;
      ds = [`${X} bukan ${B}.`, `${X} belum tentu ${B}.`, `Semua ${B} adalah ${A}.`, `Sebagian ${A} bukan ${B}.`]; e = 'Semua A ⊂ B dan X ∈ A, maka X ∈ B.'; d = 1; break;
    case 'c2': prem = [`Semua ${A} adalah ${B}.`, `${X} bukan ${B}.`]; cor = `${X} bukan ${A}.`;
      ds = [`${X} adalah ${A}.`, `${X} adalah ${B}.`, `${X} belum tentu bukan ${A}.`, `Semua ${B} adalah ${A}.`]; e = 'Jika X ∉ B dan A ⊂ B, maka X ∉ A.'; d = 1; break;
    case 'c3': prem = [`Semua ${A} adalah ${B}.`, `Sebagian ${C} adalah ${A}.`]; cor = `Sebagian ${C} adalah ${B}.`;
      ds = [`Semua ${C} adalah ${B}.`, `Tidak ada ${C} yang merupakan ${B}.`, `Semua ${B} adalah ${C}.`, `Semua ${C} adalah ${A}.`]; e = 'C yang termasuk A pasti termasuk B, sehingga sebagian C adalah B.'; break;
    case 'c4': prem = [`Semua ${A} adalah ${B}.`, `Sebagian ${C} bukan ${B}.`]; cor = `Sebagian ${C} bukan ${A}.`;
      ds = [`Semua ${C} bukan ${A}.`, `Sebagian ${C} adalah ${A}.`, `Semua ${A} adalah ${C}.`, `Tidak ada ${C} yang merupakan ${B}.`]; e = 'C yang tidak termasuk B pasti juga tidak termasuk A (karena A ⊂ B).'; d = 3; break;
    case 'c5': prem = [`Tidak ada ${A} yang merupakan ${B}.`, `Semua ${C} adalah ${A}.`]; cor = `Tidak ada ${C} yang merupakan ${B}.`;
      ds = [`Sebagian ${C} adalah ${B}.`, `Semua ${B} adalah ${C}.`, `Semua ${C} adalah ${B}.`, `Sebagian ${B} adalah ${A}.`]; e = 'C ⊂ A dan A tidak beririsan dengan B, maka C tidak beririsan dengan B.'; break;
    case 'c6': prem = [`Tidak ada ${A} yang merupakan ${B}.`, `Sebagian ${C} adalah ${A}.`]; cor = `Sebagian ${C} bukan ${B}.`;
      ds = [`Semua ${C} bukan ${B}.`, `Sebagian ${C} adalah ${B}.`, `Tidak ada ${C} yang merupakan ${A}.`, `Semua ${B} adalah ${C}.`]; e = 'C yang termasuk A pasti bukan B, maka sebagian C bukan B.'; d = 3; break;
    case 'c7': prem = [`Semua ${A} adalah ${B}.`, `Semua ${B} adalah ${D}.`]; cor = `Semua ${A} adalah ${D}.`;
      ds = [`Semua ${D} adalah ${A}.`, `Sebagian ${A} bukan ${D}.`, `Semua ${D} adalah ${B}.`, `Tidak ada ${A} yang merupakan ${D}.`]; e = 'A ⊂ B dan B ⊂ D, maka A ⊂ D.'; d = 1; break;
    case 'c8': prem = [`Semua ${A} adalah ${B}.`, `${X} adalah ${B}.`]; cor = `${X} belum tentu ${A}.`;
      ds = [`${X} adalah ${A}.`, `${X} bukan ${A}.`, `Semua ${B} adalah ${A}.`, `${X} bukan ${B}.`]; e = 'X ∈ B tidak menjamin X ∈ A (B lebih luas dari A). Jadi X <i>belum tentu</i> A.'; d = 2; break;
  }
  const q = prem.map(x => `<div class="prem">${cap(x)}</div>`).join('') + '<div class="ask">Kesimpulan yang paling tepat adalah ....</div>';
  const b = buildOptions(cap(cor), ds.map(cap));
  if (!b) return null;
  return { t: 'silogisme', q, o: b.o, a: b.a, e, d };
}

// ---------- PENALARAN ANALITIK ----------
const NAMA = ['Adam','Bima','Citra','Dewi','Eka','Fajar','Gita','Hadi','Indra','Joko','Kiki','Lina','Maya','Nanda','Oki','Putri','Raka','Sinta','Tono','Umar','Vina','Wahyu','Yogi','Zahra','Arif','Bayu','Dian','Fikri','Hana','Irfan','Nisa','Rizky','Salsa','Tari','Yuda'];
const KONTEKS = [
  { attr: 'nilai TOEFL', more: 'lebih tinggi', less: 'lebih rendah', hi: 'tinggi', lo: 'rendah', topS: 'memiliki nilai TOEFL tertinggi', botS: 'memiliki nilai TOEFL terendah', who: 'peserta' },
  { attr: 'tinggi badan', more: 'lebih tinggi', less: 'lebih pendek', hi: 'tinggi', lo: 'pendek', topS: 'paling tinggi', botS: 'paling pendek', who: 'siswa' },
  { attr: 'usia', more: 'lebih tua', less: 'lebih muda', hi: 'tua', lo: 'muda', topS: 'paling tua', botS: 'paling muda', who: 'saudara sepupu' },
  { attr: 'tagihan rekening', more: 'lebih besar', less: 'lebih kecil', hi: 'besar', lo: 'kecil', topS: 'memiliki tagihan rekening terbesar', botS: 'memiliki tagihan rekening terkecil', who: 'pegawai' },
  { attr: 'kecepatan lari', more: 'lebih cepat', less: 'lebih lambat', hi: 'cepat', lo: 'lambat', topS: 'berlari paling cepat', botS: 'berlari paling lambat', who: 'pelari' },
  { attr: 'berat badan', more: 'lebih berat', less: 'lebih ringan', hi: 'berat', lo: 'ringan', topS: 'paling berat', botS: 'paling ringan', who: 'atlet' },
  { attr: 'jumlah tabungan', more: 'lebih banyak', less: 'lebih sedikit', hi: 'banyak', lo: 'sedikit', topS: 'memiliki tabungan terbanyak', botS: 'memiliki tabungan paling sedikit', who: 'karyawan' },
  { attr: 'nilai IELTS', more: 'lebih tinggi', less: 'lebih rendah', hi: 'tinggi', lo: 'rendah', topS: 'memiliki nilai IELTS tertinggi', botS: 'memiliki nilai IELTS terendah', who: 'pelamar beasiswa' },
  { attr: 'skor kinerja', more: 'lebih tinggi', less: 'lebih rendah', hi: 'tinggi', lo: 'rendah', topS: 'memiliki skor kinerja tertinggi', botS: 'memiliki skor kinerja terendah', who: 'staf' },
  { attr: 'jumlah buku yang dibaca', more: 'lebih banyak', less: 'lebih sedikit', hi: 'banyak', lo: 'sedikit', topS: 'membaca buku paling banyak', botS: 'membaca buku paling sedikit', who: 'mahasiswa' },
];

function permutations(arr) {
  if (arr.length <= 1) return [arr.slice()];
  const res = [];
  arr.forEach((x, i) => permutations(arr.slice(0, i).concat(arr.slice(i + 1))).forEach(p => res.push([x, ...p])));
  return res;
}

function genUrutan() {
  const n = pick([4, 5, 5, 5, 6]);
  const names = sample(NAMA, n);
  const K = pick(KONTEKS);
  const order = shuffle(names); // order[0] = paling "more"
  const rank = Object.fromEntries(order.map((x, i) => [x, i]));
  const cands = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) {
    const a = names[i], b = names[j];
    if (rank[a] < rank[b]) cands.push({ txt: `${K.attr} ${a} ${K.more} daripada ${b}`, f: r => r[a] < r[b] });
  }
  // klausa "X lebih ... dari Y, tetapi lebih ... dari Z"
  for (let k = 1; k < n - 1; k++) {
    const x = order[k];
    const up = order[ri(0, k - 1)], dn = order[ri(k + 1, n - 1)];
    cands.push({ txt: `${K.attr} ${x} ${K.less} daripada ${up}, tetapi ${K.more} daripada ${dn}`, f: r => r[x] > r[up] && r[x] < r[dn] });
  }
  cands.push({ txt: `${order[0]} ${K.topS}`, f: r => r[order[0]] === 0 });
  cands.push({ txt: `${order[n - 1]} ${K.botS}`, f: r => r[order[n - 1]] === n - 1 });
  const perms = permutations(names).map(p => Object.fromEntries(p.map((x, i) => [x, i])));
  // pilih klausa acak sampai urutan tunggal
  let chosen = [];
  let pool = shuffle(cands);
  let consistent = perms;
  for (const c of pool) {
    const next = consistent.filter(c.f);
    if (next.length < consistent.length) { chosen.push(c); consistent = next; }
    if (consistent.length === 1) break;
  }
  if (consistent.length !== 1) return null;
  // minimalkan
  for (let i = chosen.length - 1; i >= 0; i--) {
    const trial = chosen.filter((_, j) => j !== i);
    if (perms.filter(r => trial.every(c => c.f(r))).length === 1) chosen = trial;
  }
  if (chosen.length > 6) return null;
  const sent = shuffle(chosen).map(c => cap(c.txt) + '.');
  const intro = `${cap(numWord(n))} orang ${K.who}, yaitu ${listJoin(names)}, dibandingkan berdasarkan ${K.attr}. `;
  const ask = pick(['top', 'bot', 'pos', 'asc', 'desc', 'true']);
  let q, cor, ds, e;
  const desc = order, asc = order.slice().reverse();
  e = `Susun informasi satu per satu. Urutan dari yang paling ${K.hi} ke paling ${K.lo}: <b>${desc.join(' → ')}</b>.`;
  if (ask === 'top' || ask === 'bot') {
    const ans = ask === 'top' ? desc[0] : desc[n - 1];
    q = `Siapakah yang ${ask === 'top' ? K.topS : K.botS}?`;
    cor = ans; ds = names.filter(x => x !== ans);
    if (n === 4) ds.push(`${desc[0]} dan ${desc[1]}`);
  } else if (ask === 'pos') {
    const k = ri(1, n - 2);
    const fromTop = L.rnd() < 0.5;
    const ans = fromTop ? desc[k] : asc[k];
    q = `Jika diurutkan dari yang paling ${fromTop ? K.hi : K.lo}, siapakah yang berada di urutan ke-${k + 1}?`;
    cor = ans; ds = names.filter(x => x !== ans);
    if (n === 4) ds.push('Tidak dapat ditentukan');
  } else if (ask === 'asc' || ask === 'desc') {
    const seq = ask === 'asc' ? asc : desc;
    q = `Urutan ${K.who} jika diurutkan mulai dari yang paling ${ask === 'asc' ? K.lo : K.hi} adalah ....`;
    cor = seq.join(', ');
    ds = [];
    const rev = seq.slice().reverse().join(', '); ds.push(rev);
    for (let t = 0; t < 12; t++) {
      const s = seq.slice(); const i = ri(0, n - 2); [s[i], s[i + 1]] = [s[i + 1], s[i]];
      if (L.rnd() < 0.4) { const j = ri(0, n - 2); [s[j], s[j + 1]] = [s[j + 1], s[j]]; }
      ds.push(s.join(', '));
    }
    ds = shuffle(ds);
  } else {
    const [a, b] = sample(names, 2);
    const hi = rank[a] < rank[b] ? a : b, lo = hi === a ? b : a;
    q = 'Pernyataan berikut yang pasti benar adalah ....';
    cor = `${K.attr} ${hi} ${K.more} daripada ${lo}`;
    ds = [];
    for (let t = 0; t < 10; t++) { const [x, y] = sample(names, 2); const H = rank[x] < rank[y] ? x : y, Lo = H === x ? y : x; ds.push(`${K.attr} ${Lo} ${K.more} daripada ${H}`); }
    ds.push(`${desc[n - 1]} memiliki ${K.attr} di urutan tengah`);
    cor = cap(cor); ds = ds.map(cap);
  }
  const b = buildOptions(cor, ds);
  if (!b) return null;
  return { t: 'analitik', q: `<p>${intro}${sent.join(' ')}</p><div class="ask">${q}</div>`, o: b.o, a: b.a, e, d: n >= 6 ? 3 : 2 };
}

function numWord(n) { return ['nol','satu','dua','tiga','empat','lima','enam','tujuh','delapan'][n]; }
function listJoin(a) { return a.length === 1 ? a[0] : a.slice(0, -1).join(', ') + ', dan ' + a[a.length - 1]; }

// Posisi: duduk berjajar / jadwal hari
const HARI = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
function genPosisi() {
  const n = pick([5, 5, 6]);
  const mode = pick(['kursi', 'hari', 'rak']);
  const names = sample(NAMA, n);
  const pos = shuffle([...Array(n).keys()]); // pos[i] = posisi names[i]
  const P = Object.fromEntries(names.map((x, i) => [x, pos[i]]));
  const atPos = p => names.find(x => P[x] === p);
  const lbl = p => mode === 'hari' ? HARI[p] : `${mode === 'rak' ? 'rak' : 'kursi'} nomor ${p + 1}`;
  const cands = [];
  for (const a of names) for (const b of names) if (a !== b) {
    const d = P[b] - P[a];
    if (mode === 'hari') {
      if (d === 1) cands.push({ txt: `${a} presentasi tepat sehari sebelum ${b}`, f: r => r[b] - r[a] === 1 });
      if (d > 1) cands.push({ txt: `${a} presentasi lebih awal daripada ${b}, tetapi tidak berurutan hari`, f: r => r[b] - r[a] > 1 });
      if (Math.abs(d) > 1 && a < b) cands.push({ txt: `${a} dan ${b} tidak presentasi pada hari yang berurutan`, f: r => Math.abs(r[a] - r[b]) > 1 });
    } else {
      if (d === 1) cands.push({ txt: `${a} ${mode === 'rak' ? 'menempati rak' : 'duduk'} tepat di sebelah kiri ${b}`, f: r => r[b] - r[a] === 1 });
      if (Math.abs(d) === 1 && a < b) cands.push({ txt: `${a} ${mode === 'rak' ? 'dan ' + b + ' menempati rak bersebelahan' : 'duduk bersebelahan dengan ' + b}`, f: r => Math.abs(r[a] - r[b]) === 1 });
      if (Math.abs(d) > 1 && a < b) cands.push({ txt: `${a} ${mode === 'rak' ? 'dan ' + b + ' tidak menempati rak bersebelahan' : 'tidak duduk bersebelahan dengan ' + b}`, f: r => Math.abs(r[a] - r[b]) > 1 });
      if (d > 1) cands.push({ txt: `di antara ${a} dan ${b} terdapat tepat ${d - 1} ${mode === 'rak' ? 'rak lain' : 'orang'}`, f: r => Math.abs(r[a] - r[b]) === d });
    }
  }
  for (const a of names) {
    if (P[a] === 0) cands.push({ txt: mode === 'hari' ? `${a} presentasi paling awal` : `${a} berada di ujung paling kiri`, f: r => r[a] === 0 });
    if (P[a] === n - 1) cands.push({ txt: mode === 'hari' ? `${a} presentasi paling akhir` : `${a} berada di ujung paling kanan`, f: r => r[a] === n - 1 });
    if (P[a] !== 0 && P[a] !== n - 1) cands.push({ txt: mode === 'hari' ? `${a} tidak presentasi pada hari pertama maupun terakhir` : `${a} tidak berada di ujung`, f: r => r[a] !== 0 && r[a] !== n - 1 });
    cands.push({ txt: `${a} ${mode === 'hari' ? 'presentasi pada hari' : 'berada di'} ${lbl(P[a])}`, f: r => r[a] === P[a], direct: true });
  }
  const perms = permutations([...Array(n).keys()]).map(p => Object.fromEntries(names.map((x, i) => [x, p[i]])));
  // pertanyaan
  const ask = pick(['who', 'where', 'next']);
  let target, getAns;
  if (ask === 'who') { const p = ri(0, n - 1); target = p; getAns = r => names.find(x => r[x] === p); }
  else if (ask === 'where') { target = pick(names); getAns = r => r[target]; }
  else { target = pick(names.filter(x => P[x] > 0 && P[x] < n - 1)); getAns = r => names.filter(x => Math.abs(r[x] - r[target]) === 1).sort().join(' dan '); }
  let chosen = [];
  let consistent = perms;
  for (const c of shuffle(cands.filter(c => !c.direct || L.rnd() < 0.3))) {
    const next = consistent.filter(c.f);
    if (next.length === 0 || next.length === consistent.length) continue;
    chosen.push(c); consistent = next;
    if (new Set(consistent.map(getAns)).size === 1 && consistent.length <= 2) break;
  }
  if (new Set(consistent.map(getAns)).size !== 1) return null;
  for (let i = chosen.length - 1; i >= 0; i--) {
    const trial = chosen.filter((_, j) => j !== i);
    const cs = perms.filter(r => trial.every(c => c.f(r)));
    if (new Set(cs.map(getAns)).size === 1) chosen = trial;
  }
  if (chosen.length < 2 || chosen.length > 6) return null;
  const ansVal = getAns(P);
  let intro, q, cor, ds;
  if (mode === 'kursi') intro = `${cap(numWord(n))} orang, yaitu ${listJoin(names)}, duduk berjajar pada ${n} kursi bernomor 1 sampai ${n} dari kiri ke kanan.`;
  else if (mode === 'rak') intro = `${cap(numWord(n))} kategori buku milik ${listJoin(names)} disusun pada ${n} rak bernomor 1 sampai ${n} dari kiri ke kanan (satu rak untuk satu orang).`;
  else intro = `${cap(numWord(n))} mahasiswa, yaitu ${listJoin(names)}, mendapat jadwal presentasi pada hari ${HARI[0]} sampai ${HARI[n - 1]}, masing-masing satu hari dan tidak ada yang sama.`;
  if (ask === 'who') {
    q = mode === 'hari' ? `Siapakah yang presentasi pada hari ${HARI[target]}?` : `Siapakah yang berada di ${lbl(target)}?`;
    cor = ansVal; ds = names.filter(x => x !== cor);
  } else if (ask === 'where') {
    q = mode === 'hari' ? `Pada hari apakah ${target} presentasi?` : `${target} berada di ....`;
    cor = cap(lbl(ansVal)); ds = [...Array(n).keys()].filter(x => x !== ansVal).map(x => cap(lbl(x)));
  } else {
    q = mode === 'hari' ? `Siapa saja yang presentasi tepat sehari sebelum dan sesudah ${target}?` : `Siapa saja yang berada tepat di sebelah ${target}?`;
    cor = ansVal;
    ds = [];
    const others = names.filter(x => x !== target);
    for (let t = 0; t < 15; t++) { const pr = sample(others, 2).sort().join(' dan '); ds.push(pr); }
  }
  const b = buildOptions(cor, shuffle(ds));
  if (!b) return null;
  const sol = [...Array(n).keys()].map(p => `${mode === 'hari' ? HARI[p] : p + 1}: ${atPos(p)}`).join(', ');
  return { t: 'analitik', q: `<p>${intro}</p><ul class="clues">${shuffle(chosen).map(c => `<li>${cap(c.txt)}.</li>`).join('')}</ul><div class="ask">${q}</div>`,
    o: b.o, a: b.a, d: chosen.length >= 4 ? 3 : 2,
    e: `Uji setiap kemungkinan penempatan terhadap semua syarat. Susunan yang memenuhi (salah satu susunan yang valid): ${sol}. Jawaban: <b>${cor}</b>.` };
}

function genAnalitik(target) {
  const out = []; const seen = new Set();
  let guard = 0;
  while (out.length < target && guard++ < target * 40) {
    const it = L.rnd() < 0.5 ? genUrutan() : genPosisi();
    if (!it || seen.has(it.q)) continue;
    seen.add(it.q); out.push(it);
  }
  return out;
}

module.exports = function genVerbal(counts) {
  return [
    ...genWordPairs(SINONIM, 'sinonim', counts.sinonim),
    ...genWordPairs(ANTONIM, 'antonim', counts.antonim),
    ...genAnalogi(counts.analogi),
    ...genSilogisme(counts.silogisme),
    ...genAnalitik(counts.analitik),
  ];
};
