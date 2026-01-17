import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Download, CheckCircle } from 'lucide-react';
import type { Invoice, InvoiceLineItem, InvoiceStatus } from '../types';
import {
  getInvoices,
  getClients,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  generateId,
  getBusinessProfile,
} from '../utils/storage';
import { formatCurrency, formatDate, getNextInvoiceNumber } from '../utils/calculations';
import { generateInvoicePDF } from '../utils/pdfGenerator';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    tax: 0,
  });
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: '', quantity: 1, rate: 0, amount: 0 },
  ]);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const allInvoices = getInvoices();
    // Update overdue status
    const now = new Date();
    allInvoices.forEach((inv) => {
      if (inv.status === 'Sent' && new Date(inv.dueDate) < now) {
        inv.status = 'Overdue';
        updateInvoice(inv.id, inv);
      }
    });
    setInvoices(allInvoices.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const clients = getClients();
    const client = clients.find((c) => c.id === formData.clientId);
    if (!client) {
      alert('Please select a client');
      return;
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const total = subtotal + formData.tax;

    const invoiceData = {
      clientId: formData.clientId,
      clientName: client.name,
      date: formData.date,
      dueDate: formData.dueDate,
      lineItems,
      subtotal,
      tax: formData.tax,
      total,
      notes: formData.notes,
      status: (editingInvoice?.status || 'Draft') as InvoiceStatus,
    };

    if (editingInvoice) {
      const updated: Invoice = {
        ...editingInvoice,
        ...invoiceData,
      };
      updateInvoice(editingInvoice.id, updated);
    } else {
      const newInvoice: Invoice = {
        id: generateId(),
        invoiceNumber: getNextInvoiceNumber(invoices),
        ...invoiceData,
        createdAt: new Date().toISOString(),
      };
      addInvoice(newInvoice);
    }

    resetForm();
    loadInvoices();
  };

  const handleLineItemChange = (
    index: number,
    field: keyof InvoiceLineItem,
    value: string | number
  ) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'rate') {
      updated[index].amount = updated[index].quantity * updated[index].rate;
    }

    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      clientId: invoice.clientId,
      date: invoice.date,
      dueDate: invoice.dueDate,
      notes: invoice.notes || '',
      tax: invoice.tax,
    });
    setLineItems(invoice.lineItems);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
      loadInvoices();
    }
  };

  const handleMarkPaid = (invoice: Invoice) => {
    const paidAmount = prompt(
      `Enter amount paid (Total: ${formatCurrency(invoice.total)}):`,
      invoice.total.toString()
    );

    if (paidAmount) {
      const amount = parseFloat(paidAmount);
      if (!isNaN(amount) && amount > 0) {
        const updated: Invoice = {
          ...invoice,
          status: 'Paid',
          paidDate: new Date().toISOString().split('T')[0],
          paidAmount: amount,
        };
        updateInvoice(invoice.id, updated);
        loadInvoices();
      }
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    const businessProfile = getBusinessProfile();
    generateInvoicePDF(invoice, businessProfile);
  };

  const handleStatusChange = (invoice: Invoice, newStatus: InvoiceStatus) => {
    const updated: Invoice = {
      ...invoice,
      status: newStatus,
    };
    updateInvoice(invoice.id, updated);
    loadInvoices();
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: '',
      tax: 0,
    });
    setLineItems([{ description: '', quantity: 1, rate: 0, amount: 0 }]);
    setEditingInvoice(null);
    setIsFormOpen(false);
  };

  const clients = getClients();
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal + formData.tax;

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-700';
      case 'Sent':
        return 'bg-blue-100 text-blue-700';
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Overdue':
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Create Invoice
        </button>
      </div>

      {isFormOpen && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Client *</label>
                <select
                  required
                  className="input-field"
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: e.target.value })
                  }
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Invoice Date *</label>
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
                <label className="label">Due Date *</label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="label">Tax Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={formData.tax}
                  onChange={(e) =>
                    setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="label mb-0">Line Items</label>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Line Item
                </button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Description"
                        className="input-field"
                        value={item.description}
                        onChange={(e) =>
                          handleLineItemChange(index, 'description', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Qty"
                        className="input-field"
                        value={item.quantity}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            'quantity',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Rate"
                        className="input-field"
                        value={item.rate}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            'rate',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        className="input-field bg-gray-50"
                        value={formatCurrency(item.amount)}
                        disabled
                      />
                    </div>
                    <div className="col-span-1">
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span className="font-medium">{formatCurrency(formData.tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea
                className="input-field"
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
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
        {invoices.length === 0 ? (
          <div className="text-center py-12 card">
            <p className="text-gray-500">
              No invoices yet. Click "Create Invoice" to get started.
            </p>
          </div>
        ) : (
          invoices.map((invoice) => (
            <div key={invoice.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {invoice.invoiceNumber}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-1">{invoice.clientName}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Date: {formatDate(invoice.date)}</span>
                    <span>Due: {formatDate(invoice.dueDate)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {formatCurrency(invoice.total)}
                  </p>
                  <div className="flex gap-2">
                    {invoice.status !== 'Paid' && (
                      <button
                        onClick={() => handleMarkPaid(invoice)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Mark as Paid"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadPDF(invoice)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(invoice)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {invoice.status === 'Draft' && (
                    <button
                      onClick={() => handleStatusChange(invoice, 'Sent')}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Mark as Sent
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
