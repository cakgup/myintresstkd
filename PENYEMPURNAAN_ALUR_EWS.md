# Penyempurnaan alur EWS TKD–APBD

Peringatan tetap berada dalam popup MyIntress dengan tiga tab yang sama. Perubahan menekankan pengenalan masalah dan kelanjutan pekerjaan, tanpa menambah menu.

## Perilaku yang berubah

- Kartu menampilkan masalah, lokasi/jenis TKD, dampak spesifik, dan tindakan berikutnya. Fakta serta sumber tersedia lewat bagian yang dapat dibuka.
- Target terlewat dan hari ini didahulukan, diikuti tenggat dekat. Dampak tinggi memengaruhi urutan; pada kelompok urgensi yang sama, dampak lebih tinggi didahulukan. Ini merupakan urutan kerja mockup, bukan ambang risiko resmi.
- Setelah pencatatan, pembaruan kasus, atau perubahan metadata RKUD, hasil tindakan menunjukkan penanggung jawab berikutnya dan informasi yang sedang ditunggu. Tidak ada pengiriman pesan eksternal.
- Arahan terakhir dari Kepala KPPN atau Kanwil muncul pada langkah berikutnya. Arahan perbaikan menggantikan arahan lama, sementara riwayat tetap tersimpan.
- Penutupan kasus dibedakan dari penyaluran TKD dan belanja APBD. Sumber kasus saat ini belum menyediakan status transaksi dan laporan realisasi belanja yang terstruktur; konteks APBD menampilkan keadaan tersebut secara eksplisit, tanpa mengasumsikan sudah/belum disalurkan atau belanja bernilai nol.
- Hasil tindakan tidak menyatakan tersimpan jika penyimpanan browser gagal. Pengguna diberi keterangan bahwa perubahan hanya tersedia dalam sesi saat ini.
- Hasil tindakan dapat ditutup, hilang saat berganti pengguna/menutup popup, dan dibersihkan ketika data diperbarui dari tab lain.

## Pemeriksaan otomatis

Jalankan `node tests/ews-e2e.cjs`. Laporan mencakup empat peran, alih tanggung jawab, arahan terbaru, pemisahan status fiskal, kegagalan penyimpanan, persetujuan/penolakan, metadata RKUD, CSV, keyboard, deduplikasi, dan tampilan 320–1440 px. Jalur pembaruan utama tetap dua klik tombol: buka tindakan dan simpan.

## Uji dengan perwakilan pengguna

### Hasil uji ulang fungsi

- 140 dari 140 pemeriksaan otomatis lulus; tidak ada exception aplikasi yang tertangkap selama pengujian. Termasuk pemeriksaan bahwa judul aksesibilitas beranda tetap tersembunyi ketika stylesheet CDN tidak tersedia.
- Empat peran diuji pada enam ukuran viewport (320–1440 px). Form tindakan masing-masing peran juga diperiksa pada 320, 390, dan 1366 px, termasuk keterjangkauan tombol simpan.
- Pembaruan utama tetap dua klik tombol, di luar pengisian formulir. Filter pada 300 kasus tambahan tetap menghasilkan daftar yang benar.
- Celah yang diperbaiki: petunjuk pada kasus baca saja kini menyebut peran yang bertanggung jawab; petunjuk Kepala KPPN sesuai tindakan penugasan; hasil tindakan lama dibersihkan setelah impor berhasil; ekspor register membawa dampak dan arahan terbaru.
- Pemeriksaan screenshot mencakup kartu mobile dan hasil penyimpanan. Pengujian berjalan dengan profil Chrome terisolasi dan permintaan HTTPS/CDN diblokir.

Penilaian: alur sudah konsisten untuk mockup dan demonstrasi. Hasil ini belum membuktikan kemudahan penggunaan oleh petugas sungguhan atau kesiapan operasi dengan data nyata.

Pengujian otomatis dan pemeriksaan screenshot belum menggantikan pengamatan pengguna sungguhan. Berikut tugas untuk sesi berikutnya; waktu adalah target evaluasi desain, bukan SLA operasional.

| Peserta | Tugas tanpa panduan | Kriteria keberhasilan |
|---|---|---|
| Petugas KPPN | Temukan masalah yang paling mendesak; jelaskan lokasi, dampak, dan tindakan berikutnya; konfirmasi fakta | Dapat menjelaskan masalah dalam 30 detik dan mengenali bahwa penetapan PIC menunggu Kepala KPPN |
| Kepala KPPN | Tetapkan PIC/target lalu periksa usulan penutupan | Menugaskan dengan benar; tidak menganggap usulan petugas sebagai persetujuan akhir |
| Analis Kanwil | Tanggapi permintaan dukungan dan periksa kesiapan RKUD | Memahami pekerjaan kembali kepada KPPN; membedakan data yang siap telaah dan yang belum lengkap |
| Pengampu PKN | Perbaiki cakupan/validasi/izin sumber | Mengetahui bahwa penerimaan dan penggunaan ALCo dicatat Kanwil, bukan PKN |
| Semua peserta | Jelaskan arti kasus selesai dan status belanja | Tidak menyimpulkan dana sudah disalurkan/dibelanjakan hanya karena kasus ditutup |

Catat waktu, salah pilih tindakan, kebutuhan bantuan, dan kemampuan menyebut penanggung jawab berikutnya. Jika peserta memerlukan penjelasan fasilitator, tandai tugas belum berhasil mandiri dan perbaiki bagian yang membingungkan.

Video yang dibuat sebelumnya menggambarkan versi sebelum penyempurnaan ini; video belum direkam ulang pada perubahan ini.
