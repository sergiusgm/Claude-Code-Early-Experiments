import jsPDF from 'jspdf';
import type { Invoice, BusinessProfile } from '../types';
import { formatCurrency, formatDate } from './calculations';

export function generateInvoicePDF(
  invoice: Invoice,
  businessProfile: BusinessProfile
): void {
  const doc = new jsPDF();

  // Set up fonts and colors
  const primaryColor = [37, 99, 235] as const; // Blue-600
  const textColor = [31, 41, 55] as const; // Gray-800

  // Business header
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text(businessProfile.businessName || 'Your Business', 20, 20);

  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.text(businessProfile.ownerName || '', 20, 28);
  doc.text(businessProfile.address || '', 20, 33);
  doc.text(businessProfile.email || '', 20, 38);
  doc.text(businessProfile.phone || '', 20, 43);

  // Invoice title and number
  doc.setFontSize(28);
  doc.setTextColor(...primaryColor);
  doc.text('INVOICE', 150, 20);

  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 150, 28);
  doc.text(`Date: ${formatDate(invoice.date)}`, 150, 33);
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 150, 38);
  doc.text(`Status: ${invoice.status}`, 150, 43);

  // Client information
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text('Bill To:', 20, 60);

  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.text(invoice.clientName, 20, 68);

  // Line items table
  let yPos = 85;
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos - 5, 170, 8, 'F');
  doc.text('Description', 22, yPos);
  doc.text('Qty', 120, yPos);
  doc.text('Rate', 140, yPos);
  doc.text('Amount', 165, yPos);

  yPos += 10;
  doc.setTextColor(...textColor);

  invoice.lineItems.forEach((item) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    doc.text(item.description, 22, yPos);
    doc.text(item.quantity.toString(), 120, yPos);
    doc.text(formatCurrency(item.rate), 140, yPos);
    doc.text(formatCurrency(item.amount), 165, yPos);
    yPos += 7;
  });

  // Totals
  yPos += 10;
  doc.line(20, yPos, 190, yPos);
  yPos += 8;

  doc.text('Subtotal:', 140, yPos);
  doc.text(formatCurrency(invoice.subtotal), 165, yPos);
  yPos += 7;

  if (invoice.tax > 0) {
    doc.text('Tax:', 140, yPos);
    doc.text(formatCurrency(invoice.tax), 165, yPos);
    yPos += 7;
  }

  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text('Total:', 140, yPos);
  doc.text(formatCurrency(invoice.total), 165, yPos);

  // Notes
  if (invoice.notes) {
    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.text('Notes:', 20, yPos);
    yPos += 7;
    const splitNotes = doc.splitTextToSize(invoice.notes, 170);
    doc.text(splitNotes, 20, yPos);
  }

  // Payment information
  if (invoice.status === 'Paid' && invoice.paidDate) {
    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(34, 197, 94); // Green
    doc.text(`Paid on ${formatDate(invoice.paidDate)}`, 20, yPos);
    if (invoice.paidAmount) {
      doc.text(`Amount paid: ${formatCurrency(invoice.paidAmount)}`, 20, yPos + 7);
    }
  }

  // Save the PDF
  doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
}
