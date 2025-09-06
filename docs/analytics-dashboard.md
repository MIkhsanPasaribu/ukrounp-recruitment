# Advanced Analytics Dashboard

## Overview

Fitur Advanced Analytics Dashboard menyediakan insight mendalam tentang proses rekrutmen dengan visualisasi interaktif, analisis funnel, dan kemampuan export data.

## Features

### 📊 Real-time Analytics

- **Overview Statistics**: Total aplikasi, wawancara selesai, diterima, skor rata-rata
- **Status Distribution**: Pie chart distribusi status aplikasi
- **Faculty Breakdown**: Bar chart aplikasi per fakultas
- **Education Level**: Distribusi tingkat pendidikan
- **Gender Analysis**: Analisis demografi gender

### 📈 Advanced Analysis

- **Skills Analysis**: Top 10 skill yang disebutkan pelamar
- **Interviewer Performance**: Performa interviewer berdasarkan sesi dan skor
- **Timeline Trends**: Tren aplikasi dalam 30 hari terakhir
- **Conversion Funnel**: Analisis konversi dari aplikasi hingga penerimaan

### 🔍 Filtering & Export

- **Date Range Filtering**: Filter berdasarkan rentang tanggal
- **Faculty Filtering**: Filter berdasarkan fakultas
- **CSV Export**: Export semua data analytics ke format CSV
- **Real-time Refresh**: Refresh data secara manual

## Technical Implementation

### File Structure

```
src/
├── components/
│   ├── charts/
│   │   └── Charts.tsx              # Reusable chart components
│   └── dashboard/
│       └── AnalyticsDashboard.tsx  # Main dashboard component
├── hooks/
│   └── useAnalytics.ts             # Custom hook for analytics data
├── types/
│   └── analytics.ts                # TypeScript interfaces
├── app/
│   ├── admin/
│   │   └── analytics/
│   │       └── page.tsx            # Analytics page route
│   └── api/
│       └── admin/
│           └── analytics/
│               └── route.ts        # Analytics API endpoint
```

### API Endpoint

**GET** `/api/admin/analytics`

Query parameters:

- `dateFrom` (optional): Start date filter (YYYY-MM-DD)
- `dateTo` (optional): End date filter (YYYY-MM-DD)
- `faculty` (optional): Faculty filter

Response:

```json
{
  "success": true,
  "data": {
    "overview": {
      /* Overview statistics */
    },
    "facultyBreakdown": {
      /* Faculty distribution */
    },
    "statusBreakdown": {
      /* Status distribution */
    },
    "educationBreakdown": {
      /* Education level distribution */
    },
    "genderBreakdown": {
      /* Gender distribution */
    },
    "skillsAnalysis": {
      /* Skills analysis */
    },
    "interviewerPerformance": {
      /* Interviewer performance */
    },
    "timeline": {
      /* Timeline data */
    },
    "conversionFunnel": {
      /* Conversion funnel */
    },
    "metadata": {
      /* Filter info and timestamp */
    }
  }
}
```

### Chart Components

#### CustomPieChart

Pie chart dengan tooltip dan legend untuk distribusi data.

```tsx
<CustomPieChart
  title="Status Distribution"
  data={[
    { name: "Diterima", value: 50 },
    { name: "Ditolak", value: 30 },
    { name: "Sedang Ditinjau", value: 20 },
  ]}
  colors={["#8884d8", "#82ca9d", "#ffc658"]}
/>
```

#### CustomBarChart

Bar chart untuk perbandingan data kategorikal.

```tsx
<CustomBarChart
  title="Applications by Faculty"
  data={[
    { name: "Engineering", value: 100 },
    { name: "Science", value: 80 },
    { name: "Business", value: 60 },
  ]}
  color="#82ca9d"
/>
```

#### TimelineChart

Multi-line chart untuk menampilkan tren temporal.

```tsx
<TimelineChart
  title="Application Timeline"
  data={[
    { date: "2024-01-01", applications: 10, interviews: 5, accepted: 2 },
    { date: "2024-01-02", applications: 15, interviews: 8, accepted: 3 },
  ]}
/>
```

#### FunnelChart

Custom funnel visualization dengan conversion rates.

```tsx
<FunnelChart
  title="Recruitment Funnel"
  data={{
    applied: 1000,
    interview_scheduled: 500,
    interview_completed: 400,
    accepted: 100,
    conversion_rates: {
      application_to_interview: "50.00",
      interview_to_completion: "80.00",
      completion_to_acceptance: "25.00",
    },
  }}
/>
```

### Custom Hook: useAnalytics

```tsx
const { data, loading, error, refetch } = useAnalytics({
  dateFrom: "2024-01-01",
  dateTo: "2024-12-31",
  faculty: "Engineering",
});
```

### Export Functionality

```tsx
const { exportToCSV, exporting } = useAnalyticsExport();

const handleExport = async () => {
  await exportToCSV(data, "recruitment-analytics");
};
```

## Integration dengan Admin Panel

Dashboard analytics terintegrasi dengan admin panel sebagai tab terpisah:

1. **Tab Navigation**: Tambahan tab "Advanced Analytics" di admin panel
2. **Access Control**: Hanya admin yang bisa mengakses analytics
3. **Responsive Design**: Optimized untuk desktop dan mobile
4. **Real-time Data**: Data selalu update berdasarkan database terbaru

## Access & Navigation

1. Login sebagai admin di `/admin`
2. Klik tab "Advanced Analytics"
3. Gunakan filter untuk menyaring data
4. Klik "Export CSV" untuk download data
5. Klik "Refresh" untuk update data terbaru

## Performance Considerations

- **Database Optimization**: Query teroptimasi untuk performa
- **Caching**: Data di-cache untuk menghindari query berulang
- **Lazy Loading**: Chart components dimuat sesuai kebutuhan
- **Error Handling**: Robust error handling untuk stabilitas
- **Mobile Responsive**: Optimized untuk berbagai ukuran layar

## Future Enhancements

- Real-time updates dengan WebSocket
- Advanced filtering (multiple selections)
- Custom date range picker
- PDF export functionality
- Email scheduling untuk report otomatis
- Drill-down analysis per faculty/interviewer
- Predictive analytics dengan machine learning

## Dependencies

- **Recharts**: Chart visualization library
- **React**: Component framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Supabase**: Database queries
- **Next.js**: API routes dan SSR

---

**Note**: Fitur ini tidak mengubah database schema dan menggunakan data existing dari tabel `applicants`, `interview_sessions`, dan `interviewers`.
