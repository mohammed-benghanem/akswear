import { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import "./AdminSettings.css";

export default function AdminSettings() {
  const { settings, updateSettings } = useAdmin();

  const [form, setForm] = useState({
    storeName: settings.storeName,
    contactEmail: settings.contactEmail,
    whatsapp: settings.whatsapp,
    freeShippingThreshold: settings.freeShippingThreshold,
    shippingCost: settings.shippingCost,
  });
  const [pwdForm, setPwdForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [pwdError, setPwdError] = useState("");
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(""), 3000);
  };

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      updateSettings({
        storeName: form.storeName,
        contactEmail: form.contactEmail,
        whatsapp: form.whatsapp,
        freeShippingThreshold: parseFloat(form.freeShippingThreshold) || 0,
        shippingCost: parseFloat(form.shippingCost) || 0,
      });
      setSaving(false);
      showToast("✓ Settings saved successfully");
    }, 600);
  };

  const handlePasswordChange = () => {
    setPwdError("");
    const storedPwd = localStorage.getItem("akswear_admin_pwd") || "admin123";
    if (pwdForm.current !== storedPwd) {
      setPwdError("Current password is incorrect.");
      return;
    }
    if (pwdForm.newPwd.length < 6) {
      setPwdError("New password must be at least 6 characters.");
      return;
    }
    if (pwdForm.newPwd !== pwdForm.confirm) {
      setPwdError("Passwords do not match.");
      return;
    }
    setSavingPwd(true);
    setTimeout(() => {
      updateSettings({ newPassword: pwdForm.newPwd });
      setPwdForm({ current: "", newPwd: "", confirm: "" });
      setSavingPwd(false);
      showToast("✓ Password changed successfully");
    }, 600);
  };

  return (
    <div className="ads-root">
      {toast && (
        <div className={`ads-toast ads-toast-${toast.type}`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="ads-header">
        <h1 className="ads-title">Settings</h1>
        <p className="ads-subtitle">Manage your store configuration</p>
      </div>

      {/* Store Info */}
      <div className="ads-section">
        <div className="ads-section-header">
          <div className="ads-section-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <h2 className="ads-section-title">Store Information</h2>
            <p className="ads-section-sub">Basic details about your store</p>
          </div>
        </div>

        <div className="ads-form-grid">
          <div className="ads-field">
            <label>Store Name</label>
            <input value={form.storeName} onChange={handleChange("storeName")} placeholder="AKS Wear" />
          </div>
          <div className="ads-field">
            <label>Contact Email</label>
            <input type="email" value={form.contactEmail} onChange={handleChange("contactEmail")} placeholder="akswear1@gmail.com" />
          </div>
          <div className="ads-field ads-field-full">
            <label>WhatsApp Number</label>
            <input value={form.whatsapp} onChange={handleChange("whatsapp")} placeholder="0675777859" />
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div className="ads-section">
        <div className="ads-section-header">
          <div className="ads-section-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div>
            <h2 className="ads-section-title">Shipping Settings</h2>
            <p className="ads-section-sub">Configure shipping costs and thresholds</p>
          </div>
        </div>

        <div className="ads-form-grid">
          <div className="ads-field">
            <label>Free Shipping Threshold (DH)</label>
            <div className="ads-input-prefix-wrap">
              <span className="ads-input-prefix">DH</span>
              <input
                type="number" min="0"
                value={form.freeShippingThreshold}
                onChange={handleChange("freeShippingThreshold")}
                className="ads-input-prefixed"
              />
            </div>
            <span className="ads-field-hint">Orders above this amount get free shipping</span>
          </div>
          <div className="ads-field">
            <label>Standard Shipping Cost (DH)</label>
            <div className="ads-input-prefix-wrap">
              <span className="ads-input-prefix">DH</span>
              <input
                type="number" min="0"
                value={form.shippingCost}
                onChange={handleChange("shippingCost")}
                className="ads-input-prefixed"
              />
            </div>
            <span className="ads-field-hint">Applied when order is below threshold</span>
          </div>
        </div>

        <div className="ads-shipping-preview">
          <div className="ads-preview-item">
            <span>Orders under <strong>{form.freeShippingThreshold} DH</strong></span>
            <span className="ads-preview-val ads-preview-paid">{form.shippingCost} DH shipping</span>
          </div>
          <div className="ads-preview-item">
            <span>Orders of <strong>{form.freeShippingThreshold} DH+</strong></span>
            <span className="ads-preview-val ads-preview-free">FREE shipping 🎉</span>
          </div>
        </div>

        <button
          className={`ads-save-btn${saving ? " loading" : ""}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <><span className="ads-spinner" />Saving...</> : "Save Settings"}
        </button>
      </div>

      {/* Security */}
      <div className="ads-section">
        <div className="ads-section-header">
          <div className="ads-section-icon ads-section-icon-red">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <div>
            <h2 className="ads-section-title">Security</h2>
            <p className="ads-section-sub">Change your admin password</p>
          </div>
        </div>

        <div className="ads-form-grid">
          <div className="ads-field ads-field-full">
            <label>Current Password</label>
            <input
              type="password" placeholder="Enter current password"
              value={pwdForm.current}
              onChange={(e) => { setPwdForm((f) => ({ ...f, current: e.target.value })); setPwdError(""); }}
            />
          </div>
          <div className="ads-field">
            <label>New Password</label>
            <input
              type="password" placeholder="At least 6 characters"
              value={pwdForm.newPwd}
              onChange={(e) => { setPwdForm((f) => ({ ...f, newPwd: e.target.value })); setPwdError(""); }}
            />
          </div>
          <div className="ads-field">
            <label>Confirm New Password</label>
            <input
              type="password" placeholder="Repeat new password"
              value={pwdForm.confirm}
              onChange={(e) => { setPwdForm((f) => ({ ...f, confirm: e.target.value })); setPwdError(""); }}
            />
          </div>
        </div>
        {pwdError && <div className="ads-pwd-error">✗ {pwdError}</div>}

        <button
          className={`ads-save-btn ads-save-btn-outline${savingPwd ? " loading" : ""}`}
          onClick={handlePasswordChange}
          disabled={savingPwd || !pwdForm.current || !pwdForm.newPwd || !pwdForm.confirm}
        >
          {savingPwd ? <><span className="ads-spinner" />Changing...</> : "Change Password"}
        </button>
      </div>
    </div>
  );
}
