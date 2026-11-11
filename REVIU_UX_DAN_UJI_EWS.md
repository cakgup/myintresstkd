# Reviu UI UX dan pengujian EWS TKD APBD

Tanggal: 11 November 2026. Konteks: Kanwil DJPb Provinsi Bali dan KPPN Denpasar.

Popup telah disederhanakan menjadi pendamping beranda MyIntress. Data serta identitas pada mockup tetap fiktif. Hasil ini membuktikan konsistensi fungsi dan jalur interaksi yang diuji, bukan efektivitas operasional pada data pemerintah.

## Temuan dan perbaikan

| Temuan | Perbaikan |
|---|---|
| EWS terasa seperti aplikasi terpisah dengan halaman pengantar panjang | Satu popup di atas beranda; logo, warna indigo, font dan kontrol mengikuti MyIntress |
| Pemilih pengguna bertingkat dan uraian peran berulang | Empat tombol pengguna langsung, dengan penanda pengguna aktif |
| Kasus ditampilkan lagi sebagai tabel aksi dan halaman lama | Satu daftar per tampilan; tabel aksi, menu FA/pilot dan handler lama dihapus |
| Tindakan harus melewati dialog rincian | Tombol utama langsung membuka form; rincian menjadi pilihan sekunder |
| Prioritas bergantung tanggal pemeriksaan tersembunyi | Target dibandingkan tanggal WIB saat ini dan terlihat pada kartu |
| Tindakan antar pengguna terlalu serupa | Antrean mengikuti peran, tahap kasus dan penerima permintaan dukungan |
| Impor CSV tidak konsisten dengan templat dan menambah duplikasi | Pemetaan judul kolom, validasi seluruh batch dan pembaruan berdasarkan objek/bank/periode |
| Perubahan sumber menimpa catatan analis | Catatan dipisahkan; perubahan sumber yang telah dipakai meminta peninjauan ulang Kanwil |
| Banner yang ditutup dapat menyembunyikan pekerjaan baru | Banner muncul kembali ketika isi antrean berubah |
| Fokus keyboard tidak kembali ke tombol pembuka | Fokus dipulihkan dan latar tidak interaktif selama popup terbuka |
| Layar 320 px melebar tanpa CDN | Perbaikan ukuran elemen dan batas lebar canvas |
| Rekap yang sudah diterima masih diberi tugas konfirmasi penerimaan | Kasus dummy diubah menjadi telaah metodologi; kasus selesai menampilkan hasil, bukan potensi risiko |

## Hasil pengujian

Runner: tests/ews-e2e.cjs. **91 dari 91 pemeriksaan otomatis lulus**, tanpa error JavaScript aplikasi yang tidak tertangani. Dua pemeriksaan browser tambahan mengonfirmasi narasi metodologi dan hasil kasus selesai.

Pengujian memakai profil Chromium terisolasi dan server lokal. Permintaan HTTPS/CDN diblokir untuk memastikan fungsi popup tidak bergantung pada layanan eksternal.

| Cakupan | Hasil |
|---|---|
| Empat pengguna, satu entri Tematik dan tiga bagian popup | Lulus; tidak ada ID ganda, menu lama atau select pengguna |
| Pencatatan, pemeriksaan, penugasan dan tindakan pertama | Lulus; penugasan tidak mengarang waktu tindakan lapangan |
| Arahan Kepala KPPN, penerusan ke Kanwil dan respons kembali ke pelaksana | Lulus |
| Usulan penutupan, pengembalian, perbaikan dan persetujuan | Lulus; hasil, bukti dan aktor tersimpan |
| Sinyal tidak relevan dan pemeriksaan ulang | Lulus; tidak memerlukan tindakan lapangan fiktif |
| Kepemilikan field PKN/Kanwil, termasuk percobaan perubahan field yang dinonaktifkan | Lulus |
| Kalender tanggal, urutan waktu, timestamp masa depan dan catatan wajib | Lulus |
| Ekspor/impor ulang, kutipan, koma, baris baru dan duplikasi baris | Lulus |
| Batch dengan baris kedua tidak valid | Lulus; baris pertama tidak terlanjur disimpan |
| Duplikasi sumber manual dan kasus dengan variasi kapitalisasi/spasi | Lulus |
| KPI menuju daftar terkait, pencarian PIC, filter dan keadaan kosong | Lulus |
| Persistensi setelah reload, navigasi keyboard, Escape dan pemulihan fokus | Lulus |
| Empat pengguna pada 1440×900, 1366×768, 1024×768, 768×1024, 390×844 dan 320×700 | 24 kombinasi lulus; popup muat tanpa overflow horizontal halaman |

## Efisiensi interaksi

- Pembaruan utama yang diukur memerlukan **dua klik tombol**: membuka form dari kartu, lalu menyimpan. Pengisian catatan dan pergantian akun tidak dimasukkan dalam hitungan.
- Rincian tidak wajib dibuka sebelum tindakan utama. Form persetujuan langsung tetap memperlihatkan hasil serta bukti pengaju.
- Pekerjaan yang menunggu pengguna lain keluar dari antrean tindakan sebelumnya, tetapi tetap dapat dibaca pada riwayat sesuai kewenangan.
- Pada uji tambahan 300 kasus, lima eksekusi handler filter tercatat sekitar **21–165 ms**, median sekitar **44 ms** pada lingkungan pengujian ini. Ini waktu pemrosesan JavaScript/filter, bukan waktu membaca atau waktu paint penuh perangkat.
- Kasus tidak dirender ulang pada panel yang tidak sedang aktif.

## Manfaat dan batas kesimpulan

Alur membantu triase awal: masalah, potensi dampak, target, PIC dan tindakan berikutnya tersedia pada satu kartu. Antrean memisahkan pekerjaan petugas, keputusan pimpinan, dukungan regional dan kualitas sumber RKUD.

Cakupan tetap pada hambatan penyaluran TKD serta kesiapan informasi kas untuk analisis APBD. Tidak ada koneksi live SPAN/SAKTI/PKN/SIKD/bank, pengiriman pesan, atau penilaian otomatis menyeluruh terhadap APBD. Saldo RKUD bukan bukti dana TKD mengendap.

Efektivitas lapangan, akurasi sinyal dan pengurangan waktu respons nyata memerlukan UAT petugas serta data berizin. Pengujian ini menggunakan Chromium; inspeksi visual dilakukan melalui viewport desktop/handphone, bukan perangkat fisik lintas browser.

## Mengulang pengujian

Jalankan **node tests/ews-e2e.cjs**. Chrome/Edge Chromium harus tersedia; gunakan **CHROME_BIN** untuk executable di lokasi lain dan **TKD_AUDIT_DIR** untuk direktori hasil.

Runner menghasilkan hasil-uji.json dan screenshot empat peran, tanpa memakai profil browser pribadi atau mengubah dataset referensi versi 4.
