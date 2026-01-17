export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  paidDate?: string;
  paidAmount?: number;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Travel'
  | 'Software'
  | 'Office'
  | 'Marketing'
  | 'Professional Services'
  | 'Contractor Payment'
  | 'Other';

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  isContractorPayment: boolean;
  contractorName?: string;
  receiptImage?: string;
  createdAt: string;
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  taxId?: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  quarterlyRevenue: number;
  ytdRevenue: number;
  outstandingAmount: number;
  totalExpenses: number;
  monthlyExpenses: number;
  profitLoss: number;
  overdueInvoices: number;
  contractorPayments: number;
}

export interface TaxReport {
  period: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  incomeByClient: { clientName: string; amount: number }[];
  totalExpenses: number;
  expensesByCategory: { category: string; amount: number }[];
  netProfit: number;
  contractorPayments: {
    contractorName: string;
    totalPaid: number;
    paymentCount: number;
  }[];
}
