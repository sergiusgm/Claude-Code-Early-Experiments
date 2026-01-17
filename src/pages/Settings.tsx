import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import type { BusinessProfile } from '../types';
import { getBusinessProfile, saveBusinessProfile } from '../utils/storage';

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
