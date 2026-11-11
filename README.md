# MyIntress — EWS Risiko TKD & RKUD (Prototipe Demonstrasi)

Aplikasi statis HTML/CSS/JavaScript untuk **demonstrasi ide makalah inovasi Kelompok 15 DJPb**, bukan layanan MyIntress resmi dan **tidak terhubung dengan SPAN, SAKTI, PKN, SIKD, SIKRI, bank, maupun server DJPb**.

## Publikasikan di GitHub Pages

1. Buat repositori GitHub baru, misalnya `myintress-ews-tkd-demo`.
2. Unggah **isi folder ini ke direktori utama repositori**, terutama `index.html`, folder `assets/`, dan `.nojekyll`.
3. Buka **Settings → Pages → Build and deployment → Deploy from a branch**.
4. Pilih branch `main`, folder `/ (root)`, lalu **Save**.
5. Setelah GitHub Pages aktif, buka URL yang diberikan GitHub: `https://USERNAME.github.io/NAMA-REPO/`.

Jangan memakai GitHub Pages sebagai tempat menyimpan data operasional. Hindari mengunggah arsip RKUD, surat/email bank, dokumen internal, atau data pemerintah daerah yang tidak berizin.

## Fitur interaktif

- **Peringatan & verifikasi**: tombol alert dan lonceng membuka antrean kandidat D1–D2, kasus aktif, dan kualitas metadata RKUD. Setiap kasus menunjukkan sumber dan langkah berikutnya; jumlah kasus dan metadata tidak dijumlahkan menjadi satu skor risiko.
- **Ikhtisar strategis**: prioritas yang perlu keputusan, ringkasan kasus, konteks ALCo NTT/Bali September 2026.
- **Jalur A — Penyaluran**: skenario rule-based D1–D2, tanggal evaluasi yang dapat diubah, countdown tenggat **ilustratif** (H-14/H-7/H-3), dan tombol untuk mendaftarkan sinyal ke register.
- **Jalur B — RKUD**: metadata pelaporan bank ke PKN, tanggal validasi, siap distribusi, diterima Kanwil, dipakai ALCo; status izin/cakupan; perhitungan jeda yang hanya muncul bila tanggal lengkap.
- **Register & aksi**: verifikasi berjenjang, penanggung jawab, bukti, timestamps, hasil, jejak status, ekspor CSV.
- **Evaluasi pilot**: median waktu sinyal ke verifikasi dan verifikasi ke tindakan, pembanding baseline hipotetis yang bisa diedit; kriteria go/no-go.
- **Tata kelola & ADKAR**: lima dimensi risiko, SOP/roadmap enam bulan, ceklis persyaratan integrasi.

## Panduan demonstrasi lima menit

1. Dari halaman awal, klik **Lihat peringatan** atau lonceng. Baca sumber dan langkah berikutnya pada **Peringatan & Verifikasi**. Buka **Jalur A**, ubah tanggal evaluasi jika perlu dan klik **Jalankan pemeriksaan**.
2. Lihat satu kasus mendekati tenggat, klik **Daftarkan sinyal**, isi **Sinyal dicatat**, **Verifikasi selesai**, **Pejabat pemutus**, keterangan bukti, ubah status ke **Terverifikasi**, lalu simpan.
3. Buka kasus lagi, tetapkan PIC, tenggat, rencana tindakan dan **Kontak/tindakan pertama**, ubah status ke **Ditindaklanjuti**, lalu simpan. Eskalasi memerlukan tujuan dan alasan lintas kewenangan. Penutupan memerlukan hasil, waktu dan bukti; sinyal **Tidak relevan** dapat ditutup setelah verifikasi tanpa tindakan lapangan fiktif.
4. Pada **Jalur B — RKUD**, buka satu metadata contoh lalu bandingkan tanggal PKN siap dan Kanwil menerima. Perhatikan wilayah belum diverifikasi tetap berstatus **belum layak**, bukan saldo nol.
5. Buka **Evaluasi Pilot**, lihat waktu respons yang dihitung dari timestamps, ubah baseline hipotetis, dan jelaskan gerbang keputusan bulan 2/4/6.

## Penyimpanan dan batasan

- Prototipe menyimpan perubahan hanya di `localStorage` browser/perangkat yang sedang digunakan.
- Pengguna lain yang membuka GitHub Pages **tidak** melihat perubahan Anda; tidak ada database dan tidak ada sinkronisasi antarpengguna.
- Ekspor CSV memudahkan pemindahan hasil **simulasi** saja. Jangan memasukkan data rahasia; repositori Pages bersifat publik.
- Perspektif `KPPN`, `Kanwil`, `PKN`, dan `Pusat` hanya demonstrasi perilaku antarmuka. Bukan autentikasi atau otorisasi keamanan.
- Modul MyIntress lain pada template merupakan replika visual yang berisi data ilustratif, bukan informasi real-time.
- Konten ALCo September 2026 dipakai sebagai **referensi historis**; data kasus proses, tenggat contoh, alur tanggal, dan nilai baseline adalah **fiktif**.
- Perubahan data simulasi tidak menyebabkan email, WhatsApp, notifikasi HAI-CSO, surat, atau tindakan sungguhan.

## Ketergantungan

Template visual warisan memakai Tailwind CSS CDN, Chart.js CDN, Font Awesome CDN, dan Google Fonts. Karena itu internet diperlukan agar seluruh tata letak dan ikon dari template berfungsi maksimal. Modul TKD baru dibangun dengan CSS dan JavaScript langsung di `index.html`, sehingga tidak memerlukan server-side API. Logo prototipe disertakan lokal pada `assets/myintress-logo.svg`.

## Batas implementasi produksi

Sebagai sistem operasional dibutuhkan minimal: penetapan produk dan pemilik proses, izin sumber data, backend dan database, autentikasi dan RBAC sisi server, jejak audit yang terlindungi, persetujuan keamanan, integrasi yang disahkan, UAT, mekanisme koreksi dan pembaruan status transaksi, serta penetapan SLA dan aturan bisnis per jenis TKD.
