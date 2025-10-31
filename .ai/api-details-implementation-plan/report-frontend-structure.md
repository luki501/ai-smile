# Struktura frontendu funkcjonalności raportów AI

## 📁 Struktura plików

```
src/
├── components/
│   ├── hooks/
│   │   ├── useSymptoms.tsx              [istniejący]
│   │   └── useReports.tsx               ✨ [nowy] - Hook zarządzający raportami
│   │
│   └── reports/                          ✨ [nowy katalog]
│       ├── ReportGenerator.tsx          ✨ [nowy] - Formularz generowania
│       ├── ReportsList.tsx              ✨ [nowy] - Lista z paginacją
│       ├── ReportViewer.tsx             ✨ [nowy] - Widok raportu
│       └── ReportsFilter.tsx            ✨ [nowy] - Filtr według typu
│
├── pages/
│   ├── index.astro                      🔧 [zmodyfikowany] - Dodano link do raportów
│   │
│   ├── api/
│   │   ├── reports.ts                   [istniejący] - POST & GET endpoints
│   │   └── reports/
│   │       └── [id].ts                  [istniejący] - GET & DELETE endpoint
│   │
│   └── reports/                          ✨ [nowy katalog]
│       ├── new.astro                    ✨ [nowy] - Strona generowania
│       ├── index.astro                  ✨ [nowy] - Lista raportów
│       └── [id].astro                   ✨ [nowy] - Pojedynczy raport
│
└── types.ts                              [istniejący] - Typy raportów

.ai/
├── report-post-implementation-plan.md    [istniejący] - Plan implementacji
├── report-frontend-testing-checklist.md  ✨ [nowy] - Checklist testowania
├── report-frontend-implementation-summary.md ✨ [nowy] - Podsumowanie
└── report-frontend-structure.md          ✨ [nowy] - Ten plik
```

---

## 🔄 Przepływ danych

### 1. Generowanie raportu

```
User (Browser)
    │
    │ 1. Navigate to /reports/new
    ▼
/reports/new.astro (SSR)
    │
    │ 2. Render ReportGenerator
    ▼
<ReportGenerator /> (Client)
    │
    │ 3. Select period_type
    │ 4. Click "Wygeneruj raport"
    ▼
useReports.generateReport()
    │
    │ 5. POST /api/reports
    │    { period_type: "month" }
    ▼
Backend API
    │
    │ 6. Calculate dates
    │ 7. Fetch symptoms
    │ 8. Call OpenRouter AI
    │ 9. Save to DB
    ▼
    │ 10. Return ReportDto (201)
    ▼
<ReportGenerator />
    │
    │ 11. Toast success
    │ 12. Redirect to /reports/{id}
    ▼
User sees generated report
```

---

### 2. Przeglądanie listy raportów

```
User (Browser)
    │
    │ 1. Navigate to /reports
    ▼
/reports/index.astro (SSR)
    │
    │ 2. Render ReportsList
    ▼
<ReportsList /> (Client)
    │
    │ 3. useReports() hook
    ▼
useReports.fetchReports()
    │
    │ 4. GET /api/reports?offset=0&limit=10
    ▼
Backend API
    │
    │ 5. Query DB with filters
    │ 6. Return { data: [...], count: N }
    ▼
<ReportsList />
    │
    │ 7. Render cards
    │ 8. Show pagination
    ▼
User browses reports

User interactions:
    │
    ├─> Filter by period_type
    │   └─> setFilters() → re-fetch
    │
    ├─> Change page
    │   └─> setFilters({ offset }) → re-fetch
    │
    └─> Click "Wyświetl"
        └─> Navigate to /reports/{id}
```

---

### 3. Wyświetlanie pojedynczego raportu

```
User (Browser)
    │
    │ 1. Navigate to /reports/{id}
    ▼
/reports/[id].astro (SSR)
    │
    │ 2. Check authentication
    │ 3. Validate ID
    │ 4. getReportById(supabase, id, userId)
    ▼
Backend DB
    │
    │ 5. Fetch report
    │ 6. Check authorization
    ▼
/reports/[id].astro
    │
    │ 7. Render ReportViewer with report data
    ▼
<ReportViewer /> (Client)
    │
    │ 8. Render metadata
    │ 9. ReactMarkdown renders content
    ▼
User reads report

User interactions:
    │
    ├─> Click "Usuń raport"
    │   ├─> Show AlertDialog
    │   ├─> Confirm
    │   ├─> DELETE /api/reports/{id}
    │   ├─> Toast success
    │   └─> Redirect to /reports
    │
    ├─> Click "Drukuj"
    │   └─> window.print()
    │
    └─> Click "Powrót"
        └─> Navigate to /reports
```

---

## 🎨 Komponenty UI - Hierarchia

```
Page: /reports/new
└── <Layout>
    └── <main>
        └── <ReportGenerator />
            ├── <Card>
            │   ├── <CardHeader>
            │   │   ├── <CardTitle>
            │   │   └── <CardDescription>
            │   ├── <CardContent>
            │   │   ├── <Select> (period_type)
            │   │   ├── Info section (blue)
            │   │   └── Warning section (yellow)
            │   └── <CardFooter>
            │       └── <Button> (Generate)
            └── useReports() hook

---

Page: /reports
└── <Layout>
    └── <main>
        └── <ReportsList />
            ├── Header
            │   ├── <h2> (count)
            │   └── <Button> (New report)
            ├── <ReportsFilter />
            │   ├── <Select> (period_type)
            │   └── <Button> (Clear)
            ├── Reports list
            │   └── <ReportItem /> × N
            │       └── <Card>
            │           ├── <CardHeader>
            │           ├── <CardContent>
            │           └── <Button> (View)
            └── <Pagination />
                ├── <PaginationPrevious>
                ├── <PaginationLink> × N
                └── <PaginationNext>

---

Page: /reports/{id}
└── <Layout>
    └── <main>
        └── <ReportViewer />
            ├── Header actions
            │   ├── <Button> (Back)
            │   └── <AlertDialog> (Delete)
            ├── <Card> (Metadata)
            │   ├── <CardHeader>
            │   │   ├── <CardTitle>
            │   │   └── <CardDescription>
            └── <Card> (Content)
                ├── <CardHeader>
                ├── <CardContent>
                │   └── <ReactMarkdown>
                └── <CardFooter>
                    ├── Report ID
                    └── <Button> (Print)
```

---

## 🔌 API Endpoints - Mapping

| Frontend Action | HTTP Method | Endpoint | Component | Hook Method |
|----------------|-------------|----------|-----------|-------------|
| Generate report | POST | `/api/reports` | ReportGenerator | `generateReport()` |
| List reports | GET | `/api/reports` | ReportsList | `fetchReports()` |
| View report | GET | `/api/reports/{id}` | [id].astro (SSR) | - |
| Delete report | DELETE | `/api/reports/{id}` | ReportViewer | fetch() directly |

---

## 📦 State Management

### useReports Hook State

```typescript
{
  // Data
  reports: ReportDto[]           // Lista raportów
  count: number | null           // Całkowita liczba (pagination)
  
  // UI States
  loading: boolean               // Ładowanie listy
  isGenerating: boolean          // Generowanie nowego
  error: Error | null            // Błąd
  
  // Filters & Pagination
  filters: {
    offset: number               // Paginacja offset
    limit: number                // Paginacja limit (default: 10)
    period_type?: PeriodType     // Filtr typu okresu
  }
}
```

### Component Local State

#### ReportGenerator
```typescript
selectedPeriod: PeriodType       // Wybrany okres (default: "month")
```

#### ReportViewer
```typescript
isDeleting: boolean              // Stan usuwania
```

---

## 🎯 Routing

```
/                                 → index.astro (istniejący)
                                   └─ Link: "Raporty AI" → /reports

/reports                         → reports/index.astro ✨
                                   └─ <ReportsList />
                                   
/reports/new                     → reports/new.astro ✨
                                   └─ <ReportGenerator />
                                   
/reports/{id}                    → reports/[id].astro ✨
                                   └─ <ReportViewer />
                                   
/symptoms/new                    → symptoms/new.astro (istniejący)
/symptoms/edit/{id}              → symptoms/edit/[id].astro (istniejący)
```

---

## 🔐 Authentication Flow

```
User request
    │
    ▼
Astro Middleware (src/middleware/index.ts)
    │
    ├─ Verify JWT token
    ├─ Extract user_id
    └─ Set context.locals.user
    │
    ▼
Page SSR
    │
    ├─ Check: context.locals.user exists?
    │   ├─ NO → redirect("/") or 401
    │   └─ YES → continue
    │
    ▼
Fetch data with user_id
    │
    ▼
Render page with user's data
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │ ReportGenerator│  │  ReportsList   │  │ ReportViewer │ │
│  └───────┬────────┘  └───────┬────────┘  └──────┬───────┘ │
│          │                    │                   │          │
│          └────────────┬───────┴───────────────────┘         │
│                       │                                      │
│                  ┌────▼──────┐                              │
│                  │ useReports │                              │
│                  └────┬───────┘                              │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        │ fetch()
                        │
        ┌───────────────▼────────────────┐
        │       API Routes (Astro)        │
        │                                 │
        │  POST   /api/reports           │
        │  GET    /api/reports           │
        │  GET    /api/reports/{id}      │
        │  DELETE /api/reports/{id}      │
        └───────────────┬─────────────────┘
                        │
                        │ Service Layer
                        │
        ┌───────────────▼─────────────────┐
        │   report.service.ts              │
        │                                  │
        │  - generateReport()             │
        │  - fetchReports()               │
        │  - getReportById()              │
        │  - deleteReport()               │
        │  - generateAIReport()           │
        └───────────────┬──────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │               │
         ▼              ▼               ▼
    ┌────────┐   ┌──────────┐   ┌──────────┐
    │Supabase│   │OpenRouter│   │ Helpers  │
    │   DB   │   │   API    │   │          │
    └────────┘   └──────────┘   └──────────┘
```

---

## 🚀 Performance Considerations

### Code Splitting
- ✅ `client:load` directive na komponentach React
- ✅ Lazy loading komponentów (Astro Islands)
- ✅ Chunks: ReportGenerator (3KB), ReportsList (5KB), ReportViewer (161KB)

### Bundle Size
| Component | Size | Gzipped | Notes |
|-----------|------|---------|-------|
| useReports | 1.35 KB | 0.67 KB | Hook only |
| ReportGenerator | 3.12 KB | 1.44 KB | + Select component |
| ReportsList | 5.32 KB | 2.12 KB | + Pagination |
| ReportViewer | 161 KB | 49 KB | Large due to react-markdown |

### Optimization Strategies
- ✅ Skeleton loaders (perceived performance)
- ✅ Optimistic UI updates where possible
- ✅ Debounced filter changes (implicit via React state)
- 🔄 Future: Virtual scrolling dla długich list
- 🔄 Future: Prefetching następnej strony paginacji

---

## 🎨 Styling Architecture

### Tailwind Classes
- Utility-first approach
- Responsive modifiers (sm:, md:, lg:)
- Dark mode ready (dark: prefix)

### Shadcn/ui Theme
- CSS Variables dla kolorów
- `prose` classes dla Markdown typography
- Consistent spacing (space-y-*, gap-*)

### Responsive Breakpoints
```css
sm: 640px   /* Mobile landscape, small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

---

## ✅ Checklist zgodności z guidelines

### Astro Guidelines
- [x] Używamy .astro dla stron (SSR)
- [x] `export const prerender = false` dla dynamic routes
- [x] `client:load` dla interaktywnych komponentów
- [x] Middleware dla autentykacji
- [x] Server-side data fetching w Astro frontmatter

### React Guidelines
- [x] Functional components z hooks
- [x] Brak "use client" (nie używamy Next.js)
- [x] Custom hooks w `src/components/hooks/`
- [x] React.memo() nie używane (nie jest potrzebne)
- [x] useCallback dla event handlers przekazywanych do children

### TypeScript Guidelines
- [x] Typy w `src/types.ts`
- [x] Interface dla props komponentów
- [x] Type safety w całym kodzie
- [x] Generowane typy z Supabase

### UI Guidelines
- [x] Shadcn/ui dla komponentów
- [x] Tailwind dla stylowania
- [x] Responsive design
- [x] Accessibility (ARIA)

---

## 📚 Dokumentacja

### Pliki dokumentacji
1. `report-post-implementation-plan.md` - Oryginalny plan (916 linii)
2. `report-frontend-testing-checklist.md` - Testy (500+ linii) ✨
3. `report-frontend-implementation-summary.md` - Podsumowanie (650+ linii) ✨
4. `report-frontend-structure.md` - Struktura (ten plik) ✨

### Code Documentation
- ✅ JSDoc comments na funkcjach serwisowych
- ✅ Component docstrings
- ✅ Type annotations
- ✅ Inline comments gdzie potrzebne

---

## 🎓 Dla nowych developerów

### Jak dodać nową funkcjonalność?

1. **Nowy endpoint API** → Dodaj w `src/pages/api/reports/`
2. **Nowy widok** → Dodaj w `src/pages/reports/`
3. **Nowy komponent** → Dodaj w `src/components/reports/`
4. **Nowe typy** → Dodaj w `src/types.ts`
5. **Nowy hook** → Dodaj w `src/components/hooks/`

### Przykład: Dodanie eksportu do PDF

```typescript
// 1. Backend: src/lib/services/report.service.ts
export async function exportReportToPDF(report: Report): Promise<Buffer> {
  // Implementacja
}

// 2. API: src/pages/api/reports/[id]/pdf.ts
export const GET: APIRoute = async ({ params, locals }) => {
  const pdf = await exportReportToPDF(report);
  return new Response(pdf, {
    headers: { 'Content-Type': 'application/pdf' }
  });
}

// 3. Frontend: src/components/reports/ReportViewer.tsx
const handleExportPDF = async () => {
  const response = await fetch(`/api/reports/${report.id}/pdf`);
  const blob = await response.blob();
  // Download logic
}

// 4. UI: Dodaj przycisk w ReportViewer
<Button onClick={handleExportPDF}>
  Export to PDF
</Button>
```

---

**Ostatnia aktualizacja**: 31 października 2025
**Wersja**: 1.0.0

