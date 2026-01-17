import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import type { Expense, ExpenseCategory } from '../types';
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  generateId,
} from '../utils/storage';
import { formatCurrency, formatDate } from '../utils/calculations';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Travel',
  'Software',
  'Office',
  'Marketing',
  'Professional Services',
  'Contractor Payment',
  'Other',
];

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Other' as ExpenseCategory,
    description: '',
    isContractorPayment: false,
    contractorName: '',
    receiptImage: '',
  });
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    const allExpenses = getExpenses();
    setExpenses(
      allExpenses.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const expenseData = {
      date: formData.date,
      amount,
      category: formData.category,
      description: formData.description,
      isContractorPayment: formData.isContractorPayment,
      contractorName: formData.isContractorPayment
        ? formData.contractorName
        : undefined,
      receiptImage: formData.receiptImage || undefined,
    };

    if (editingExpense) {
      const updated: Expense = {
        ...editingExpense,
        ...expenseData,
      };
      updateExpense(editingExpense.id, updated);
    } else {
      const newExpense: Expense = {
        id: generateId(),
        ...expenseData,
        createdAt: new Date().toISOString(),
      };
      addExpense(newExpense);
    }

    resetForm();
    loadExpenses();
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      date: expense.date,
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description,
      isContractorPayment: expense.isContractorPayment,
      contractorName: expense.contractorName || '',
      receiptImage: expense.receiptImage || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
      loadExpenses();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, receiptImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: 'Other',
      description: '',
      isContractorPayment: false,
      contractorName: '',
      receiptImage: '',
    });
    setEditingExpense(null);
    setIsFormOpen(false);
  };

  const filteredExpenses =
    filterCategory === 'all'
      ? expenses
      : expenses.filter((exp) => exp.category === filterCategory);

  const totalExpenses = filteredExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  const getCategoryColor = (category: ExpenseCategory) => {
    const colors: Record<ExpenseCategory, string> = {
      Travel: 'bg-blue-100 text-blue-700',
      Software: 'bg-purple-100 text-purple-700',
      Office: 'bg-gray-100 text-gray-700',
      Marketing: 'bg-pink-100 text-pink-700',
      'Professional Services': 'bg-green-100 text-green-700',
      'Contractor Payment': 'bg-orange-100 text-orange-700',
      Other: 'bg-yellow-100 text-yellow-700',
    };
    return colors[category];
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total: {formatCurrency(totalExpenses)}
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      <div className="mb-6">
        <label className="label">Filter by Category</label>
        <select
          className="input-field max-w-xs"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {isFormOpen && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Date *</label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="label">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input-field"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="label">Category *</label>
                <select
                  required
                  className="input-field"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as ExpenseCategory,
                    })
                  }
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Receipt Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="input-field"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea
                required
                className="input-field"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="contractorPayment"
                checked={formData.isContractorPayment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isContractorPayment: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="contractorPayment"
                className="text-sm font-medium text-gray-700"
              >
                This is a contractor payment (for 1099 tracking)
              </label>
            </div>

            {formData.isContractorPayment && (
              <div>
                <label className="label">Contractor Name *</label>
                <input
                  type="text"
                  required={formData.isContractorPayment}
                  className="input-field"
                  value={formData.contractorName}
                  onChange={(e) =>
                    setFormData({ ...formData, contractorName: e.target.value })
                  }
                />
              </div>
            )}

            {formData.receiptImage && (
              <div>
                <label className="label">Receipt Preview</label>
                <img
                  src={formData.receiptImage}
                  alt="Receipt"
                  className="max-w-xs rounded-lg border"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 card">
            <p className="text-gray-500">
              No expenses found. Click "Add Expense" to get started.
            </p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div key={expense.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        expense.category
                      )}`}
                    >
                      {expense.category}
                    </span>
                    {expense.isContractorPayment && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        1099
                      </span>
                    )}
                    {expense.receiptImage && (
                      <ImageIcon size={16} className="text-gray-400" />
                    )}
                  </div>
                  <p className="text-gray-900 font-medium mb-1">
                    {expense.description}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>{formatDate(expense.date)}</span>
                    {expense.contractorName && (
                      <span>Contractor: {expense.contractorName}</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {formatCurrency(expense.amount)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {expense.receiptImage && (
                <div className="mt-4">
                  <img
                    src={expense.receiptImage}
                    alt="Receipt"
                    className="max-w-md rounded-lg border cursor-pointer"
                    onClick={() => window.open(expense.receiptImage, '_blank')}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
