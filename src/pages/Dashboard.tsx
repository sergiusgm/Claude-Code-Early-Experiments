import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar,
  ArrowRight,
  Receipt,
  BarChart3,
} from 'lucide-react';
import type { DashboardMetrics, Invoice } from '../types';
import { getInvoices, getExpenses } from '../utils/storage';
import { calculateDashboardMetrics, formatCurrency, formatDate } from '../utils/calculations';

interface MetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  color?: string;
}

function MetricCard({ title, value, icon, trend, color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && <p className="text-sm text-gray-500 mt-1">{trend}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [upcomingInvoices, setUpcomingInvoices] = useState<Invoice[]>([]);
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const invoices = getInvoices();
    const expenses = getExpenses();
    const calculatedMetrics = calculateDashboardMetrics(invoices, expenses);
    setMetrics(calculatedMetrics);

    // Get upcoming invoices (due in next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcoming = invoices
      .filter((inv) => {
        if (inv.status !== 'Sent' && inv.status !== 'Overdue') return false;
        const dueDate = new Date(inv.dueDate);
        return dueDate >= now && dueDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
    setUpcomingInvoices(upcoming);

    // Get overdue invoices
    const overdue = invoices
      .filter((inv) => {
        if (inv.status !== 'Sent' && inv.status !== 'Overdue') return false;
        const dueDate = new Date(inv.dueDate);
        return dueDate < now;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
    setOverdueInvoices(overdue);
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Monthly Revenue"
          value={formatCurrency(metrics.monthlyRevenue)}
          icon={<DollarSign size={24} />}
          trend={`YTD: ${formatCurrency(metrics.ytdRevenue)}`}
          color="blue"
        />
        <MetricCard
          title="Outstanding Amount"
          value={formatCurrency(metrics.outstandingAmount)}
          icon={<TrendingUp size={24} />}
          trend={`${metrics.overdueInvoices} overdue`}
          color="yellow"
        />
        <MetricCard
          title="Monthly Expenses"
          value={formatCurrency(metrics.monthlyExpenses)}
          icon={<Receipt size={24} />}
          trend={`Total: ${formatCurrency(metrics.totalExpenses)}`}
          color="red"
        />
        <MetricCard
          title="Profit/Loss"
          value={formatCurrency(metrics.profitLoss)}
          icon={<BarChart3 size={24} />}
          trend={metrics.profitLoss >= 0 ? 'Profitable' : 'Loss'}
          color={metrics.profitLoss >= 0 ? 'green' : 'red'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Invoices */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Upcoming Due Dates
            </h2>
            <Link
              to="/invoices"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>

          {upcomingInvoices.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming invoices</p>
          ) : (
            <div className="space-y-3">
              {upcomingInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {invoice.clientName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {invoice.invoiceNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(invoice.total)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Invoices */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-600" />
              Overdue Invoices
            </h2>
            <Link
              to="/invoices"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>

          {overdueInvoices.length === 0 ? (
            <p className="text-gray-500 text-sm">No overdue invoices</p>
          ) : (
            <div className="space-y-3">
              {overdueInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle size={18} className="text-red-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {invoice.clientName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {invoice.invoiceNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(invoice.total)}
                    </p>
                    <p className="text-sm text-red-600">
                      Due: {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
