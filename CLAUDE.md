# CLAUDE.md — ConsultTrack

A reference for AI assistants working in this repository.

## Project Overview

**ConsultTrack** is a local-first business management SPA for independent consultants. All data is persisted exclusively in the browser's `localStorage` — there is no backend, no authentication, and no network calls at runtime.

- **App name:** ConsultTrack (`package.json` name: `consulttrack`)
- **Version:** 1.0 (MVP)
- **Stack:** React 19 + TypeScript + Vite + TailwindCSS v4

---

## Repository Structure

```
/
├── src/
│   ├── App.tsx              # BrowserRouter + route declarations
│   ├── main.tsx             # React entry point (ReactDOM.createRoot)
│   ├── index.css            # Global CSS (Tailwind directives)
│   ├── assets/              # Static assets (react.svg)
│   ├── components/
│   │   └── Layout.tsx       # Sidebar nav + main content wrapper
│   ├── pages/               # One file per route
│   │   ├── Dashboard.tsx    # Key metrics overview
│   │   ├── Clients.tsx      # Client CRUD
│   │   ├── Invoices.tsx     # Invoice creation, status, PDF export
│   │   ├── Expenses.tsx     # Expense entry and filtering
│   │   ├── Reports.tsx      # Tax / P&L / 1099 reports + CSV export
│   │   └── Settings.tsx     # Business profile management
│   ├── types/
│   │   └── index.ts         # All shared TypeScript interfaces/types
│   └── utils/
│       ├── storage.ts       # localStorage CRUD for all entities
│       ├── calculations.ts  # Business logic (metrics, tax reports, formatting)
│       ├── pdfGenerator.ts  # jsPDF invoice PDF generation
│       └── dataBackup.ts    # JSON export/import and data wipe
├── public/                  # Static public assets
├── index.html               # Vite HTML entry
├── vite.config.ts           # Vite config (React plugin only)
├── tailwind.config.js       # Tailwind config
├── postcss.config.js        # PostCSS config
├── tsconfig.json            # Project-level TS config
├── tsconfig.app.json        # App compiler options (strict mode)
├── tsconfig.node.json       # Node/Vite compiler options
├── eslint.config.js         # ESLint flat config
└── serve.js                 # Simple static file server for production preview
```

---

## Core Data Model (`src/types/index.ts`)

| Type | Key Fields |
|---|---|
| `Client` | `id`, `name`, `email`, `phone`, `address`, `createdAt` |
| `Invoice` | `id`, `invoiceNumber` (INV-NNN), `clientId`, `lineItems[]`, `subtotal`, `tax`, `total`, `status` |
| `InvoiceStatus` | `'Draft' \| 'Sent' \| 'Paid' \| 'Overdue'` |
| `InvoiceLineItem` | `description`, `quantity`, `rate`, `amount` |
| `Expense` | `id`, `date`, `amount`, `category`, `isContractorPayment`, `contractorName?`, `receiptImage?` |
| `ExpenseCategory` | `'Travel' \| 'Software' \| 'Office' \| 'Marketing' \| 'Professional Services' \| 'Contractor Payment' \| 'Other'` |
| `BusinessProfile` | `businessName`, `ownerName`, `email`, `phone`, `address`, `logo?`, `taxId?` |
| `DashboardMetrics` | Revenue (total/monthly/quarterly/YTD), outstanding, expenses, profitLoss, overdueInvoices |
| `TaxReport` | Period, incomeByClient[], expensesByCategory[], contractorPayments[], netProfit |

---

## Storage Layer (`src/utils/storage.ts`)

All persistence goes through this module. The `localStorage` keys are:

| Key | Entity |
|---|---|
| `consulttrack_clients` | `Client[]` |
| `consulttrack_invoices` | `Invoice[]` |
| `consulttrack_expenses` | `Expense[]` |
| `consulttrack_business_profile` | `BusinessProfile` |

**Patterns to follow:**
- Read: `getClients()`, `getInvoices()`, `getExpenses()`, `getBusinessProfile()`
- Write: `saveClients()`, `saveInvoices()`, `saveExpenses()`, `saveBusinessProfile()`
- CRUD helpers: `addX()`, `updateX(id, updated)`, `deleteX(id)`, `getXById(id)`
- ID generation: always use `generateId()` from `storage.ts` (returns `"${Date.now()}-${random}"`)
- Never access `localStorage` directly from pages or components — always go through `storage.ts`

---

## Business Logic (`src/utils/calculations.ts`)

Key exported functions:

- `calculateDashboardMetrics(invoices, expenses)` → `DashboardMetrics`
  - Revenue uses `paidDate` if set, falls back to `date`
  - Outstanding = invoices with status `Sent` or `Overdue`, minus any partial `paidAmount`
- `generateTaxReport(invoices, expenses, startDate, endDate)` → `TaxReport`
  - Only counts invoices with `status === 'Paid'`
  - Groups income by `clientName`, expenses by `category`
  - 1099 tracking: contractor payments require `isContractorPayment === true` and a `contractorName`
- `formatCurrency(amount)` → USD string via `Intl.NumberFormat`
- `formatDate(date)` → locale string (`en-US`, e.g. "Jan 1, 2025")
- `getNextInvoiceNumber(invoices)` → `"INV-NNN"` (3-digit zero-padded, max+1)

---

## Routing (`src/App.tsx`)

| Path | Component |
|---|---|
| `/` | `Dashboard` |
| `/clients` | `Clients` |
| `/invoices` | `Invoices` |
| `/expenses` | `Expenses` |
| `/reports` | `Reports` |
| `/settings` | `Settings` |

The `Layout` component wraps all routes and renders the sidebar navigation. Active route is determined by `useLocation().pathname` with exact match.

---

## PDF Generation (`src/utils/pdfGenerator.ts`)

- Uses `jsPDF` (v4)
- `generateInvoicePDF(invoice, businessProfile)` — renders business header, invoice metadata, line items table, totals, notes, and payment status
- Saved as `Invoice-{invoiceNumber}.pdf` via browser download
- Page overflow handled: new page added when `yPos > 270`
- Colors: primary blue `[37, 99, 235]`, text gray `[31, 41, 55]`

---

## Data Backup (`src/utils/dataBackup.ts`)

- `exportAllData()` → JSON string of `DataBackup` (version, exportDate, all entities)
- `downloadBackup()` → triggers browser file download as `consulttrack-backup-YYYY-MM-DD.json`
- `importData(jsonData)` → validates structure, then overwrites all `localStorage` entries
- `clearAllData()` → `confirm()` dialog → `localStorage.clear()` → `window.location.reload()`

---

## Development Commands

```bash
npm run dev        # Start Vite dev server (http://localhost:5173)
npm run build      # TypeScript type-check + Vite production build → dist/
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

No test runner is configured. There are no test files in this project.

---

## TypeScript Configuration

`tsconfig.app.json` uses **strict mode** with additional checks:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedSideEffectImports: true`
- `erasableSyntaxOnly: true` (no legacy TS-only syntax like `const enum`)
- Target: `ES2022`, module: `ESNext`, JSX: `react-jsx`

Use `import type` for type-only imports (`verbatimModuleSyntax` is enabled and will error otherwise).

---

## ESLint Configuration

Flat config (`eslint.config.js`) applying to `**/*.{ts,tsx}`:
- `@eslint/js` recommended
- `typescript-eslint` recommended
- `eslint-plugin-react-hooks` (hooks rules)
- `eslint-plugin-react-refresh` (Vite HMR safety)
- `dist/` is globally ignored

---

## Styling Conventions

- **TailwindCSS v4** with PostCSS
- Layout uses a fixed 64 (w-64) sidebar + flex-1 main content area
- Color palette: blue-600 (`#2563EB`) as primary; gray-50/100/700/800 for surfaces and text
- No custom CSS classes — use Tailwind utility classes directly
- No CSS modules or styled-components

---

## Key Conventions for AI Assistants

1. **No backend** — never add API calls, server-side logic, or authentication.
2. **Storage isolation** — all data access must go through `src/utils/storage.ts`. Never call `localStorage` directly from components or pages.
3. **Type safety** — all new data structures must be defined in `src/types/index.ts`. Use `import type` for type-only imports.
4. **No new dependencies without good reason** — the dependency list is intentionally minimal.
5. **No test infrastructure** — do not add test files or testing libraries unless explicitly asked.
6. **Single-file pages** — each route maps to one file in `src/pages/`. Keep components in `src/components/` only if reused across multiple pages.
7. **Invoice numbers** — always use `getNextInvoiceNumber()` from `calculations.ts`; never generate them manually.
8. **IDs** — always use `generateId()` from `storage.ts`.
9. **Currency/date formatting** — always use `formatCurrency()` and `formatDate()` from `calculations.ts` for display.
10. **Contractor 1099 tracking** — expenses with `isContractorPayment: true` must also have a `contractorName` to appear in tax reports.
