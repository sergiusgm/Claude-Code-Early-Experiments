import {
  getClients,
  getInvoices,
  getExpenses,
  getBusinessProfile,
  saveClients,
  saveInvoices,
  saveExpenses,
  saveBusinessProfile
} from './storage';

export interface DataBackup {
  version: string;
  exportDate: string;
  clients: ReturnType<typeof getClients>;
  invoices: ReturnType<typeof getInvoices>;
  expenses: ReturnType<typeof getExpenses>;
  businessProfile: ReturnType<typeof getBusinessProfile>;
}

export function exportAllData(): string {
  const backup: DataBackup = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    clients: getClients(),
    invoices: getInvoices(),
    expenses: getExpenses(),
    businessProfile: getBusinessProfile(),
  };

  return JSON.stringify(backup, null, 2);
}

export function downloadBackup(): void {
  const data = exportAllData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = `consulttrack-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function importData(jsonData: string): { success: boolean; error?: string } {
  try {
    const backup: DataBackup = JSON.parse(jsonData);

    // Validate backup structure
    if (!backup.version || !backup.clients || !backup.invoices || !backup.expenses) {
      return { success: false, error: 'Invalid backup file format' };
    }

    // Import all data
    saveClients(backup.clients);
    saveInvoices(backup.invoices);
    saveExpenses(backup.expenses);
    saveBusinessProfile(backup.businessProfile);

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to parse backup file' };
  }
}

export function clearAllData(): void {
  if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
    localStorage.clear();
    window.location.reload();
  }
}
