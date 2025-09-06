# Perbaikan Software PDF Generator

## Masalah yang Diperbaiki

Sebelumnya, ketika user memilih banyak software di form pendaftaran, teks pada bagian "Software yang dikuasai" di PDF akan melampaui margin kanan halaman sehingga teks terpotong atau tidak terbaca dengan baik.

## Solusi yang Diterapkan

### 1. Perbaikan Text Wrapping untuk Software Section

Di file `src/utils/pdfGeneratorJsPDF.ts`:

- **Sebelum**: Menggunakan `doc.text()` langsung tanpa mempertimbangkan lebar halaman
- **Sesudah**: Menggunakan `doc.splitTextToSize()` untuk membagi teks menjadi beberapa baris jika melampaui lebar yang tersedia

```typescript
// Menghitung lebar yang tersedia
const availableWidth = 210 - (leftMargin + labelWidth + 5) - rightMargin;

// Membagi teks agar sesuai dengan lebar
const textLines = doc.splitTextToSize(softwareText, availableWidth);

// Menambahkan setiap baris teks
for (let i = 0; i < textLines.length; i++) {
  doc.text(
    textLines[i],
    leftMargin + labelWidth + 5,
    yPosition + i * lineHeight
  );
}

// Update posisi Y berdasarkan jumlah baris yang digunakan
yPosition += textLines.length * lineHeight;
```

### 2. Perbaikan Helper Function addField

Memperbaiki fungsi `addField` agar semua field form juga dapat menangani teks panjang dengan text wrapping:

```typescript
const addField = (label: string, value: string, currentY: number) => {
  doc.text(label, leftMargin, currentY);
  doc.text(":", leftMargin + labelWidth, currentY);

  if (value && value.trim() !== "") {
    // Menghitung lebar yang tersedia untuk value text
    const availableWidth = 210 - (leftMargin + labelWidth + 5) - rightMargin;

    // Membagi teks agar sesuai dengan lebar
    const textLines = doc.splitTextToSize(value, availableWidth);

    // Menambahkan setiap baris teks
    for (let i = 0; i < textLines.length; i++) {
      doc.text(
        textLines[i],
        leftMargin + labelWidth + 5,
        currentY + i * lineHeight
      );
    }

    // Return posisi setelah semua baris
    return currentY + textLines.length * lineHeight;
  } else {
    doc.text("-", leftMargin + labelWidth + 5, currentY);
    return currentY + lineHeight;
  }
};
```

### 3. Konsistensi Margin untuk Text Area

Memperbaiki bagian text area agar menggunakan perhitungan margin yang konsisten:

```typescript
// Menggunakan margin yang konsisten
const boxWidth = 210 - leftMargin - rightMargin;
doc.rect(leftMargin, currentY - 3, boxWidth, 15);
```

## Hasil Perbaikan

1. **Text Wrapping Otomatis**: Ketika user memilih banyak software, teks akan secara otomatis pindah ke baris baru jika melampaui margin kanan
2. **Konsistensi Layout**: Semua field form kini menggunakan perhitungan margin yang konsisten
3. **Responsif**: PDF tetap rapi dan terbaca meskipun ada teks yang panjang
4. **Tidak Ada Teks Terpotong**: Semua teks akan selalu terlihat penuh dalam margin yang benar

## Files yang Dimodifikasi

- `src/utils/pdfGeneratorJsPDF.ts`

## Testing

Build sukses tanpa error:

```bash
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (19/19)
```

## Contoh Kasus

**Sebelum**: Jika user memilih software:

- CorelDraw, Photoshop, Adobe Premiere Pro, Adobe After Effect, Autodesk Eagle, Arduino IDE, Android Studio, Visual Studio, Mission Planner, Autodesk Inventor, Autodesk AutoCAD, SolidWorks

Teks akan melampaui margin kanan dan terpotong.

**Sesudah**: Teks yang sama akan dibagi menjadi beberapa baris:

```text
Software yang dikuasai : CorelDraw, Photoshop, Adobe Premiere Pro,
                        Adobe After Effect, Autodesk Eagle, Arduino IDE,
                        Android Studio, Visual Studio, Mission Planner,
                        Autodesk Inventor, Autodesk AutoCAD, SolidWorks
```

Semua teks tetap dalam margin dan mudah dibaca.
