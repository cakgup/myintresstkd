# Kamus Data dan Alur Demo EWS TKD–RKUD

**Status dokumen:** Rancangan interaktif, bukan keputusan tata kelola DJPb. Dataset yang dapat dimanipulasi adalah sintetis. Narasi ALCo NTT/Bali September 2026 adalah referensi historis, bukan input transaksi langsung.

## A. Deteksi risiko penyaluran

| Elemen | Penggunaan | Ketentuan desain |
|---|---|---|
| `region`, `locality` | Unit wilayah/pemda | Kode entitas produksi harus menggunakan referensi resmi |
| `transfer`, `dimension` | D1 / D2 dan jenis TKD | Aturan dan tenggat resmi harus ditetapkan per skema/tahun |
| `sourceDate`, `source` | Kesegaran/status dokumen sumber | Tidak boleh membuat sinyal sebelum tanggal data diterbitkan |
| `deadline` | Tenggat skenario | Tanggal dalam demo fiktif, bukan tenggat legal |
| `document` | Lengkap / dalam perbaikan / belum lengkap | Status input simulasi, bukan SAKTI/SPAN |
| `detectedAt`, `verifiedAt`, `actedAt`, `closedAt` | Kronologi keputusan | Digunakan untuk mengukur jeda tindakan dan validasi |
| `owner`, `decider`, `evidenceRef` | Penanggung jawab dan bukti | Isian dalam simulasi tidak berarti otorisasi formal |
| `stage` | Sinyal → Terverifikasi → Ditindaklanjuti/Eskalasi → Selesai | Kasus relevan harus ditindaklanjuti; sinyal tidak relevan dapat ditutup setelah verifikasi dengan alasan, hasil dan bukti |
| `escalationTarget`, `escalationReason` | Tujuan dan alasan lintas kewenangan | Wajib untuk eskalasi; kasus lokal tidak otomatis diteruskan ke pusat |

Ambang contoh: ≤3 hari prioritas tinggi, 4–7 hari klarifikasi, 8–14 hari pemantauan, >14 hari belum mendesak; belum ada ambang resmi yang disahkan. Sinyal hasil perhitungan tetap harus diverifikasi oleh petugas yang berwenang.

## B. Aliran informasi RKUD

| Elemen | Makna |
|---|---|
| `period` | Tanggal posisi saldo akhir bulan |
| `received` | Tanggal PKN menerima dari bank pelapor |
| `validatedAt` | Tanggal pemeriksaan/validasi rekap selesai |
| `readyAt` | Tanggal rekap siap didistribusikan sesuai kewenangan |
| `kanwilAt` | Tanggal diterima pengguna Kanwil yang berwenang |
| `alcoAt` | Tanggal digunakan dalam bahan ALCo jika layak |
| `coverage` | Kelengkapan cakupan bank/pemda/rekening |
| `validation` | Status kualitas data |
| `permission` | Status izin penggunaan dan distribusi |

**Kelayakan RKUD** hanya muncul jika periode, jejak waktu berurutan, cakupan lengkap, validasi, dan izin terisi. Label "Valid" atau "Disetujui" dalam aplikasi tidak berarti persetujuan PKN yang sesungguhnya. Tidak ada kolom nominal saldo. Data kosong tidak disimpulkan saldo nol atau dana TKD mengendap.

## C. Formula evaluasi pilot

- **Waktu verifikasi** = `verifiedAt − detectedAt`.
- **Waktu respons awal** = `actedAt − verifiedAt`.
- **Jeda RKUD** = `kanwilAt − readyAt`.
- **Baseline** ditampilkan dalam jam yang dapat diubah sebagai hipotesis latihan; bukan hasil pengamatan.
- Jumlah kasus dan penyebut indikator wajib diperlihatkan. Jika tanggal tidak memadai, status indikator adalah **belum dapat dihitung**, bukan nol.

## D. Alur peringatan pada prototipe

Mengacu pada Bab III.E dan Lampiran A makalah Kelompok 15, tombol **Lihat peringatan** dan lonceng membuka tab **Peringatan & Verifikasi**. Ringkasan beranda mencakup seluruh wilayah contoh; antrean mengikuti filter modul. Jumlah kasus dan metadata RKUD ditampilkan terpisah karena dapat merujuk isu yang sama.

1. Kandidat D1–D2 dibuka pada Jalur A, diperiksa dan didaftarkan satu kali ke register. Perubahan skenario membatalkan hasil pemeriksaan sebelumnya.
2. Kasus penyaluran diverifikasi pengampu KPPN; masalah kualitas RKUD diklarifikasi kepada PKN/Kanwil. Rujukan historis ALCo tidak menjadi deteksi otomatis.
3. Verifikasi memerlukan waktu sinyal, waktu verifikasi, pejabat pengampu/pemutus, dan catatan bukti. Tindak lanjut memerlukan PIC, rencana, target peninjauan, dan waktu tindakan. Eskalasi menambahkan tujuan serta alasan lintas kewenangan.
4. Penutupan memerlukan hasil, waktu dan referensi bukti. Sinyal tidak relevan dapat ditutup setelah verifikasi tanpa membuat tindakan lapangan fiktif. Kasus selesai keluar dari antrean, namun tetap di register dan jejak perubahan.
5. Metadata RKUD yang belum memenuhi periode, urutan tanggal, cakupan, validasi atau izin tetap belum layak analisis. Saldo tidak dinilai dan D4b tidak dihitung otomatis.

## E. Kondisi praproduksi

Produksi baru layak bila ada penanggung jawab proses, regulasi sumber, SLA data, identitas resmi, otorisasi, model database, autentikasi terpusat, RBAC sisi server, pencatatan audit terlindungi, integrasi resmi, uji akurasi, UAT, pengujian keamanan, dan keputusan tata kelola/pembiayaan.
