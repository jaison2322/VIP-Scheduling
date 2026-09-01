import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  Search,
  Plus,
  Users,
  Edit3,
  Trash2,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { getInitials, getRelationshipLabel } from '../utils/formatters';
import type { RelationshipType, Person } from '../types';

export default function PeopleListScreen() {
  const navigate = useNavigate();
  const {
    people,
    addPerson,
    updatePerson,
    removePerson,
    isVIP,
    currentPrivilegedUser,
    addActivityLog,
  } = useAppStore();

  const canManagePeople = isVIP || !!currentPrivilegedUser?.permissions?.canAddPeople;

  const [search, setSearch] = useState('');

  // Modal State: 'add' | 'edit' | 'delete' | null
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [formRelationship, setFormRelationship] = useState<RelationshipType>('friend');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const filtered = people.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.nickname.toLowerCase().includes(q) ||
      p.relationship.toLowerCase().includes(q)
    );
  });

  const relationships: RelationshipType[] = [
    'family',
    'relative',
    'friend',
    'business_partner',
    'client',
    'colleague',
    'neighbor',
    'acquaintance',
    'other',
  ];

  const handleOpenAdd = () => {
    setFormName('');
    setFormNickname('');
    setFormRelationship('friend');
    setFormPhone('');
    setFormEmail('');
    setFormNotes('');
    setSelectedPersonId(null);
    setModalMode('add');
  };

  const handleOpenEdit = (person: Person) => {
    setFormName(person.name);
    setFormNickname(person.nickname || person.name);
    setFormRelationship(person.relationship);
    setFormPhone(person.phone || '');
    setFormEmail(person.email || '');
    setFormNotes(person.notes || '');
    setSelectedPersonId(person.id);
    setModalMode('edit');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formName.trim();
    if (!trimmedName) return;

    if (modalMode === 'edit' && selectedPersonId) {
      updatePerson(selectedPersonId, {
        name: trimmedName,
        nickname: formNickname.trim() || trimmedName,
        relationship: formRelationship,
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined,
        notes: formNotes.trim() || undefined,
      });

      addActivityLog({
        userId: isVIP ? 'vip' : currentPrivilegedUser?.id || 'staff',
        userName: isVIP ? 'VIP Principal' : currentPrivilegedUser?.name || 'Staff User',
        action: `updated contact details for "${trimmedName}"`,
        entityType: 'person',
        entityId: selectedPersonId,
        entityName: trimmedName,
      });
    } else {
      const created = addPerson({
        name: trimmedName,
        nickname: formNickname.trim() || trimmedName,
        relationship: formRelationship,
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined,
        notes: formNotes.trim() || undefined,
      });

      addActivityLog({
        userId: isVIP ? 'vip' : currentPrivilegedUser?.id || 'staff',
        userName: isVIP ? 'VIP Principal' : currentPrivilegedUser?.name || 'Staff User',
        action: `added new VIP contact "${trimmedName}"`,
        entityType: 'person',
        entityId: created.id,
        entityName: trimmedName,
      });
    }

    setModalMode(null);
  };

  const handleConfirmDelete = () => {
    if (!selectedPersonId) return;
    const person = people.find((p) => p.id === selectedPersonId);
    removePerson(selectedPersonId);

    addActivityLog({
      userId: isVIP ? 'vip' : currentPrivilegedUser?.id || 'staff',
      userName: isVIP ? 'VIP Principal' : currentPrivilegedUser?.name || 'Staff User',
      action: `removed contact "${person?.name || 'Contact'}"`,
      entityType: 'person',
      entityId: selectedPersonId,
      entityName: person?.name,
    });

    setModalMode(null);
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="flex items-center justify-between">
          <h2>People</h2>
          {canManagePeople && (
            <button className="btn btn-sm btn-gold" onClick={handleOpenAdd}>
              <Plus size={14} /> Add Person
            </button>
          )}
        </div>
        <p className="text-sm text-secondary mt-1">{people.length} VIP contacts in directory</p>
      </div>

      <div className="search-bar mb-4">
        <Search size={16} className="search-bar-icon" />
        <input
          placeholder="Search by name, nickname, or relationship..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* People List */}
      <div className="flex flex-col gap-2">
        {filtered.map((person, i) => (
          <div
            key={person.id}
            className="glass-card glass-card-interactive animate-slide-up"
            style={{ animationDelay: `${i * 0.04}s`, padding: 'var(--space-3) var(--space-4)' }}
            onClick={() => navigate(`/person/${person.id}`)}
          >
            <div className="flex items-center gap-3">
              <div className="avatar">{getInitials(person.name)}</div>
              <div className="flex-1">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <span>{person.nickname || person.name}</span>
                </div>
                <div className="text-xs text-muted mt-0.5">{person.name}</div>
              </div>

              <div className="flex items-center gap-2">
                <span className="badge badge-gold" style={{ fontSize: '9px' }}>
                  {getRelationshipLabel(person.relationship)}
                </span>

                {canManagePeople && (
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost text-muted"
                    style={{ padding: '6px' }}
                    title="Edit Contact"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(person);
                    }}
                  >
                    <Edit3 size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users size={28} />
            </div>
            <div className="empty-state-title">No People Found</div>
            <div className="empty-state-text">
              {search ? 'No contacts match your search.' : 'Add contacts to build your VIP network.'}
            </div>
            {canManagePeople && (
              <button className="btn btn-gold mt-4" onClick={handleOpenAdd}>
                <Plus size={14} /> Add First Contact
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── MODAL: ADD / EDIT PERSON ───────────────────────────────────────── */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="modal-overlay" onClick={() => setModalMode(null)}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="flex items-center justify-between mb-2">
              <h3 style={{ margin: 0 }}>
                {modalMode === 'edit' ? 'Edit VIP Contact' : 'Add New VIP Contact'}
              </h3>
              {modalMode === 'edit' && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost text-danger"
                  onClick={() => setModalMode('delete')}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px' }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
            <p className="text-xs text-secondary mb-4">
              {modalMode === 'edit'
                ? 'Update contact details, relationship tier, and notes'
                : 'Add a new person to your executive relationship network'}
            </p>

            <form onSubmit={handleSaveForm} className="flex flex-col gap-3">
              {/* Full Name */}
              <div>
                <label className="label">Full Name *</label>
                <input
                  className="input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Rajesh Khanna"
                  autoFocus
                  required
                />
              </div>

              {/* Nickname / Display Name */}
              <div>
                <label className="label">Display Name / Nickname</label>
                <input
                  className="input"
                  value={formNickname}
                  onChange={(e) => setFormNickname(e.target.value)}
                  placeholder="e.g., Ramesh (Business Partner)"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="label">Relationship Tier *</label>
                <select
                  className="select"
                  value={formRelationship}
                  onChange={(e) => setFormRelationship(e.target.value as RelationshipType)}
                >
                  {relationships.map((r) => (
                    <option key={r} value={r}>
                      {getRelationshipLabel(r)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone & Email */}
              <div className="grid-2">
                <div>
                  <label className="label">Phone</label>
                  <input
                    className="input"
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="contact@vip.com"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="label">Notes / Relationship Context</label>
                <textarea
                  className="textarea"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Family relations, important preferences, VIP background..."
                  rows={2}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => setModalMode(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold flex-1"
                  disabled={!formName.trim()}
                >
                  {modalMode === 'edit' ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CENTERED DELETE CONFIRMATION ─────────────────────────────── */}
      {modalMode === 'delete' && (
        <div className="modal-overlay modal-centered" onClick={() => setModalMode('edit')}>
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

            <h3 style={{ marginBottom: 'var(--space-2)' }}>Delete Contact?</h3>
            <p className="text-xs text-secondary mb-5">
              Are you sure you want to remove <strong>{formName}</strong> from your VIP directory? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                className="btn btn-ghost flex-1"
                onClick={() => setModalMode('edit')}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger flex-1"
                onClick={handleConfirmDelete}
              >
                Delete Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
