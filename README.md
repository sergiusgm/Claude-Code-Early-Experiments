# ConsultTrack

**Business Management App for Independent Consultants**

ConsultTrack is a lightweight, local-first business management application designed specifically for independent consultants and small consulting teams. It helps you manage invoices, track expenses, and generate tax reports - all without sending your data to the cloud.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Core Features (MVP - P0)

✅ **Dashboard with Key Metrics**
- Revenue summary (monthly, quarterly, YTD)
- Outstanding invoices and amounts due
- Expense totals by category
- Profit/loss indicator
- Upcoming invoice due dates

✅ **Invoice Creation and Management**
- Professional invoice creation with business branding
- Client management (store client info for reuse)
- Line items with descriptions, quantities, and rates
- Automatic calculations (subtotals, taxes)
- Status tracking (Draft, Sent, Paid, Overdue)
- PDF export functionality
- Payment recording with partial payment support

✅ **Expense Tracking**
- Quick expense entry with date, amount, category, and description
- Receipt photo upload and storage
- Predefined categories (Travel, Software, Office, Marketing, Professional Services, etc.)
- Contractor payment tracking with 1099 flagging
- Filter expenses by category

✅ **Tax Reporting**
- Income summary by client and period
- Expense breakdown by category
- Profit and loss statement
- 1099 contractor summary report
- Export to CSV for accountant

✅ **Client Management**
- Store client contact information
- Quick client selection for invoices
- Edit and delete clients

✅ **Settings & Business Profile**
- Business name, owner name, and contact information
- Business logo upload
- Tax ID/EIN storage

## Technology Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Routing:** React Router v6
- **PDF Generation:** jsPDF
- **Icons:** Lucide React
- **Data Storage:** Local Storage (browser-based, no cloud)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd consulttrack
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory. You can serve them using any static file server.

To preview the production build locally:

```bash
npm run preview
```

## Usage Guide

### First-Time Setup

1. **Configure Business Profile**
   - Navigate to Settings
   - Enter your business name, contact information, and address
   - Upload your business logo (optional)
   - Save your profile

2. **Add Clients**
   - Go to the Clients page
   - Click "Add Client"
   - Enter client details (name, email, phone, address)
   - Save the client

### Creating an Invoice

1. Navigate to the Invoices page
2. Click "Create Invoice"
3. Select a client from the dropdown
4. Set invoice date and due date
5. Add line items (description, quantity, rate)
6. Add tax amount if applicable
7. Add notes (optional)
8. Click "Create Invoice"

The invoice will be saved as a Draft. You can:
- Mark it as "Sent" when you send it to the client
- Mark it as "Paid" when you receive payment
- Download it as a PDF
- Edit or delete it

### Tracking Expenses

1. Go to the Expenses page
2. Click "Add Expense"
3. Enter the date and amount
4. Select a category
5. Add a description
6. Upload a receipt image (optional)
7. Check "contractor payment" if it's a 1099 payment
8. Save the expense

### Generating Tax Reports

1. Navigate to the Reports page
2. Select report type:
   - Tax Report (complete)
   - Profit & Loss Statement
   - 1099 Contractor Summary
3. Set the date range (or use quick filters)
4. Click "Generate Report"
5. Export to CSV to share with your accountant

## Data Storage

**Important:** All your data is stored locally in your browser's Local Storage. This means:

✅ **Privacy:** Your data never leaves your computer
✅ **No Login Required:** No account creation or authentication needed
✅ **Offline Access:** Works completely offline once loaded

⚠️ **Backup Considerations:**
- Data is tied to your browser and device
- Clearing browser data will delete all information
- Consider exporting reports regularly as backups
- To transfer data to another device, you'll need to manually recreate entries

## Project Structure

```
consulttrack/
├── src/
│   ├── components/       # Reusable UI components
│   │   └── Layout.tsx   # Main layout with navigation
│   ├── pages/           # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Clients.tsx
│   │   ├── Invoices.tsx
│   │   ├── Expenses.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── storage.ts        # Local storage operations
│   │   ├── calculations.ts   # Business calculations
│   │   └── pdfGenerator.ts   # PDF export functionality
│   ├── App.tsx          # Main app component with routing
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html          # HTML entry point
└── package.json        # Dependencies and scripts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Future Enhancements (Post-MVP)

- Invoice templates for recurring work
- Bank account integration for transaction import
- Payment processor integration (Stripe, PayPal)
- Accounting software export (QuickBooks, Xero)
- Calendar integration for billing reminders
- Time tracking functionality
- Multi-currency support
- Native mobile apps
- Data export/import for backup and migration

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## Acknowledgments

Built with modern web technologies to provide a fast, reliable, and privacy-focused business management solution for independent consultants.

---

**Version:** 1.0
**Last Updated:** January 2026
**Status:** MVP Release
