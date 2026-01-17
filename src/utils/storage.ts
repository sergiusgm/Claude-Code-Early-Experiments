import type {
  Client,
  Invoice,
  Expense,
  BusinessProfile,
} from '../types';

const STORAGE_KEYS = {
  CLIENTS: 'consulttrack_clients',
  INVOICES: 'consulttrack_invoices',
  EXPENSES: 'consulttrack_expenses',
  BUSINESS_PROFILE: 'consulttrack_business_profile',
};

// Generic storage functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from storage: ${key}`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to storage: ${key}`, error);
  }
}

// Client functions
export function getClients(): Client[] {
  return getFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, []);
}

export function saveClients(clients: Client[]): void {
  saveToStorage(STORAGE_KEYS.CLIENTS, clients);
}

export function addClient(client: Client): void {
  const clients = getClients();
  clients.push(client);
  saveClients(clients);
}

export function updateClient(id: string, updatedClient: Client): void {
  const clients = getClients();
  const index = clients.findIndex((c) => c.id === id);
  if (index !== -1) {
    clients[index] = updatedClient;
    saveClients(clients);
  }
}

export function deleteClient(id: string): void {
  const clients = getClients();
  saveClients(clients.filter((c) => c.id !== id));
}

export function getClientById(id: string): Client | undefined {
  return getClients().find((c) => c.id === id);
}

// Invoice functions
export function getInvoices(): Invoice[] {
  return getFromStorage<Invoice[]>(STORAGE_KEYS.INVOICES, []);
}

export function saveInvoices(invoices: Invoice[]): void {
  saveToStorage(STORAGE_KEYS.INVOICES, invoices);
}

export function addInvoice(invoice: Invoice): void {
  const invoices = getInvoices();
  invoices.push(invoice);
  saveInvoices(invoices);
}

export function updateInvoice(id: string, updatedInvoice: Invoice): void {
  const invoices = getInvoices();
  const index = invoices.findIndex((i) => i.id === id);
  if (index !== -1) {
    invoices[index] = updatedInvoice;
    saveInvoices(invoices);
  }
}

export function deleteInvoice(id: string): void {
  const invoices = getInvoices();
  saveInvoices(invoices.filter((i) => i.id !== id));
}

export function getInvoiceById(id: string): Invoice | undefined {
  return getInvoices().find((i) => i.id === id);
}

// Expense functions
export function getExpenses(): Expense[] {
  return getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);
}

export function saveExpenses(expenses: Expense[]): void {
  saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
}

export function addExpense(expense: Expense): void {
  const expenses = getExpenses();
  expenses.push(expense);
  saveExpenses(expenses);
}

export function updateExpense(id: string, updatedExpense: Expense): void {
  const expenses = getExpenses();
  const index = expenses.findIndex((e) => e.id === id);
  if (index !== -1) {
    expenses[index] = updatedExpense;
    saveExpenses(expenses);
  }
}

export function deleteExpense(id: string): void {
  const expenses = getExpenses();
  saveExpenses(expenses.filter((e) => e.id !== id));
}

// Business Profile functions
export function getBusinessProfile(): BusinessProfile {
  return getFromStorage<BusinessProfile>(STORAGE_KEYS.BUSINESS_PROFILE, {
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
  });
}

export function saveBusinessProfile(profile: BusinessProfile): void {
  saveToStorage(STORAGE_KEYS.BUSINESS_PROFILE, profile);
}

// Utility function to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
