# MyIntress — EWS Risiko TKD & RKUD (Prototipe Demonstrasi)

Aplikasi statis HTML/CSS/JavaScript untuk **demonstrasi ide makalah inovasi Kelompok 15 DJPb**, bukan layanan MyIntress resmi dan **tidak terhubung dengan SPAN, SAKTI, PKN, SIKD, SIKRI, bank, maupun server DJPb**.

## Konteks mockup Bali dan Denpasar

Antarmuka memakai **Kanwil DJPb Provinsi Bali** dan **KPPN Denpasar**, dengan bahasa operasional sesuai permintaan desain. Seluruh kasus, nama PIC, nomor dokumen, tanggal kegiatan, status, dan metadata pada dataset versi 5 adalah **dummy fiktif**, bukan laporan transaksi atau temuan nyata. Penyebutan nama bank dan unit tidak menyatakan adanya integrasi atau kejadian pada institusi tersebut. Tenggat pada kasus adalah target peninjauan internal yang dibuat untuk mockup, bukan batas penyaluran resmi.

Pergantian pengguna berada pada **menu pengguna di header**, menggantikan pengaturan notifikasi. Keempat akun berbagi kasus yang sama pada browser ini:

| Pengguna fiktif | Peran | Tampilan awal dan kewenangan mockup |
|---|---|---|
| Ni Putu Wulandari | Petugas KPPN Denpasar | Daftar pekerjaan; konfirmasi, pencatatan pelaksanaan, permintaan arahan dan usulan penutupan |
| I Made Pranata | Kepala KPPN Denpasar | Antrean keputusan; penugasan PIC/target, penerusan ke Kanwil, persetujuan atau pengembalian penutupan |
| Ni Kadek Maharani | Analis Kanwil DJPb Provinsi Bali | Antrean dukungan regional, kesiapan data, tanggal penerimaan dan penggunaan ALCo |
| Rizky Pratama | Pengampu PKN | Kualitas sumber RKUD, cakupan, periode, validasi, izin dan kesiapan distribusi |

Pembatasan tersebut diterapkan pada antarmuka dan handler JavaScript untuk demonstrasi proses. Ini bukan RBAC sisi server. Dataset memakai penyimpanan `myintress.tkd.bali.denpasar.v5`; dataset referensi versi 4 tidak ditimpa. Menu serta handler FA/pilot lama telah dihentikan agar tidak ada jalur aplikasi ganda.

## Publikasikan di GitHub Pages

1. Buat repositori GitHub baru, misalnya `myintress-ews-tkd-demo`.
2. Unggah **isi folder ini ke direktori utama repositori**, terutama `index.html`, folder `assets/`, dan `.nojekyll`.
3. Buka **Settings → Pages → Build and deployment → Deploy from a branch**.
4. Pilih branch `main`, folder `/ (root)`, lalu **Save**.
5. Setelah GitHub Pages aktif, buka URL yang diberikan GitHub: `https://USERNAME.github.io/NAMA-REPO/`.

Jangan memakai GitHub Pages sebagai tempat menyimpan data operasional. Hindari mengunggah arsip RKUD, surat/email bank, dokumen internal, atau data pemerintah daerah yang tidak berizin.

## Fitur interaktif

- **Popup EWS**: lonceng, banner dan satu entri Tematik membuka popup yang sama di atas beranda. Warna, font dan kontrol mengikuti tema MyIntress.
- **Pilihan pengguna langsung**: empat tombol akun di menu pengguna, tanpa dropdown bertingkat atau uraian peran berulang.
- **Perlu tindakan**: hanya pekerjaan yang menunggu pengguna aktif, diurutkan menurut target dan kebutuhan keputusan. Tombol utama langsung membuka form tindakan.
- **Riwayat & kasus**: satu daftar kasus aktif dan selesai, pencarian termasuk PIC, filter status, serta unduhan CSV. Tabel aksi duplikat telah dihapus.
- **Ringkasan**: angka agregat yang dapat diklik untuk membuka daftar terkait. Durasi verifikasi dan tindakan dihitung dari timestamps dengan jumlah sampelnya.
- **Informasi RKUD**: satu sumber per objek/bank/periode. PKN mengubah sumber; Kanwil mengubah penerimaan/pemanfaatan. Perubahan sumber yang telah dipakai meminta peninjauan ulang Kanwil. Catatan keduanya disimpan terpisah.
- **Impor atomik dan idempoten**: templat CSV bisa diimpor kembali, judul kolom ditangani tanpa membedakan kapitalisasi, tanggal diverifikasi, dan impor ulang memperbarui sumber yang sama. Satu baris tidak valid membatalkan seluruh batch.
- **Tindakan bertahap**: konfirmasi masalah → tetapkan PIC/rencana/target → catat perkembangan atau minta bantuan → selesaikan dengan hasil dan bukti. Pengguna memilih tindakan; status dan waktu pencatatan diperbarui sistem. Pengampu dan waktu simulasi dapat diperiksa sebelum menyimpan.
- **Dua jenis penanganan**: KPPN/Kanwil menangani risiko penyaluran; PKN/Kanwil menangani kualitas informasi RKUD. Tanggal penerimaan/distribusi RKUD tetap merupakan data sumber yang harus diisi berdasarkan bukti, bukan dihasilkan otomatis.

## Panduan demonstrasi lima menit

1. Pilih **Petugas KPPN** di header. Buka lonceng atau **Lihat peringatan**, lalu klik **Konfirmasi masalah** pada kartu. Gunakan **Rincian & tindakan lain** untuk meminta data atau mengusulkan peringatan tidak relevan.
2. Ganti pengguna menjadi **Kepala KPPN**, pilih kasus terverifikasi lalu **Tetapkan tindak lanjut**; isi PIC, target dan rencana. Tahap ini mencatat penugasan; waktu tindakan pertama belum diisi.
3. Kembali ke **Petugas KPPN**, pilih **Catat perkembangan** setelah tindakan dilakukan. Isi tindakan, respons dan target peninjauan. Gunakan **Minta dukungan** melalui rincian; Kepala KPPN dapat meneruskan ke Kanwil.
4. Sebagai petugas, pilih **Ajukan penutupan** dan isi hasil serta bukti. Ganti menjadi **Kepala KPPN** untuk menyetujui atau mengembalikan usulan. Kasus baru berstatus selesai setelah persetujuan; riwayat tetap tersimpan.
5. Ganti menjadi **Analis Kanwil** untuk merespons permintaan dukungan atau mencatat penerimaan RKUD; ganti menjadi **Pengampu PKN** untuk memperbaiki sumber. Data RKUD yang belum lengkap tetap belum layak analisis.

## Penyimpanan dan batasan

- Prototipe menyimpan perubahan hanya di `localStorage` browser/perangkat yang sedang digunakan.
- Pengguna lain yang membuka GitHub Pages **tidak** melihat perubahan Anda; tidak ada database dan tidak ada sinkronisasi antarpengguna.
- Ekspor CSV memudahkan pemindahan hasil **simulasi** saja. Jangan memasukkan data rahasia; repositori Pages bersifat publik.
- Pilihan `Petugas KPPN`, `Kepala KPPN`, `Analis Kanwil`, dan `Pengampu PKN` merupakan akun mockup. Tidak ada login atau otorisasi server.
- Modul MyIntress lain pada template merupakan replika visual yang berisi data ilustratif, bukan informasi real-time.
- Rancangan awal mengacu pada kajian ALCo; kasus pada popup adalah dummy Bali–Denpasar, bukan penyalinan kasus historis atau data live.
- Perubahan data simulasi tidak menyebabkan email, WhatsApp, notifikasi HAI-CSO, surat, atau tindakan sungguhan.

## Ketergantungan

Beranda warisan memakai Tailwind CSS CDN, Chart.js CDN, Font Awesome CDN, dan Google Fonts. Grafik dan ikon beranda memerlukan ketergantungan tersebut. Popup TKD menggunakan `assets/tkd.css`, `assets/tkd.js`, dan dataset fiktif `assets/tkd-base.js`, tanpa paket npm atau API server. EWS juga diuji saat seluruh permintaan HTTPS/CDN diblokir. Logo aktif memakai `myintress-logo.svg` pada direktori utama.

## Pengujian otomatis

Jalankan `node tests/ews-e2e.cjs` dengan Node.js dan Chrome/Edge Chromium terpasang. Gunakan `CHROME_BIN` bila executable berada di lokasi lain; `TKD_AUDIT_DIR` menentukan direktori laporan dan screenshot.

Runner memakai server lokal dan profil browser sementara yang terisolasi; tidak membaca profil browser pengguna. Cakupan meliputi empat peran, popup dan keyboard, persetujuan dan pengembalian kasus, timestamp, impor/ekspor, deduplikasi, perubahan sumber RKUD, persistensi, enam ukuran layar, dan pengukuran klik tindakan/filter. Hasil tersimpan sebagai `hasil-uji.json`.

## Batas implementasi produksi

Sebagai sistem operasional dibutuhkan minimal: penetapan produk dan pemilik proses, izin sumber data, backend dan database, autentikasi dan RBAC sisi server, jejak audit yang terlindungi, persetujuan keamanan, integrasi yang disahkan, UAT, mekanisme koreksi dan pembaruan status transaksi, serta penetapan SLA dan aturan bisnis per jenis TKD.
