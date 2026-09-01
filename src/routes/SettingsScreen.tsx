import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  User,
  Lock,
  Bell,
  Palette,
  Database,
  Info,
  LogOut,
  ChevronRight,
  Shield,
  Crown,
  Trash2,
  Check,
  Moon,
  Sun,
  Sparkles,
  KeyRound,
  ShieldAlert,
  Phone,
  Mail,
} from 'lucide-react';
import { getInitials } from '../utils/formatters';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const {
    currentUser,
    currentPrivilegedUser,
    isVIP,
    logout,
    privilegedUsers,
    theme,
    setTheme,
    updateProfile,
    changePIN,
    changePassword,
    clearAllData,
  } = useAppStore();

  const activeUser = isVIP ? currentUser : currentPrivilegedUser;
  const activeUserName = activeUser?.name || (isVIP ? 'VIP Principal' : 'Privileged User');
  const activeUsername = activeUser?.username || (isVIP ? 'vip' : 'staff');
  const activeUserRole = isVIP ? 'VIP Master Account' : (currentPrivilegedUser?.role || 'Privileged User');

  // Modals state
  const [activeModal, setActiveModal] = useState<
    'theme' | 'profile' | 'password' | 'pin' | 'notifications' | 'about' | 'clear' | 'privileged-info' | null
  >(null);

  // Profile Edit Form State
  const [editName, setEditName] = useState(activeUserName);
  const [editPhone, setEditPhone] = useState(activeUser?.phone || '');
  const [editEmail, setEditEmail] = useState(activeUser?.email || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Change Password Form State
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Change PIN Form State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  // Notification Preferences State
  const [notifConflictAlerts, setNotifConflictAlerts] = useState(true);
  const [notifNewInvitations, setNotifNewInvitations] = useState(true);
  const [notifScheduleChanges, setNotifScheduleChanges] = useState(true);
  const [notifReminders, setNotifReminders] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleClearData = async () => {
    await clearAllData();
    navigate('/login', { replace: true });
    window.location.reload();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateProfile(editName.trim(), editPhone.trim(), editEmail.trim());
    setProfileSuccess('Profile updated successfully.');
    setTimeout(() => {
      setProfileSuccess('');
      setActiveModal(null);
    }, 800);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassInput.length < 4) {
      setPassError('Password must be at least 4 characters.');
      return;
    }
    if (newPassInput !== confirmPassInput) {
      setPassError('New passwords do not match.');
      return;
    }

    const result = await changePassword(currentPassInput, newPassInput);
    if (result.success) {
      setPassSuccess(result.message);
      setCurrentPassInput('');
      setNewPassInput('');
      setConfirmPassInput('');
      setTimeout(() => {
        setPassSuccess('');
        setActiveModal(null);
      }, 1000);
    } else {
      setPassError(result.message);
    }
  };

  const handleSavePIN = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (newPinInput !== confirmPinInput) {
      setPinError('New PINs do not match.');
      return;
    }

    const result = changePIN(currentPinInput, newPinInput);
    if (result.success) {
      setPinSuccess(result.message);
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      setTimeout(() => {
        setPinSuccess('');
        setActiveModal(null);
      }, 1000);
    } else {
      setPinError(result.message);
    }
  };

  const themeOptions = [
    {
      id: 'dark',
      name: 'Midnight Gold',
      desc: 'Dark navy glassmorphism with radiant gold',
      icon: <Moon size={20} className="text-gold" />,
      colors: ['#060a13', '#131b2e', '#d4a853'],
    },
    {
      id: 'light',
      name: 'Platinum Ivory',
      desc: 'Clean executive light mode with warm accents',
      icon: <Sun size={20} style={{ color: '#b3821a' }} />,
      colors: ['#f5f7fc', '#ffffff', '#b3821a'],
    },
    {
      id: 'onyx',
      name: 'Royal Onyx',
      desc: 'Pure pitch black OLED with high-contrast gold',
      icon: <Crown size={20} className="text-gold" />,
      colors: ['#000000', '#161616', '#e5b352'],
    },
    {
      id: 'sapphire',
      name: 'Royal Sapphire',
      desc: 'Deep imperial blue glass with champagne gold',
      icon: <Sparkles size={20} style={{ color: '#60a5fa' }} />,
      colors: ['#040916', '#101e40', '#d8ad56'],
    },
  ];

  const getThemeLabel = (t: string) => {
    switch (t) {
      case 'light': return 'Platinum Ivory (Light)';
      case 'onyx': return 'Royal Onyx (Pure Black)';
      case 'sapphire': return 'Royal Sapphire (Deep Blue)';
      default: return 'Midnight Gold (Dark)';
    }
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        {
          icon: <User size={18} />,
          label: 'Profile',
          desc: `@${activeUsername} • ${activeUser?.email || activeUser?.phone || activeUserName}`,
          onClick: () => {
            setEditName(activeUserName);
            setEditPhone(activeUser?.phone || '');
            setEditEmail(activeUser?.email || '');
            setActiveModal('profile');
          },
        },
        {
          icon: <Lock size={18} />,
          label: 'Change Password',
          desc: 'Update your account sign-in password',
          onClick: () => {
            setCurrentPassInput('');
            setNewPassInput('');
            setConfirmPassInput('');
            setPassError('');
            setPassSuccess('');
            setActiveModal('password');
          },
        },
        {
          icon: <KeyRound size={18} />,
          label: 'Change PIN',
          desc: 'Update your 4-digit backup security PIN',
          onClick: () => {
            setCurrentPinInput('');
            setNewPinInput('');
            setConfirmPinInput('');
            setPinError('');
            setPinSuccess('');
            setActiveModal('pin');
          },
        },
        ...(isVIP
          ? [
              {
                icon: <Shield size={18} />,
                label: 'Privileged Users',
                desc: `${privilegedUsers.length}/5 staff members`,
                onClick: () => navigate('/privileged-users'),
                badge: true,
                isInfoOnly: false,
              },
            ]
          : [
              {
                icon: <Shield size={18} style={{ color: 'var(--color-info)' }} />,
                label: 'Privileged Access',
                desc: 'You are a privileged person only',
                onClick: () => setActiveModal('privileged-info'),
                badge: false,
                isInfoOnly: true,
              },
            ]),
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <Palette size={18} />,
          label: 'Appearance',
          desc: getThemeLabel(theme || 'dark'),
          onClick: () => setActiveModal('theme'),
        },
        {
          icon: <Bell size={18} />,
          label: 'Notifications',
          desc: 'Manage alerts & reminders',
          onClick: () => setActiveModal('notifications'),
        },
      ],
    },
    {
      title: 'Data & Security',
      items: [
        {
          icon: <Database size={18} />,
          label: 'Export Data',
          desc: 'Download your events & contacts as JSON',
          onClick: () => {
            const data = localStorage.getItem('vip-event-intelligence-store-v2');
            if (data) {
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `vip-event-backup-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }
          },
        },
        {
          icon: <Trash2 size={18} />,
          label: 'Clear All Data',
          desc: 'Reset all stored events and profiles',
          onClick: () => setActiveModal('clear'),
          danger: true,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: <Info size={18} />,
          label: 'About VIP Event Intelligence',
          desc: 'v2.0 Executive Edition',
          onClick: () => setActiveModal('about'),
        },
      ],
    },
  ];

  return (
    <div className="screen">
      <div className="screen-header">
        <h2>Settings</h2>
      </div>

      {/* Profile Card */}
      <div
        className={`glass-card ${isVIP ? 'glass-card-gold' : ''} animate-slide-up mb-4`}
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setEditName(activeUserName);
          setEditPhone(activeUser?.phone || '');
          setEditEmail(activeUser?.email || '');
          setActiveModal('profile');
        }}
      >
        <div className="flex items-center gap-3">
          <div className="avatar avatar-lg">{getInitials(activeUserName)}</div>
          <div className="flex-1">
            <div className="font-heading font-bold text-lg">{activeUserName}</div>
            <div className="flex items-center gap-2 mt-1">
              {isVIP ? (
                <>
                  <Crown size={14} style={{ color: 'var(--color-gold)' }} />
                  <span className="text-sm text-gold">VIP Master Account</span>
                </>
              ) : (
                <>
                  <Shield size={14} style={{ color: 'var(--color-info)' }} />
                  <span className="text-sm text-info">{activeUserRole}</span>
                </>
              )}
            </div>
            {(activeUser?.email || activeUser?.phone) && (
              <div className="text-xs text-muted mt-1 flex items-center gap-2 flex-wrap">
                {activeUser.email && <span>{activeUser.email}</span>}
                {activeUser.email && activeUser.phone && <span>•</span>}
                {activeUser.phone && <span>{activeUser.phone}</span>}
              </div>
            )}
          </div>
          <ChevronRight size={18} className="text-muted" />
        </div>
      </div>

      {/* Settings Groups */}
      {settingsGroups.map((group, gi) => (
        <div
          key={gi}
          className="animate-slide-up"
          style={{ animationDelay: `${gi * 0.08}s`, marginBottom: 'var(--space-5)' }}
        >
          <div
            className="text-xs text-muted font-heading font-semibold mb-2"
            style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            {group.title}
          </div>
          <div className="flex flex-col gap-1">
            {group.items.map((item: any, ii) => (
              <div
                key={ii}
                className={`glass-card ${item.isInfoOnly ? '' : 'glass-card-interactive'} flex items-center gap-3`}
                style={{ padding: 'var(--space-3) var(--space-4)', cursor: 'pointer' }}
                onClick={item.onClick}
              >
                <div style={{ color: item.danger ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div
                    className="text-sm font-semibold"
                    style={{ color: item.danger ? 'var(--color-danger)' : undefined }}
                  >
                    {item.label}
                  </div>
                  <div className="text-xs text-muted">{item.desc}</div>
                </div>
                {item.isInfoOnly ? (
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Active</span>
                ) : (
                  <ChevronRight size={16} className="text-muted" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <button className="btn btn-danger w-full mb-8" onClick={handleLogout}>
        <LogOut size={18} /> Sign Out
      </button>

      {/* ─── MODAL: THEME SELECTION ────────────────────────────────────────── */}
      {activeModal === 'theme' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="flex items-center gap-2 mb-2">
              <Palette size={20} className="text-gold" />
              <h3 style={{ margin: 0 }}>Select Theme</h3>
            </div>
            <p className="text-xs text-secondary mb-4">
              Choose your preferred executive interface styling
            </p>

            <div className="flex flex-col gap-3 mb-5">
              {themeOptions.map((t) => {
                const isSelected = (theme || 'dark') === t.id;
                return (
                  <div
                    key={t.id}
                    className={`glass-card flex items-center justify-between p-3 ${
                      isSelected ? 'glass-card-gold' : ''
                    }`}
                    style={{
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--color-gold)' : '1px solid var(--glass-border)',
                      background: isSelected ? 'var(--color-gold-muted)' : undefined,
                    }}
                    onClick={() => {
                      setTheme(t.id as any);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-md)',
                          background: t.colors[0],
                          border: `2px solid ${t.colors[2]}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {t.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-2">
                          {t.name}
                          {t.id === 'light' && (
                            <span className="badge badge-info" style={{ fontSize: '0.6rem' }}>
                              Light Mode
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted">{t.desc}</div>
                      </div>
                    </div>

                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: isSelected ? '2px solid var(--color-gold)' : '2px solid var(--glass-border)',
                        background: isSelected ? 'var(--color-gold)' : 'transparent',
                        color: 'var(--color-text-inverse)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isSelected && <Check size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="btn btn-gold w-full" onClick={() => setActiveModal(null)}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT PROFILE ────────────────────────────────────────────── */}
      {activeModal === 'profile' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Edit Profile</h3>
            <p className="text-xs text-secondary mb-4">Update your profile details and contact information</p>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
              {profileSuccess && (
                <div className="badge badge-success p-2 text-center">{profileSuccess}</div>
              )}

              {/* Username (Read Only in Edit Profile) */}
              <div>
                <label className="label">
                  <span className="text-gold font-semibold">@</span> Username (Account Identifier)
                </label>
                <input
                  className="input"
                  style={{ opacity: 0.75, cursor: 'not-allowed', background: 'rgba(0,0,0,0.2)' }}
                  value={`@${activeUsername}`}
                  disabled
                  readOnly
                />
              </div>

              <div>
                <label className="label">
                  <User size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Full Name / Title
                </label>
                <input
                  className="input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="label">
                  <Phone size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Phone Number
                </label>
                <input
                  className="input"
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="label">
                  <Mail size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Email Address
                </label>
                <input
                  className="input"
                  type="email"
                  placeholder="e.g. user@vip.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold flex-1" disabled={!editName.trim()}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CHANGE PASSWORD ────────────────────────────────────────── */}
      {activeModal === 'password' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Change Account Password</h3>
            <p className="text-xs text-secondary mb-4">Set a new secure sign-in password for @{activeUsername}</p>

            <form onSubmit={handleSavePassword} className="flex flex-col gap-3">
              {passError && (
                <div
                  style={{
                    color: 'var(--color-danger)',
                    fontSize: 'var(--text-xs)',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239, 68, 68, 0.1)',
                  }}
                >
                  {passError}
                </div>
              )}
              {passSuccess && (
                <div
                  style={{
                    color: 'var(--color-confirmed)',
                    fontSize: 'var(--text-xs)',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(34, 197, 94, 0.1)',
                  }}
                >
                  {passSuccess}
                </div>
              )}

              <div>
                <label className="label">Current Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassInput}
                  onChange={(e) => setCurrentPassInput(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">New Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="At least 4 characters"
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassInput}
                  onChange={(e) => setConfirmPassInput(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold flex-1"
                  disabled={!currentPassInput || newPassInput.length < 4 || newPassInput !== confirmPassInput}
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CHANGE PIN ──────────────────────────────────────────────── */}
      {activeModal === 'pin' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Change Security PIN</h3>
            <p className="text-xs text-secondary mb-4">Set a new 4-digit access PIN</p>

            <form onSubmit={handleSavePIN} className="flex flex-col gap-3">
              {pinError && (
                <div
                  style={{
                    color: 'var(--color-danger)',
                    fontSize: 'var(--text-xs)',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239, 68, 68, 0.1)',
                  }}
                >
                  {pinError}
                </div>
              )}
              {pinSuccess && (
                <div
                  style={{
                    color: 'var(--color-confirmed)',
                    fontSize: 'var(--text-xs)',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(34, 197, 94, 0.1)',
                  }}
                >
                  {pinSuccess}
                </div>
              )}

              <div>
                <label className="label">Current PIN</label>
                <input
                  className="input text-center"
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  placeholder="••••"
                  style={{ fontSize: 'var(--text-lg)', letterSpacing: '4px' }}
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  required
                />
              </div>

              <div>
                <label className="label">New 4-Digit PIN</label>
                <input
                  className="input text-center"
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  placeholder="••••"
                  style={{ fontSize: 'var(--text-lg)', letterSpacing: '4px' }}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  required
                />
              </div>

              <div>
                <label className="label">Confirm New PIN</label>
                <input
                  className="input text-center"
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  placeholder="••••"
                  style={{ fontSize: 'var(--text-lg)', letterSpacing: '4px' }}
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  required
                />
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold flex-1"
                  disabled={
                    currentPinInput.length !== 4 ||
                    newPinInput.length !== 4 ||
                    confirmPinInput.length !== 4
                  }
                >
                  Update PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: NOTIFICATIONS ───────────────────────────────────────────── */}
      {activeModal === 'notifications' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Notification Preferences</h3>
            <p className="text-xs text-secondary mb-4">Choose which alerts you receive</p>

            <div className="flex flex-col gap-3 mb-5">
              <div className="glass-card flex items-center justify-between p-3">
                <div>
                  <div className="text-sm font-semibold">Schedule Conflict Warnings</div>
                  <div className="text-xs text-muted">Immediate alert when events overlap</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifConflictAlerts}
                  onChange={(e) => setNotifConflictAlerts(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)' }}
                />
              </div>

              <div className="glass-card flex items-center justify-between p-3">
                <div>
                  <div className="text-sm font-semibold">New Invitation Alerts</div>
                  <div className="text-xs text-muted">Alerts when staff submits an invitation</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifNewInvitations}
                  onChange={(e) => setNotifNewInvitations(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)' }}
                />
              </div>

              <div className="glass-card flex items-center justify-between p-3">
                <div>
                  <div className="text-sm font-semibold">Event Reminders</div>
                  <div className="text-xs text-muted">48h & 24h reminders before confirmed events</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifReminders}
                  onChange={(e) => setNotifReminders(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)' }}
                />
              </div>

              <div className="glass-card flex items-center justify-between p-3">
                <div>
                  <div className="text-sm font-semibold">Schedule Modifications</div>
                  <div className="text-xs text-muted">Changes made by privileged assistants</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifScheduleChanges}
                  onChange={(e) => setNotifScheduleChanges(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)' }}
                />
              </div>
            </div>

            <button className="btn btn-gold w-full" onClick={() => setActiveModal(null)}>
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL: ABOUT ───────────────────────────────────────────────────── */}
      {activeModal === 'about' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="text-center mb-4">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, var(--color-gold-light), var(--color-gold))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-3)',
                  color: 'var(--color-text-inverse)',
                }}
              >
                <Crown size={28} />
              </div>
              <h3 style={{ marginBottom: '2px' }}>VIP Event Intelligence</h3>
              <p className="text-xs text-gold">Executive Private Assistant v2.0</p>
            </div>

            <div className="flex flex-col gap-2 text-xs text-secondary mb-5">
              <div className="glass-card p-3">
                <strong>Protocol Intelligence:</strong> Prioritization matrix & family relationship memory ledger.
              </div>
              <div className="glass-card p-3">
                <strong>Security:</strong> Client-side PIN cryptographic isolation & delegated staff role-based permissions.
              </div>
            </div>

            <button className="btn btn-gold w-full" onClick={() => setActiveModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL: CLEAR DATA CONFIRMATION ──────────────────────────────────── */}
      {activeModal === 'clear' && (
        <div className="modal-overlay modal-centered" onClick={() => setActiveModal(null)}>
          <div className="modal-dialog animate-scale-in text-center" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-3)',
              }}
            >
              <Trash2 size={26} />
            </div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Clear All Data?</h3>
            <p className="text-xs text-secondary mb-5">
              This will permanently delete all your invitations, contacts, events, and gift records. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button className="btn btn-ghost flex-1" onClick={() => setActiveModal(null)}>
                Cancel
              </button>
              <button className="btn btn-danger flex-1" onClick={handleClearData}>
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: PRIVILEGED ACCESS INFO ──────────────────────────────────── */}
      {activeModal === 'privileged-info' && (
        <div className="modal-overlay modal-centered" onClick={() => setActiveModal(null)}>
          <div className="modal-dialog animate-scale-in text-center" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(96, 165, 250, 0.15)',
                color: 'var(--color-info)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-3)',
              }}
            >
              <Shield size={26} />
            </div>
            <h3 style={{ marginBottom: 'var(--space-1)' }}>Privileged Account</h3>
            <p className="text-xs text-secondary mb-4">
              You are a privileged person only. Staff member delegation & access permissions are managed exclusively by the VIP Principal.
            </p>

            <div className="glass-card text-left p-3 mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-xs text-muted mb-1">Your Delegated Role</div>
              <div className="font-semibold text-sm mb-3 text-primary">
                {currentPrivilegedUser?.role || 'Personal Assistant'}
              </div>
              <div className="text-xs text-muted mb-2">Active Permissions</div>
              <div className="flex flex-wrap gap-1">
                {currentPrivilegedUser?.permissions &&
                  Object.entries(currentPrivilegedUser.permissions)
                    .filter(([, v]) => v)
                    .map(([key]) => (
                      <span key={key} className="badge badge-info" style={{ fontSize: '9px' }}>
                        {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    ))}
              </div>
            </div>

            <button className="btn btn-gold w-full" onClick={() => setActiveModal(null)}>
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
