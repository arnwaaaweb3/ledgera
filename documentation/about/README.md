# 🏛️ APBD Tracker - Indonesia Web3 Hackathon 2026

[cite_start]**APBD Tracker** adalah platform pengadaan barang dan jasa pemerintah (anggaran daerah) berbasis Web3 yang mengedepankan transparansi absolut tanpa mengorbankan kemudahan adopsi pengguna awam (Web2-lookalike UI/UX)[cite: 34, 108]. [cite_start]Proyek ini dibangun khusus untuk ekosistem **BNB Chain** dengan integrasi **AI Agents** sebagai mesin pembaca wawasan (*insight machine*) bagi publik[cite: 7, 35].

---

## 💡 Grand Idea & Masalah Nyata yang Diselesaikan

[cite_start]Di dunia nyata, transparansi anggaran publik sering kali bersifat pasif (seperti file PDF yang sulit diakses atau dipahami masyarakat awam)[cite: 52]. [cite_start]Di sisi lain, celah korupsi atau penyalahgunaan dana rentan terjadi saat transaksi mulai bergeser ke ranah *off-chain*[cite: 65, 66].

**APBD Tracker hadir untuk mengubah lanskap ini melalui:**
1. [cite_start]**Transparansi Aktif:** Mengunci alokasi anggaran daerah di dalam blockchain sehingga mustahil dimanipulasi (*immutable*)[cite: 41, 52, 53].
2. [cite_start]**Invisible Web3 Onboarding:** Pengguna (pejabat dinas, vendor utama, hingga sub-kontraktor) cukup masuk menggunakan akun Google tanpa perlu pusing memikirkan *private key* atau dompet kripto manual[cite: 107, 125, 126].
3. [cite_start]**Fully Smart Contract Escrow:** Dana anggaran dicairkan secara otomatis berdasarkan pencapaian proyek (*milestone*) yang terverifikasi langsung secara *on-chain*[cite: 44, 45, 103].

---

## 🛠️ Tech Stack Resmi

[cite_start]Arsitektur aplikasi ini sengaja dipisahkan secara modular untuk memangkas beban biaya gas (*gas fee*) di blockchain namun tetap mempertahankan performa analisis yang cerdas[cite: 132, 135].

* [cite_start]**Frontend & UX:** `Next.js` + `TypeScript` + `Tailwind CSS` [cite: 191]
* [cite_start]**Web3 Onboarding:** `ZeroDev` (Account Abstraction berbasis Google Account / zkLogin) [cite: 191]
* [cite_start]**Smart Contract Environment:** `Solidity` + `Foundry` (Untuk penyusunan kode *escrow* dan pengujian berkecepatan tinggi) [cite: 192]
* [cite_start]**Web3 Integration:** `Wagmi` (Menghubungkan *frontend hooks* ke jaringan BNB Chain) [cite: 193]
* [cite_start]**AI Analytics (Off-Chain):** `Google Gemini API` (Mesin pemroses data JSON terstruktur untuk merangkum riwayat anggaran menjadi bahasa awam) [cite: 194]
* [cite_start]**Backend API:** `Python FastAPI` (Server jembatan minimalis berkinerja tinggi antara data *on-chain* dan mesin AI) [cite: 195]

---

## ⚙️ Arsitektur & Alur Solusi MVP (Minimum Viable Product)

Aplikasi difokuskan pada tiga halaman utama untuk keperluan demonstrasi fungsional dengan data simulasi (*dummy*):

### 1. Dashboard Publik (Citizen View)
* [cite_start]**Natural Language Search Bar:** Memungkinkan masyarakat mencari detail proyek menggunakan bahasa sehari-hari yang ditenagai oleh Google Gemini API[cite: 207].
* [cite_start]**APBD Health Score Widget:** Grafik *speedometer* interaktif penunjuk kesehatan anggaran (Hijau: Aman, Kuning: Dokumen Belum Lengkap, Merah: Risiko Tinggi kecurangan finansial)[cite: 208, 209, 210, 211].
* [cite_start]**Active Project Feed:** Daftar baris/kartu proyek berjalan yang memuat nama tender, pagu dana, kemajuan fisik, dan status dari AI[cite: 213].

### 2. Portal Internal & Invisible Onboarding
* [cite_start]Otentikasi satu tombol **"Sign in with Google"**[cite: 215].
* [cite_start]Di balik layar, sistem secara otomatis membuatkan *smart contract wallet* berdasarkan identitas Google pengguna menggunakan kapabilitas Account Abstraction dari *ZeroDev*[cite: 217].

### 3. Dashboard Vendor & Dinas (Escrow Management)
* [cite_start]**Sub-contractor Whitelist Registration:** Fitur wajib di mana vendor utama harus mendaftarkan alamat email sub-kontraktor mereka ke dalam *smart contract* sebelum transaksi dilakukan demi membatasi adanya "perusahaan cangkang" atau sub-kontraktor fiktif[cite: 85, 221].
* [cite_start]**Milestone Payment Claim:** Tombol simulasi penarikan dana (ala QRIS/Virtual Account) yang akan otomatis mengeksekusi fungsi pencairan dana *escrow* setelah bukti foto fisik proyek diunggah ke *decentralized storage*[cite: 224, 226].

---

## 🚀 Rencana Skalabilitas (Future Roadmap)

* [cite_start]**Penyimpanan Terdesentralisasi:** Memanfaatkan `BNB Greenfield` untuk mengamankan data lampiran tender berukuran besar serta struk belanja mikro guna menekan *gas fee* di jaringan utama[cite: 94, 137].
* [cite_start]**Autonomous Cross-Referencer:** Pengembangan AI Oracle yang dapat melakukan *web scraping* otomatis ke e-Katalog nasional demi mendeteksi adanya penggelembungan harga (*markup*) sebelum data masuk ke blockchain[cite: 86, 88].