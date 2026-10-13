'use strict';
const L = require('./lib');
const { pick, shuffle, sample, ri, fmt, rp, buildOptions, numDistractors, lcm } = L;
const WACANA = require('./data_wacana');

function mk(t, q, correct, ds, e, d = 2, extra = {}, opt = {}) {
  const b = buildOptions(correct, ds, 5, opt);
  if (!b) return null;
  return { t, q, o: b.o, a: b.a, e, d, ...extra, ...(opt.sortNumeric ? { fx: 1 } : {}) };
}
const r1 = x => Math.round(x * 10) / 10;

const PROV = ['Aceh','Sumatera Utara','Sumatera Barat','Riau','Jambi','Sumatera Selatan','Lampung','Jawa Barat','Jawa Tengah','Jawa Timur','Banten','Bali','NTB','NTT','Kalimantan Barat','Kalimantan Timur','Kalimantan Selatan','Sulawesi Selatan','Sulawesi Tengah','Gorontalo','Maluku','Papua'];
const TEMA = [
  { title: 'Produksi Karet', unit: 'ribu ton', ent: PROV, label: 'Provinsi', range: [80, 900], y: ['2023', '2024'] },
  { title: 'Produksi Kopi', unit: 'ribu ton', ent: PROV, label: 'Provinsi', range: [10, 250], y: ['2023', '2024'] },
  { title: 'Produksi Padi', unit: 'ribu ton', ent: PROV, label: 'Provinsi', range: [300, 9000], y: ['2023', '2024'] },
  { title: 'Kunjungan Wisatawan', unit: 'ribu orang', ent: ['Bali','Yogyakarta','Labuan Bajo','Lombok','Danau Toba','Raja Ampat','Bromo','Bandung','Malang','Belitung','Wakatobi'], label: 'Destinasi', range: [50, 900], y: ['2023', '2024'] },
  { title: 'Penerima Beasiswa per Bidang', unit: 'orang', ent: ['Teknik','Kesehatan','Pendidikan','Ekonomi','Hukum','Pertanian','Sains','Sosial Humaniora','Agama','Seni'], label: 'Bidang Studi', range: [120, 1500], y: ['2024', '2025'] },
  { title: 'Penjualan per Cabang', unit: 'juta rupiah', ent: ['Medan','Padang','Palembang','Jakarta','Bandung','Semarang','Surabaya','Denpasar','Makassar','Balikpapan','Manado'], label: 'Cabang', range: [200, 2500], y: ['Semester I', 'Semester II'] },
  { title: 'Lowongan CPNS per Instansi', unit: 'formasi', ent: ['Kementerian Agama','Kejaksaan Agung','Kemenkumham','Kementerian Kesehatan','Kemendikbudristek','Mahkamah Agung','Kemenhub','Kementerian PUPR','Kementerian ATR','BMKG'], label: 'Instansi', range: [300, 6000], y: ['2023', '2024'] },
  { title: 'Ekspor Produk UMKM', unit: 'juta USD', ent: ['Kerajinan','Fesyen','Kuliner','Furnitur','Kosmetik','Perhiasan','Kopi Olahan','Rempah'], label: 'Kategori', range: [20, 600], y: ['2023', '2024'] },
];

function makeTable(n) {
  const T = pick(TEMA);
  const ents = sample(T.ent, n);
  const [lo, hi] = T.range;
  const base = ents.map(() => ri(lo, hi));
  const v2 = base.map(v => Math.max(lo, Math.round(v * (1 + ri(-20, 35) / 100))));
  return { T, ents, v1: base, v2 };
}
function tableHTML(D) {
  return { title: `${D.T.title} (${D.T.unit}) — data ilustrasi`, head: ['No.', D.T.label, D.T.y[0], D.T.y[1]], rows: D.ents.map((e, i) => [String(i + 1), e, fmt(D.v1[i]), fmt(D.v2[i])]) };
}
function uniqueArgmax(arr, gap = 0) {
  const m = Math.max(...arr); const idx = arr.indexOf(m);
  if (arr.filter(x => x >= m - gap).length > 1) return -1;
  return idx;
}

function genTabel() {
  const n = ri(6, 9);
  const D = makeTable(n);
  const tb = tableHTML(D);
  const { ents, v1, v2, T } = D;
  const y1 = T.y[0], y2 = T.y[1];
  const type = ri(0, 9);
  const nameDs = (ans) => shuffle(ents.filter(x => x !== ans));
  switch (type) {
    case 0: { const g = v1.map((v, i) => (v2[i] - v) / v * 100); const k = uniqueArgmax(g, 0.5); if (k < 0) return null;
      return mk('tabel', `Berdasarkan tabel, ${lc(T.label)} yang mengalami persentase kenaikan tertinggi dari ${y1} ke ${y2} adalah ....`, ents[k], nameDs(ents[k]),
        `Hitung (${y2} − ${y1}) / ${y1} × 100% untuk tiap baris. Tertinggi: <b>${ents[k]}</b> (${fmt(r1(g[k]))}%).`, 2, { tb }); }
    case 1: { const g = v1.map((v, i) => v2[i] - v); const k = uniqueArgmax(g); if (k < 0) return null;
      return mk('tabel', `${cap(T.label)} dengan kenaikan absolut (selisih) terbesar dari ${y1} ke ${y2} adalah ....`, ents[k], nameDs(ents[k]),
        `Selisih terbesar: <b>${ents[k]}</b> (+${fmt(g[k])} ${T.unit}).`, 2, { tb }); }
    case 2: { const s = v2.reduce((a, b) => a + b, 0);
      return mk('tabel', `Total ${lc(T.title)} seluruh ${lc(T.label)} pada ${y2} adalah ....`, `${fmt(s)} ${T.unit}`, numDistractors(s, { extra: [v1.reduce((a, b) => a + b, 0)] }).map(x => `${fmt(x)} ${T.unit}`),
        `Jumlahkan kolom ${y2}: <b>${fmt(s)} ${T.unit}</b>.`, 1, { tb }, { sortNumeric: true }); }
    case 3: { const s = v1.reduce((a, b) => a + b, 0); const avg = r1(s / n);
      return mk('tabel', `Rata-rata ${lc(T.title)} per ${lc(T.label)} pada ${y1} adalah .... (dibulatkan satu desimal)`, `${fmt(avg)} ${T.unit}`, numDistractors(avg, { integer: false, extra: [r1(v2.reduce((a, b) => a + b, 0) / n), r1(s / (n - 1))] }).map(x => `${fmt(r1(x))} ${T.unit}`),
        `Jumlah ${y1} = ${fmt(s)}; dibagi ${n} = <b>${fmt(avg)}</b>.`, 2, { tb }, { sortNumeric: true }); }
    case 4: { const s = v2.reduce((a, b) => a + b, 0); const k = ri(0, n - 1); const p = r1(v2[k] / s * 100);
      return mk('tabel', `Persentase kontribusi ${ents[k]} terhadap total pada ${y2} adalah sekitar ....`, `${fmt(p)}%`, numDistractors(p, { integer: false, extra: [r1(v1[k] / v1.reduce((a, b) => a + b, 0) * 100), r1(p * 2)] }).filter(x => x > 0).map(x => `${fmt(r1(x))}%`),
        `${fmt(v2[k])} ÷ ${fmt(s)} × 100% ≈ <b>${fmt(p)}%</b>.`, 2, { tb }, { sortNumeric: true }); }
    case 5: { const c = v1.filter((v, i) => v2[i] < v).length;
      return mk('tabel', `Banyaknya ${lc(T.label)} yang mengalami penurunan dari ${y1} ke ${y2} adalah ....`, `${c}`, [c + 1, c + 2, c - 1, c - 2, c + 3, n - c].filter(x => x >= 0 && x !== c).map(String),
        `Bandingkan tiap baris; yang turun: ${ents.filter((_, i) => v2[i] < v1[i]).join(', ') || 'tidak ada'} → <b>${c}</b>.`, 1, { tb }, { sortNumeric: true }); }
    case 6: { const [i, j] = sample([...Array(n).keys()], 2); const d = Math.abs(v2[i] - v2[j]);
      return mk('tabel', `Selisih ${lc(T.title)} antara ${ents[i]} dan ${ents[j]} pada ${y2} adalah ....`, `${fmt(d)} ${T.unit}`, numDistractors(d, { min: 0, extra: [Math.abs(v1[i] - v1[j])] }).map(x => `${fmt(x)} ${T.unit}`),
        `|${fmt(v2[i])} − ${fmt(v2[j])}| = <b>${fmt(d)}</b>.`, 1, { tb }, { sortNumeric: true }); }
    case 7: { const k = ri(0, n - 1); const g = (v2[k] - v1[k]) / v1[k]; const proj = Math.round(v2[k] * (1 + g));
      return mk('tabel', `Jika ${ents[k]} mengalami persentase pertumbuhan yang sama dari ${y2} ke periode berikutnya seperti dari ${y1} ke ${y2}, nilainya pada periode berikutnya sekitar ....`, `${fmt(proj)} ${T.unit}`,
        numDistractors(proj, { extra: [v2[k] + (v2[k] - v1[k]), Math.round(v2[k] * (1 + 2 * g))] }).map(x => `${fmt(x)} ${T.unit}`),
        `Pertumbuhan = ${fmt(r1(g * 100))}%. ${fmt(v2[k])} × ${fmt(r1(1 + g), 3)} ≈ <b>${fmt(proj)}</b>.`, 3, { tb }, { sortNumeric: true }); }
    case 8: { const avg = v1.map((v, i) => (v + v2[i]) / 2); const target = ri(Math.min(...avg), Math.max(...avg)); const dist = avg.map(a => Math.abs(a - target)); const k = dist.indexOf(Math.min(...dist));
      if (dist.filter(x => x - dist[k] < 5).length > 1) return null;
      return mk('tabel', `${cap(T.label)} yang rata-rata ${lc(T.title)} selama dua periode paling mendekati ${fmt(target)} ${T.unit} adalah ....`, ents[k], nameDs(ents[k]),
        `Rata-rata dua periode ${ents[k]} = ${fmt(avg[k])}, paling dekat ke ${fmt(target)}.`, 2, { tb }); }
    case 9: { const s1 = v1.reduce((a, b) => a + b, 0), s2 = v2.reduce((a, b) => a + b, 0); const p = r1((s2 - s1) / s1 * 100);
      return mk('tabel', `Persentase perubahan total ${lc(T.title)} dari ${y1} ke ${y2} adalah ....`, `${p >= 0 ? 'naik' : 'turun'} ${fmt(Math.abs(p))}%`,
        [...numDistractors(Math.abs(p), { integer: false, min: 0.1 }).slice(0, 4).map(x => `${p >= 0 ? 'naik' : 'turun'} ${fmt(r1(x))}%`), `${p >= 0 ? 'turun' : 'naik'} ${fmt(Math.abs(p))}%`],
        `Total ${y1} = ${fmt(s1)}, total ${y2} = ${fmt(s2)}. Perubahan = ${fmt(s2 - s1)} / ${fmt(s1)} × 100% ≈ <b>${p >= 0 ? 'naik' : 'turun'} ${fmt(Math.abs(p))}%</b>.`, 3, { tb }); }
  }
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const lc = s => s.split(' ').map(w => (/^[A-Z]{2,}|[A-Z].*[A-Z]/.test(w) ? w : w.toLowerCase())).join(' ');

// ---------- GRAFIK ----------
const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const GTEMA = [
  { title: 'Penjualan Toko Daring', unit: 'unit' }, { title: 'Jumlah Penumpang KRL', unit: 'ribu orang' }, { title: 'Produksi Pabrik Garmen', unit: 'ribu potong' },
  { title: 'Pendaftar Beasiswa', unit: 'orang' }, { title: 'Ekspor Kopi', unit: 'ribu ton' }, { title: 'Kunjungan Perpustakaan Digital', unit: 'ribu akses' },
  { title: 'Konsumsi Listrik Kantor', unit: 'MWh' }, { title: 'Pendapatan Koperasi', unit: 'juta rupiah' },
];
function genGrafik() {
  const T = pick(GTEMA);
  const kind = pick(['bar', 'line', 'line2']);
  let labels, series;
  if (kind === 'line2') {
    const yrs = ri(2017, 2019); labels = Array.from({ length: 6 }, (_, i) => String(yrs + i));
    const a = [ri(100, 400)], b = [ri(100, 400)];
    for (let i = 1; i < 6; i++) { a.push(Math.max(20, a[i - 1] + ri(-60, 90))); b.push(Math.max(20, b[i - 1] + ri(-60, 90))); }
    series = [{ name: 'Produk A', values: a }, { name: 'Produk B', values: b }];
  } else {
    const m0 = ri(0, 5); const len = 6; labels = kind === 'bar' && L.rnd() < 0.5 ? Array.from({ length: len }, (_, i) => BULAN[m0 + i]) : Array.from({ length: len }, (_, i) => String(2019 + i));
    const v = [ri(10, 60) * 10]; for (let i = 1; i < len; i++) v.push(Math.max(30, v[i - 1] + ri(-15, 20) * 10));
    series = [{ name: T.title, values: v }];
  }
  const ch = { type: kind === 'bar' ? 'bar' : 'line', title: `${T.title} (${T.unit}) — data ilustrasi`, labels, series, unit: T.unit };
  const v = series[0].values, n = v.length;
  const type = ri(0, kind === 'line2' ? 7 : 5);
  switch (type) {
    case 0: { const inc = v.slice(1).map((x, i) => x - v[i]); const k = uniqueArgmax(inc); if (k < 0) return null; const ans = `${labels[k]} ke ${labels[k + 1]}`;
      const ds = inc.map((_, i) => `${labels[i]} ke ${labels[i + 1]}`).filter(x => x !== ans);
      return mk('grafik', `Berdasarkan grafik ${series[0].name}, kenaikan terbesar terjadi pada periode ....`, ans, ds, `Selisih tiap periode: ${inc.map((d, i) => `${labels[i]}→${labels[i + 1]}: ${d > 0 ? '+' : ''}${d}`).join('; ')}. Terbesar: <b>${ans}</b>.`, 2, { ch }); }
    case 1: { const s = v.reduce((a, b) => a + b, 0); const avg = r1(s / n);
      return mk('grafik', `Rata-rata ${lc(series[0].name)} per periode berdasarkan grafik adalah ....`, `${fmt(avg)} ${T.unit}`, numDistractors(avg, { integer: false, extra: [r1(s / (n - 1)), r1((v[0] + v[n - 1]) / 2)] }).map(x => `${fmt(r1(x))} ${T.unit}`),
        `Jumlah = ${fmt(s)}, dibagi ${n} = <b>${fmt(avg)}</b>.`, 2, { ch }, { sortNumeric: true }); }
    case 2: { const p = r1((v[n - 1] - v[0]) / v[0] * 100);
      return mk('grafik', `Persentase perubahan ${lc(series[0].name)} dari ${labels[0]} ke ${labels[n - 1]} adalah ....`, `${p >= 0 ? 'naik' : 'turun'} ${fmt(Math.abs(p))}%`,
        [...numDistractors(Math.abs(p), { integer: false, min: 0.1 }).slice(0, 4).map(x => `${p >= 0 ? 'naik' : 'turun'} ${fmt(r1(x))}%`), `${p >= 0 ? 'turun' : 'naik'} ${fmt(Math.abs(p))}%`, `${p >= 0 ? 'naik' : 'turun'} ${fmt(r1(Math.abs(v[n - 1] - v[0]) / v[n - 1] * 100))}%`],
        `(${fmt(v[n - 1])} − ${fmt(v[0])}) ÷ ${fmt(v[0])} × 100% ≈ <b>${fmt(Math.abs(p))}%</b>.`, 2, { ch }); }
    case 3: { const th = pick(v.slice().sort((a, b) => a - b).slice(1, -1)); const c = v.filter(x => x > th).length;
      return mk('grafik', `Berapa banyak periode yang nilainya lebih dari ${fmt(th)} ${T.unit}?`, `${c}`, [c - 1, c + 1, c + 2, c - 2, n].filter(x => x >= 0 && x !== c).map(String),
        `Periode dengan nilai > ${fmt(th)}: ${labels.filter((_, i) => v[i] > th).join(', ')} → <b>${c}</b>.`, 1, { ch }, { sortNumeric: true }); }
    case 4: { const dec = v.slice(1).map((x, i) => v[i] - x); const k = uniqueArgmax(dec); if (k < 0 || dec[k] <= 0) return null; const ans = `${labels[k]} ke ${labels[k + 1]}`;
      return mk('grafik', `Penurunan terbesar terjadi pada periode ....`, ans, dec.map((_, i) => `${labels[i]} ke ${labels[i + 1]}`).filter(x => x !== ans), `Penurunan terbesar ${fmt(dec[k])} pada <b>${ans}</b>.`, 2, { ch }); }
    case 5: { const k = ri(1, n - 1); const s = v.slice(0, k + 1).reduce((a, b) => a + b, 0);
      return mk('grafik', `Total ${lc(series[0].name)} dari ${labels[0]} sampai ${labels[k]} adalah ....`, `${fmt(s)} ${T.unit}`, numDistractors(s, { extra: [s - v[k], s + v[k + 1] || s + 10] }).map(x => `${fmt(x)} ${T.unit}`), `Jumlahkan ${k + 1} periode pertama: <b>${fmt(s)}</b>.`, 1, { ch }, { sortNumeric: true }); }
    case 6: { const w = series[1].values; const dif = v.map((x, i) => x - w[i]); const k = uniqueArgmax(dif.map(Math.abs)); if (k < 0) return null;
      return mk('grafik', `Pada tahun berapa selisih penjualan Produk A dan Produk B paling besar?`, labels[k], labels.filter(x => x !== labels[k]), `Selisih |A − B| tiap tahun: ${labels.map((l, i) => `${l}: ${Math.abs(dif[i])}`).join(', ')}. Terbesar: <b>${labels[k]}</b>.`, 2, { ch }); }
    case 7: { const w = series[1].values; const c = v.filter((x, i) => x > w[i]).length;
      return mk('grafik', `Dalam berapa tahun penjualan Produk A lebih tinggi daripada Produk B?`, `${c}`, [0, 1, 2, 3, 4, 5, 6].filter(x => x !== c).map(String), `Tahun ketika A > B: ${labels.filter((_, i) => v[i] > w[i]).join(', ') || '-'} → <b>${c}</b>.`, 1, { ch }, { sortNumeric: true }); }
  }
}

// ---------- DIAGRAM LINGKARAN ----------
function genPie() {
  const cats = sample(['Apel','Jeruk','Pir','Kiwi','Pisang','Mangga','Anggur','Melon'], ri(4, 5));
  let pct; do { pct = cats.map(() => ri(1, 8) * 5); } while (pct.reduce((a, b) => a + b, 0) !== 100);
  const tot = pick([400, 600, 800, 1000, 1200, 2000]);
  const ch = { type: 'pie', title: `Komposisi buah di sebuah toko (total ${fmt(tot)} buah)`, labels: cats, series: [{ name: 'persen', values: pct }], unit: '%' };
  const type = ri(0, 3);
  const cnt = pct.map(p => p * tot / 100);
  switch (type) {
    case 0: { const k = ri(0, cats.length - 1); return mk('diagram', `Banyak buah ${lc(cats[k])} di toko tersebut adalah ....`, fmt(cnt[k]), numDistractors(cnt[k], { min: 1, extra: [pct[k], cnt[k] * 2] }).map(x => fmt(x)), `${pct[k]}% × ${fmt(tot)} = <b>${fmt(cnt[k])}</b> buah.`, 1, { ch }, { sortNumeric: true }); }
    case 1: { const [i, j] = sample([...Array(cats.length).keys()], 2); if (pct[i] === pct[j]) return null; const d = Math.abs(cnt[i] - cnt[j]);
      return mk('diagram', `Selisih banyak buah ${lc(cats[i])} dan ${lc(cats[j])} adalah ....`, fmt(d), numDistractors(d, { min: 1, extra: [Math.abs(pct[i] - pct[j])] }).map(x => fmt(x)), `(${Math.max(pct[i], pct[j])}% − ${Math.min(pct[i], pct[j])}%) × ${fmt(tot)} = <b>${fmt(d)}</b> buah.`, 1, { ch }, { sortNumeric: true }); }
    case 2: { const k = ri(0, cats.length - 1); const deg = pct[k] * 3.6; return mk('diagram', `Besar sudut pusat juring ${lc(cats[k])} pada diagram lingkaran tersebut adalah ....`, `${fmt(deg)}°`, numDistractors(deg, { integer: false, min: 1, extra: [pct[k] * 3, deg * 2] }).map(x => `${fmt(r1(x))}°`), `${pct[k]}% × 360° = <b>${fmt(deg)}°</b>.`, 1, { ch }, { sortNumeric: true }); }
    case 3: { const [i, j] = sample([...Array(cats.length).keys()], 2); const s = cnt[i] + cnt[j]; const p = r1(s / tot * 100);
      return mk('diagram', `Jika ${lc(cats[i])} dan ${lc(cats[j])} terjual habis, berapa persen sisa buah di toko?`, `${fmt(100 - p)}%`, numDistractors(100 - p, { integer: false, min: 1, extra: [p] }).filter(x => x < 100).map(x => `${fmt(r1(x))}%`), `Yang terjual ${pct[i]}% + ${pct[j]}% = ${fmt(p)}%, sisa <b>${fmt(100 - p)}%</b>.`, 1, { ch }, { sortNumeric: true }); }
  }
}

// ---------- MASALAH KONTEKSTUAL ----------
const HARI = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
function genKonteks() {
  const type = ri(0, 6);
  switch (type) {
    case 0: { // parkir progresif
      const a = pick([3000, 4000, 5000]), b = pick([2000, 3000]), mx = pick([0, 25000, 30000]); const h = ri(3, 12) + pick([0, 0.5]);
      const hours = Math.ceil(h); let cost = a + (hours - 1) * b; let note = ''; if (mx && cost > mx) { cost = mx; note = ` (dibatasi tarif maksimum ${rp(mx)})`; }
      const ds = [a + (Math.floor(h) - 1) * b, a * hours, b * hours, a + hours * b, cost + b, cost - b].filter(x => x > 0 && x !== cost).map(x => rp(x));
      return mk('kontekstual', `Tarif parkir mobil di sebuah gedung: ${rp(a)} untuk jam pertama dan ${rp(b)} untuk setiap jam berikutnya (bagian jam dihitung satu jam)${mx ? `, dengan tarif maksimum ${rp(mx)} per hari` : ''}. Jika seseorang parkir selama ${fmt(h)} jam, biaya parkirnya adalah ....`, rp(cost), ds,
        `${fmt(h)} jam dibulatkan menjadi ${hours} jam: ${rp(a)} + ${hours - 1} × ${rp(b)} = ${rp(a + (hours - 1) * b)}${note}. Jawaban <b>${rp(cost)}</b>.`, 2, {}, { sortNumeric: true }); }
    case 1: { // paket internet
      const plans = [['Hemat', ri(4, 8) * 10000, ri(5, 15), ri(3, 6) * 1000], ['Reguler', ri(9, 14) * 10000, ri(20, 35), ri(2, 4) * 1000], ['Premium', ri(15, 20) * 10000, ri(50, 70), 1000]];
      const u = ri(10, 60); const cost = plans.map(([, f, q, x]) => f + Math.max(0, u - q) * x); const mn = Math.min(...cost); if (cost.filter(c => c === mn).length > 1) return null; const k = cost.indexOf(mn);
      const tb = { title: 'Pilihan paket internet bulanan', head: ['Paket', 'Biaya Bulanan', 'Kuota', 'Biaya Kelebihan per GB'], rows: plans.map(([n, f, q, x]) => [n, rp(f), q + ' GB', rp(x)]) };
      return mk('kontekstual', `Seorang mahasiswa memperkirakan memakai ${u} GB data per bulan. Paket termurah untuknya dan biayanya adalah ....`, `${plans[k][0]}, ${rp(mn)}`,
        [...plans.map((p, i) => `${p[0]}, ${rp(cost[i])}`).filter((_, i) => i !== k), `${plans[k][0]}, ${rp(plans[k][1])}`, `${plans[(k + 1) % 3][0]}, ${rp(plans[(k + 1) % 3][1])}`, `${plans[k][0]}, ${rp(mn + 10000)}`],
        `Biaya tiap paket untuk ${u} GB: ${plans.map((p, i) => `${p[0]} = ${rp(cost[i])}`).join(', ')}. Termurah: <b>${plans[k][0]}, ${rp(mn)}</b>.`, 3, { tb }); }
    case 2: { // jadwal bertemu hari
      const ps = sample([2, 3, 4, 5, 6, 8, 9], 2); const L2 = lcm(ps[0], ps[1]); const d0 = ri(0, 6); const ans = HARI[(d0 + L2) % 7];
      const ds = HARI.filter(x => x !== ans);
      return mk('kontekstual', `Petugas A piket setiap ${ps[0]} hari sekali dan petugas B setiap ${ps[1]} hari sekali. Mereka piket bersama pada hari ${HARI[d0]}. Mereka akan piket bersama lagi untuk pertama kalinya pada hari ....`, ans, shuffle(ds),
        `KPK(${ps[0]}, ${ps[1]}) = ${L2} hari. ${L2} mod 7 = ${L2 % 7}, sehingga ${HARI[d0]} + ${L2 % 7} hari = <b>${ans}</b>.`, 2); }
    case 3: { // PIN
      for (let tries = 0; tries < 40; tries++) {
        const pin = [ri(1, 9), ri(0, 9), ri(0, 9), ri(0, 9)];
        if (new Set(pin).size < 4) continue;
        const [a, b, c, d] = pin;
        const clues = [
          { t: `Jumlah keempat angka adalah ${a + b + c + d}.`, f: p => p[0] + p[1] + p[2] + p[3] === a + b + c + d },
          { t: `Angka pertama ${a > d ? 'lebih besar' : 'lebih kecil'} daripada angka terakhir.`, f: p => (a > d ? p[0] > p[3] : p[0] < p[3]) },
          { t: `Angka kedua adalah ${b % 2 ? 'ganjil' : 'genap'}.`, f: p => p[1] % 2 === b % 2 },
          { t: `Hasil kali angka pertama dan ketiga adalah ${a * c}.`, f: p => p[0] * p[2] === a * c },
          { t: `Selisih angka kedua dan keempat adalah ${Math.abs(b - d)}.`, f: p => Math.abs(p[1] - p[3]) === Math.abs(b - d) },
          { t: `Angka ketiga ${c > b ? 'lebih besar' : 'lebih kecil'} daripada angka kedua.`, f: p => (c > b ? p[2] > p[1] : p[2] < p[1]) },
          { t: `Angka terakhir adalah ${d}.`, f: p => p[3] === d },
          { t: `Angka pertama adalah bilangan ${[2, 3, 5, 7].includes(a) ? 'prima' : 'bukan prima'}.`, f: p => [2, 3, 5, 7].includes(p[0]) === [2, 3, 5, 7].includes(a) },
        ];
        let all = [];
        for (let x = 1000; x < 10000; x++) { const p = String(x).split('').map(Number); if (new Set(p).size === 4) all.push(p); }
        const chosen = [];
        for (const cl of shuffle(clues)) { const nx = all.filter(cl.f); if (nx.length < all.length) { chosen.push(cl); all = nx; } if (all.length === 1) break; }
        if (all.length !== 1 || chosen.length > 6) continue;
        const ans = pin.join('');
        const ds = [];
        for (let t = 0; t < 20; t++) { const s = pin.slice(); const i = ri(0, 3), j = ri(0, 3); [s[i], s[j]] = [s[j], s[i]]; if (s[0] === 0) continue; ds.push(s.join('')); s[ri(0, 3)] = ri(1, 9); ds.push(s.join('')); }
        return mk('kontekstual', `<p>Sebuah ponsel dikunci dengan PIN 4 digit yang semua angkanya berbeda dan angka pertamanya bukan 0. Petunjuknya:</p><ul class="clues">${chosen.map(c => `<li>${c.t}</li>`).join('')}</ul><div class="ask">PIN yang tepat adalah ....</div>`, ans, shuffle(ds),
          `Uji setiap pilihan terhadap semua petunjuk; hanya <b>${ans}</b> yang memenuhi semuanya.`, 3);
      }
      return null; }
    case 4: { // rute terpendek
      const nodes = ['P', 'Q', 'R', 'S', 'T'];
      const w = {}; const edges = [];
      for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) if (L.rnd() < 0.7 || j === i + 1) { const d = ri(2, 15) * 5; w[i + '-' + j] = d; edges.push([i, j, d]); }
      const dist = [0, Infinity, Infinity, Infinity, Infinity], prev = [];
      const used = new Set();
      for (let k = 0; k < 5; k++) { let u = -1; for (let i = 0; i < 5; i++) if (!used.has(i) && (u < 0 || dist[i] < dist[u])) u = i; used.add(u); for (const [a, b, d] of edges) { const v = a === u ? b : b === u ? a : -1; if (v >= 0 && dist[u] + d < dist[v]) { dist[v] = dist[u] + d; prev[v] = u; } } }
      const best = dist[4]; if (!isFinite(best)) return null;
      // pastikan rute terpendek unik
      const paths = []; const dfs = (u, seen, len) => { if (u === 4) { paths.push(len); return; } for (const [a, b, d] of edges) { const v = a === u ? b : b === u ? a : -1; if (v >= 0 && !seen.has(v)) { seen.add(v); dfs(v, seen, len + d); seen.delete(v); } } };
      dfs(0, new Set([0]), 0); if (paths.filter(p => p === best).length > 1 || paths.length < 3) return null;
      const tb = { title: 'Jarak langsung antarkota (km); tanda – berarti tidak ada jalan langsung', head: ['', ...nodes], rows: nodes.map((n, i) => [n, ...nodes.map((_, j) => i === j ? '0' : (w[Math.min(i, j) + '-' + Math.max(i, j)] ?? '–') + '')]) };
      const ds = [...new Set(paths.filter(p => p !== best))].sort((a, b) => a - b).map(p => `${p} km`);
      for (const x of numDistractors(best, { min: 5 })) ds.push(`${x} km`);
      let route = [4]; while (route[0] !== 0) route.unshift(prev[route[0]]);
      return mk('kontekstual', `Seorang kurir akan berangkat dari kota P menuju kota T. Berdasarkan tabel jarak, panjang rute terpendek yang dapat ditempuh adalah ....`, `${best} km`, ds,
        `Rute terpendek: ${route.map(i => nodes[i]).join(' → ')} = <b>${best} km</b>.`, 3, { tb }, { sortNumeric: true }); }
    case 5: { // kurs
      const usd = ri(150, 165) * 100, rate = pick([[1, 'USD'], [1, 'EUR']]); const kurs = rate[1] === 'USD' ? usd : usd + ri(10, 20) * 100; const amt = ri(4, 30) * 50; const fee = pick([0, 1, 2]);
      const total = amt * kurs * (1 + fee / 100);
      return mk('kontekstual', `Seorang awardee membutuhkan ${fmt(amt)} ${rate[1]} untuk biaya awal di luar negeri. Kurs jual ${rate[1]} adalah ${rp(kurs)}${fee ? ` dan bank mengenakan biaya ${fee}% dari nilai transaksi` : ''}. Jumlah rupiah yang diperlukan adalah ....`, rp(total),
        numDistractors(total, { extra: [amt * kurs, amt * kurs * (1 + 2 * fee / 100) || amt * kurs + 50000] }).map(x => rp(x)), `${fmt(amt)} × ${rp(kurs)} = ${rp(amt * kurs)}${fee ? `; ditambah ${fee}% = ${rp(total)}` : ''}. Jawaban <b>${rp(total)}</b>.`, 2, {}, { sortNumeric: true }); }
    case 6: { // produksi mesin
      const a = ri(3, 9) * 10, b = ri(3, 9) * 10, h1 = ri(2, 6), target = (a + b) * ri(4, 10) + a * h1;
      const rest = target - a * h1; if (rest % (a + b)) return null; const t2 = rest / (a + b); const tot = h1 + t2;
      return mk('kontekstual', `Mesin A memproduksi ${a} unit per jam dan mesin B ${b} unit per jam. Untuk memenuhi pesanan ${fmt(target)} unit, mesin A bekerja sendiri selama ${h1} jam pertama, lalu kedua mesin bekerja bersama. Total waktu yang diperlukan adalah ....`, `${tot} jam`,
        numDistractors(tot, { min: 1, extra: [t2, target / (a + b)] }).filter(Number.isInteger).map(x => `${x} jam`), `${h1} jam pertama: ${a * h1} unit. Sisa ${fmt(rest)} unit ÷ ${a + b} = ${t2} jam. Total <b>${tot} jam</b>.`, 2, {}, { sortNumeric: true }); }
  }
}

function genWacana() {
  const out = [];
  WACANA.forEach((w, wi) => {
    w.qs.forEach((it, qi) => {
      const b = buildOptions(it.o[0], it.o.slice(1));
      out.push({ t: 'wacana', q: it.q, o: b.o, a: b.a, e: it.e, d: 2, px: wi });
    });
  });
  return out;
}

function collect(fn, target, t) {
  const out = []; const seen = new Set(); let guard = 0;
  while (out.length < target && guard++ < target * 80) {
    let it; try { it = fn(); } catch (e) { it = null; }
    if (!it) continue;
    const key = it.q + JSON.stringify(it.tb || it.ch || '');
    if (seen.has(key)) continue;
    seen.add(key); out.push(it);
  }
  if (out.length < target) console.warn(`[pm] ${t}: hanya ${out.length}/${target}`);
  return out;
}

module.exports = function genPM(c) {
  return [
    ...collect(genTabel, c.tabel, 'tabel'),
    ...collect(genGrafik, c.grafik, 'grafik'),
    ...collect(genPie, c.diagram, 'diagram'),
    ...collect(genKonteks, c.kontekstual, 'kontekstual'),
    ...genWacana(),
  ];
};
module.exports.WACANA = WACANA;
