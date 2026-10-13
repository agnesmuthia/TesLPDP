# TBS Prep LPDP — Simulasi & Latihan Tes Bakat Skolastik

Aplikasi web statis untuk berlatih **Tes Bakat Skolastik (TBS) LPDP**. Isinya 5.000 soal (Penalaran Verbal, Penalaran Kuantitatif, Pemecahan Masalah) ditambah 40 skenario SJT. Aplikasi bisa di-hosting gratis di **GitHub Pages**, tanpa server dan tanpa login.

> Analisis lengkap format & tipe soal: [ANALISIS.md](ANALISIS.md)

## Fitur
- **Simulasi CAT penuh**: 60 soal / 80 menit dalam 3 sesi dengan timer terpisah. Sesi otomatis terkunci saat waktunya habis dan ada penanda *ragu-ragu*, sama seperti tes asli.
- **Latihan harian** (20/40 soal) dan **Mode Belajar** dengan pembahasan yang langsung muncul.
- **Latihan per topik**: 19 tipe soal, bisa memilih satu atau beberapa sekaligus.
- **Pengacakan soal dan opsi** di setiap sesi. Soal dipilih secara adaptif: soal yang belum pernah dikerjakan didahulukan, lalu soal yang pernah salah.
- **Bank soal salah**: soal yang salah diulang sampai dijawab benar.
- **Pemantauan harian**: target soal per hari, *streak*, grafik 30 hari (jumlah soal + akurasi), heatmap 18 minggu, penguasaan per tipe soal, tren skor simulasi, log harian, dan hitung mundur ke tanggal tes.
- **Simulasi SJT** (tes kepribadian) 40 soal / 45 menit dengan skor berbobot.
- Pembahasan untuk setiap soal, tampilan responsif (desktop & ponsel), dan mode gelap.
- Ekspor/impor progres (JSON) untuk cadangan atau pindah perangkat.

## Hosting di GitHub Pages
1. Pastikan file ini ada di repositori GitHub Anda (mis. `TesLPDP`).
2. Buka **Settings → Pages**.
3. Di *Build and deployment*, pilih **Source: Deploy from a branch**. Pilih branch yang berisi file ini (mis. `main`), folder `/ (root)`, lalu **Save**.
4. Tunggu 1–2 menit. Situs akan tersedia di `https://<username>.github.io/TesLPDP/`.

Untuk dibuka secara lokal, cukup klik dua kali `index.html` (tidak perlu server).

## Data progres
Progres disimpan di **localStorage** browser, jadi hanya ada di perangkat dan browser yang Anda pakai. Lakukan **Ekspor JSON** secara rutin dari menu *Pengaturan*. Jika berlatih di dua perangkat, impor file cadangan dengan pilihan *Gabungkan*.

## Membangun ulang bank soal
Bank soal dihasilkan oleh generator Node.js dengan *seed* tetap (hasilnya selalu sama):

```bash
node tools/build.js   # menulis data/bank.js (5.000 soal + SJT)
```

| File | Isi |
|---|---|
| `tools/data_verbal.js` | Kosakata sinonim/antonim, kelompok relasi analogi, proposisi silogisme |
| `tools/gen_verbal.js` | Generator sinonim, antonim, analogi, silogisme, penalaran analitik (diverifikasi *brute force*) |
| `tools/gen_kuant.js` | Generator deret, aritmetika, aljabar, perbandingan x&y, soal cerita, geometri, statistika |
| `tools/gen_pm.js` | Generator tabel, grafik, diagram lingkaran, masalah kontekstual |
| `tools/data_wacana.js` | 20 wacana × 4 soal pemahaman bacaan |
| `tools/data_sjt.js` | 40 skenario SJT berbobot |

## Catatan
Soal-soal ini adalah **latihan orisinal** yang meniru format, pola, dan tingkat kesulitan TBS LPDP. Soal ujian asli bersifat rahasia. Aplikasi ini tidak berafiliasi dengan LPDP. Selalu rujuk panduan resmi di [lpdp.kemenkeu.go.id](https://lpdp.kemenkeu.go.id).
