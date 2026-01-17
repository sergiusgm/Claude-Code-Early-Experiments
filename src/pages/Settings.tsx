import { useEffect, useState, useRef } from 'react';
import { Save, Download, Upload, Trash2 } from 'lucide-react';
import type { BusinessProfile } from '../types';
import { getBusinessProfile, saveBusinessProfile } from '../utils/storage';
import { downloadBackup, importData, clearAllData } from '../utils/dataBackup';

export default function Settings() {
  const [profile, setProfile] = useState<BusinessProfile>({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    logo: '',
    taxId: '',
  });
  const [isSaved, setIsSaved] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedProfile = getBusinessProfile();
    setProfile(savedProfile);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveBusinessProfile(profile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackupDownload = () => {
    downloadBackup();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const importResult = importData(result);

        if (importResult.success) {
          setImportMessage({ type: 'success', text: 'Data imported successfully! Refreshing page...' });
          setTimeout(() => window.location.reload(), 2000);
        } else {
          setImportMessage({ type: 'error', text: importResult.error || 'Import failed' });
          setTimeout(() => setImportMessage(null), 5000);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="card max-w-2xl">
        <h2 className="text-xl font-semibold mb-6">Business Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Business Name</label>
            <input
              type="text"
              className="input-field"
              value={profile.businessName}
              onChange={(e) =>
                setProfile({ ...profile, businessName: e.target.value })
              }
              placeholder="Your Consulting Business"
            />
          </div>

          <div>
            <label className="label">Owner Name</label>
            <input
              type="text"
              className="input-field"
              value={profile.ownerName}
              onChange={(e) =>
                setProfile({ ...profile, ownerName: e.target.value })
              }
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input-field"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="label">Phone</label>
            <input
              type="tel"
              className="input-field"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="label">Business Address</label>
            <textarea
              className="input-field"
              rows={3}
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
              placeholder="123 Business St, City, State 12345"
            />
          </div>

          <div>
            <label className="label">Tax ID / EIN (Optional)</label>
            <input
              type="text"
              className="input-field"
              value={profile.taxId}
              onChange={(e) =>
                setProfile({ ...profile, taxId: e.target.value })
              }
              placeholder="XX-XXXXXXX"
            />
          </div>

          <div>
            <label className="label">Business Logo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              className="input-field"
              onChange={handleLogoUpload}
            />
            {profile.logo && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Logo Preview:</p>
                <img
                  src={profile.logo}
                  alt="Business Logo"
                  className="max-w-xs rounded-lg border"
                />
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
            >
              <Save size={20} />
              Save Profile
            </button>
            {isSaved && (
              <p className="text-green-600 mt-2 text-sm">
                Profile saved successfully!
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Backup & Data Management */}
      <div className="card max-w-2xl mt-6">
        <h2 className="text-xl font-semibold mb-4">Backup & Data Management</h2>
        <p className="text-gray-600 mb-6">
          Export all your data to a backup file or import previously saved data.
          Keep regular backups to prevent data loss!
        </p>

        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={handleBackupDownload}
              className="btn-primary flex items-center gap-2"
            >
              <Download size={20} />
              Download Backup
            </button>

            <button
              onClick={handleImportClick}
              className="btn-secondary flex items-center gap-2"
            >
              <Upload size={20} />
              Import Backup
            </button>

            <button
              onClick={clearAllData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
            >
              <Trash2 size={20} />
              Clear All Data
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />

          {importMessage && (
            <div
              className={`p-4 rounded-lg ${
                importMessage.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {importMessage.text}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li><strong>Download Backup:</strong> Saves all your clients, invoices, expenses, and settings to a JSON file</li>
              <li><strong>Import Backup:</strong> Restores data from a previously downloaded backup file</li>
              <li><strong>Clear All Data:</strong> Permanently deletes all data (make a backup first!)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card max-w-2xl mt-6">
        <h2 className="text-xl font-semibold mb-4">About ConsultTrack</h2>
        <p className="text-gray-600 mb-2">
          Version 1.0 - Business Management App for Independent Consultants
        </p>
        <p className="text-gray-600">
          All data is stored locally in your browser. No data is sent to any
          external servers.
        </p>
      </div>
    </div>
  );
}
