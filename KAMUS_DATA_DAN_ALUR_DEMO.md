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
| `stage` | Sinyal → Terverifikasi → Ditindaklanjuti/Eskalasi → Selesai | Tidak boleh langsung melompat dari Sinyal ke Selesai |

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

## D. Kondisi praproduksi

Produksi baru layak bila ada penanggung jawab proses, regulasi sumber, SLA data, identitas resmi, otorisasi, model database, autentikasi terpusat, RBAC sisi server, pencatatan audit terlindungi, integrasi resmi, uji akurasi, UAT, pengujian keamanan, dan keputusan tata kelola/pembiayaan.
