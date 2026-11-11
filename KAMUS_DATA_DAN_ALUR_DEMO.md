# Kamus Data dan Alur Demo EWS TKD–RKUD

**Status dokumen:** Rancangan interaktif, bukan keputusan tata kelola DJPb. Dataset yang dapat dimanipulasi adalah sintetis. Narasi ALCo NTT/Bali September 2026 adalah referensi historis, bukan input transaksi langsung.

**Dataset versi 5:** antarmuka aktif memakai konteks Kanwil DJPb Provinsi Bali dan KPPN Denpasar, dengan seluruh nama PIC, dokumen, kasus dan metadata fiktif. Narasi operasional pada layar adalah kebutuhan mockup, bukan pengesahan data riil. Rujukan ALCo lama dipertahankan pada arsip sumber, tidak dicampur ke daftar kasus dummy baru.

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
| `stage` | Sinyal → Terverifikasi → Ditugaskan → Ditindaklanjuti/Eskalasi → Menunggu persetujuan → Selesai | Untuk kasus penyaluran, petugas mengusulkan dan Kepala KPPN menyetujui penutupan; usulan dapat dikembalikan |
| `proposedAt`, `proposedBy`, `proposedResult`, `proposedEvidence` | Usulan penutupan petugas | Bukti dan hasil diperiksa Kepala KPPN sebelum `closedAt` diisi |
| `approvedAt`, `approvedBy` | Persetujuan Kepala KPPN | Waktu dan aktor persetujuan disimpan terpisah dari pengaju |
| `regionalResponse`, `regionalRespondedAt` | Respons Kanwil atas eskalasi | Permintaan dukungan dikembalikan ke tahap pelaksanaan setelah analis memberi respons |
| `assignedAt` | Waktu penetapan PIC dan rencana | Penugasan belum menjadi tindakan lapangan; `actedAt` diisi ketika perkembangan atau permintaan bantuan dicatat |
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

Mengacu pada Bab III.E dan Lampiran A makalah Kelompok 15, tombol **Lihat peringatan** dan lonceng membuka **Perlu ditangani**. Dua menu lain ialah **Semua kasus** dan **Ringkasan**. Ringkasan beranda mencakup seluruh wilayah contoh; antrean mengikuti filter modul. Metadata RKUD dan kandidat skenario berada pada bagian pendukung yang dapat dibuka, tidak dijumlahkan sebagai kasus tambahan.

1. Kandidat D1–D2 dibuka pada Jalur A, diperiksa dan didaftarkan satu kali ke register. Perubahan skenario membatalkan hasil pemeriksaan sebelumnya.
2. Kasus penyaluran diverifikasi pengampu KPPN; masalah kualitas RKUD diklarifikasi kepada PKN/Kanwil. Rujukan historis ALCo tidak menjadi deteksi otomatis.
3. Pengguna memilih tindakan, bukan mengganti status secara manual. Konfirmasi meminta hasil pemeriksaan; penugasan meminta PIC, target dan rencana; perkembangan meminta tindakan serta respons; bantuan meminta tujuan dan alasan lintas kewenangan. Waktu pencatatan dan pengampu simulasi diisi awal oleh sistem, dapat diperiksa/dikoreksi, dan tidak boleh mendahului kronologi sebelumnya. Pengampu demo bukan identitas pengguna yang telah diautentikasi.
4. Penutupan memerlukan hasil, waktu dan referensi bukti. Sinyal tidak relevan dapat ditutup setelah verifikasi tanpa membuat tindakan lapangan fiktif. Kasus selesai keluar dari antrean, namun tetap di register dan jejak perubahan.
5. Metadata RKUD yang belum memenuhi periode, urutan tanggal, cakupan, validasi atau izin tetap belum layak analisis. Saldo tidak dinilai dan D4b tidak dihitung otomatis.

## E. Kondisi praproduksi

Produksi baru layak bila ada penanggung jawab proses, regulasi sumber, SLA data, identitas resmi, otorisasi, model database, autentikasi terpusat, RBAC sisi server, pencatatan audit terlindungi, integrasi resmi, uji akurasi, UAT, pengujian keamanan, dan keputusan tata kelola/pembiayaan.
