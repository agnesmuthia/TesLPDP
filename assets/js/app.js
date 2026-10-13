/* TBS Prep — Aplikasi latihan Tes Bakat Skolastik LPDP (vanilla JS, tanpa server). */
(function () {
  'use strict';
  const BANK = window.TBS_BANK;
  if (!BANK) { document.body.innerHTML = '<p style="padding:24px">Bank soal gagal dimuat. Pastikan file <code>data/bank.js</code> tersedia.</p>'; return; }

  // ---------- Data & indeks ----------
  const QMAP = new Map(BANK.questions.map(q => [q.id, q]));
  const SJTMAP = new Map(BANK.sjt.map(q => [q.id, q]));
  const SEC = {
    verbal: { name: 'Penalaran Verbal', short: 'Verbal', n: 23, min: 30, color: '#1d4ed8' },
    kuantitatif: { name: 'Penalaran Kuantitatif', short: 'Kuantitatif', n: 25, min: 30, color: '#e9a300' },
    pm: { name: 'Pemecahan Masalah', short: 'Pemecahan Masalah', n: 12, min: 20, color: '#11845b' },
  };
  const TYPE_SEC = {}; const BY_TYPE = {}; const BY_SEC = { verbal: [], kuantitatif: [], pm: [] };
  BANK.questions.forEach(q => { TYPE_SEC[q.t] = q.s; (BY_TYPE[q.t] = BY_TYPE[q.t] || []).push(q); BY_SEC[q.s].push(q); });
  const TYPE_ORDER = Object.keys(BANK.types).filter(t => BY_TYPE[t]);
  const tname = t => BANK.types[t] || t;
  const BLUEPRINT = {
    verbal: [['analogi', 6], ['silogisme', 7], ['analitik', 7], ['sinonim', 2], ['antonim', 1]],
    kuantitatif: [['deret_angka', 6], ['deret_huruf', 2], ['aritmetika', 3], ['aljabar', 3], ['perbandingan', 3], ['cerita', 5], ['geometri', 2], ['statistik|peluang', 1]],
    pm: [['wacana', 4], ['tabel', 3], ['grafik', 2], ['diagram', 1], ['kontekstual', 2]],
  };

  // ---------- Penyimpanan ----------
  const KEY = 'tbsprep.v1';
  const blank = () => ({ v: 1, profile: { name: '', target: 50, examDate: '', theme: 'auto' }, sessions: [], qs: {}, daily: {}, active: null, created: Date.now() });
  let S = load();
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) { const d = JSON.parse(raw); return Object.assign(blank(), d, { profile: Object.assign(blank().profile, d.profile || {}) }); } } catch (e) { /* abaikan */ }
    return blank();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Penyimpanan penuh/terblokir — ekspor data Anda di Pengaturan.'); } }

  // ---------- Util ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const dkey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const fdate = ts => { const d = new Date(ts); return `${d.getDate()} ${BLN[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}.${pad(d.getMinutes())}`; };
  const fdur = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}j ${m}m` : m ? `${m}m ${pad(x)}d` : `${x}d`; };
  const fclock = s => { s = Math.max(0, Math.ceil(s)); const m = Math.floor(s / 60), x = s % 60; return `${pad(m)}:${pad(x)}`; };
  const pct = (a, b) => (b ? Math.round(a / b * 100) : 0);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const KEYS = 'ABCDE';
  function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }
  function modal(title, body, actions) {
    return new Promise(res => {
      const bg = document.createElement('div'); bg.className = 'modal-bg';
      bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><h3>${title}</h3><div class="muted">${body}</div><div class="btn-row">${actions.map((a, i) => `<button class="btn ${a.cls || ''}" data-i="${i}">${a.label}</button>`).join('')}</div></div>`;
      document.body.appendChild(bg);
      bg.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) { bg.remove(); res(actions[+b.dataset.i].value); } else if (e.target === bg) { bg.remove(); res(null); } });
    });
  }

  // ---------- Ikon ----------
  const I = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    exam: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    redo: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    history: '<path d="M12 7v5l3 2"/><circle cx="12" cy="12" r="9"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5V4.5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    flame: '<path d="M12 22c4 0 7-2.7 7-7 0-4-3-6.5-4.5-9.5-.5 2.5-2 4-3.5 4.5C11 6 10 4 9.5 2 7 5 5 8.5 5 15c0 4.3 3 7 7 7z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>', flag: '<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
    left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>', menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>', brain: '<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3h1V3zM15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3h-1V3z"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
    download: '<path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16"/>', upload: '<path d="M12 21V9m0 0-4 4m4-4 4 4M4 3h16"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  };
  const ico = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;

  // ---------- Statistik ----------
  function daily(k = dkey()) { return S.daily[k] || { n: 0, c: 0, sec: 0 }; }
  function streak() {
    let cur = 0; let d = new Date();
    if (!(S.daily[dkey(d)] && S.daily[dkey(d)].n)) d = addDays(d, -1);
    while (S.daily[dkey(d)] && S.daily[dkey(d)].n) { cur++; d = addDays(d, -1); }
    const keys = Object.keys(S.daily).filter(k => S.daily[k].n).sort();
    let best = 0, run = 0, prev = null;
    keys.forEach(k => { const dt = fromKey(k); run = prev && dkey(addDays(prev, 1)) === k ? run + 1 : 1; best = Math.max(best, run); prev = dt; });
    return { cur, best };
  }
  function typeStats() {
    const st = {}; TYPE_ORDER.forEach(t => (st[t] = { n: 0, c: 0, seen: 0, total: BY_TYPE[t].length }));
    for (const id in S.qs) { const q = QMAP.get(id); if (!q) continue; const r = S.qs[id]; const x = st[q.t]; x.n += r.n; x.c += r.c; x.seen++; }
    return st;
  }
  function totals() {
    let n = 0, c = 0, sec = 0; for (const k in S.daily) { n += S.daily[k].n; c += S.daily[k].c; sec += S.daily[k].sec || 0; }
    return { n, c, sec, unique: Object.keys(S.qs).filter(id => QMAP.has(id)).length };
  }
  function wrongIds() { return Object.keys(S.qs).filter(id => QMAP.has(id) && S.qs[id].lc === false); }

  // ---------- Pemilihan soal (adaptif: belum pernah → pernah salah → paling lama) ----------
  function prioritize(pool) {
    const now = Date.now();
    return shuffle(pool).map(q => { const r = S.qs[q.id]; let p; if (!r) p = 0; else if (r.lc === false) p = 1 + (now - r.last) / 1e12; else p = 2 + 1 / (1 + (now - r.last) / 864e5); return [p, q]; })
      .sort((a, b) => a[0] - b[0]).map(x => x[1]);
  }
  function pickN(pool, n, exclude) { return prioritize(pool.filter(q => !exclude.has(q.id))).slice(0, n); }
  function pickPassage(n, exclude) {
    const groups = {}; BY_TYPE.wacana.forEach(q => { (groups[q.px] = groups[q.px] || []).push(q); });
    const scored = shuffle(Object.values(groups)).map(g => [g.filter(q => !S.qs[q.id]).length, g]).sort((a, b) => b[0] - a[0]);
    const g = scored[0][1].filter(q => !exclude.has(q.id));
    return g.slice(0, n);
  }
  function buildSection(sec, bp) {
    const out = []; const ex = new Set();
    for (const [types, n] of bp) {
      let got;
      if (types === 'wacana') got = pickPassage(n, ex);
      else got = pickN(types.split('|').flatMap(t => BY_TYPE[t] || []), n, ex);
      got.forEach(q => { ex.add(q.id); out.push(q.id); });
    }
    return out;
  }

  // ---------- Sesi ujian ----------
  function newSession(cfg) {
    const s = {
      id: uid(), mode: cfg.mode, title: cfg.title, secs: cfg.secs, si: 0, qi: 0, ans: {}, flag: {}, perm: {}, t: {},
      used: cfg.secs.map(() => 0), locked: cfg.secs.map(() => false), started: Date.now(), learn: !!cfg.learn, lockSections: !!cfg.lockSections, sjt: !!cfg.sjt,
    };
    s.secs.forEach(sec => sec.qids.forEach(id => {
      const q = s.sjt ? SJTMAP.get(id) : QMAP.get(id);
      s.perm[id] = q.fx ? q.o.map((_, i) => i) : shuffle(q.o.map((_, i) => i));
    }));
    S.active = s; save();
    location.hash = '#/ujian';
  }
  function startSimulasi() {
    newSession({ mode: 'simulasi', title: 'Simulasi TBS LPDP', lockSections: true,
      secs: Object.keys(SEC).map(k => ({ key: k, name: SEC[k].name, qids: buildSection(k, BLUEPRINT[k]), limit: SEC[k].min * 60 })) });
  }
  function startHarian(n, learn) {
    const share = { verbal: 23, kuantitatif: 25, pm: 12 }; const tot = 60;
    const secs = Object.keys(SEC).map(k => {
      const m = Math.max(1, Math.round(n * share[k] / tot));
      const pool = k === 'pm' ? BY_SEC.pm.filter(q => q.t !== 'wacana') : BY_SEC[k];
      const ids = pickN(pool, m, new Set()).map(q => q.id);
      return { key: k, name: SEC[k].name, qids: ids, limit: 0 };
    });
    const total = secs.reduce((a, s) => a + s.qids.length, 0);
    newSession({ mode: 'harian', title: `Latihan Harian · ${total} soal`, learn, secs: [{ key: 'mix', name: 'Campuran', qids: shuffle(secs.flatMap(s => s.qids)), limit: learn ? 0 : Math.round(total * 80) }] });
  }
  function startTopik(types, n, learn, timed) {
    const pool = types.flatMap(t => BY_TYPE[t] || []);
    const ids = pickN(pool, n, new Set()).map(q => q.id);
    if (!ids.length) return toast('Pilih minimal satu tipe soal.');
    newSession({ mode: 'topik', title: types.length === 1 ? `Latihan ${tname(types[0])}` : `Latihan ${types.length} Topik`, learn,
      secs: [{ key: 'topik', name: types.length === 1 ? tname(types[0]) : 'Topik Pilihan', qids: ids, limit: timed ? ids.length * 80 : 0 }] });
  }
  function startReview(learn) {
    const ids = prioritize(wrongIds().map(id => QMAP.get(id))).slice(0, 30).map(q => q.id);
    if (!ids.length) return toast('Belum ada soal salah untuk diulang. Bagus!');
    newSession({ mode: 'ulang', title: `Ulang Soal Salah · ${ids.length} soal`, learn, secs: [{ key: 'ulang', name: 'Soal yang Pernah Salah', qids: shuffle(ids), limit: 0 }] });
  }
  function startSJT() {
    newSession({ mode: 'sjt', title: 'Simulasi Tes Kepribadian (SJT)', sjt: true, secs: [{ key: 'sjt', name: 'Situational Judgment Test', qids: shuffle(BANK.sjt.map(q => q.id)), limit: 45 * 60 }] });
  }

  function finishSession(s) {
    const now = Date.now(); const today = dkey();
    const rec = { id: s.id, mode: s.mode, title: s.title, start: s.started, end: now, dur: s.used.reduce((a, b) => a + b, 0), secs: [], items: [] };
    const D = S.daily[today] || (S.daily[today] = { n: 0, c: 0, sec: 0 });
    D.sec += rec.dur;
    if (s.sjt) {
      let score = 0, max = 0, answered = 0;
      s.secs[0].qids.forEach(id => { const q = SJTMAP.get(id); const ch = s.ans[id]; max += 5; if (ch !== undefined) { answered++; score += q.sc[ch]; } rec.items.push([id, ch === undefined ? -1 : ch, Math.round(s.t[id] || 0)]); });
      rec.sjt = { score, max, answered }; rec.secs.push({ key: 'sjt', name: 'SJT', total: s.secs[0].qids.length, correct: answered, wrong: 0, empty: s.secs[0].qids.length - answered, time: rec.dur });
      D.n += answered;
    } else {
      s.secs.forEach((sec, i) => {
        const r = { key: sec.key, name: sec.name, total: sec.qids.length, correct: 0, wrong: 0, empty: 0, time: s.used[i] };
        sec.qids.forEach(id => {
          const q = QMAP.get(id); const ch = s.ans[id];
          const ok = ch !== undefined && ch === q.a;
          if (ch === undefined) r.empty++; else if (ok) r.correct++; else r.wrong++;
          rec.items.push([id, ch === undefined ? -1 : ch, Math.round(s.t[id] || 0)]);
          if (ch !== undefined) {
            const st = S.qs[id] || (S.qs[id] = { n: 0, c: 0 }); st.n++; if (ok) st.c++; st.last = now; st.lc = ok;
            D.n++; if (ok) D.c++;
          }
        });
        rec.secs.push(r);
      });
    }
    const T = rec.secs.reduce((a, r) => ({ total: a.total + r.total, correct: a.correct + r.correct }), { total: 0, correct: 0 });
    rec.score = s.sjt ? pct(rec.sjt.score, rec.sjt.max) : pct(T.correct, T.total);
    S.sessions.unshift(rec); if (S.sessions.length > 400) S.sessions.length = 400;
    S.active = null; save();
    stopTimer();
    location.hash = '#/hasil/' + rec.id;
  }

  // ---------- Render stimulus ----------
  function renderTable(tb) {
    return `<div class="stim"><div class="cap">${esc(tb.title)}</div><div class="table-wrap" style="display:inline-block;max-width:100%"><table><thead><tr>${tb.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${tb.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  }
  const PAL = ['#1d4ed8', '#e9a300', '#11845b', '#c7362f', '#7c3aed', '#0891b2', '#db2777', '#65a30d'];
  const nf = v => Number(v).toLocaleString('id-ID');
  function renderChart(ch) {
    if (ch.type === 'pie') {
      const W = 420, H = 260, cx = 130, cy = 130, r = 110; let a0 = -Math.PI / 2; const vals = ch.series[0].values; const tot = vals.reduce((a, b) => a + b, 0);
      let paths = '', legend = '';
      vals.forEach((v, i) => {
        const a1 = a0 + v / tot * 2 * Math.PI; const large = a1 - a0 > Math.PI ? 1 : 0;
        const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
        paths += `<path d="M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z" fill="${PAL[i % PAL.length]}" stroke="var(--surface)" stroke-width="2"/>`;
        const am = (a0 + a1) / 2; const lx = cx + r * 0.62 * Math.cos(am), ly = cy + r * 0.62 * Math.sin(am);
        paths += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" style="fill:#fff;font-weight:700;font-size:12px">${v}%</text>`;
        legend += `<rect x="280" y="${40 + i * 26}" width="14" height="14" rx="3" fill="${PAL[i % PAL.length]}"/><text x="302" y="${52 + i * 26}" style="font-size:13px;fill:var(--text)">${esc(ch.labels[i])}</text>`;
        a0 = a1;
      });
      return `<div class="stim chart"><div class="cap">${esc(ch.title)}</div><svg viewBox="0 0 ${W} ${H}" style="max-width:460px">${paths}${legend}</svg></div>`;
    }
    const W = 560, H = 280, L = 52, R = 16, T = 18, B = 36; const n = ch.labels.length;
    const all = ch.series.flatMap(s => s.values); let max = Math.max(...all); const step = niceStep(max / 5); max = Math.ceil(max / step) * step;
    const x = i => L + (W - L - R) * (ch.type === 'bar' ? (i + 0.5) / n : i / (n - 1));
    const y = v => T + (H - T - B) * (1 - v / max);
    let g = '';
    for (let v = 0; v <= max + 1e-9; v += step) g += `<line class="axis" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke-dasharray="${v ? '3 3' : ''}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${nf(v)}</text>`;
    ch.labels.forEach((lb, i) => { g += `<text x="${x(i)}" y="${H - 12}" text-anchor="middle">${esc(lb)}</text>`; });
    ch.series.forEach((s, si) => {
      const col = PAL[si % PAL.length];
      if (ch.type === 'bar') {
        const bw = (W - L - R) / n * 0.56;
        s.values.forEach((v, i) => { g += `<rect x="${x(i) - bw / 2}" y="${y(v)}" width="${bw}" height="${y(0) - y(v)}" rx="4" fill="${col}"/><text x="${x(i)}" y="${y(v) - 6}" text-anchor="middle" style="font-weight:700;fill:var(--text)">${nf(v)}</text>`; });
      } else {
        g += `<polyline fill="none" stroke="${col}" stroke-width="2.5" points="${s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}"/>`;
        s.values.forEach((v, i) => { g += `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="${col}"/><text x="${x(i)}" y="${y(v) - 9}" text-anchor="middle" style="font-weight:700;fill:${col}">${nf(v)}</text>`; });
      }
    });
    const leg = ch.series.length > 1 ? `<div class="legend" style="margin-top:6px;gap:14px">${ch.series.map((s, i) => `<span><i style="background:${PAL[i]}"></i> ${esc(s.name)}</span>`).join('')}</div>` : '';
    return `<div class="stim chart"><div class="cap">${esc(ch.title)}</div><svg viewBox="0 0 ${W} ${H}" style="max-width:620px">${g}</svg>${leg}</div>`;
  }
  function niceStep(raw) { const p = Math.pow(10, Math.floor(Math.log10(raw || 1))); const f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; }

  function qBody(q) {
    let h = '';
    if (q.tb) h += renderTable(q.tb);
    if (q.ch) h += renderChart(q.ch);
    h += `<div class="qtext">${q.q}</div>`;
    return h;
  }
  function passageHTML(q) { if (q.px === undefined) return ''; const p = BANK.passages[q.px]; return `<div class="passage"><h4>${esc(p.title)}</h4>${p.text}</div>`; }

  // ---------- Runner ujian ----------
  let timer = null;
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function renderExam() {
    const s = S.active; if (!s) { location.hash = '#/'; return; }
    document.body.style.overflow = 'hidden';
    const root = $('#exam-root'); root.innerHTML = '';
    const ex = document.createElement('div'); ex.className = 'exam'; root.appendChild(ex);
    const draw = () => {
      const sec = s.secs[s.si]; const id = sec.qids[s.qi];
      const q = s.sjt ? SJTMAP.get(id) : QMAP.get(id);
      const perm = s.perm[id]; const chosen = s.ans[id];
      const showFb = s.learn && chosen !== undefined && !s.sjt;
      const remaining = sec.limit ? sec.limit - s.used[s.si] : null;
      const tabs = s.secs.length > 1 ? `<div class="sec-tabs">${s.secs.map((x, i) => `<div class="sec-tab ${i === s.si ? 'on' : ''} ${s.locked[i] ? 'done' : ''}">${i + 1}. ${esc(x.name)} · ${x.qids.length} soal${x.limit ? ' · ' + x.limit / 60 + ' menit' : ''}</div>`).join('')}</div>` : '';
      const opts = perm.map((oi, k) => {
        let cls = '';
        if (chosen === oi) cls = 'sel';
        if (showFb) { if (oi === q.a) cls = 'right'; else if (chosen === oi) cls = 'wrong'; }
        return `<button class="opt ${cls}" data-oi="${oi}" ${showFb ? 'disabled' : ''}><span class="key">${KEYS[k]}</span><span>${q.o[oi]}</span></button>`;
      }).join('');
      const fb = showFb ? `<div class="explain"><b class="h">${chosen === q.a ? '✓ Benar' : '✗ Kurang tepat — jawaban: ' + KEYS[perm.indexOf(q.a)]}</b>${q.e}</div>` : '';
      const body = s.sjt ? `<div class="qtext">${esc(q.q)}<div class="ask">Apa yang paling mungkin Anda lakukan?</div></div>` : qBody(q);
      const hasP = !s.sjt && q.px !== undefined;
      const answered = sec.qids.filter(x => s.ans[x] !== undefined).length;
      ex.innerHTML = `
        <div class="exam-top">
          <div class="title"><b>${esc(s.title)}</b><span>${esc(sec.name)} · Soal ${s.qi + 1} dari ${sec.qids.length}</span></div>
          <div class="btn-row">
            <div class="timer ${remaining !== null && remaining <= 60 ? 'low' : ''}" id="tmr">${ico('clock')}<span>${remaining !== null ? fclock(remaining) : fclock(s.used[s.si])}</span></div>
            <button class="btn btn-sm" id="b-exit" title="Simpan & keluar">Keluar</button>
          </div>
        </div>
        ${tabs}
        <div class="exam-body">
          <div class="qpanel">
            <div class="qhead"><b>Soal ${s.qi + 1}</b><span class="btn-row">${!s.sjt ? `<span class="badge pri">${esc(tname(q.t))}</span>` : ''}${s.flag[id] ? '<span class="badge warn">Ragu-ragu</span>' : ''}</span></div>
            <div class="qscroll">
              <div class="${hasP ? 'qsplit' : ''}">${hasP ? passageHTML(q) : ''}<div>${body}<div class="opts">${opts}</div>${fb}</div></div>
            </div>
            <div class="qfoot">
              <button class="btn" id="b-prev" ${s.qi === 0 ? 'disabled' : ''}>${ico('left')} Sebelumnya</button>
              <div class="btn-row">
                ${!s.learn ? `<button class="btn ${s.flag[id] ? 'btn-accent' : ''}" id="b-flag">${ico('flag')} Ragu-ragu</button>` : ''}
                ${s.qi < sec.qids.length - 1 ? `<button class="btn btn-primary" id="b-next">Selanjutnya ${ico('right')}</button>` : `<button class="btn btn-accent" id="b-end">${s.si < s.secs.length - 1 ? 'Selesaikan Sesi' : 'Selesai'} ${ico('check')}</button>`}
              </div>
            </div>
          </div>
          <aside class="side">
            <div class="card" style="padding:16px">
              <div class="card-head" style="margin-bottom:10px"><h3 style="font-size:14px">Navigasi Soal</h3><span class="badge">${answered}/${sec.qids.length}</span></div>
              <div class="navgrid">${sec.qids.map((x, i) => {
                let c = s.ans[x] !== undefined ? 'ans' : ''; if (s.flag[x]) c = 'flag';
                if (s.learn && !s.sjt && s.ans[x] !== undefined) c = s.ans[x] === QMAP.get(x).a ? 'right' : 'wrong';
                return `<button data-go="${i}" class="${c} ${i === s.qi ? 'cur' : ''}">${i + 1}</button>`; }).join('')}</div>
              <div class="navlegend" style="margin-top:12px"><span style="--c:var(--primary-2)">Dijawab</span><span style="--c:var(--accent)">Ragu-ragu</span><span style="--c:var(--surface)">Belum</span>${s.learn ? '<span style="--c:var(--good)">Benar</span>' : ''}</div>
            </div>
            <div class="card" style="padding:16px;font-size:13px" class="muted">
              <b style="display:block;margin-bottom:6px">Pintasan keyboard</b>
              <span class="kbd">A</span>–<span class="kbd">E</span> pilih jawaban · <span class="kbd">←</span> <span class="kbd">→</span> pindah soal${!s.learn ? ' · <span class="kbd">F</span> ragu-ragu' : ''}
              ${s.lockSections ? '<p style="margin:8px 0 0" class="muted">Seperti tes asli, sesi yang sudah diselesaikan tidak dapat dibuka kembali. Waktu tiap sesi berjalan terpisah.</p>' : ''}
            </div>
          </aside>
        </div>`;
      $$('.opt', ex).forEach(b => b.onclick = () => choose(+b.dataset.oi));
      $$('[data-go]', ex).forEach(b => b.onclick = () => { s.qi = +b.dataset.go; save(); draw(); });
      const on = (sel, fn) => { const el = $(sel, ex); if (el) el.onclick = fn; };
      on('#b-prev', () => { if (s.qi > 0) { s.qi--; save(); draw(); } });
      on('#b-next', () => { s.qi++; save(); draw(); });
      on('#b-flag', () => { s.flag[id] = !s.flag[id]; save(); draw(); });
      on('#b-end', () => endSection(false));
      on('#b-exit', async () => {
        const v = await modal('Keluar dari sesi?', 'Progres disimpan di perangkat ini. Anda bisa melanjutkan dari Dashboard. Timer akan berhenti selama Anda keluar.', [{ label: 'Lanjut mengerjakan', value: 0 }, { label: 'Akhiri & lihat hasil', value: 2, cls: 'btn-danger' }, { label: 'Simpan & keluar', value: 1, cls: 'btn-primary' }]);
        if (v === 1) { stopTimer(); location.hash = '#/'; } else if (v === 2) finishSession(s);
      });
      const qs = $('.qscroll', ex); if (qs) qs.scrollTop = 0;
    };
    const choose = oi => {
      const sec = s.secs[s.si]; const id = sec.qids[s.qi];
      if (s.learn && s.ans[id] !== undefined && !s.sjt) return;
      s.ans[id] = s.ans[id] === oi && !s.learn ? undefined : oi;
      if (s.ans[id] === undefined) delete s.ans[id];
      save(); draw();
      if (!s.learn && s.ans[id] !== undefined && s.qi < sec.qids.length - 1 && S.profile.autoNext) setTimeout(() => { s.qi++; save(); draw(); }, 250);
    };
    const endSection = async (auto) => {
      const sec = s.secs[s.si];
      const empty = sec.qids.filter(x => s.ans[x] === undefined).length;
      const flagged = sec.qids.filter(x => s.flag[x]).length;
      const last = s.si === s.secs.length - 1;
      if (!auto) {
        const v = await modal(last ? 'Selesaikan tes?' : `Selesaikan sesi ${sec.name}?`,
          `${empty ? `<b>${empty} soal belum dijawab.</b> ` : 'Semua soal sudah dijawab. '}${flagged ? `${flagged} soal ditandai ragu-ragu. ` : ''}${!last && s.lockSections ? 'Setelah sesi ini diselesaikan Anda tidak dapat kembali.' : ''}`,
          [{ label: 'Periksa lagi', value: false }, { label: last ? 'Selesai & lihat hasil' : 'Lanjut ke sesi berikutnya', value: true, cls: 'btn-primary' }]);
        if (!v) return;
      } else toast(`Waktu ${sec.name} habis.`);
      s.locked[s.si] = true;
      if (last) return finishSession(s);
      s.si++; s.qi = 0; save(); draw();
    };
    draw();
    stopTimer();
    let tick = 0;
    timer = setInterval(() => {
      if (!S.active || S.active.id !== s.id) return stopTimer();
      if (document.hidden && !s.secs[s.si].limit) return;
      const sec = s.secs[s.si]; const id = sec.qids[s.qi];
      s.used[s.si]++; s.t[id] = (s.t[id] || 0) + 1;
      const el = $('#tmr span'); const rem = sec.limit ? sec.limit - s.used[s.si] : null;
      if (el) el.textContent = rem !== null ? fclock(rem) : fclock(s.used[s.si]);
      if (rem !== null && rem <= 60) $('#tmr') && $('#tmr').classList.add('low');
      if (++tick % 5 === 0) save();
      if (rem !== null && rem <= 0) endSection(true);
    }, 1000);
    document.onkeydown = e => {
      if (!S.active || location.hash !== '#/ujian' || $('.modal-bg')) return;
      if (e.target.matches('input,textarea,select')) return;
      const k = e.key.toUpperCase(); const sec = s.secs[s.si]; const id = sec.qids[s.qi]; const perm = s.perm[id];
      const idx = KEYS.indexOf(k) >= 0 ? KEYS.indexOf(k) : '12345'.indexOf(k);
      if (idx >= 0 && idx < perm.length) { choose(perm[idx]); e.preventDefault(); }
      else if (e.key === 'ArrowRight' && s.qi < sec.qids.length - 1) { s.qi++; draw(); }
      else if (e.key === 'ArrowLeft' && s.qi > 0) { s.qi--; draw(); }
      else if (k === 'F' && !s.learn) { s.flag[id] = !s.flag[id]; save(); draw(); }
    };
  }

  // ---------- Grafik dashboard ----------
  function activityChart() {
    const days = 30; const W = 640, H = 200, L = 30, R = 46, T = 14, B = 26;
    const data = []; for (let i = days - 1; i >= 0; i--) { const d = addDays(new Date(), -i); const r = daily(dkey(d)); data.push({ d, n: r.n, acc: r.n ? r.c / r.n * 100 : null }); }
    const max = Math.max(S.profile.target || 10, ...data.map(x => x.n)); const step = niceStep(max / 4); const top = Math.ceil(max / step) * step;
    const bw = (W - L - R) / days; const y = v => T + (H - T - B) * (1 - v / top); const ya = v => T + (H - T - B) * (1 - v / 100);
    let g = '';
    for (let v = 0; v <= top; v += step) g += `<line class="axis" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke-dasharray="${v ? '3 3' : ''}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
    g += `<line x1="${L}" x2="${W - R}" y1="${y(S.profile.target)}" y2="${y(S.profile.target)}" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="6 4"/><text x="${W - R + 4}" y="${y(S.profile.target) + 4}" style="fill:var(--warn);font-weight:700">target</text>`;
    data.forEach((x, i) => {
      const h = y(0) - y(x.n);
      g += `<rect x="${L + i * bw + bw * 0.18}" y="${y(x.n)}" width="${bw * 0.64}" height="${Math.max(0, h)}" rx="3" fill="${x.n >= S.profile.target ? 'var(--primary-2)' : '#8fb0f7'}"><title>${x.d.getDate()} ${BLN[x.d.getMonth()]}: ${x.n} soal${x.acc !== null ? ', akurasi ' + Math.round(x.acc) + '%' : ''}</title></rect>`;
      if (i % 5 === 0 || i === days - 1) g += `<text x="${L + i * bw + bw / 2}" y="${H - 8}" text-anchor="middle">${x.d.getDate()}/${x.d.getMonth() + 1}</text>`;
    });
    const pts = data.map((x, i) => x.acc === null ? null : `${L + i * bw + bw / 2},${ya(x.acc)}`).filter(Boolean);
    if (pts.length > 1) g += `<polyline fill="none" stroke="var(--good)" stroke-width="2" points="${pts.join(' ')}"/>`;
    data.forEach((x, i) => { if (x.acc !== null) g += `<circle cx="${L + i * bw + bw / 2}" cy="${ya(x.acc)}" r="3" fill="var(--good)"/>`; });
    return `<div class="chart"><svg viewBox="0 0 ${W} ${H}">${g}</svg></div><div class="legend" style="gap:14px;margin-top:6px"><span><i style="background:var(--primary-2)"></i> Soal/hari (target tercapai)</span><span><i style="background:#8fb0f7"></i> Di bawah target</span><span><i style="background:var(--good)"></i> Akurasi (%)</span></div>`;
  }
  function heatmap() {
    const weeks = 18; const end = new Date(); const start = addDays(end, -(weeks * 7 - 1) - end.getDay());
    let cells = ''; const tg = Math.max(1, S.profile.target);
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      const r = daily(dkey(d)); const lv = !r.n ? 0 : r.n < tg * 0.34 ? 1 : r.n < tg * 0.67 ? 2 : r.n < tg ? 3 : 4;
      cells += `<i class="l${lv} ${dkey(d) === dkey() ? 'today' : ''}" title="${d.getDate()} ${BLN[d.getMonth()]}: ${r.n} soal"></i>`;
    }
    return `<div class="heat">${cells}</div><div class="legend" style="margin-top:8px">Sedikit <i style="background:var(--surface-2);border:1px solid var(--border)"></i><i style="background:#c9d8fb"></i><i style="background:#8fb0f7"></i><i style="background:#4f7ff0"></i><i style="background:#1d4ed8"></i> Target</div>`;
  }
  function simTrend() {
    const sims = S.sessions.filter(x => x.mode === 'simulasi').slice(0, 10).reverse();
    if (sims.length < 1) return `<div class="empty">${ico('chart')}<div>Belum ada simulasi. Kerjakan simulasi pertama untuk melihat tren skor per subtes.</div></div>`;
    const W = 560, H = 200, L = 34, R = 14, T = 12, B = 26; const n = sims.length;
    const x = i => n === 1 ? (L + W - R) / 2 : L + (W - L - R) * i / (n - 1); const y = v => T + (H - T - B) * (1 - v / 100);
    let g = ''; [0, 25, 50, 75, 100].forEach(v => { g += `<line class="axis" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke-dasharray="${v ? '3 3' : ''}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; });
    Object.keys(SEC).forEach(k => {
      const pts = sims.map((s, i) => { const r = s.secs.find(z => z.key === k); return r ? [x(i), y(pct(r.correct, r.total))] : null; }).filter(Boolean);
      if (pts.length > 1) g += `<polyline fill="none" stroke="${SEC[k].color}" stroke-width="2.5" points="${pts.map(p => p.join(',')).join(' ')}"/>`;
      pts.forEach(p => { g += `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${SEC[k].color}"/>`; });
    });
    sims.forEach((s, i) => { g += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">#${S.sessions.filter(z => z.mode === 'simulasi').length - (n - 1 - i)}</text>`; });
    return `<div class="chart"><svg viewBox="0 0 ${W} ${H}">${g}</svg></div><div class="legend" style="gap:14px;margin-top:6px">${Object.keys(SEC).map(k => `<span><i style="background:${SEC[k].color}"></i> ${SEC[k].short}</span>`).join('')}</div>`;
  }

  // ---------- Halaman ----------
  const pages = {};
  pages.dashboard = () => {
    const t = totals(); const td = daily(); const st = streak(); const ts = typeStats(); const tg = S.profile.target || 50;
    const sims = S.sessions.filter(x => x.mode === 'simulasi'); const best = sims.reduce((a, x) => Math.max(a, x.score), 0);
    const weak = TYPE_ORDER.filter(k => ts[k].n >= 5).sort((a, b) => ts[a].c / ts[a].n - ts[b].c / ts[b].n).slice(0, 3);
    const untouched = TYPE_ORDER.filter(k => ts[k].n === 0);
    let days = '';
    if (S.profile.examDate) { const dd = Math.ceil((fromKey(S.profile.examDate) - fromKey(dkey())) / 864e5); days = dd >= 0 ? `<span class="badge" style="background:rgba(255,255,255,.15);color:#fff;border:none">${ico('clock')} H-${dd} menuju tes</span>` : ''; }
    const h = new Date().getHours(); const greet = h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 19 ? 'Selamat sore' : 'Selamat malam';
    const act = S.active ? `<div class="callout info" style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><span><b>Sesi belum selesai:</b> ${esc(S.active.title)} — ${Object.keys(S.active.ans).length} jawaban tersimpan.</span><span class="btn-row"><button class="btn btn-sm" data-act="discard">Buang</button><a class="btn btn-sm btn-primary" href="#/ujian">Lanjutkan</a></span></div>` : '';
    const rec = untouched.length ? `Anda belum mencoba <b>${tname(untouched[0])}</b>. Coba 10 soal hari ini.` : weak.length ? `Topik terlemah Anda: <b>${tname(weak[0])}</b> (${pct(ts[weak[0]].c, ts[weak[0]].n)}%). Latih 15 soal untuk memperbaikinya.` : 'Mulai dengan simulasi lengkap untuk memetakan kemampuan awal Anda.';
    const recType = untouched[0] || weak[0];
    return `
      ${act}
      <div class="grid g-3" style="margin-bottom:16px">
        <div class="card hero span-2">
          <div style="display:flex;gap:20px;align-items:center;justify-content:space-between;flex-wrap:wrap;position:relative;z-index:1">
            <div style="flex:1;min-width:220px">
              <div class="eyebrow" style="color:#ffd469">${HARI[new Date().getDay()]}, ${new Date().getDate()} ${BLN[new Date().getMonth()]} ${new Date().getFullYear()}</div>
              <h2 style="font-size:1.5rem">${greet}${S.profile.name ? ', ' + esc(S.profile.name) : ''}!</h2>
              <p class="muted" style="margin-bottom:14px">Target harian: <b style="color:#fff">${tg} soal</b>. ${td.n >= tg ? 'Target hari ini tercapai — luar biasa! 🎉' : `Tinggal <b style="color:#fff">${tg - td.n} soal</b> lagi untuk hari ini.`}</p>
              <div class="btn-row"><button class="btn btn-accent" data-act="harian">${ico('bolt')} Latihan Harian</button><a class="btn" style="background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.25)" href="#/simulasi">${ico('exam')} Simulasi Penuh</a>${days}</div>
            </div>
            <div class="ring" style="--p:${Math.min(100, pct(td.n, tg))}"><div><b>${td.n}</b><span>dari ${tg} soal</span></div></div>
          </div>
        </div>
        <div class="card stat">
          <div class="label">${ico('flame')} Streak belajar</div>
          <div class="value" style="color:var(--warn)">${st.cur} hari</div>
          <div class="sub">Terpanjang: ${st.best} hari</div>
          <div class="bar warn" style="margin-top:14px"><i style="width:${Math.min(100, st.cur / 30 * 100)}%"></i></div>
          <div class="sub" style="margin-top:6px">Tantangan 30 hari berturut-turut</div>
        </div>
      </div>
      <div class="grid g-4" style="margin-bottom:16px">
        <div class="card stat"><div class="label">Total soal dikerjakan</div><div class="value">${t.n.toLocaleString('id-ID')}</div><div class="sub">${fdur(t.sec)} waktu belajar</div></div>
        <div class="card stat"><div class="label">Akurasi keseluruhan</div><div class="value">${pct(t.c, t.n)}%</div><div class="sub">${t.c.toLocaleString('id-ID')} jawaban benar</div></div>
        <div class="card stat"><div class="label">Cakupan bank soal</div><div class="value">${pct(t.unique, BANK.total)}%</div><div class="sub">${t.unique.toLocaleString('id-ID')} dari ${BANK.total.toLocaleString('id-ID')} soal unik</div></div>
        <div class="card stat"><div class="label">Simulasi terbaik</div><div class="value">${sims.length ? best + '%' : '–'}</div><div class="sub">${sims.length} simulasi dikerjakan</div></div>
      </div>
      <div class="grid g-3" style="margin-bottom:16px">
        <div class="card span-2"><div class="card-head"><h3>Aktivitas 30 hari terakhir</h3><span class="badge">Hari ini: ${td.n} soal · ${pct(td.c, td.n)}%</span></div>${activityChart()}</div>
        <div class="card"><div class="card-head"><h3>Rekomendasi hari ini</h3></div><p>${rec}</p>${recType ? `<button class="btn btn-primary btn-sm" data-act="rec" data-t="${recType}">Latih sekarang</button>` : `<a class="btn btn-primary btn-sm" href="#/simulasi">Mulai simulasi</a>`}
          <div class="nav-sep" style="margin:16px 0"></div><h3 style="font-size:14px">Konsistensi (18 minggu)</h3>${heatmap()}</div>
      </div>
      <div class="grid g-2">
        <div class="card"><div class="card-head"><h3>Penguasaan per tipe soal</h3><a href="#/latihan" class="btn btn-sm btn-ghost">Latihan topik ${ico('right')}</a></div>
          ${Object.keys(SEC).map(k => `<div class="eyebrow" style="margin-top:10px;color:${SEC[k].color}">${SEC[k].name}</div>` + TYPE_ORDER.filter(t => TYPE_SEC[t] === k).map(t => { const x = ts[t]; const p = pct(x.c, x.n); return `<div class="trow"><span>${tname(t)} <small class="faint">· ${x.seen}/${x.total}</small></span><div class="bar ${!x.n ? '' : p >= 75 ? 'good' : p >= 55 ? 'warn' : 'bad'}"><i style="width:${x.n ? p : 0}%"></i></div><span class="pct">${x.n ? p + '%' : '–'}</span></div>`; }).join('')).join('')}
        </div>
        <div class="grid" style="align-content:start">
          <div class="card"><div class="card-head"><h3>Tren skor simulasi</h3><span class="badge">10 terakhir</span></div>${simTrend()}</div>
          <div class="card"><div class="card-head"><h3>Sesi terakhir</h3><a href="#/riwayat" class="btn btn-sm btn-ghost">Semua ${ico('right')}</a></div>${sessionList(S.sessions.slice(0, 5))}</div>
        </div>
      </div>`;
  };
  function sessionList(list) {
    if (!list.length) return `<div class="empty">${ico('history')}<div>Belum ada sesi latihan.</div></div>`;
    return `<div class="table-wrap"><table class="table"><tbody>${list.map(s => `<tr style="cursor:pointer" data-href="#/hasil/${s.id}"><td><b>${esc(s.title)}</b><br><small>${fdate(s.end)} · ${fdur(s.dur)}</small></td><td class="num"><span class="badge ${s.score >= 75 ? 'good' : s.score >= 55 ? 'warn' : 'bad'}">${s.score}%</span></td></tr>`).join('')}</tbody></table></div>`;
  }

  pages.simulasi = () => `
    <div class="page-head"><div><div class="eyebrow">Mode ujian</div><h1>Simulasi Tes Bakat Skolastik</h1><p>Format, jumlah soal, dan batas waktu mengikuti pelaksanaan TBS LPDP terbaru.</p></div></div>
    <div class="grid g-3" style="margin-bottom:16px">
      ${Object.keys(SEC).map((k, i) => `<div class="card"><div class="eyebrow" style="color:${SEC[k].color}">Sesi ${i + 1}</div><h3>${SEC[k].name}</h3><div class="stat"><div class="value">${SEC[k].n} <small style="font-size:14px;font-weight:600" class="muted">soal</small></div><div class="sub">${SEC[k].min} menit · ±${Math.round(SEC[k].min * 60 / SEC[k].n)} detik/soal</div></div><p class="muted" style="margin:10px 0 0;font-size:13.5px">${BLUEPRINT[k].map(([t, n]) => `${t.split('|').map(tname).join(' / ')} (${n})`).join(', ')}</p></div>`).join('')}
    </div>
    <div class="grid g-2">
      <div class="card"><h3>Aturan simulasi</h3><ul class="prose" style="padding-left:20px;margin:0">
        <li>Total <b>60 soal dalam 80 menit</b>, terbagi dalam 3 sesi dengan timer terpisah.</li>
        <li>Saat waktu sesi habis, jawaban otomatis dikunci dan berlanjut ke sesi berikutnya.</li>
        <li>Sesi yang sudah diselesaikan <b>tidak dapat dibuka kembali</b>.</li>
        <li>Gunakan tanda <b>ragu-ragu</b> untuk menandai soal yang ingin ditinjau.</li>
        <li>Tidak ada pengurangan nilai untuk jawaban salah — jawab semua soal.</li>
        <li>Soal dipilih adaptif: memprioritaskan soal yang belum pernah Anda kerjakan.</li></ul></div>
      <div class="card" style="display:flex;flex-direction:column;justify-content:space-between;gap:16px">
        <div><h3>Siap memulai?</h3><p class="muted">Siapkan kertas coretan dan lingkungan yang tenang. Disarankan mengerjakan simulasi penuh minimal 2 kali seminggu.</p></div>
        <div class="btn-row"><button class="btn btn-primary btn-lg" data-act="sim">${ico('exam')} Mulai Simulasi (80 menit)</button><button class="btn btn-lg" data-act="sjt">${ico('users')} Simulasi SJT (40 soal)</button></div>
      </div>
    </div>`;

  let topikSel = new Set();
  pages.latihan = () => {
    const ts = typeStats();
    return `
    <div class="page-head"><div><div class="eyebrow">Latihan</div><h1>Latihan Harian & per Topik</h1><p>Soal diacak setiap sesi dan memprioritaskan soal baru serta soal yang pernah salah.</p></div></div>
    <div class="grid g-3" style="margin-bottom:16px">
      <div class="card mode" data-act="h20"><div class="ico a">${ico('bolt')}</div><h3>Pemanasan 20 soal</h3><p>Campuran ketiga subtes, ±25 menit. Cocok untuk hari sibuk.</p><div class="meta"><span class="badge">20 soal</span><span class="badge">Timer 80 dtk/soal</span></div></div>
      <div class="card mode" data-act="h40"><div class="ico">${ico('target')}</div><h3>Latihan Harian 40 soal</h3><p>Komposisi proporsional seperti tes asli. Rekomendasi utama setiap hari.</p><div class="meta"><span class="badge pri">Disarankan</span><span class="badge">40 soal</span></div></div>
      <div class="card mode" data-act="h40l"><div class="ico g">${ico('book')}</div><h3>Mode Belajar 40 soal</h3><p>Tanpa timer; pembahasan langsung muncul setelah menjawab.</p><div class="meta"><span class="badge good">Pembahasan instan</span></div></div>
    </div>
    <div class="card">
      <div class="card-head"><h3>Latihan per topik</h3><span class="muted" style="font-size:13px">Pilih satu atau beberapa tipe soal</span></div>
      ${Object.keys(SEC).map(k => `<div style="margin-bottom:14px"><div class="eyebrow" style="color:${SEC[k].color}">${SEC[k].name} · ${BY_SEC[k].length} soal</div><div class="chips">${TYPE_ORDER.filter(t => TYPE_SEC[t] === k).map(t => `<button class="chip ${topikSel.has(t) ? 'on' : ''}" data-chip="${t}">${tname(t)} <small class="faint">${BY_TYPE[t].length}${ts[t].n ? ' · ' + pct(ts[t].c, ts[t].n) + '%' : ''}</small></button>`).join('')}</div></div>`).join('')}
      <div class="grid g-3" style="align-items:end;margin-top:8px">
        <div class="field" style="margin:0"><label for="tp-n">Jumlah soal</label><select id="tp-n">${[10, 15, 20, 30, 50].map(n => `<option ${n === 15 ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
        <div class="field" style="margin:0"><label for="tp-m">Mode</label><select id="tp-m"><option value="learn">Belajar (pembahasan langsung)</option><option value="exam">Ujian (pembahasan di akhir)</option><option value="timed">Ujian + timer 80 dtk/soal</option></select></div>
        <button class="btn btn-primary btn-lg" data-act="topik">${ico('target')} Mulai latihan topik</button>
      </div>
    </div>`;
  };

  pages.ulang = () => {
    const ids = wrongIds(); const by = {}; ids.forEach(id => { const t = QMAP.get(id).t; by[t] = (by[t] || 0) + 1; });
    return `
    <div class="page-head"><div><div class="eyebrow">Perbaikan</div><h1>Bank Soal Salah</h1><p>Soal yang jawaban terakhir Anda salah. Soal hilang dari daftar setelah Anda menjawabnya dengan benar.</p></div>
      <div class="btn-row"><button class="btn" data-act="ulang-exam">Mode ujian</button><button class="btn btn-primary" data-act="ulang-learn" ${ids.length ? '' : 'disabled'}>${ico('redo')} Ulangi ${Math.min(30, ids.length)} soal</button></div></div>
    ${!ids.length ? `<div class="card empty">${ico('check')}<h3>Tidak ada soal salah</h3><p>Kerjakan latihan atau simulasi; soal yang salah akan muncul di sini untuk diulang.</p></div>` : `
    <div class="grid g-3" style="margin-bottom:16px">${Object.keys(by).sort((a, b) => by[b] - by[a]).map(t => `<div class="card stat"><div class="label">${tname(t)}</div><div class="value" style="color:var(--bad)">${by[t]}</div><div class="sub">${SEC[TYPE_SEC[t]].short}</div></div>`).join('')}</div>
    <div class="card"><h3>Daftar soal (maks. 50 terbaru)</h3>${ids.sort((a, b) => S.qs[b].last - S.qs[a].last).slice(0, 50).map(id => reviewItem(QMAP.get(id), -1, null, true)).join('')}</div>`}`;
  };

  pages.riwayat = () => `
    <div class="page-head"><div><div class="eyebrow">Pemantauan</div><h1>Riwayat Latihan</h1><p>${S.sessions.length} sesi tercatat di perangkat ini.</p></div></div>
    <div class="card">${S.sessions.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Sesi</th><th>Tanggal</th><th class="num">Durasi</th><th class="num">Benar</th><th class="num">Skor</th></tr></thead><tbody>${S.sessions.map(s => { const c = s.secs.reduce((a, r) => a + r.correct, 0), n = s.secs.reduce((a, r) => a + r.total, 0); return `<tr style="cursor:pointer" data-href="#/hasil/${s.id}"><td><b>${esc(s.title)}</b></td><td>${fdate(s.end)}</td><td class="num">${fdur(s.dur)}</td><td class="num">${s.sjt ? s.sjt.score + '/' + s.sjt.max : c + '/' + n}</td><td class="num"><span class="badge ${s.score >= 75 ? 'good' : s.score >= 55 ? 'warn' : 'bad'}">${s.score}%</span></td></tr>`; }).join('')}</tbody></table></div>` : `<div class="empty">${ico('history')}<div>Belum ada sesi.</div></div>`}</div>
    ${dailyTable()}`;
  function dailyTable() {
    const keys = Object.keys(S.daily).filter(k => S.daily[k].n).sort().reverse().slice(0, 60);
    if (!keys.length) return '';
    return `<div class="card" style="margin-top:16px"><h3>Log harian</h3><div class="table-wrap"><table class="table"><thead><tr><th>Tanggal</th><th class="num">Soal</th><th class="num">Benar</th><th class="num">Akurasi</th><th class="num">Waktu</th><th>Target</th></tr></thead><tbody>${keys.map(k => { const r = S.daily[k]; const d = fromKey(k); return `<tr><td>${HARI[d.getDay()]}, ${d.getDate()} ${BLN[d.getMonth()]} ${d.getFullYear()}</td><td class="num">${r.n}</td><td class="num">${r.c}</td><td class="num">${pct(r.c, r.n)}%</td><td class="num">${fdur(r.sec || 0)}</td><td>${r.n >= S.profile.target ? '<span class="badge good">Tercapai</span>' : '<span class="badge">—</span>'}</td></tr>`; }).join('')}</tbody></table></div></div>`;
  }

  let hasilFilter = 'all';
  pages.hasil = (id) => {
    const s = S.sessions.find(x => x.id === id); if (!s) return `<div class="card empty">Sesi tidak ditemukan.</div>`;
    const isSJT = s.mode === 'sjt';
    const tot = s.secs.reduce((a, r) => ({ c: a.c + r.correct, w: a.w + r.wrong, e: a.e + r.empty, n: a.n + r.total }), { c: 0, w: 0, e: 0, n: 0 });
    const types = {}; if (!isSJT) s.items.forEach(([qid, ch]) => { const q = QMAP.get(qid); if (!q) return; const x = types[q.t] || (types[q.t] = { n: 0, c: 0 }); x.n++; if (ch === q.a) x.c++; });
    const items = s.items.filter(([qid, ch]) => { if (isSJT) return true; const q = QMAP.get(qid); if (!q) return false; return hasilFilter === 'all' || (hasilFilter === 'wrong' && ch !== -1 && ch !== q.a) || (hasilFilter === 'empty' && ch === -1) || (hasilFilter === 'right' && ch === q.a); });
    const avgT = Math.round(s.dur / Math.max(1, tot.n));
    return `
      <div class="page-head"><div><div class="eyebrow">Hasil · ${fdate(s.end)}</div><h1>${esc(s.title)}</h1><p>Durasi ${fdur(s.dur)} · rata-rata ${avgT} detik per soal</p></div>
        <div class="btn-row"><a class="btn" href="#/riwayat">${ico('history')} Riwayat</a>${s.mode === 'simulasi' ? `<button class="btn btn-primary" data-act="sim">Simulasi lagi</button>` : `<a class="btn btn-primary" href="#/latihan">Latihan lagi</a>`}</div></div>
      <div class="grid g-4" style="margin-bottom:16px">
        ${isSJT ? `<div class="card stat"><div class="label">Skor SJT</div><div class="score-big">${s.sjt.score}<small style="font-size:1rem" class="muted">/${s.sjt.max}</small></div><div class="sub">${s.score}% dari skor maksimum</div></div>
          <div class="card stat"><div class="label">Dijawab</div><div class="value">${s.sjt.answered}/${tot.n}</div></div>
          <div class="card stat span-2"><div class="label">Interpretasi</div><p style="margin:6px 0 0">${s.score >= 85 ? 'Sangat baik — pilihan Anda konsisten mencerminkan integritas, profesionalisme, dan kolaborasi.' : s.score >= 70 ? 'Baik — beberapa pilihan masih bisa lebih proaktif dan solutif.' : 'Perlu latihan — perhatikan pilihan yang menekankan kejujuran, komunikasi, dan penyelesaian masalah.'}</p></div>`
        : `<div class="card stat"><div class="label">Skor</div><div class="score-big" style="color:${s.score >= 75 ? 'var(--good)' : s.score >= 55 ? 'var(--warn)' : 'var(--bad)'}">${s.score}%</div><div class="sub">${tot.c} benar dari ${tot.n} soal</div></div>
          <div class="card stat"><div class="label">${ico('check')} Benar</div><div class="value" style="color:var(--good)">${tot.c}</div></div>
          <div class="card stat"><div class="label">${ico('x')} Salah</div><div class="value" style="color:var(--bad)">${tot.w}</div></div>
          <div class="card stat"><div class="label">Tidak dijawab</div><div class="value">${tot.e}</div></div>`}
      </div>
      ${!isSJT ? `<div class="grid g-2" style="margin-bottom:16px">
        <div class="card"><h3>Per subtes / sesi</h3><div class="table-wrap"><table class="table"><thead><tr><th>Sesi</th><th class="num">Benar</th><th class="num">Salah</th><th class="num">Kosong</th><th class="num">Waktu</th><th class="num">Skor</th></tr></thead><tbody>${s.secs.map(r => `<tr><td>${esc(r.name)}</td><td class="num">${r.correct}</td><td class="num">${r.wrong}</td><td class="num">${r.empty}</td><td class="num">${fdur(r.time)}</td><td class="num"><b>${pct(r.correct, r.total)}%</b></td></tr>`).join('')}</tbody></table></div></div>
        <div class="card"><h3>Per tipe soal</h3>${Object.keys(types).sort((a, b) => types[a].c / types[a].n - types[b].c / types[b].n).map(t => { const p = pct(types[t].c, types[t].n); return `<div class="trow"><span>${tname(t)} <small class="faint">${types[t].c}/${types[t].n}</small></span><div class="bar ${p >= 75 ? 'good' : p >= 55 ? 'warn' : 'bad'}"><i style="width:${p}%"></i></div><span class="pct">${p}%</span></div>`; }).join('')}</div>
      </div>` : ''}
      <div class="card">
        <div class="card-head"><h3>Pembahasan</h3>${!isSJT ? `<div class="chips">${[['all', 'Semua'], ['wrong', 'Salah'], ['empty', 'Kosong'], ['right', 'Benar']].map(([k, l]) => `<button class="chip ${hasilFilter === k ? 'on' : ''}" data-filter="${k}">${l}</button>`).join('')}</div>` : ''}</div>
        ${items.length ? items.map(([qid, ch, t], i) => isSJT ? sjtReview(SJTMAP.get(qid), ch, i) : reviewItem(QMAP.get(qid), ch, t)).join('') : '<div class="empty">Tidak ada soal pada filter ini.</div>'}
      </div>`;
  };
  function reviewItem(q, ch, t, noAns) {
    const st = noAns ? '' : ch === -1 ? '<span class="badge">Tidak dijawab</span>' : ch === q.a ? '<span class="badge good">Benar</span>' : '<span class="badge bad">Salah</span>';
    return `<div class="review-item"><div class="btn-row" style="justify-content:space-between;margin-bottom:10px"><span class="btn-row"><span class="badge pri">${tname(q.t)}</span>${st}</span><small class="faint">${q.id}${t ? ' · ' + t + ' dtk' : ''}</small></div>
      ${q.px !== undefined ? `<details style="margin-bottom:10px"><summary>Tampilkan bacaan: ${esc(BANK.passages[q.px].title)}</summary><div class="passage" style="margin-top:8px">${BANK.passages[q.px].text}</div></details>` : ''}
      ${qBody(q)}<div class="opts">${q.o.map((o, i) => `<div class="opt ${i === q.a ? 'right' : i === ch ? 'wrong' : ''}"><span class="key">${KEYS[i]}</span><span>${o}</span></div>`).join('')}</div>
      <div class="explain"><b class="h">Pembahasan</b>${q.e}</div></div>`;
  }
  function sjtReview(q, ch, i) {
    const best = q.sc.indexOf(5);
    return `<div class="review-item"><div class="btn-row" style="justify-content:space-between;margin-bottom:10px"><span class="badge pri">SJT ${i + 1}</span>${ch === -1 ? '<span class="badge">Tidak dijawab</span>' : `<span class="badge ${q.sc[ch] >= 4 ? 'good' : q.sc[ch] >= 3 ? 'warn' : 'bad'}">Skor ${q.sc[ch]}/5</span>`}</div>
      <div class="qtext">${esc(q.q)}</div><div class="opts">${q.o.map((o, k) => `<div class="opt ${k === best ? 'right' : k === ch ? 'wrong' : ''}"><span class="key">${q.sc[k]}</span><span>${esc(o)}</span></div>`).join('')}</div>
      <div class="explain"><b class="h">Catatan</b>Angka di kiri pilihan adalah bobot skor (5 = respons paling ideal). Respons terbaik menunjukkan integritas, komunikasi terbuka, dan orientasi solusi.</div></div>`;
  }

  pages.analisis = () => {
    const tc = {}; BANK.questions.forEach(q => { tc[q.t] = (tc[q.t] || 0) + 1; });
    return `
    <div class="page-head"><div><div class="eyebrow">Analisis</div><h1>Struktur & Tipe Soal TBS LPDP</h1><p>Ringkasan format tes dan peta bank soal latihan.</p></div></div>
    <div class="grid g-2" style="margin-bottom:16px">
      <div class="card"><h3>Format Seleksi Bakat Skolastik</h3><div class="table-wrap"><table class="table"><thead><tr><th>Subtes</th><th class="num">Soal</th><th class="num">Waktu</th><th class="num">Detik/soal</th></tr></thead><tbody>
        ${Object.keys(SEC).map(k => `<tr><td>${SEC[k].name}</td><td class="num">${SEC[k].n}</td><td class="num">${SEC[k].min} mnt</td><td class="num">±${Math.round(SEC[k].min * 60 / SEC[k].n)}</td></tr>`).join('')}
        <tr><td><b>Total Tes Bakat Skolastik</b></td><td class="num"><b>60</b></td><td class="num"><b>80 mnt</b></td><td class="num">±80</td></tr>
        <tr><td>Tes Kepribadian / SJT</td><td class="num">40</td><td class="num">45 mnt</td><td class="num">±68</td></tr></tbody></table></div>
        <p class="muted" style="margin-top:12px;font-size:13px">Pelaksanaan daring menggunakan aplikasi ujian dengan pengawasan kamera. Angka di atas mengikuti pelaksanaan periode terakhir; selalu cek panduan resmi di laman LPDP untuk periode Anda.</p></div>
      <div class="card"><h3>Distribusi 5.000 soal di aplikasi ini</h3>
        ${Object.keys(SEC).map(k => `<div class="eyebrow" style="margin-top:8px;color:${SEC[k].color}">${SEC[k].name} · ${BY_SEC[k].length} soal</div>` + TYPE_ORDER.filter(t => TYPE_SEC[t] === k).map(t => `<div class="trow"><span>${tname(t)}</span><div class="bar"><i style="width:${tc[t] / 5}%;background:${SEC[k].color}"></i></div><span class="pct">${tc[t]}</span></div>`).join('')).join('')}
        <p class="muted" style="margin-top:10px;font-size:13px">+ ${BANK.sjt.length} skenario SJT berbobot.</p></div>
    </div>
    <div class="card prose">
      <h3 style="margin-top:0">1. Penalaran Verbal (23 soal · 30 menit)</h3>
      <ul><li><b>Analogi</b> — menemukan hubungan pasangan kata (A : B = C : ?), termasuk bentuk "A : ... = C : ..." dan "A : B = ... : ...". Kunci: rumuskan relasi dalam satu kalimat ("penjahit <i>menggunakan</i> jarum"), lalu uji ke setiap opsi; perhatikan urutan pasangan.</li>
      <li><b>Silogisme & logika</b> — modus ponens, modus tollens, silogisme hipotetis, disjungtif, kontraposisi, ingkaran, dan silogisme kategoris (semua/sebagian/tidak ada). Waspadai kekeliruan "menegaskan konsekuen" dan jawaban "belum tentu".</li>
      <li><b>Penalaran analitik</b> — mengurutkan (nilai, usia, tinggi), menempatkan posisi duduk, dan menyusun jadwal dari beberapa syarat. Kunci: buat diagram/garis bilangan cepat di kertas coretan.</li>
      <li><b>Sinonim & antonim</b> — muncul pada beberapa versi TPA; tetap dilatih sebagai pemanasan kosakata.</li></ul>
      <h3>2. Penalaran Kuantitatif (25 soal · 30 menit)</h3>
      <ul><li><b>Deret angka & huruf</b> — pola beda tetap, beda bertingkat, deret berselang (2–3 deret), perkalian, Fibonacci, kuadrat/kubik, huruf maju–mundur.</li>
      <li><b>Aritmetika & aljabar</b> — persen, pecahan, eksponen, SPLDV, identitas (x ± y)², operasi khusus (p ∗ q), fungsi komposisi, akar persamaan kuadrat.</li>
      <li><b>Perbandingan kuantitatif</b> — membandingkan x dan y (x &gt; y, x &lt; y, x = y, tidak dapat ditentukan). Ingat: x² = 16 berarti x = ±4.</li>
      <li><b>Soal cerita</b> — umur, kecepatan (papasan, susul, rata-rata pulang-pergi), kerja bersama, diskon bertingkat, untung–rugi, KPK jadwal, campuran, perbandingan.</li>
      <li><b>Geometri, statistika & peluang</b> — luas/volume, Pythagoras, median/rata-rata, peluang, kombinasi/permutasi.</li></ul>
      <h3>3. Pemecahan Masalah (12 soal · 20 menit)</h3>
      <ul><li><b>Pemahaman wacana</b> — ide pokok, informasi tersurat/tersirat, pernyataan yang TIDAK sesuai, makna kata, sikap penulis.</li>
      <li><b>Tabel & grafik</b> — persentase pertumbuhan, total/rata-rata, kontribusi (%), proyeksi, membandingkan dua seri data.</li>
      <li><b>Diagram lingkaran</b> — jumlah per kategori, sudut juring, selisih, persentase sisa.</li>
      <li><b>Masalah kontekstual</b> — tarif progresif, pemilihan paket termurah, kode PIN, rute terpendek, kurs, produktivitas mesin, jadwal.</li></ul>
      <h3>Strategi waktu</h3>
      <ul><li>Verbal & kuantitatif: ±75 detik/soal; pemecahan masalah: ±100 detik/soal karena perlu membaca data.</li>
      <li>Kerjakan dulu yang cepat (deret, analogi), tandai ragu-ragu yang lama, lalu kembali.</li>
      <li>Untuk tabel/grafik, baca pertanyaan <i>sebelum</i> membaca data agar fokus pada angka yang diperlukan.</li>
      <li>Gunakan estimasi untuk memilih opsi pada soal persentase — sering kali opsi cukup berjauhan.</li></ul>
      <h3>Rencana latihan harian yang disarankan</h3>
      <ul><li><b>Senin–Jumat:</b> Latihan Harian 40 soal + 15 soal topik terlemah (±60 menit).</li>
      <li><b>Sabtu:</b> Simulasi penuh 80 menit + pembahasan menyeluruh.</li>
      <li><b>Minggu:</b> Ulang Bank Soal Salah + simulasi SJT setiap dua pekan.</li></ul>
      <div class="callout" style="margin-top:16px">Soal di aplikasi ini adalah <b>soal latihan orisinal</b> yang disusun meniru format, tipe, dan tingkat kesulitan soal TBS LPDP berdasarkan kumpulan soal latihan TBS 2023 dan informasi publik. Soal ujian asli bersifat rahasia sehingga tidak ada pihak yang dapat menjamin soal "persis sama". Angka pada tabel/grafik/wacana bersifat ilustratif. Informasi passing grade yang beredar di media sosial tidak resmi — rujuk pengumuman LPDP.</div>
    </div>`;
  };

  pages.pengaturan = () => `
    <div class="page-head"><div><div class="eyebrow">Pengaturan</div><h1>Profil & Data</h1><p>Semua data tersimpan lokal di browser perangkat ini (localStorage).</p></div></div>
    <div class="grid g-2">
      <div class="card">
        <h3>Profil & target</h3>
        <div class="field"><label for="p-name">Nama panggilan</label><input type="text" id="p-name" value="${esc(S.profile.name)}" placeholder="mis. Agnes"></div>
        <div class="field"><label for="p-target">Target soal per hari</label><input type="number" id="p-target" min="5" max="500" value="${S.profile.target}"></div>
        <div class="field"><label for="p-date">Tanggal tes (opsional, untuk hitung mundur)</label><input type="date" id="p-date" value="${S.profile.examDate}"></div>
        <div class="field"><label for="p-theme">Tema tampilan</label><select id="p-theme"><option value="auto">Ikuti sistem</option><option value="light">Terang</option><option value="dark">Gelap</option></select></div>
        <label style="display:flex;gap:8px;align-items:center;font-size:14px;margin-bottom:14px"><input type="checkbox" id="p-auto" ${S.profile.autoNext ? 'checked' : ''}> Pindah otomatis ke soal berikutnya setelah menjawab (mode ujian)</label>
        <button class="btn btn-primary" data-act="save-profile">${ico('check')} Simpan</button>
      </div>
      <div class="grid" style="align-content:start">
        <div class="card"><h3>Cadangan data</h3><p class="muted">Ekspor progres secara berkala (misalnya seminggu sekali) agar tidak hilang saat membersihkan browser atau berganti perangkat.</p>
          <div class="btn-row"><button class="btn" data-act="export">${ico('download')} Ekspor JSON</button><label class="btn">${ico('upload')} Impor JSON<input type="file" id="imp" accept="application/json" hidden></label></div></div>
        <div class="card"><h3>Ringkasan penyimpanan</h3><p class="muted" style="margin:0">${S.sessions.length} sesi · ${Object.keys(S.qs).length} soal unik tercatat · ${Object.keys(S.daily).length} hari aktif · dimulai ${fdate(S.created)}</p></div>
        <div class="card"><h3 style="color:var(--bad)">Reset</h3><p class="muted">Menghapus seluruh riwayat dan statistik di perangkat ini.</p><button class="btn btn-danger" data-act="reset">Hapus semua data</button></div>
      </div>
    </div>`;

  // ---------- Router ----------
  const NAV = [['dashboard', 'Dashboard', 'home'], ['simulasi', 'Simulasi Tes', 'exam'], ['latihan', 'Latihan', 'target'], ['ulang', 'Bank Soal Salah', 'redo'], ['riwayat', 'Riwayat', 'history'], ['analisis', 'Analisis Tes', 'book'], ['pengaturan', 'Pengaturan', 'gear']];
  function shell() {
    $('#app').innerHTML = `
      <header class="topbar"><button class="btn btn-sm btn-ghost" id="menu" aria-label="Menu">${ico('menu')}</button><b>TBS Prep LPDP</b><span class="badge warn">${ico('flame')} ${streak().cur}</span></header>
      <aside class="sidebar" id="sb">
        <div class="brand"><div class="brand-mark">TBS</div><div><b>TBS Prep</b><span>Latihan Tes LPDP</span></div></div>
        <nav class="nav">${NAV.map(([k, l, i]) => `<a href="#/${k === 'dashboard' ? '' : k}" data-nav="${k}">${ico(i)}<span>${l}</span></a>`).join('')}</nav>
        <div class="sidebar-foot"><b style="color:var(--text)">${BANK.total.toLocaleString('id-ID')} soal</b> + ${BANK.sjt.length} SJT<br>Data tersimpan di perangkat ini. <a href="#/pengaturan">Cadangkan</a>.</div>
      </aside>
      <main class="main" id="view"></main>`;
    $('#menu').onclick = () => $('#sb').classList.toggle('open');
  }
  function route() {
    const h = location.hash.replace(/^#\/?/, ''); const [p, arg] = h.split('/');
    if (p === 'ujian') { if (S.active) return renderExam(); location.hash = '#/'; return; }
    stopTimer(); document.onkeydown = null; document.body.style.overflow = ''; $('#exam-root').innerHTML = '';
    const page = pages[p] ? p : 'dashboard';
    shell();
    $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === page));
    $('#view').innerHTML = pages[page](arg);
    window.scrollTo(0, 0);
    if (page === 'pengaturan') $('#p-theme').value = S.profile.theme || 'auto';
  }
  function applyTheme() { const t = S.profile.theme; if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme; }

  document.addEventListener('click', async e => {
    const row = e.target.closest('[data-href]'); if (row) { location.hash = row.dataset.href; return; }
    const chip = e.target.closest('[data-chip]'); if (chip) { const t = chip.dataset.chip; topikSel.has(t) ? topikSel.delete(t) : topikSel.add(t); chip.classList.toggle('on'); return; }
    const f = e.target.closest('[data-filter]'); if (f) { hasilFilter = f.dataset.filter; route(); return; }
    const a = e.target.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act;
    const guard = async () => { if (!S.active) return true; const v = await modal('Ada sesi yang belum selesai', `Sesi "${esc(S.active.title)}" masih tersimpan. Memulai sesi baru akan membuangnya.`, [{ label: 'Batal', value: false }, { label: 'Buang & mulai baru', value: true, cls: 'btn-primary' }]); return v; };
    if (act === 'sim') { if (await guard()) startSimulasi(); }
    else if (act === 'sjt') { if (await guard()) startSJT(); }
    else if (act === 'harian' || act === 'h40') { if (await guard()) startHarian(40, false); }
    else if (act === 'h20') { if (await guard()) startHarian(20, false); }
    else if (act === 'h40l') { if (await guard()) startHarian(40, true); }
    else if (act === 'rec') { if (await guard()) startTopik([a.dataset.t], 15, true, false); }
    else if (act === 'topik') { const n = +$('#tp-n').value, m = $('#tp-m').value; if (!topikSel.size) return toast('Pilih minimal satu tipe soal.'); if (await guard()) startTopik([...topikSel], n, m === 'learn', m === 'timed'); }
    else if (act === 'ulang-learn' || act === 'ulang-exam') { if (await guard()) startReview(act === 'ulang-learn'); }
    else if (act === 'discard') { const v = await modal('Buang sesi?', 'Jawaban pada sesi yang belum selesai akan dihapus.', [{ label: 'Batal', value: false }, { label: 'Buang', value: true, cls: 'btn-danger' }]); if (v) { S.active = null; save(); route(); } }
    else if (act === 'save-profile') {
      S.profile.name = $('#p-name').value.trim().slice(0, 40); S.profile.target = Math.max(5, Math.min(500, +$('#p-target').value || 50));
      S.profile.examDate = $('#p-date').value; S.profile.theme = $('#p-theme').value; S.profile.autoNext = $('#p-auto').checked; save(); applyTheme(); toast('Pengaturan disimpan.'); route();
    }
    else if (act === 'export') {
      const blob = new Blob([JSON.stringify(S)], { type: 'application/json' }); const url = URL.createObjectURL(blob);
      const l = document.createElement('a'); l.href = url; l.download = `tbsprep-backup-${dkey()}.json`; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    else if (act === 'reset') { const v = await modal('Hapus semua data?', 'Tindakan ini tidak dapat dibatalkan. Ekspor data terlebih dahulu bila perlu.', [{ label: 'Batal', value: false }, { label: 'Hapus permanen', value: true, cls: 'btn-danger' }]); if (v) { S = blank(); save(); applyTheme(); toast('Data dihapus.'); route(); } }
  });
  document.addEventListener('change', e => {
    if (e.target.id !== 'imp') return; const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = async () => {
      try {
        const d = JSON.parse(r.result); if (!d || !d.daily || !d.qs) throw new Error('format');
        const v = await modal('Impor data?', 'Data impor akan <b>digabung</b> dengan data saat ini (riwayat sesi dan statistik harian digabungkan).', [{ label: 'Batal', value: 0 }, { label: 'Ganti seluruhnya', value: 2, cls: 'btn-danger' }, { label: 'Gabungkan', value: 1, cls: 'btn-primary' }]);
        if (!v) return;
        if (v === 2) S = Object.assign(blank(), d);
        else {
          const ids = new Set(S.sessions.map(x => x.id)); d.sessions.forEach(x => { if (!ids.has(x.id)) S.sessions.push(x); }); S.sessions.sort((a, b) => b.end - a.end);
          for (const k in d.daily) { const a = S.daily[k], b = d.daily[k]; S.daily[k] = !a ? b : (a.n >= b.n ? a : b); }
          for (const k in d.qs) { const a = S.qs[k], b = d.qs[k]; if (!a || (b.last || 0) > (a.last || 0)) S.qs[k] = b; }
        }
        save(); applyTheme(); toast('Data berhasil diimpor.'); route();
      } catch (err) { toast('File tidak valid.'); }
    };
    r.readAsText(file);
  });
  window.addEventListener('hashchange', route);
  applyTheme();
  route();
})();
