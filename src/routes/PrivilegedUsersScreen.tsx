import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ArrowLeft, Plus, UserPlus, Shield, Trash2, Clock } from 'lucide-react';
import { getInitials, formatTimeAgo } from '../utils/formatters';
import type { PermissionKey } from '../types';

export default function PrivilegedUsersScreen() {
  const navigate = useNavigate();
  const { privilegedUsers, isVIP, removePrivilegedUser, addPrivilegedUser } = useAppStore();

  useEffect(() => {
    if (!isVIP) {
      navigate('/settings', { replace: true });
    }
  }, [isVIP, navigate]);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPin, setNewPin] = useState('');

  const handleAddUser = () => {
    if (!newName.trim() || !newRole.trim() || newPin.length !== 4) return;
    const defaultPerms: Record<PermissionKey, boolean> = {
      canAddInvitations: true,
      canEditEvents: false,
      canChangePriority: false,
      canManageSchedule: false,
      canViewGiftHistory: false,
      canAddPeople: false,
    };
    addPrivilegedUser({
      name: newName.trim(),
      role: newRole.trim(),
      pin: newPin,
      phone: newPhone.trim() || undefined,
      email: newEmail.trim() || undefined,
      permissions: defaultPerms,
      addedBy: 'vip',
    });
    setShowAdd(false);
    setNewName('');
    setNewRole('');
    setNewPhone('');
    setNewEmail('');
    setNewPin('');
  };

  return (
    <div className="screen-no-nav">
      <div className="top-bar">
        <button className="top-bar-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <span className="top-bar-title">Privileged Users</span>
        <div style={{ width: '36px' }} />
      </div>

      {/* Count indicator */}
      <div className="glass-card glass-card-gold animate-slide-up" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={18} style={{ color: 'var(--color-gold)' }} />
            <span className="font-heading font-semibold">Access Control</span>
          </div>
          <span className="badge badge-gold">{privilegedUsers.length}/5 Users</span>
        </div>
        <p className="text-xs text-muted mt-2">
          Privileged users can perform actions on your behalf. Maximum 5 users allowed.
        </p>
      </div>

      {/* User List */}
      <div className="flex flex-col gap-3">
        {privilegedUsers.map((user, i) => (
          <div key={user.id} className="glass-card animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-center gap-3">
              <div className="avatar">{getInitials(user.name)}</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{user.name}</div>
                <div className="text-xs text-muted">{user.role}</div>
                {(user.email || user.phone) && (
                  <div className="text-xs text-muted mt-1">
                    {user.email} {user.email && user.phone ? '•' : ''} {user.phone}
                  </div>
                )}
                {user.lastActive && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted">
                    <Clock size={10} /> Last active {formatTimeAgo(user.lastActive)}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button className="btn btn-sm btn-outline" onClick={() => navigate(`/permissions/${user.id}`)}>
                  Manage
                </button>
                {isVIP && (
                  <button className="btn btn-sm btn-danger" onClick={() => removePrivilegedUser(user.id)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Permission Summary */}
            <div className="flex flex-wrap gap-1 mt-3">
              {Object.entries(user.permissions).filter(([, v]) => v).map(([key]) => (
                <span key={key} className="badge badge-info" style={{ fontSize: '8px' }}>
                  {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add User */}
      {isVIP && privilegedUsers.length < 5 && (
        <>
          {!showAdd ? (
            <button className="btn btn-outline w-full mt-4" onClick={() => setShowAdd(true)}>
              <UserPlus size={16} /> Add Privileged User
            </button>
          ) : (
            <div className="glass-card mt-4 animate-scale-in">
              <h4 style={{ marginBottom: 'var(--space-3)' }}>Add New User</h4>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="label">Name</label>
                  <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Deepa" />
                </div>
                <div>
                  <label className="label">Role</label>
                  <input className="input" value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="e.g., Personal Assistant" />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input className="input" type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="e.g., +91 98765 43210" />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input className="input" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="e.g., deepa@executive.com" />
                </div>
                <div>
                  <label className="label">4-Digit PIN</label>
                  <input className="input" type="password" maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} placeholder="••••" />
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-ghost flex-1" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button className="btn btn-gold flex-1" onClick={handleAddUser} disabled={!newName.trim() || !newRole.trim() || newPin.length !== 4}>Add User</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
