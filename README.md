# Suitmedia Frontend Test — Ideas List Page

Halaman web **Ideas** interaktif dan responsif yang dibangun menggunakan **React**, **Vite**, dan **Vanilla CSS** sesuai dengan spesifikasi dan desain acuan dari Suitmedia.

---

## 🚀 Fitur & Spesifikasi yang Diimplementasikan

### 1. 🔝 Header Interaktif
- **Fixed Position**: Tetap di bagian atas halaman saat scroll.
- **Scroll Behavior**: Otomatis menghilang saat user scroll ke bawah (setelah 80px) dan muncul kembali saat user scroll ke atas.
- **Semi-Transparent Background**: Efek *backdrop-filter blur* dan *transparansi* `#FF6700` saat di-scroll.
- **Active State**: Indikator menu aktif ("Ideas") dengan underline putih tebal.
- **Mobile Responsive Drawer**: Menu hamburger interaktif untuk layar mobile/tablet.

### 2. 🖼️ Banner dengan Parallax & Area Miring
- **Area Miring (Slant)**: Dibuat secara murni menggunakan CSS `clip-path: polygon(...)` sehingga gambar banner dapat diganti via CMS tanpa perlu mengedit file gambarnya secara manual.
- **Efek Parallax**: Gambar banner bergerak pada kecepatan `0.35x` scroll dan teks bergerak pada kecepatan `0.12x` scroll untuk memberikan kedalaman visual (*depth effect*).

### 3. 📋 List Post (Idea Cards)
- **Responsive Layout Grid**:
  - Desktop (>1100px): **4 Kolom**
  - Tablet (768px - 1100px): **3 Kolom**
  - Mobile Small (<768px): **2 Kolom** / **1 Kolom**
- **Ratio Thumbnail Konsisten**: `aspect-ratio: 16/9` di seluruh kartu.
- **Title Clamp 3 Baris**: Judul post dibatasi maksimal 3 baris dengan efek *ellipsis* (`-webkit-line-clamp: 3`).
- **Lazy Loading**: Atribut `loading="lazy"` diterapkan pada seluruh gambar kartu untuk mengoptimalkan performa pemuatan.
- **Visual Alternating Fallback**: Kartu secara otomatis bergantian menampilkan gambar opsional berkualitas tinggi bila gambar dari API tidak tersedia.

### 4. ⚙️ Kontrol & Persistence State
- **Sort Options**: Berdasarkan terbaru (`-published_at`) dan terlama (`published_at`).
- **Show Per Page Options**: `[10, 20, 50]` item per halaman.
- **Status Item Count**: Menampilkan indikator jangkauan data yang sedang ditampilkan (contoh: *Showing 1 - 10 of 274*).
- **URL State Persistence**: Query parameter (`?page=1&perPage=10&sort=-published_at`) otomatis tersimpan dan diperbarui di URL browser. Saat halaman di-refresh, state tidak akan kembali ke awal.
- **Custom Pagination**: Navigasi halaman lengkap dengan tombol First (`«`), Prev (`‹`), Next (`›`), Last (`»`), serta indicator active berupa lingkaran oranye khas Suitmedia.

### 5. 🔌 API & Proxy Setup
- Menggunakan Proxy Vite untuk menghindari kendala CORS dan proxying request ke backend Suitmedia.
- **Endpoint**: `/api/ideas` -> `https://suitmedia-backend.suitdev.com/api/ideas`
- **Parameters**: `page[number]`, `page[size]`, `append[]=small_image`, `append[]=medium_image`, `sort`.

---

## 🛠️ Teknologi yang Digunakan

- **React 18** (Functional Components, Hooks: `useState`, `useEffect`, `useCallback`, `useRef`)
- **Vite 5** (Build Tool & Dev Server with API Proxy)
- **Vanilla CSS3** (CSS Grid, Flexbox, Custom Variables, Animations, Clip-Path, Backdrop Filter)
- **Google Fonts** (Inter Font Family)

---

## 📦 Panduan Jalankan Secara Lokal

### Prerequisites
- Node.js versi 18+ atau yang terbaru
- npm (Node Package Manager)

### Langkah Pemasangan

1. **Clone Repository**
   ```bash
   git clone https://github.com/bagja1001/suitmedia-test-mifta-subagja.git
   cd suitmedia-test-mifta-subagja
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Jalankan Server Development**
   ```bash
   npm run dev
   ```

4. **Buka Aplikasi di Browser**
   Buka `http://localhost:3000` pada browser Anda.

---

## 🏗️ Build Produksi

Untuk membuat bundle produksi yang dioptimasi:

```bash
npm run build
```

File output produksi akan tersedia di dalam folder `dist/`.

---

## 📝 Lisensi & Hak Cipta
Dibuat untuk keperluan **Frontend Developer Test — Suitmedia**.
