# Kamus Data dan Alur Demo EWS TKD–RKUD

**Status dokumen:** Rancangan interaktif, bukan keputusan tata kelola DJPb. Dataset yang dapat dimanipulasi adalah sintetis. Narasi ALCo NTT/Bali September 2026 adalah referensi historis, bukan input transaksi langsung.

**Dataset versi 5:** popup aktif memakai konteks Kanwil DJPb Provinsi Bali dan KPPN Denpasar, dengan seluruh nama PIC, dokumen, kasus dan metadata fiktif. Narasi operasional adalah kebutuhan mockup, bukan pengesahan data riil. Menu serta formulir FA/pilot lama yang menduplikasi alur sudah dihentikan.

## A. Deteksi risiko penyaluran

| Elemen | Penggunaan | Ketentuan desain |
|---|---|---|
| `region`, `locality` | Unit wilayah/pemda | Kode entitas produksi harus menggunakan referensi resmi |
| `transfer`, `dimension` | D1 / D2 dan jenis TKD | Aturan dan tenggat resmi harus ditetapkan per skema/tahun |
| `source` | Rujukan dokumen dan tanggal posisi | Diisi dari keterangan petugas, belum ada feed otomatis |
| `deadline` | Target pemeriksaan/tindak lanjut internal | Bukan tenggat legal penyaluran; digunakan untuk urutan prioritas |
| `detectedAt`, `verifiedAt`, `actedAt`, `closedAt` | Kronologi keputusan | Digunakan untuk mengukur jeda tindakan dan validasi |
| `owner`, `decider`, `evidenceRef` | Penanggung jawab dan bukti | Isian dalam simulasi tidak berarti otorisasi formal |
| `stage` | Sinyal → Terverifikasi → Ditugaskan → Ditindaklanjuti/Eskalasi → Menunggu persetujuan → Selesai | Untuk kasus penyaluran, petugas mengusulkan dan Kepala KPPN menyetujui penutupan; usulan dapat dikembalikan |
| `proposedAt`, `proposedBy`, `proposedResult`, `proposedEvidence` | Usulan penutupan petugas | Bukti dan hasil diperiksa Kepala KPPN sebelum `closedAt` diisi |
| `approvedAt`, `approvedBy` | Persetujuan Kepala KPPN | Waktu dan aktor persetujuan disimpan terpisah dari pengaju |
| `regionalResponse`, `regionalRespondedAt` | Respons Kanwil atas eskalasi | Permintaan dukungan dikembalikan ke tahap pelaksanaan setelah analis memberi respons |
| `assignedAt` | Waktu penetapan PIC dan rencana | Penugasan belum menjadi tindakan lapangan; `actedAt` diisi ketika perkembangan atau permintaan bantuan dicatat |
| `escalationTarget`, `escalationReason` | Tujuan dan alasan lintas kewenangan | Wajib untuk eskalasi; kasus lokal tidak otomatis diteruskan ke pusat |

Urutan antrean mempertimbangkan target terlewat, target hari ini, kebutuhan persetujuan, target dekat, dan prioritas kasus. Penentuan ini membantu mengurutkan pekerjaan; tidak menetapkan pelanggaran atau aturan hukum penyaluran.

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
| `sourceNote`, `analysisNote` | Catatan terpisah PKN dan analis, tidak saling menimpa |
| `analysisNeedsReview` | Perubahan sumber yang telah diterima/dipakai memerlukan peninjauan ulang Kanwil |

**Kelayakan RKUD** hanya muncul jika periode, jejak waktu berurutan, cakupan lengkap, validasi, dan izin terisi. Label "Valid" atau "Disetujui" dalam aplikasi tidak berarti persetujuan PKN yang sesungguhnya. Tidak ada kolom nominal saldo. Data kosong tidak disimpulkan saldo nol atau dana TKD mengendap.

## C. Formula evaluasi pilot

- **Waktu verifikasi** = `verifiedAt − detectedAt`.
- **Waktu respons awal** = `actedAt − verifiedAt`.
- **Jeda RKUD** = `kanwilAt − readyAt`.
- **Median** dihitung hanya dari pasangan waktu yang valid; ini durasi dummy, bukan dampak pilot lapangan.
- Jumlah kasus dan penyebut indikator wajib diperlihatkan. Jika tanggal tidak memadai, status indikator adalah **belum dapat dihitung**, bukan nol.

## D. Alur peringatan pada prototipe

Tombol **Lihat peringatan**, lonceng dan satu entri Tematik membuka popup EWS di atas beranda. Bagian popup ialah **Perlu tindakan**, **Riwayat & kasus**, serta **Ringkasan**. Pemilihan pengguna memakai empat tombol langsung di header. Identitas dan konteks unit tidak diulang sebagai halaman pengantar.

1. Kasus berasal dari dataset dummy atau pencatatan petugas. Judul/wilayah/jenis yang sama pada kasus aktif diarahkan ke kasus tersebut. Belum ada deteksi dari sistem sumber pemerintah.
2. Petugas KPPN memverifikasi dan melaksanakan, Kepala KPPN menetapkan PIC dan persetujuan penutupan. Dukungan Kanwil kembali ke pelaksana setelah respons diterima.
3. Pengguna memilih tindakan, bukan mengganti status secara manual. Konfirmasi meminta hasil pemeriksaan; penugasan meminta PIC, target dan rencana; perkembangan meminta tindakan serta respons; bantuan meminta tujuan dan alasan lintas kewenangan. Waktu pencatatan dan pengampu simulasi diisi awal oleh sistem, dapat diperiksa/dikoreksi, dan tidak boleh mendahului kronologi sebelumnya. Pengampu demo bukan identitas pengguna yang telah diautentikasi.
4. Penutupan memerlukan hasil, waktu dan referensi bukti. Sinyal penyaluran yang tidak relevan juga diajukan kepada Kepala KPPN tanpa mengarang waktu tindakan. Pengembalian usulan tersebut mewajibkan pemeriksaan ulang. Kasus selesai tetap ada pada riwayat.
5. Metadata RKUD yang belum memenuhi periode, urutan tanggal, cakupan, validasi atau izin tetap belum layak analisis. Saldo tidak dinilai dan D4b tidak dihitung otomatis.
6. Rekap dikenali melalui wilayah, objek, bank dan periode. Seluruh batch impor divalidasi sebelum disimpan. Impor ulang memperbarui sumber yang sama dan tidak mengubah tanggal milik Kanwil.
7. Menutup banner tidak menyelesaikan kasus. Banner muncul lagi bila isi antrean berubah. Pencarian tidak mengurangi indikator global jumlah pekerjaan.

## E. Kondisi praproduksi

Produksi baru layak bila ada penanggung jawab proses, regulasi sumber, SLA data, identitas resmi, otorisasi, model database, autentikasi terpusat, RBAC sisi server, pencatatan audit terlindungi, integrasi resmi, uji akurasi, UAT, pengujian keamanan, dan keputusan tata kelola/pembiayaan.
