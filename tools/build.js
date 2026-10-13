'use strict';
// Membangun bank 5.000 soal TBS LPDP + bank SJT → data/bank.js
// Jalankan: node tools/build.js
const fs = require('fs');
const path = require('path');
const L = require('./lib');
const genVerbal = require('./gen_verbal');
const genKuant = require('./gen_kuant');
const genPM = require('./gen_pm');
const SJT = require('./data_sjt');

L.setSeed(20261013);

const COUNTS = {
  verbal: { sinonim: 300, antonim: 250, analogi: 400, silogisme: 450, analitik: 500 },
  kuantitatif: { deret_angka: 350, deret_huruf: 150, aritmetika: 250, aljabar: 250, perbandingan: 250, cerita: 500, geometri: 150, statistik: 100 },
  pm: { tabel: 380, grafik: 300, diagram: 120, kontekstual: 220 },
};

const sections = [
  ['V', 'verbal', genVerbal(COUNTS.verbal)],
  ['K', 'kuantitatif', genKuant(COUNTS.kuantitatif)],
  ['P', 'pm', genPM(COUNTS.pm)],
];

const questions = [];
const seen = new Set();
for (const [prefix, s, list] of sections) {
  let i = 0;
  for (const q of list) {
    const key = q.q + JSON.stringify(q.tb || q.ch || '') + q.o.join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    if (q.a < 0 || q.a >= q.o.length || new Set(q.o).size !== q.o.length) throw new Error('Soal tidak valid: ' + q.q);
    i++;
    questions.push({ id: prefix + String(i).padStart(4, '0'), s, ...q });
  }
}

const TYPES = {
  sinonim: 'Sinonim', antonim: 'Antonim', analogi: 'Analogi', silogisme: 'Silogisme & Logika', analitik: 'Penalaran Analitik',
  deret_angka: 'Deret Angka', deret_huruf: 'Deret Huruf', aritmetika: 'Aritmetika', aljabar: 'Aljabar', perbandingan: 'Perbandingan Kuantitatif (x & y)',
  cerita: 'Soal Cerita', geometri: 'Geometri', statistik: 'Statistika', peluang: 'Peluang & Kombinatorik',
  tabel: 'Analisis Tabel', grafik: 'Analisis Grafik', diagram: 'Diagram Lingkaran', kontekstual: 'Masalah Kontekstual', wacana: 'Pemahaman Wacana',
};

const bank = {
  version: 1,
  generated: new Date().toISOString().slice(0, 10),
  total: questions.length,
  types: TYPES,
  passages: genPM.WACANA.map(w => ({ title: w.title, text: w.text })),
  questions,
  sjt: SJT.map((s, i) => ({ id: 'S' + String(i + 1).padStart(3, '0'), q: s[0], o: s[1].map(x => x[0]), sc: s[1].map(x => x[1]) })),
};

const count = {};
questions.forEach(q => { count[q.s] = (count[q.s] || 0) + 1; });
console.log('Total soal:', questions.length, count, 'SJT:', bank.sjt.length);
if (questions.length !== 5000) console.warn('PERINGATAN: total bukan 5000');

const out = path.join(__dirname, '..', 'data', 'bank.js');
fs.writeFileSync(out, '/* Bank soal TBS LPDP — dihasilkan oleh tools/build.js. Jangan diedit manual. */\nwindow.TBS_BANK=' + JSON.stringify(bank) + ';\n');
console.log('Ditulis:', out, (fs.statSync(out).size / 1024 / 1024).toFixed(2) + ' MB');
