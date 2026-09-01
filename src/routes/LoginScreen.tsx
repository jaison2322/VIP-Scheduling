import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown,
  LogIn,
  UserPlus,
  Briefcase,
  User,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Shield,
  Calendar,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AtSign,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { loginWithCredentials, setupVIP, registerPrivilegedUser } = useAppStore();

  // Auth View: 'landing' (welcome screen) | 'login' (username & password) | 'register' (create account)
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>('landing');

  // ── Login Form State ────────────────────────────────────────────────────────
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ── Register Form State ─────────────────────────────────────────────────────
  const [regType, setRegType] = useState<'vip' | 'staff'>('vip');
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('Personal Assistant');
  const [regPin, setRegPin] = useState('1234');
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // ── Login Handlers ──────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanUser = loginUsername.trim();
    if (!cleanUser) {
      setLoginError('Please enter your username.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const result = await loginWithCredentials(cleanUser, loginPassword);
      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 400);
      } else {
        setLoginError(result.error || 'Invalid credentials. Please try again.');
        setIsLoggingIn(false);
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Sign in failed. Please try again.');
      setIsLoggingIn(false);
    }
  };

  // ── Register Handler ────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    const cleanUsername = regUsername.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setRegError('Username must be at least 3 alphanumeric characters.');
      return;
    }

    if (!regName.trim()) {
      setRegError('Please enter your full name or title.');
      return;
    }

    if (!regPassword || regPassword.length < 4) {
      setRegError('Password must be at least 4 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please verify.');
      return;
    }

    if (regEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setRegError('Please enter a valid email address.');
      return;
    }

    setIsRegistering(true);
    try {
      if (regType === 'vip') {
        await setupVIP(
          regName.trim(),
          regPin || '1234',
          regPhone.trim(),
          regEmail.trim(),
          cleanUsername,
          regPassword
        );
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 400);
      } else {
        const result = await registerPrivilegedUser(
          regName.trim(),
          regRole.trim(),
          regPin || '1111',
          regPhone.trim(),
          regEmail.trim(),
          cleanUsername,
          regPassword
        );
        if (result) {
          setIsSuccess(true);
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 400);
        } else {
          setRegError('Maximum privileged staff limit reached (5 users max).');
          setIsRegistering(false);
        }
      }
    } catch (err: any) {
      setRegError(err?.message || 'Registration failed. Please try again.');
      setIsRegistering(false);
    }
  };

  return (
    <div className="auth-wrapper screen-no-nav">
      {/* Background ambient gold lighting */}
      <div className="auth-ambient-glow" />

      <div className="auth-card animate-scale-in">
        {/* ══════════════════════════════════════════════════════════════════════
            VIEW 1: LANDING / WELCOME SCREEN (Default)
            ══════════════════════════════════════════════════════════════════════ */}
        {authView === 'landing' && (
          <div className="animate-fade-in text-center">
            {/* Header Logo & Title */}
            <div className="auth-header" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="auth-logo-badge">
                <Crown size={32} />
              </div>
              <h1 className="auth-title" style={{ fontSize: 'var(--text-2xl)' }}>
                VIP Event Intelligence
              </h1>
              <p className="auth-subtitle" style={{ fontSize: 'var(--text-sm)', marginTop: '4px' }}>
                Executive Schedule & Protocol Management
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="flex flex-col gap-3 mb-6 text-left">
              <div
                className="glass-card flex items-center gap-3 p-3"
                style={{ borderRadius: 'var(--radius-lg)', background: 'rgba(15, 23, 42, 0.45)' }}
              >
                <div style={{ color: 'var(--color-gold)', flexShrink: 0 }}>
                  <Crown size={20} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-primary">Executive Protocol</div>
                  <div className="text-xs text-muted">VIP relationship memory ledger & event prioritization</div>
                </div>
              </div>

              <div
                className="glass-card flex items-center gap-3 p-3"
                style={{ borderRadius: 'var(--radius-lg)', background: 'rgba(15, 23, 42, 0.45)' }}
              >
                <div style={{ color: '#60a5fa', flexShrink: 0 }}>
                  <Shield size={20} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-primary">Role Delegated Access</div>
                  <div className="text-xs text-muted">Secure account authentication for VIPs and Staff</div>
                </div>
              </div>

              <div
                className="glass-card flex items-center gap-3 p-3"
                style={{ borderRadius: 'var(--radius-lg)', background: 'rgba(15, 23, 42, 0.45)' }}
              >
                <div style={{ color: '#34d399', flexShrink: 0 }}>
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-primary">Smart Schedule Intelligence</div>
                  <div className="text-xs text-muted">AI OCR card scanning & real-time conflict detection</div>
                </div>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="btn btn-gold w-full"
                style={{
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                }}
                onClick={() => {
                  setLoginError('');
                  setAuthView('login');
                }}
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                className="btn btn-outline w-full"
                style={{
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                }}
                onClick={() => {
                  setRegError('');
                  setAuthView('register');
                }}
              >
                <UserPlus size={18} />
                <span>Register</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            VIEW 2: SIGN IN (USERNAME & PASSWORD SCREEN)
            ══════════════════════════════════════════════════════════════════════ */}
        {authView === 'login' && (
          <div className="animate-fade-in">
            {/* Top Back Nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                className="btn btn-sm btn-ghost text-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px' }}
                onClick={() => setAuthView('landing')}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <span className="text-xs text-gold font-semibold uppercase tracking-wider">
                Executive Access
              </span>
              <div style={{ width: '40px' }} />
            </div>

            {/* Logo Badge & Header */}
            <div className="text-center" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="auth-logo-badge" style={{ width: '48px', height: '48px', marginBottom: 'var(--space-2)' }}>
                <Crown size={24} />
              </div>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {isSuccess ? 'Access Granted' : 'Sign In'}
              </h2>
              <p className="text-secondary text-xs" style={{ marginTop: '2px' }}>
                {isSuccess
                  ? 'Initializing executive interface...'
                  : 'Enter your username and password to log in to your account'}
              </p>
            </div>

            {/* Error Banner */}
            {loginError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--color-danger)',
                  fontSize: 'var(--text-xs)',
                  marginBottom: 'var(--space-3)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  animation: 'slideUp 0.25s ease-out',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            {/* Username & Password Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              {/* Username Input */}
              <div>
                <label className="label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  <AtSign size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    style={{ fontSize: 'var(--text-sm)', padding: '10px 14px' }}
                    type="text"
                    placeholder="e.g. jaison or deepa_pa"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoFocus
                    required
                    disabled={isLoggingIn || isSuccess}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  <Lock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    className="input"
                    style={{ fontSize: 'var(--text-sm)', padding: '10px 40px 10px 14px', width: '100%' }}
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={isLoggingIn || isSuccess}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-gold w-full mt-2"
                style={{
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                }}
                disabled={isLoggingIn || isSuccess || !loginUsername.trim() || !loginPassword}
              >
                {isLoggingIn ? (
                  <span>Authenticating...</span>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Access Granted</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Don&apos;t have an account yet?{' '}
              <button
                type="button"
                className="text-gold"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                onClick={() => {
                  setRegError('');
                  setAuthView('register');
                }}
              >
                Register Here
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            VIEW 3: REGISTER SCREEN (USERNAME, PASSWORD & PROFILE)
            ══════════════════════════════════════════════════════════════════════ */}
        {authView === 'register' && (
          <form onSubmit={handleRegister} className="animate-fade-in">
            {/* Top Back Nav */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                className="btn btn-sm btn-ghost text-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px' }}
                onClick={() => setAuthView('landing')}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <span className="text-xs text-gold font-semibold uppercase tracking-wider">
                Create Account
              </span>
              <div style={{ width: '40px' }} />
            </div>

            <div style={{ marginBottom: 'var(--space-3)', textAlign: 'center' }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Create New Profile
              </h2>
              <p className="text-secondary text-xs" style={{ marginTop: '2px' }}>
                Set up VIP Principal or Staff credentials with username & password
              </p>
            </div>

            {/* Account Role Card Selector */}
            <div className="role-select-cards">
              <div
                className={`role-select-card ${regType === 'vip' ? 'active' : ''}`}
                onClick={() => setRegType('vip')}
              >
                <div className="role-select-card-icon">👑</div>
                <div className="role-select-card-title">VIP Principal</div>
                <div className="role-select-card-desc">Master access & protocol</div>
              </div>

              <div
                className={`role-select-card ${regType === 'staff' ? 'active' : ''}`}
                onClick={() => setRegType('staff')}
              >
                <div className="role-select-card-icon">👔</div>
                <div className="role-select-card-title">Staff / PA</div>
                <div className="role-select-card-desc">Schedule & entry access</div>
              </div>
            </div>

            {/* Error Message */}
            {regError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-danger)',
                  fontSize: 'var(--text-xs)',
                  marginBottom: 'var(--space-3)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  animation: 'slideUp 0.25s ease-out',
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{regError}</span>
              </div>
            )}

            {/* Username Input (Primary Key) */}
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <div className="flex items-center justify-between mb-1">
                <label className="label" style={{ fontSize: 'var(--text-xs)', margin: 0 }}>
                  <AtSign size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Username
                </label>
                <span className="badge badge-gold" style={{ fontSize: '9px', padding: '1px 5px' }}>
                  Database Primary Key
                </span>
              </div>
              <input
                className="input"
                style={{ fontSize: 'var(--text-sm)', padding: '10px 14px' }}
                type="text"
                placeholder={regType === 'vip' ? 'e.g. vikram_principal' : 'e.g. ananya_pa'}
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                autoCapitalize="none"
                autoCorrect="off"
                autoFocus
                required
              />
              <p className="text-muted" style={{ fontSize: '10px', marginTop: '2px', paddingLeft: '2px' }}>
                Used to log in to your account. Unique primary key in database.
              </p>
            </div>

            {/* Full Name input */}
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <label className="label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                <User size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Full Name / Title
              </label>
              <input
                className="input"
                style={{ fontSize: 'var(--text-sm)', padding: '10px 14px' }}
                type="text"
                placeholder={regType === 'vip' ? 'e.g. Dr. Vikramaditya' : 'e.g. Ananya Rao'}
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
            </div>

            {/* Password & Confirm Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <div>
                <label className="label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  <Lock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    className="input"
                    style={{ fontSize: 'var(--text-sm)', padding: '8px 30px 8px 10px', width: '100%' }}
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{
                      position: 'absolute',
                      right: '6px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                  >
                    {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Confirm
                </label>
                <input
                  className="input"
                  style={{ fontSize: 'var(--text-sm)', padding: '8px 10px' }}
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Role input if Staff */}
            {regType === 'staff' && (
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label className="label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  <Briefcase size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Staff Role / Designation
                </label>
                <input
                  className="input"
                  style={{ fontSize: 'var(--text-sm)', padding: '10px 14px' }}
                  type="text"
                  placeholder="e.g. Personal Assistant, Secretary"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Phone Number input */}
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <label className="label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                <Phone size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Phone Number (Optional)
              </label>
              <input
                className="input"
                style={{ fontSize: 'var(--text-sm)', padding: '10px 14px' }}
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
              />
            </div>

            {/* Email Address input */}
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <label className="label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                <Mail size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Email Address (Optional)
              </label>
              <input
                className="input"
                style={{ fontSize: 'var(--text-sm)', padding: '10px 14px' }}
                type="email"
                placeholder={regType === 'vip' ? 'e.g. vikramaditya@royal.com' : 'e.g. ananya@executive.com'}
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>

            {/* Optional 4-Digit PIN */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                <KeyRound size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Security PIN (Optional backup)
              </label>
              <input
                className="input"
                style={{ fontSize: 'var(--text-sm)', padding: '8px 12px', letterSpacing: '2px' }}
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="1234"
                value={regPin}
                onChange={(e) => setRegPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="btn btn-gold w-full"
              style={{
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
              }}
              disabled={
                isRegistering ||
                isSuccess ||
                !regUsername.trim() ||
                !regName.trim() ||
                !regPassword ||
                regPassword !== regConfirmPassword
              }
            >
              {isRegistering ? (
                <span>Creating Account in Database...</span>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Account Created & Signed In</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Create Account & Sign In</span>
                </>
              )}
            </button>

            <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Already registered?{' '}
              <button
                type="button"
                className="text-gold"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                onClick={() => {
                  setLoginError('');
                  setAuthView('login');
                }}
              >
                Sign In with Username & Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
