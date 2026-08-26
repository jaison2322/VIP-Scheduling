import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  ArrowLeft, User, Lock, Bell, Palette, Database, Info,
  LogOut, ChevronRight, Shield, Crown, Trash2,
} from 'lucide-react';
import { getInitials } from '../utils/formatters';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { currentUser, isVIP, logout, privilegedUsers } = useAppStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleClearData = () => {
    localStorage.removeItem('vip-event-intelligence-store');
    window.location.reload();
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: <User size={18} />, label: 'Profile', desc: currentUser?.name || 'VIP User', onClick: () => {} },
        { icon: <Lock size={18} />, label: 'Change PIN', desc: 'Update your security PIN', onClick: () => {} },
        {
          icon: <Shield size={18} />,
          label: 'Privileged Users',
          desc: `${privilegedUsers.length}/5 users`,
          onClick: () => navigate('/privileged-users'),
          badge: isVIP,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: <Bell size={18} />, label: 'Notifications', desc: 'Manage notification preferences', onClick: () => {} },
        { icon: <Palette size={18} />, label: 'Appearance', desc: 'Dark theme (default)', onClick: () => {} },
      ],
    },
    {
      title: 'Data',
      items: [
        { icon: <Database size={18} />, label: 'Export Data', desc: 'Download your data as JSON', onClick: () => {
          const data = localStorage.getItem('vip-event-intelligence-store');
          if (data) {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'vip-event-data.json';
            a.click();
            URL.revokeObjectURL(url);
          }
        }},
        { icon: <Trash2 size={18} />, label: 'Clear All Data', desc: 'Reset app to defaults', onClick: () => setShowClearConfirm(true), danger: true },
      ],
    },
    {
      title: 'About',
      items: [
        { icon: <Info size={18} />, label: 'About', desc: 'VIP Event Intelligence v1.0', onClick: () => {} },
      ],
    },
  ];

  return (
    <div className="screen">
      <div className="screen-header">
        <h2>Settings</h2>
      </div>

      {/* Profile Card */}
      <div className="glass-card glass-card-gold animate-slide-up mb-4">
        <div className="flex items-center gap-3">
          <div className="avatar avatar-lg">{currentUser ? getInitials(currentUser.name) : 'VIP'}</div>
          <div className="flex-1">
            <div className="font-heading font-bold text-lg">{currentUser?.name || 'VIP User'}</div>
            <div className="flex items-center gap-2 mt-1">
              <Crown size={14} style={{ color: 'var(--color-gold)' }} />
              <span className="text-sm text-gold">{isVIP ? 'VIP Master Account' : 'Privileged User'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Groups */}
      {settingsGroups.map((group, gi) => (
        <div key={gi} className="animate-slide-up" style={{ animationDelay: `${gi * 0.1}s`, marginBottom: 'var(--space-5)' }}>
          <div className="text-xs text-muted font-heading font-semibold mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {group.title}
          </div>
          <div className="flex flex-col gap-1">
            {group.items.map((item, ii) => (
              <div
                key={ii}
                className="glass-card glass-card-interactive flex items-center gap-3"
                style={{ padding: 'var(--space-3) var(--space-4)', cursor: 'pointer' }}
                onClick={item.onClick}
              >
                <div style={{ color: (item as any).danger ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{ color: (item as any).danger ? 'var(--color-danger)' : undefined }}>
                    {item.label}
                  </div>
                  <div className="text-xs text-muted">{item.desc}</div>
                </div>
                <ChevronRight size={16} className="text-muted" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <button className="btn btn-danger w-full mb-6" onClick={handleLogout}>
        <LogOut size={18} /> Sign Out
      </button>

      {/* Clear Data Confirmation */}
      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ marginBottom: 'var(--space-3)' }}>Clear All Data?</h3>
            <p className="text-sm text-secondary mb-6">
              This will permanently delete all your data including invitations, contacts, events, and gift records. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button className="btn btn-ghost flex-1" onClick={() => setShowClearConfirm(false)}>Cancel</button>
              <button className="btn btn-danger flex-1" onClick={handleClearData}>Clear Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
