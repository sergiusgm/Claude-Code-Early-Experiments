import type { Invoice, Expense, DashboardMetrics, TaxReport } from '../types';

export function calculateDashboardMetrics(
  invoices: Invoice[],
  expenses: Expense[]
): DashboardMetrics {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate quarter
  const currentQuarter = Math.floor(currentMonth / 3);
  const quarterStartMonth = currentQuarter * 3;

  // Filter paid invoices
  const paidInvoices = invoices.filter((inv) => inv.status === 'Paid');

  // Total revenue (all paid invoices)
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Monthly revenue
  const monthlyRevenue = paidInvoices
    .filter((inv) => {
      const invDate = new Date(inv.paidDate || inv.date);
      return (
        invDate.getMonth() === currentMonth &&
        invDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, inv) => sum + inv.total, 0);

  // Quarterly revenue
  const quarterlyRevenue = paidInvoices
    .filter((inv) => {
      const invDate = new Date(inv.paidDate || inv.date);
      const invMonth = invDate.getMonth();
      return (
        invMonth >= quarterStartMonth &&
        invMonth < quarterStartMonth + 3 &&
        invDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, inv) => sum + inv.total, 0);

  // YTD revenue
  const ytdRevenue = paidInvoices
    .filter((inv) => {
      const invDate = new Date(inv.paidDate || inv.date);
      return invDate.getFullYear() === currentYear;
    })
    .reduce((sum, inv) => sum + inv.total, 0);

  // Outstanding amount
  const outstandingAmount = invoices
    .filter((inv) => inv.status === 'Sent' || inv.status === 'Overdue')
    .reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0);

  // Total expenses
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Monthly expenses
  const monthlyExpenses = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  // Profit/Loss
  const profitLoss = totalRevenue - totalExpenses;

  // Overdue invoices count
  const overdueInvoices = invoices.filter((inv) => {
    if (inv.status !== 'Sent' && inv.status !== 'Overdue') return false;
    const dueDate = new Date(inv.dueDate);
    return dueDate < now;
  }).length;

  // Contractor payments
  const contractorPayments = expenses
    .filter((exp) => exp.isContractorPayment)
    .reduce((sum, exp) => sum + exp.amount, 0);

  return {
    totalRevenue,
    monthlyRevenue,
    quarterlyRevenue,
    ytdRevenue,
    outstandingAmount,
    totalExpenses,
    monthlyExpenses,
    profitLoss,
    overdueInvoices,
    contractorPayments,
  };
}

export function generateTaxReport(
  invoices: Invoice[],
  expenses: Expense[],
  startDate: string,
  endDate: string
): TaxReport {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Filter invoices in date range (using paid date or invoice date)
  const relevantInvoices = invoices.filter((inv) => {
    if (inv.status !== 'Paid') return false;
    const date = new Date(inv.paidDate || inv.date);
    return date >= start && date <= end;
  });

  // Filter expenses in date range
  const relevantExpenses = expenses.filter((exp) => {
    const date = new Date(exp.date);
    return date >= start && date <= end;
  });

  // Calculate total income
  const totalIncome = relevantInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Income by client
  const incomeByClientMap = new Map<string, number>();
  relevantInvoices.forEach((inv) => {
    const current = incomeByClientMap.get(inv.clientName) || 0;
    incomeByClientMap.set(inv.clientName, current + inv.total);
  });
  const incomeByClient = Array.from(incomeByClientMap.entries()).map(
    ([clientName, amount]) => ({ clientName, amount })
  );

  // Calculate total expenses
  const totalExpenses = relevantExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Expenses by category
  const expensesByCategoryMap = new Map<string, number>();
  relevantExpenses.forEach((exp) => {
    const current = expensesByCategoryMap.get(exp.category) || 0;
    expensesByCategoryMap.set(exp.category, current + exp.amount);
  });
  const expensesByCategory = Array.from(expensesByCategoryMap.entries()).map(
    ([category, amount]) => ({ category, amount })
  );

  // Net profit
  const netProfit = totalIncome - totalExpenses;

  // Contractor payments for 1099
  const contractorPaymentsMap = new Map<
    string,
    { totalPaid: number; paymentCount: number }
  >();
  relevantExpenses
    .filter((exp) => exp.isContractorPayment && exp.contractorName)
    .forEach((exp) => {
      const name = exp.contractorName!;
      const current = contractorPaymentsMap.get(name) || {
        totalPaid: 0,
        paymentCount: 0,
      };
      contractorPaymentsMap.set(name, {
        totalPaid: current.totalPaid + exp.amount,
        paymentCount: current.paymentCount + 1,
      });
    });
  const contractorPayments = Array.from(contractorPaymentsMap.entries()).map(
    ([contractorName, data]) => ({
      contractorName,
      ...data,
    })
  );

  return {
    period: `${startDate} to ${endDate}`,
    startDate,
    endDate,
    totalIncome,
    incomeByClient,
    totalExpenses,
    expensesByCategory,
    netProfit,
    contractorPayments,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getNextInvoiceNumber(invoices: Invoice[]): string {
  if (invoices.length === 0) return 'INV-001';

  const numbers = invoices
    .map((inv) => {
      const match = inv.invoiceNumber.match(/INV-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  const maxNumber = Math.max(...numbers, 0);
  return `INV-${String(maxNumber + 1).padStart(3, '0')}`;
}
