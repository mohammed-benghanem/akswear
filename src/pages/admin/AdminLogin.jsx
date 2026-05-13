import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAdmin } from "../../context/AdminContext";
import "./AdminLogin.css";

export default function AdminLogin() {
  const { login, loginError, setLoginError } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate("/admin");
  };

  return (
    <div className="al-root">
      <Helmet>
        <title>Admin Login | AKS Wear</title>
      </Helmet>
      <div className="al-orb al-orb-1" />
      <div className="al-orb al-orb-2" />
      <div className="al-orb al-orb-3" />

      <div className="al-card">
        <div className="al-logo-wrap">
          <div className="al-logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span className="al-logo-text">AKS Wear</span>
        </div>

        <h1 className="al-title">Admin Portal</h1>
        <p className="al-subtitle">Sign in with your admin account</p>

        <form onSubmit={handleSubmit} className="al-form">
          {/* Email */}
          <div className="al-field-wrap">
            <label className="al-label" htmlFor="al-email">Email</label>
            <div className="al-input-wrap">
              <svg className="al-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                id="al-email"
                type="email"
                className="al-input"
                placeholder="akswear1@gmail.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (loginError) setLoginError(""); }}
                autoFocus
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="al-field-wrap">
            <label className="al-label" htmlFor="al-password">Password</label>
            <div className="al-input-wrap">
              <svg className="al-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input
                id="al-password"
                type={showPwd ? "text" : "password"}
                className={`al-input${loginError ? " al-input-error" : ""}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (loginError) setLoginError(""); }}
                required
              />
              <button type="button" className="al-eye-btn" onClick={() => setShowPwd((s) => !s)}>
                {showPwd ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {loginError && <span className="al-error">{loginError}</span>}
          </div>

          <button
            id="al-submit-btn"
            type="submit"
            className={`al-submit-btn${loading ? " loading" : ""}`}
            disabled={loading || !email || !password}
          >
            {loading ? <><span className="al-spinner" />Signing in...</> : <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Sign In to Dashboard
            </>}
          </button>
        </form>

        <p className="al-hint">
          Powered by <strong>Supabase Auth</strong> — use the email & password you set in the Supabase dashboard.
        </p>
      </div>
    </div>
  );
}
