# MyIntress — EWS Risiko TKD & RKUD (Prototipe Demonstrasi)

Aplikasi statis HTML/CSS/JavaScript untuk **demonstrasi ide makalah inovasi Kelompok 15 DJPb**, bukan layanan MyIntress resmi dan **tidak terhubung dengan SPAN, SAKTI, PKN, SIKD, SIKRI, bank, maupun server DJPb**.

## Konteks mockup Bali dan Denpasar

Antarmuka memakai **Kanwil DJPb Provinsi Bali** dan **KPPN Denpasar**, dengan bahasa operasional sesuai permintaan desain. Seluruh kasus, nama PIC, nomor dokumen, tanggal kegiatan, status, dan metadata pada dataset versi 5 adalah **dummy fiktif**, bukan laporan transaksi atau temuan nyata. Penyebutan nama bank dan unit tidak menyatakan adanya integrasi atau kejadian pada institusi tersebut. Tenggat pada kasus adalah target peninjauan internal yang dibuat untuk mockup, bukan batas penyaluran resmi.

Pergantian pengguna berada pada **menu pengguna di header**, menggantikan pengaturan notifikasi. Keempat akun berbagi kasus yang sama pada browser ini:

| Pengguna fiktif | Peran | Tampilan awal dan kewenangan mockup |
|---|---|---|
| Ni Putu Wulandari | Petugas KPPN Denpasar | Daftar pekerjaan; konfirmasi, pencatatan pelaksanaan, permintaan arahan dan usulan penutupan |
| I Made Pranata | Kepala KPPN Denpasar | Ringkasan keputusan; penugasan PIC/target, penerusan ke Kanwil, persetujuan atau pengembalian penutupan |
| Ni Kadek Maharani | Analis Kanwil DJPb Provinsi Bali | Konsolidasi permintaan KPPN, kesiapan data regional, tanggal penerimaan dan penggunaan ALCo |
| Rizky Pratama | Pengampu PKN | Kualitas sumber RKUD, cakupan, periode, validasi, izin dan kesiapan distribusi |

Pembatasan tersebut diterapkan pada antarmuka dan handler JavaScript untuk demonstrasi proses. Ini bukan RBAC sisi server. Dataset memakai penyimpanan `myintress.tkd.bali.denpasar.v5`; dataset referensi versi 4 tidak ditimpa. Bagian kajian/pilot lama disimpan sebagai arsip sumber dan tidak ditampilkan sebagai layar kerja.

## Publikasikan di GitHub Pages

1. Buat repositori GitHub baru, misalnya `myintress-ews-tkd-demo`.
2. Unggah **isi folder ini ke direktori utama repositori**, terutama `index.html`, folder `assets/`, dan `.nojekyll`.
3. Buka **Settings → Pages → Build and deployment → Deploy from a branch**.
4. Pilih branch `main`, folder `/ (root)`, lalu **Save**.
5. Setelah GitHub Pages aktif, buka URL yang diberikan GitHub: `https://USERNAME.github.io/NAMA-REPO/`.

Jangan memakai GitHub Pages sebagai tempat menyimpan data operasional. Hindari mengunggah arsip RKUD, surat/email bank, dokumen internal, atau data pemerintah daerah yang tidak berizin.

## Fitur interaktif

- **Perlu ditangani**: daftar kasus aktif dengan masalah, langkah berikutnya, PIC dan target. Filter wilayah, jenis masalah serta pencarian tersedia dalam panel yang dapat dibuka. Sumber dan rincian ditampilkan saat dibutuhkan.
- **Semua kasus**: kasus aktif dan selesai, riwayat keputusan, serta ekspor CSV. Kasus selesai tetap tersimpan, tetapi keluar dari daftar pekerjaan aktif.
- **Ringkasan**: indikator dan prioritas yang berbeda untuk keempat pengguna, serta kesiapan informasi RKUD Bali. Pengampu PKN mengubah metadata sumber; analis Kanwil mengubah tanggal penerimaan/pemanfaatan. Nilai sumber tidak dapat ditimpa melalui formulir analis.
- **Tindakan bertahap**: konfirmasi masalah → tetapkan PIC/rencana/target → catat perkembangan atau minta bantuan → selesaikan dengan hasil dan bukti. Pengguna memilih tindakan; status dan waktu pencatatan diperbarui sistem. Pengampu dan waktu simulasi dapat diperiksa sebelum menyimpan.
- **Dua jenis penanganan**: KPPN/Kanwil menangani risiko penyaluran; PKN/Kanwil menangani kualitas informasi RKUD. Tanggal penerimaan/distribusi RKUD tetap merupakan data sumber yang harus diisi berdasarkan bukti, bukan dihasilkan otomatis.

## Panduan demonstrasi lima menit

1. Sebagai **Petugas KPPN**, klik **Lihat peringatan** atau lonceng, lalu pilih **Periksa kasus** dan **Konfirmasi masalah**. Bila pemicunya keliru, pilih **Usulkan tidak relevan** dan cantumkan bukti untuk persetujuan Kepala KPPN.
2. Ganti pengguna menjadi **Kepala KPPN**, pilih kasus terverifikasi lalu **Tetapkan tindak lanjut**; isi PIC, target dan rencana. Tahap ini mencatat penugasan; waktu tindakan pertama belum diisi.
3. Kembali ke **Petugas KPPN**, pilih **Catat perkembangan** setelah tindakan dilakukan. Isi tindakan, respons dan target peninjauan. Gunakan **Minta bantuan** untuk meminta arahan Kepala KPPN; Kepala KPPN dapat meneruskan ke Kanwil sesuai kewenangan.
4. Sebagai petugas, pilih **Ajukan penutupan** dan isi hasil serta bukti. Ganti menjadi **Kepala KPPN** untuk menyetujui atau mengembalikan usulan. Kasus baru berstatus selesai setelah persetujuan; riwayat tetap tersimpan.
5. Ganti menjadi **Analis Kanwil** untuk merespons permintaan dukungan atau mencatat penerimaan RKUD; ganti menjadi **Pengampu PKN** untuk memperbaiki sumber. Data RKUD yang belum lengkap tetap belum layak analisis.

## Penyimpanan dan batasan

- Prototipe menyimpan perubahan hanya di `localStorage` browser/perangkat yang sedang digunakan.
- Pengguna lain yang membuka GitHub Pages **tidak** melihat perubahan Anda; tidak ada database dan tidak ada sinkronisasi antarpengguna.
- Ekspor CSV memudahkan pemindahan hasil **simulasi** saja. Jangan memasukkan data rahasia; repositori Pages bersifat publik.
- Pilihan `Petugas KPPN`, `Kepala KPPN`, `Analis Kanwil`, dan `Pengampu PKN` merupakan akun mockup. Tidak ada login atau otorisasi server.
- Modul MyIntress lain pada template merupakan replika visual yang berisi data ilustratif, bukan informasi real-time.
- Konten ALCo September 2026 dipakai sebagai **referensi historis**; data kasus proses, tenggat contoh, alur tanggal, dan nilai baseline adalah **fiktif**.
- Perubahan data simulasi tidak menyebabkan email, WhatsApp, notifikasi HAI-CSO, surat, atau tindakan sungguhan.

## Ketergantungan

Template visual warisan memakai Tailwind CSS CDN, Chart.js CDN, Font Awesome CDN, dan Google Fonts. Karena itu internet diperlukan agar seluruh tata letak dan ikon dari template berfungsi maksimal. Modul TKD baru dibangun dengan CSS dan JavaScript langsung di `index.html`, sehingga tidak memerlukan server-side API. Logo aktif menggunakan `myintress-logo.svg` pada direktori utama.

## Batas implementasi produksi

Sebagai sistem operasional dibutuhkan minimal: penetapan produk dan pemilik proses, izin sumber data, backend dan database, autentikasi dan RBAC sisi server, jejak audit yang terlindungi, persetujuan keamanan, integrasi yang disahkan, UAT, mekanisme koreksi dan pembaruan status transaksi, serta penetapan SLA dan aturan bisnis per jenis TKD.
