'use strict';
// Bank kosakata & bahan penalaran verbal (disusun mengikuti pola soal TPA/TBS LPDP).

const SINONIM = `
ADAPTASI=penyesuaian
ABSURD=mustahil
AKURAT=tepat
ACUAN=rujukan
ADIKSI=kecanduan
AGITASI=hasutan
AKSELERASI=percepatan
AKTUAL=terkini
ALOKASI=penjatahan
AMBIGU=bermakna ganda
AMANDEMEN=perubahan
ANEKSASI=pencaplokan
APATIS=acuh tak acuh
APRESIASI=penghargaan
ASUMSI=anggapan
ATENSI=perhatian
BAKU=standar
BAHARI=kelautan
BIAS=prasangka
BIOGRAFI=riwayat hidup
BONAFIDE=tepercaya
CENDEKIA=terpelajar
DEDIKASI=pengabdian
DEFISIT=kekurangan
DEGRADASI=kemunduran
DELEGASI=perutusan
DESKRIPSI=gambaran
DETERIORASI=kemerosotan
DONASI=sumbangan
EFEKTIF=mangkus
EFISIEN=sangkil
EKSPLISIT=tersurat
IMPLISIT=tersirat
ELASTIS=lentur
ELEGAN=anggun
EMPATI=turut merasakan
ENIGMA=teka-teki
EVAKUASI=pengungsian
EVALUASI=penilaian
EKSKAVASI=penggalian
FASIH=lancar
FIKTIF=rekaan
FLUKTUASI=naik turun
FRIKSI=pergesekan
GRATIS=cuma-cuma
HAKIKI=sejati
HEGEMONI=dominasi
HIPOTESIS=dugaan sementara
HIRAU=peduli
IDENTIK=sama
ILUSI=khayalan
IMBAS=dampak
IMIGRAN=pendatang
IMUN=kebal
INDIKASI=tanda
INSENTIF=perangsang
INSOMNIA=sulit tidur
INSTAN=seketika
INTEGRASI=pembauran
INTERPRETASI=tafsiran
INTUISI=bisikan hati
INVESTIGASI=penyelidikan
JEMU=bosan
KAMUFLASE=penyamaran
KAPABEL=mampu
KARSA=kehendak
KENDALA=hambatan
KOALISI=gabungan
KOLABORASI=kerja sama
KOMPATIBEL=cocok
KOMPETEN=cakap
KOMPILASI=himpunan
KONFRONTASI=pertentangan
KONKLUSI=kesimpulan
KONKRET=nyata
KONSENSUS=kesepakatan
KONSISTEN=taat asas
KONTRIBUSI=sumbangsih
KRITERIA=tolok ukur
KUDUS=suci
LAZIM=biasa
LEGAL=menurut hukum
LOYAL=setia
MANDIRI=berdikari
MARGINAL=terpinggirkan
MASIF=besar-besaran
MEDIASI=perantaraan
MIGRASI=perpindahan
MODERAT=tidak ekstrem
NARASI=kisahan
NIHIL=tidak ada
NISBI=relatif
NOMADEN=berpindah-pindah
NORMA=kaidah
NOSTALGIA=kerinduan masa lalu
OPTIMAL=terbaik
OTONOMI=pemerintahan sendiri
OTENTIK=asli
PANDIR=bodoh
PARADIGMA=kerangka berpikir
PARAS=wajah
PARSIAL=sebagian
PARTISIPASI=peran serta
PERSEPSI=tanggapan
POLEMIK=perdebatan
POTENSI=kemampuan terpendam
PRAGMATIS=praktis
PREMIS=dasar pemikiran
PRESTISE=gengsi
PROGNOSIS=ramalan
PROVOKASI=pancingan
RAMAH=bersahabat
RANCU=kacau
REDUKSI=pengurangan
REFORMASI=pembaruan
REKONSILIASI=pemulihan hubungan
RELEVAN=berkaitan
RENTAN=mudah terserang
REPUTASI=nama baik
RESESI=kelesuan ekonomi
RESIPROKAL=timbal balik
RETORIKA=seni berpidato
REVISI=peninjauan kembali
RISAU=gelisah
RUWET=rumit
SAKSAMA=teliti
SANGGAH=bantah
SINKRON=selaras
SPEKULASI=untung-untungan
STAGNAN=mandek
STAMINA=daya tahan
SUBSIDI=bantuan dana
SUBTIL=halus
SUKSESI=pergantian
SUPREMASI=kekuasaan tertinggi
TAKSIRAN=perkiraan
TANGKAS=cekatan
TENDENSI=kecenderungan
TENTATIF=belum pasti
TOLERANSI=tenggang rasa
TRANSPARAN=terbuka
TRADISI=adat kebiasaan
UNIFIKASI=penyatuan
URGEN=mendesak
VAKUM=hampa
VALID=sahih
VERIFIKASI=pembuktian
VISI=wawasan ke depan
VOKAL=lantang
ZENIT=titik puncak
AFEKSI=kasih sayang
AGUNAN=jaminan
AJEK=tetap
ALPA=lalai
BAGAN=skema
BESTARI=berpengetahuan
BUANA=dunia
CEMOOH=ejek
DAKWA=tuduh
DAWAI=senar
DEMAGOG=penghasut
DURJANA=jahat
ENGGAN=segan
FAEDAH=manfaat
GALAT=kekeliruan
GAUNG=gema
GEMPITA=riuh
GENTAR=takut
GIGIH=tekun
HARKAT=derajat
HETEROGEN=beraneka ragam
HOMOGEN=sejenis
IKHLAS=tulus
INSAN=manusia
JENAKA=lucu
KAMPIUN=juara
KARIB=akrab
KIAT=cara
LALIM=zalim
LAYU=lisut
LUGAS=apa adanya
LUWES=supel
MAHIR=piawai
MAKLUMAT=pengumuman
MANUNGGAL=bersatu
NALAR=akal
NIRMALA=bersih
NISTA=hina
PAKAR=ahli
PATRIOT=pencinta tanah air
PENAT=lelah
PRAHARA=badai besar
RANAH=bidang
RASIO=perbandingan
ROTASI=perputaran
SENGKETA=perselisihan
SIASAT=taktik
SPORADIS=sesekali
SUAKA=perlindungan
SUMIR=ringkas
TAKZIM=hormat
TENGGAT=batas waktu
TIRAI=gorden
UJAR=ucapan
UNIK=khas
WEWENANG=otoritas
NUANSA=variasi kecil
KORELASI=hubungan
ESKALASI=peningkatan
PRIORITAS=hal yang didahulukan
SEMU=tampak seperti asli
SUBVERSIF=bersifat merongrong
INOVASI=pembaharuan cara
KOMPENSASI=ganti rugi
KUOTA=jatah
MITRA=rekan
OBSOLET=usang
PREDIKSI=perkiraan ke depan
PROSPEK=peluang
RESILIENSI=daya lenting
SIGNIFIKAN=berarti
SIMULASI=peragaan
SINERGI=perpaduan kekuatan
STIMULUS=rangsangan
VARIABEL=peubah
VOLATIL=mudah berubah
`;

const ANTONIM = `
ABADI=fana
ABSTRAK=konkret
AKTIF=pasif
AMATIR=profesional
ANTIPATI=simpati
ASLI=palsu
DEFISIT=surplus
DINAMIS=statis
EKSPLISIT=implisit
EKSPOR=impor
EKSTERNAL=internal
EKSTROVERT=introvert
ELASTIS=kaku
EMIGRASI=imigrasi
FIKTIF=faktual
FORMAL=informal
HETEROGEN=homogen
HEMAT=boros
INFERIOR=superior
INKLUSIF=eksklusif
JUJUR=culas
KIKIR=dermawan
KOLEKTIF=individual
KONVEKS=konkaf
KREDIT=debit
KUALITATIF=kuantitatif
LAZIM=ganjil
LEGAL=ilegal
LIBERAL=konservatif
MAKRO=mikro
MAKMUR=melarat
MAYOR=minor
MODERN=kuno
NETRAL=memihak
NISBI=mutlak
OPTIMIS=pesimis
ORISINAL=tiruan
PASANG=surut
PERMANEN=temporer
POSITIF=negatif
PROGRESIF=regresif
PROLOG=epilog
PROAKTIF=reaktif
RIGID=fleksibel
SENJA=fajar
SINTESIS=analisis
SKEPTIS=percaya
SUBJEKTIF=objektif
SUBUR=tandus
TENTATIF=definitif
TRANSPARAN=tertutup
URBAN=rural
VERTIKAL=horizontal
ZENIT=nadir
DEDUKTIF=induktif
MONOTON=variatif
AGRESIF=defensif
ABSOLUT=relatif
AKUT=kronis
ARTIFISIAL=alami
BURAM=jernih
CANGGUNG=luwes
DEFLASI=inflasi
DIVERGEN=konvergen
EGOIS=altruis
FUSI=fisi
HULU=hilir
INTEGRASI=disintegrasi
JAMAK=tunggal
KOMPLEKS=sederhana
KONSUMEN=produsen
LANGKA=melimpah
LUGU=licik
MANDIRI=bergantung
MAKSIMUM=minimum
MAYORITAS=minoritas
NOMADEN=menetap
OPOSISI=koalisi
PANDIR=pintar
PARSIAL=menyeluruh
PERIFER=sentral
PRIVAT=publik
PROFAN=sakral
PUNAH=lestari
RADIKAL=moderat
RAMAI=sepi
NYATA=maya
REVOLUSI=evolusi
RIUH=senyap
SEKUNDER=primer
SIMETRIS=asimetris
STABIL=labil
TAKZIM=lancang
TIMPANG=seimbang
TRADISIONAL=kontemporer
UTOPIS=realistis
WAJAR=janggal
AGRARIS=industrial
ANONIM=beridentitas
ARIF=dungu
AWAM=ahli
BAHAGIA=sengsara
BERANI=pengecut
BIADAB=beradab
CERMAT=ceroboh
CURAM=landai
DANGKAL=dalam
DURHAKA=berbakti
ENTENG=berat
FAKIR=kaya
GAIB=kasatmata
GANAS=jinak
GELAP=terang
GIGIH=mudah menyerah
HALUS=kasar
HENING=bising
HINA=mulia
IMUN=rentan
ISTIMEWA=biasa
KEMARAU=penghujan
KOKOH=rapuh
KUSUT=rapi
LESU=bugar
LUGAS=berbelit-belit
MAHAL=murah
MALAS=rajin
MENTAH=matang
MUNDUR=maju
MURNI=campuran
OBJEK=subjek
PASTI=ragu
PUDAR=cerah
RAMPING=tambun
SOMBONG=rendah hati
RUMIT=mudah
SAH=batal
SEGAR=layu
SEMPIT=luas
SIRNA=muncul
SUKAR=gampang
TANGGUH=lemah
TEGANG=santai
TIRANI=demokrasi
TUMPUL=tajam
USANG=baru
SPESIFIK=umum
DOMESTIK=mancanegara
KAWAN=lawan
AKHIR=awal
NAIK=turun
`;

// Kelompok analogi. same:true -> relasi tegas, pengecoh boleh diambil dari pasangan lain di kelompok yang sama.
const ANALOGI = [
  { rel: 'profesi : alat kerja utama', fam: 'alat', same: true, pairs: [['penjahit','jarum'],['petani','cangkul'],['nelayan','jala'],['pelukis','kuas'],['tukang kayu','gergaji'],['dokter','stetoskop'],['fotografer','kamera'],['montir','obeng'],['astronom','teleskop'],['tukang cukur','gunting'],['juru masak','wajan'],['wartawan','pena']] },
  { rel: 'profesi : tempat kerja', same: true, pairs: [['hakim','pengadilan'],['guru','sekolah'],['pilot','kokpit'],['petani','sawah'],['pelayan','restoran'],['apoteker','apotek'],['pustakawan','perpustakaan'],['teller','bank'],['aktor','panggung'],['peneliti','laboratorium'],['montir','bengkel'],['dokter bedah','ruang operasi']] },
  { rel: 'pembuat : hasil karya', fam: 'produk', same: true, pairs: [['penulis','buku'],['pelukis','lukisan'],['komponis','lagu'],['penjahit','pakaian'],['pematung','patung'],['sutradara','film'],['penyair','puisi'],['koki','masakan'],['programmer','perangkat lunak'],['kartunis','karikatur'],['arsitek','rancangan bangunan'],['pandai besi','parang']] },
  { rel: 'bagian : keseluruhan', fam: 'bagian', same: false, pairs: [['halaman','buku'],['kelopak','bunga'],['jari','tangan'],['gerbong','kereta'],['bab','novel'],['bait','puisi'],['provinsi','negara'],['ruangan','gedung'],['sel','jaringan'],['kata','kalimat'],['menit','jam'],['anak tangga','tangga']] },
  { rel: 'hewan : tempat tinggal', same: true, pairs: [['lebah','sarang'],['kuda','istal'],['laba-laba','jaring'],['cacing','tanah'],['beruang','gua'],['kelinci','liang'],['sapi','kandang'],['burung','sarang'],['rayap','kayu lapuk'],['ikan hias','akuarium']] },
  { rel: 'pengatasi : masalah', fam: 'sebab', same: false, pairs: [['lampu','gelap'],['makanan','lapar'],['obat','sakit'],['minuman','haus'],['payung','hujan'],['selimut','dingin'],['kipas','gerah'],['tidur','kantuk'],['istirahat','lelah'],['vaksin','wabah']] },
  { rel: 'sebab : akibat', fam: 'sebab', same: false, pairs: [['hujan deras','banjir'],['api','asap'],['kemarau panjang','kekeringan'],['penggundulan hutan','erosi'],['virus','infeksi'],['latihan','mahir'],['gesekan','panas'],['begadang','mengantuk'],['polusi udara','sesak napas'],['gempa bumi','reruntuhan']] },
  { rel: 'sinonim', same: false, pairs: [['cerdas','pandai'],['indah','elok'],['cepat','lekas'],['sedih','pilu'],['marah','murka'],['kaya','hartawan'],['besar','raya'],['takut','gentar'],['bohong','dusta'],['hening','sunyi']] },
  { rel: 'antonim', same: false, pairs: [['tinggi','rendah'],['panas','dingin'],['siang','malam'],['maju','mundur'],['tebal','tipis'],['basah','kering'],['lebar','sempit'],['kuat','lemah'],['awal','akhir'],['ramai','sepi']] },
  { rel: 'bahan baku : produk', fam: 'produk', same: false, pairs: [['kapas','benang'],['benang','kain'],['tanah liat','gerabah'],['kedelai','tahu'],['susu','keju'],['tebu','gula'],['pasir','kaca'],['emas','perhiasan'],['karet','ban'],['kakao','cokelat'],['kelapa sawit','minyak goreng'],['bijih besi','baja']] },
  { rel: 'alat : fungsi', fam: 'fungsi', same: true, pairs: [['gunting','memotong'],['termometer','mengukur suhu'],['barometer','mengukur tekanan udara'],['seismograf','mencatat getaran gempa'],['kompas','menunjukkan arah'],['jaring','menangkap ikan'],['kunci','membuka gembok'],['rem','memperlambat laju'],['pompa','mengisi udara'],['higrometer','mengukur kelembapan'],['anemometer','mengukur kecepatan angin'],['amperemeter','mengukur arus listrik']] },
  { rel: 'negara : mata uang', same: true, pairs: [['Jepang','yen'],['Thailand','baht'],['Vietnam','dong'],['Malaysia','ringgit'],['Filipina','peso'],['India','rupee'],['Korea Selatan','won'],['Inggris','poundsterling'],['Rusia','rubel'],['Tiongkok','yuan'],['Arab Saudi','riyal'],['Swiss','franc'],['Brasil','real'],['Turki','lira']] },
  { rel: 'negara : ibu kota', same: true, pairs: [['Australia','Canberra'],['Kanada','Ottawa'],['Brasil','Brasilia'],['Turki','Ankara'],['Myanmar','Naypyidaw'],['Filipina','Manila'],['Thailand','Bangkok'],['Vietnam','Hanoi'],['Jerman','Berlin'],['Mesir','Kairo'],['India','New Delhi'],['Korea Selatan','Seoul'],['Swiss','Bern'],['Selandia Baru','Wellington']] },
  { rel: 'alat musik : cara memainkan', same: true, pairs: [['gitar','dipetik'],['drum','dipukul'],['seruling','ditiup'],['biola','digesek'],['piano','ditekan'],['angklung','digoyangkan'],['terompet','ditiup'],['kecapi','dipetik'],['rebab','digesek'],['kendang','ditabuh']] },
  { rel: 'satuan : besaran', same: true, pairs: [['meter','panjang'],['kilogram','massa'],['detik','waktu'],['ampere','kuat arus'],['kelvin','suhu'],['joule','energi'],['watt','daya'],['newton','gaya'],['pascal','tekanan'],['hertz','frekuensi'],['volt','tegangan listrik'],['mol','jumlah zat']] },
  { rel: 'ilmu : objek kajian', same: true, pairs: [['astronomi','benda langit'],['botani','tumbuhan'],['zoologi','hewan'],['petrologi','batuan'],['entomologi','serangga'],['ornitologi','burung'],['neurologi','saraf'],['kardiologi','jantung'],['dermatologi','kulit'],['hidrologi','air'],['seismologi','gempa'],['filologi','naskah kuno'],['etimologi','asal-usul kata'],['patologi','penyakit']] },
  { rel: 'penemu : penemuan', same: true, pairs: [['Thomas Edison','lampu pijar'],['Alexander Graham Bell','telepon'],['Wright bersaudara','pesawat terbang'],['Guglielmo Marconi','radio'],['James Watt','mesin uap'],['Alfred Nobel','dinamit'],['Johannes Gutenberg','mesin cetak'],['Alexander Fleming','penisilin'],['Karl Benz','mobil bermesin bensin'],['Tim Berners-Lee','World Wide Web']] },
  { rel: 'kendaraan : pengemudi', same: true, pairs: [['pesawat','pilot'],['kereta api','masinis'],['kapal','nakhoda'],['bus','sopir'],['delman','kusir'],['roket berawak','astronaut']] },
  { rel: 'kendaraan : sumber tenaga', same: true, pairs: [['pesawat jet','avtur'],['sepeda motor','bensin'],['delman','kuda'],['perahu layar','angin'],['mobil listrik','baterai'],['sepeda','kayuhan kaki'],['kapal uap','uap air'],['pedati','sapi']] },
  { rel: 'benda : rasa', same: true, pairs: [['gula','manis'],['garam','asin'],['cuka','asam'],['empedu','pahit'],['cabai','pedas']] },
  { rel: 'hewan : golongan', same: true, pairs: [['paus','mamalia'],['ular','reptil'],['katak','amfibi'],['elang','aves'],['hiu','pisces'],['salamander','amfibi'],['kelelawar','mamalia'],['penyu','reptil'],['lumba-lumba','mamalia'],['kakatua','aves']] },
  { rel: 'organ : fungsi', fam: 'fungsi', same: true, pairs: [['jantung','memompa darah'],['paru-paru','pertukaran gas'],['ginjal','menyaring darah'],['lambung','mencerna makanan'],['mata','melihat'],['telinga','mendengar'],['hidung','mencium bau'],['kulit','meraba'],['lidah','mengecap']] },
  { rel: 'olahraga : perlengkapan', fam: 'alat', same: true, pairs: [['bulu tangkis','kok'],['tenis meja','bet'],['golf','stik'],['panahan','busur'],['anggar','pedang'],['bisbol','pemukul'],['selancar','papan'],['tinju','sarung tinju'],['menembak','pistol'],['biliar','tongkat biliar']] },
  { rel: 'bangunan ikonik : negara', same: true, pairs: [['Menara Eiffel','Prancis'],['Taj Mahal','India'],['Tembok Besar','Tiongkok'],['Colosseum','Italia'],['Patung Liberty','Amerika Serikat'],['Big Ben','Inggris'],['Menara Petronas','Malaysia'],['Angkor Wat','Kamboja'],['Gedung Opera Sydney','Australia'],['Borobudur','Indonesia'],['Machu Picchu','Peru'],['Burj Khalifa','Uni Emirat Arab'],['Piramida Giza','Mesir']] },
  { rel: 'hewan : makanan utama', same: true, pairs: [['panda','bambu'],['koala','daun kayu putih'],['kupu-kupu','nektar'],['sapi','rumput'],['ulat sutra','daun murbei'],['trenggiling','semut'],['harimau','daging'],['tupai','kacang-kacangan']] },
  { rel: 'anggota : kelompok', fam: 'bagian', same: false, pairs: [['prajurit','pasukan'],['pemain','tim'],['pulau','kepulauan'],['bintang','galaksi'],['kapal','armada'],['domba','kawanan'],['nada','melodi'],['senator','senat'],['musisi','orkestra'],['siswa','rombongan belajar']] },
  { rel: 'tingkat : tingkat lebih tinggi', fam: 'bagian', same: false, pairs: [['desa','kecamatan'],['kabupaten','provinsi'],['SMP','SMA'],['sarjana','magister'],['magister','doktor'],['kopral','sersan'],['letnan','kapten'],['lektor','guru besar'],['embrio','janin'],['kuncup','bunga mekar']] },
];

// Rantai proposisi untuk silogisme kondisional: [p, ~p]
const RANTAI = [
  [['harga bahan bakar naik','harga bahan bakar tidak naik'],['biaya distribusi meningkat','biaya distribusi tidak meningkat'],['harga barang di pasar naik','harga barang di pasar tidak naik']],
  [['curah hujan tinggi','curah hujan tidak tinggi'],['debit sungai meningkat','debit sungai tidak meningkat'],['kawasan bantaran tergenang','kawasan bantaran tidak tergenang']],
  [['Rina rajin berlatih soal','Rina tidak rajin berlatih soal'],['Rina menguasai materi tes','Rina tidak menguasai materi tes'],['Rina lolos seleksi','Rina tidak lolos seleksi']],
  [['permintaan ekspor meningkat','permintaan ekspor tidak meningkat'],['produksi pabrik bertambah','produksi pabrik tidak bertambah'],['perusahaan merekrut karyawan baru','perusahaan tidak merekrut karyawan baru']],
  [['suku bunga acuan turun','suku bunga acuan tidak turun'],['bunga kredit menjadi murah','bunga kredit tidak menjadi murah'],['penyaluran kredit meningkat','penyaluran kredit tidak meningkat']],
  [['jalan tol baru dibuka','jalan tol baru tidak dibuka'],['waktu tempuh antarkota berkurang','waktu tempuh antarkota tidak berkurang'],['biaya logistik turun','biaya logistik tidak turun']],
  [['Andi bangun kesiangan','Andi tidak bangun kesiangan'],['Andi terlambat ke kantor','Andi tidak terlambat ke kantor'],['Andi mendapat teguran','Andi tidak mendapat teguran']],
  [['pemerintah menaikkan cukai rokok','pemerintah tidak menaikkan cukai rokok'],['harga rokok naik','harga rokok tidak naik'],['konsumsi rokok menurun','konsumsi rokok tidak menurun']],
  [['vaksinasi berjalan merata','vaksinasi tidak berjalan merata'],['kekebalan kelompok terbentuk','kekebalan kelompok tidak terbentuk'],['penularan penyakit menurun','penularan penyakit tidak menurun']],
  [['tim berlatih secara teratur','tim tidak berlatih secara teratur'],['kekompakan tim meningkat','kekompakan tim tidak meningkat'],['tim memenangi pertandingan','tim tidak memenangi pertandingan']],
  [['sinyal internet stabil','sinyal internet tidak stabil'],['rapat daring berjalan lancar','rapat daring tidak berjalan lancar'],['keputusan dapat diambil tepat waktu','keputusan tidak dapat diambil tepat waktu']],
  [['Dimas memperoleh beasiswa','Dimas tidak memperoleh beasiswa'],['Dimas melanjutkan studi S2','Dimas tidak melanjutkan studi S2'],['Dimas pindah ke luar kota','Dimas tidak pindah ke luar kota']],
  [['musim kemarau berkepanjangan','musim kemarau tidak berkepanjangan'],['pasokan air irigasi berkurang','pasokan air irigasi tidak berkurang'],['hasil panen padi menurun','hasil panen padi tidak menurun']],
  [['penjualan bulan ini melampaui target','penjualan bulan ini tidak melampaui target'],['karyawan menerima bonus','karyawan tidak menerima bonus'],['daya beli karyawan meningkat','daya beli karyawan tidak meningkat']],
  [['listrik padam','listrik tidak padam'],['mesin produksi berhenti','mesin produksi tidak berhenti'],['target harian tidak tercapai','target harian tercapai']],
  [['Sari menabung setiap bulan','Sari tidak menabung setiap bulan'],['dana darurat Sari terkumpul','dana darurat Sari tidak terkumpul'],['Sari tenang menghadapi keadaan mendesak','Sari tidak tenang menghadapi keadaan mendesak']],
  [['pajak impor bahan baku dihapus','pajak impor bahan baku tidak dihapus'],['biaya produksi menurun','biaya produksi tidak menurun'],['harga jual produk lokal lebih bersaing','harga jual produk lokal tidak lebih bersaing']],
  [['kualitas udara memburuk','kualitas udara tidak memburuk'],['kasus ISPA meningkat','kasus ISPA tidak meningkat'],['kunjungan ke puskesmas bertambah','kunjungan ke puskesmas tidak bertambah']],
  [['Budi mengikuti kursus bahasa Inggris','Budi tidak mengikuti kursus bahasa Inggris'],['skor IELTS Budi meningkat','skor IELTS Budi tidak meningkat'],['Budi memenuhi syarat beasiswa','Budi tidak memenuhi syarat beasiswa']],
  [['jumlah wisatawan bertambah','jumlah wisatawan tidak bertambah'],['tingkat hunian hotel naik','tingkat hunian hotel tidak naik'],['pendapatan asli daerah meningkat','pendapatan asli daerah tidak meningkat']],
  [['pupuk bersubsidi tersedia','pupuk bersubsidi tidak tersedia'],['petani memupuk tepat waktu','petani tidak memupuk tepat waktu'],['produktivitas lahan terjaga','produktivitas lahan tidak terjaga']],
  [['laporan diserahkan tepat waktu','laporan tidak diserahkan tepat waktu'],['anggaran segera dicairkan','anggaran tidak segera dicairkan'],['proyek dimulai sesuai jadwal','proyek tidak dimulai sesuai jadwal']],
  [['perusahaan menerapkan kerja jarak jauh','perusahaan tidak menerapkan kerja jarak jauh'],['biaya sewa kantor berkurang','biaya sewa kantor tidak berkurang'],['laba perusahaan meningkat','laba perusahaan tidak meningkat']],
  [['Maya membaca jurnal setiap hari','Maya tidak membaca jurnal setiap hari'],['wawasan riset Maya bertambah','wawasan riset Maya tidak bertambah'],['proposal penelitian Maya semakin tajam','proposal penelitian Maya tidak semakin tajam']],
  [['nilai tukar rupiah melemah','nilai tukar rupiah tidak melemah'],['harga barang impor naik','harga barang impor tidak naik'],['inflasi meningkat','inflasi tidak meningkat']],
  [['hutan mangrove dilestarikan','hutan mangrove tidak dilestarikan'],['abrasi pantai berkurang','abrasi pantai tidak berkurang'],['permukiman pesisir lebih aman','permukiman pesisir tidak lebih aman']],
  [['sekolah menyediakan perpustakaan digital','sekolah tidak menyediakan perpustakaan digital'],['minat baca siswa meningkat','minat baca siswa tidak meningkat'],['kemampuan literasi siswa membaik','kemampuan literasi siswa tidak membaik']],
  [['Pak Hadi lembur','Pak Hadi tidak lembur'],['Pak Hadi pulang larut malam','Pak Hadi tidak pulang larut malam'],['Pak Hadi melewatkan makan malam bersama keluarga','Pak Hadi tidak melewatkan makan malam bersama keluarga']],
  [['transportasi umum terintegrasi','transportasi umum tidak terintegrasi'],['penggunaan kendaraan pribadi berkurang','penggunaan kendaraan pribadi tidak berkurang'],['kemacetan kota berkurang','kemacetan kota tidak berkurang']],
  [['stok beras nasional menipis','stok beras nasional tidak menipis'],['pemerintah mengimpor beras','pemerintah tidak mengimpor beras'],['cadangan devisa terpakai','cadangan devisa tidak terpakai']],
  [['matahari bersinar terik','matahari tidak bersinar terik'],['cucian cepat kering','cucian tidak cepat kering'],['Ibu menyetrika pada sore hari','Ibu tidak menyetrika pada sore hari']],
  [['penerbangan jarak jauh','penerbangan bukan jarak jauh'],['maskapai menyediakan makanan berat','maskapai tidak menyediakan makanan berat'],['penumpang tidak perlu membawa bekal','penumpang perlu membawa bekal']],
  [['Lina lulus tes bakat skolastik','Lina tidak lulus tes bakat skolastik'],['Lina mengikuti tahap wawancara','Lina tidak mengikuti tahap wawancara'],['Lina menyiapkan rencana studi','Lina tidak menyiapkan rencana studi']],
  [['data penelitian lengkap','data penelitian tidak lengkap'],['analisis dapat dilakukan','analisis tidak dapat dilakukan'],['tesis selesai tepat waktu','tesis tidak selesai tepat waktu']],
  [['harga cabai melonjak','harga cabai tidak melonjak'],['pedagang makanan menaikkan harga','pedagang makanan tidak menaikkan harga'],['jumlah pembeli berkurang','jumlah pembeli tidak berkurang']],
  [['pabrik membuang limbah ke sungai','pabrik tidak membuang limbah ke sungai'],['kualitas air sungai menurun','kualitas air sungai tidak menurun'],['populasi ikan berkurang','populasi ikan tidak berkurang']],
  [['Joko berolahraga rutin','Joko tidak berolahraga rutin'],['daya tahan tubuh Joko meningkat','daya tahan tubuh Joko tidak meningkat'],['Joko jarang sakit','Joko sering sakit']],
  [['aplikasi diperbarui','aplikasi tidak diperbarui'],['celah keamanan tertutup','celah keamanan tidak tertutup'],['data pengguna terlindungi','data pengguna tidak terlindungi']],
  [['investasi asing masuk','investasi asing tidak masuk'],['lapangan kerja bertambah','lapangan kerja tidak bertambah'],['angka pengangguran turun','angka pengangguran tidak turun']],
  [['jembatan penghubung selesai dibangun','jembatan penghubung tidak selesai dibangun'],['akses ke desa terbuka','akses ke desa tidak terbuka'],['harga hasil bumi desa membaik','harga hasil bumi desa tidak membaik']],
  [['Nadia menyelesaikan esai hari ini','Nadia tidak menyelesaikan esai hari ini'],['Nadia mengunggah berkas besok','Nadia tidak mengunggah berkas besok'],['pendaftaran Nadia tercatat sebelum tenggat','pendaftaran Nadia tidak tercatat sebelum tenggat']],
  [['gaji pegawai naik','gaji pegawai tidak naik'],['konsumsi rumah tangga meningkat','konsumsi rumah tangga tidak meningkat'],['pertumbuhan ekonomi terdorong','pertumbuhan ekonomi tidak terdorong']],
];

// Silogisme kategoris: A (kelas), B (sifat/kelompok), C (kelas lain), D (sifat lanjutan), X (nama)
const KATEGORI = [
  { A:'atlet nasional', B:'orang yang disiplin', C:'mahasiswa', D:'orang yang menghargai waktu', X:'Rudi' },
  { A:'penerima beasiswa LPDP', B:'lulusan yang berprestasi', C:'dosen muda', D:'calon pemimpin bangsa', X:'Laras' },
  { A:'dokter', B:'lulusan fakultas kedokteran', C:'pejabat dinas kesehatan', D:'orang yang menempuh pendidikan profesi', X:'dr. Hana' },
  { A:'pegawai bank', B:'orang yang teliti', C:'lulusan ekonomi', D:'orang yang jarang membuat kesalahan', X:'Wulan' },
  { A:'peneliti', B:'orang yang gemar membaca', C:'guru', D:'orang yang berwawasan luas', X:'Pak Arif' },
  { A:'pilot', B:'orang yang lulus tes kesehatan', C:'anggota klub dirgantara', D:'orang yang berbadan sehat', X:'Kapten Yoga' },
  { A:'anggota paduan suara', B:'orang yang mampu membaca not balok', C:'siswa kelas XII', D:'orang yang paham teori musik', X:'Citra' },
  { A:'karyawan tetap', B:'peserta program pensiun', C:'karyawan bagian produksi', D:'orang yang memiliki jaminan hari tua', X:'Bu Ratna' },
  { A:'pelari maraton', B:'orang yang memiliki stamina tinggi', C:'anggota komunitas sepeda', D:'orang yang jarang lelah', X:'Bima' },
  { A:'hakim', B:'sarjana hukum', C:'anggota dewan', D:'orang yang memahami peraturan', X:'Ibu Sinta' },
  { A:'penulis buku', B:'orang yang kreatif', C:'jurnalis', D:'orang yang penuh gagasan baru', X:'Fajar' },
  { A:'pegawai negeri sipil', B:'orang yang mengikuti latihan dasar', C:'lulusan perguruan tinggi', D:'orang yang memahami tata kelola birokrasi', X:'Pak Darto' },
  { A:'relawan bencana', B:'orang yang terlatih pertolongan pertama', C:'anggota pramuka', D:'orang yang sigap menolong', X:'Tegar' },
  { A:'mahasiswa pascasarjana', B:'orang yang menulis tesis', C:'pegawai kementerian', D:'orang yang melakukan penelitian', X:'Anisa' },
  { A:'pedagang daring', B:'pengguna internet', C:'ibu rumah tangga', D:'orang yang memiliki gawai', X:'Bu Tini' },
  { A:'perenang profesional', B:'orang yang berlatih setiap hari', C:'pelajar', D:'orang yang konsisten', X:'Galih' },
  { A:'astronaut', B:'orang yang menguasai bahasa asing', C:'insinyur', D:'orang yang mampu berkomunikasi lintas budaya', X:'Reza' },
  { A:'pegawai pajak', B:'orang yang memahami akuntansi', C:'konsultan', D:'orang yang mampu membaca laporan keuangan', X:'Siska' },
  { A:'anggota tim debat', B:'orang yang pandai berargumen', C:'siswa jurusan IPS', D:'orang yang berpikir kritis', X:'Dina' },
  { A:'petani organik', B:'orang yang tidak memakai pestisida kimia', C:'warga desa', D:'orang yang menjaga kesuburan tanah', X:'Pak Slamet' },
  { A:'penyiar radio', B:'orang yang bersuara jernih', C:'penyanyi', D:'orang yang percaya diri', X:'Rara' },
  { A:'teknisi jaringan', B:'pemegang sertifikat keahlian', C:'lulusan SMK', D:'orang yang diakui kompetensinya', X:'Yudi' },
  { A:'pendaki gunung', B:'orang yang menyukai alam', C:'fotografer', D:'orang yang peduli lingkungan', X:'Ilham' },
  { A:'manajer proyek', B:'orang yang mampu memimpin tim', C:'pegawai kontrak', D:'orang yang mampu mengambil keputusan', X:'Bu Nita' },
  { A:'pemain catur', B:'orang yang sabar', C:'pensiunan', D:'orang yang tenang menghadapi masalah', X:'Kakek Darmo' },
  { A:'apoteker', B:'orang yang memahami farmakologi', C:'tenaga kesehatan', D:'orang yang mengerti efek obat', X:'Mira' },
  { A:'auditor', B:'orang yang independen', C:'akuntan', D:'orang yang objektif', X:'Pak Bayu' },
  { A:'penari tradisional', B:'orang yang lentur', C:'model', D:'orang yang mampu bergerak luwes', X:'Ayu' },
  { A:'guru besar', B:'doktor', C:'dosen', D:'orang yang telah menulis disertasi', X:'Prof. Lukman' },
  { A:'nelayan tradisional', B:'orang yang memahami arah angin', C:'warga pesisir', D:'orang yang mampu membaca tanda alam', X:'Pak Udin' },
  { A:'pengusaha rintisan', B:'orang yang berani mengambil risiko', C:'lulusan muda', D:'orang yang tahan banting', X:'Kevin' },
  { A:'penerjemah', B:'orang yang menguasai dua bahasa atau lebih', C:'pemandu wisata', D:'orang yang mudah beradaptasi', X:'Salma' },
];

module.exports = { SINONIM, ANTONIM, ANALOGI, RANTAI, KATEGORI };
