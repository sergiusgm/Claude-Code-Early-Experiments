import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import type { TaxReport } from '../types';
import { getInvoices, getExpenses } from '../utils/storage';
import { generateTaxReport, formatCurrency } from '../utils/calculations';

export default function Reports() {
  const [reportType, setReportType] = useState<'tax' | 'profitloss' | '1099'>('tax');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState<TaxReport | null>(null);

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    const invoices = getInvoices();
    const expenses = getExpenses();
    const generatedReport = generateTaxReport(invoices, expenses, startDate, endDate);
    setReport(generatedReport);
  };

  const handleExportCSV = () => {
    if (!report) return;

    let csv = '';

    if (reportType === 'tax' || reportType === 'profitloss') {
      csv = 'Tax Report\n';
      csv += `Period: ${report.period}\n\n`;

      csv += 'INCOME SUMMARY\n';
      csv += 'Client,Amount\n';
      report.incomeByClient.forEach((item) => {
        csv += `${item.clientName},${item.amount}\n`;
      });
      csv += `Total Income,${report.totalIncome}\n\n`;

      csv += 'EXPENSE SUMMARY\n';
      csv += 'Category,Amount\n';
      report.expensesByCategory.forEach((item) => {
        csv += `${item.category},${item.amount}\n`;
      });
      csv += `Total Expenses,${report.totalExpenses}\n\n`;

      csv += `Net Profit,${report.netProfit}\n`;
    }

    if (reportType === '1099' || reportType === 'tax') {
      csv += '\n1099 CONTRACTOR SUMMARY\n';
      csv += 'Contractor Name,Total Paid,Payment Count\n';
      report.contractorPayments.forEach((item) => {
        csv += `${item.contractorName},${item.totalPaid},${item.paymentCount}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${startDate}-to-${endDate}.csv`;
    a.click();
  };

  const getQuickDateRange = (range: 'month' | 'quarter' | 'year') => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    let start: Date;
    let end: Date;

    if (range === 'month') {
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 0);
    } else if (range === 'quarter') {
      const quarter = Math.floor(month / 3);
      start = new Date(year, quarter * 3, 1);
      end = new Date(year, quarter * 3 + 3, 0);
    } else {
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31);
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Reports</h1>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Generate Report</h2>

        <div className="space-y-4">
          <div>
            <label className="label">Report Type</label>
            <select
              className="input-field max-w-md"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
            >
              <option value="tax">Tax Report (Complete)</option>
              <option value="profitloss">Profit & Loss Statement</option>
              <option value="1099">1099 Contractor Summary</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                className="input-field"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                className="input-field"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => getQuickDateRange('month')}
              className="btn-secondary text-sm"
            >
              Current Month
            </button>
            <button
              onClick={() => getQuickDateRange('quarter')}
              className="btn-secondary text-sm"
            >
              Current Quarter
            </button>
            <button
              onClick={() => getQuickDateRange('year')}
              className="btn-secondary text-sm"
            >
              Current Year
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              className="btn-primary flex items-center gap-2"
            >
              <FileText size={20} />
              Generate Report
            </button>
            {report && (
              <button
                onClick={handleExportCSV}
                className="btn-secondary flex items-center gap-2"
              >
                <Download size={20} />
                Export to CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {report && (
        <div className="space-y-6">
          {/* Income Summary */}
          {(reportType === 'tax' || reportType === 'profitloss') && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Income Summary</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Client</th>
                      <th className="text-right py-2 px-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.incomeByClient.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-4">{item.clientName}</td>
                        <td className="py-2 px-4 text-right font-medium">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-blue-50">
                      <td className="py-2 px-4">Total Income</td>
                      <td className="py-2 px-4 text-right">
                        {formatCurrency(report.totalIncome)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Expense Summary */}
          {(reportType === 'tax' || reportType === 'profitloss') && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Expense Summary</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Category</th>
                      <th className="text-right py-2 px-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.expensesByCategory.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-4">{item.category}</td>
                        <td className="py-2 px-4 text-right font-medium">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-red-50">
                      <td className="py-2 px-4">Total Expenses</td>
                      <td className="py-2 px-4 text-right">
                        {formatCurrency(report.totalExpenses)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Profit & Loss */}
          {(reportType === 'tax' || reportType === 'profitloss') && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Profit & Loss</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Total Income</span>
                  <span className="text-green-600 font-bold">
                    {formatCurrency(report.totalIncome)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Total Expenses</span>
                  <span className="text-red-600 font-bold">
                    {formatCurrency(report.totalExpenses)}
                  </span>
                </div>
                <div
                  className={`flex justify-between py-3 text-xl font-bold ${
                    report.netProfit >= 0
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  } px-4 rounded-lg`}
                >
                  <span>Net Profit</span>
                  <span>{formatCurrency(report.netProfit)}</span>
                </div>
              </div>
            </div>
          )}

          {/* 1099 Contractor Summary */}
          {(reportType === 'tax' || reportType === '1099') && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">
                1099 Contractor Summary
              </h2>
              {report.contractorPayments.length === 0 ? (
                <p className="text-gray-500">
                  No contractor payments in this period
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Contractor Name</th>
                        <th className="text-right py-2 px-4">Total Paid</th>
                        <th className="text-right py-2 px-4">Payments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.contractorPayments.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4">{item.contractorName}</td>
                          <td className="py-2 px-4 text-right font-medium">
                            {formatCurrency(item.totalPaid)}
                          </td>
                          <td className="py-2 px-4 text-right">
                            {item.paymentCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Contractors paid $600 or more during
                      the year require a 1099-NEC form. Please consult with your
                      tax advisor for specific requirements.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
