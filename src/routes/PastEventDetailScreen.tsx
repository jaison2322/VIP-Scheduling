import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  ArrowLeft,
  Calendar,
  Users,
  Gift,
  MapPin,
  Edit3,
  Plus,
  Trash2,
  Check,
  X,
  Sparkles,
  Link2,
  UserPlus,
} from 'lucide-react';
import {
  formatFullDate,
  formatCurrency,
  getEventTypeIcon,
  getInitials,
  getGiftCategoryLabel,
  getRelationshipLabel,
} from '../utils/formatters';
import type { GuestRecord, GiftCategory, RelationshipType } from '../types';
import { generateId } from '../utils/id';

export default function PastEventDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    familyEvents,
    updateFamilyEvent,
    removeFamilyEvent,
    addPerson,
    people,
    isVIP,
    currentPrivilegedUser,
    addActivityLog,
  } = useAppStore();

  const canEdit = isVIP || !!currentPrivilegedUser?.permissions?.canEditEvents;

  // Delete event confirmation modal state
  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);

  // Active modal: 'addGuest' | 'editGuest' | null
  const [modalType, setModalType] = useState<'addGuest' | 'editGuest' | null>(null);
  const [selectedGuestIndex, setSelectedGuestIndex] = useState<number | null>(null);

  // Modal form state
  const [guestName, setGuestName] = useState('');
  const [guestPersonId, setGuestPersonId] = useState('');
  const [guestRelationship, setGuestRelationship] = useState<RelationshipType>('friend');
  const [guestAttendance, setGuestAttendance] = useState<'attended' | 'invited_not_attended' | 'unknown'>('attended');
  const [guestGift, setGuestGift] = useState('');
  const [guestCategory, setGuestCategory] = useState<GiftCategory>('other');
  const [guestValue, setGuestValue] = useState<number | undefined>(undefined);
  const [guestNotes, setGuestNotes] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const event = familyEvents.find((e) => e.id === id);

  const handleDeleteEvent = () => {
    if (!event) return;
    removeFamilyEvent(event.id);
    addActivityLog({
      userId: isVIP ? 'vip' : currentPrivilegedUser?.id || 'staff',
      userName: isVIP ? 'VIP Principal' : currentPrivilegedUser?.name || 'Staff User',
      action: `deleted past family function "${event.name}"`,
      entityType: 'event',
      entityId: event.id,
      entityName: event.name,
    });
    navigate('/past-events', { replace: true });
  };

  if (!event) {
    return (
      <div className="screen-no-nav flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-muted mb-4">Past event function not found</p>
          <button className="btn btn-gold" onClick={() => navigate('/past-events')}>
            View Past Functions
          </button>
        </div>
      </div>
    );
  }

  const attended = event.guests.filter((g) => g.attendance === 'attended');
  const totalGiftValue = event.guests.reduce((s, g) => s + (g.estimatedValue || 0), 0);

  const giftCategories: GiftCategory[] = [
    'gold',
    'silver',
    'cash',
    'clothing',
    'electronics',
    'household',
    'jewelry',
    'other',
  ];

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

  // Open modal to add a missed guest
  const handleOpenAddGuest = () => {
    setGuestName('');
    setGuestPersonId('');
    setGuestRelationship('friend');
    setGuestAttendance('attended');
    setGuestGift('');
    setGuestCategory('other');
    setGuestValue(undefined);
    setGuestNotes('');
    setSelectedGuestIndex(null);
    setShowSuggestions(false);
    setModalType('addGuest');
  };

  // Open modal to edit an existing guest
  const handleOpenEditGuest = (guest: GuestRecord, index: number) => {
    const linkedPerson = people.find((p) => p.id === guest.personId);
    setGuestName(guest.personName);
    setGuestPersonId(guest.personId || '');
    setGuestRelationship(guest.relationship || linkedPerson?.relationship || 'friend');
    setGuestAttendance(guest.attendance);
    setGuestGift(guest.gift || '');
    setGuestCategory(guest.giftCategory || 'other');
    setGuestValue(guest.estimatedValue);
    setGuestNotes(guest.notes || '');
    setSelectedGuestIndex(index);
    setShowSuggestions(false);
    setModalType('editGuest');
  };

  // Autocomplete matching contacts
  const matchingContacts =
    guestName.trim().length > 0 && !guestPersonId
      ? people.filter(
          (p) =>
            p.name.toLowerCase().includes(guestName.trim().toLowerCase()) ||
            p.nickname.toLowerCase().includes(guestName.trim().toLowerCase())
        )
      : [];

  const handleSelectPerson = (person: typeof people[0]) => {
    setGuestPersonId(person.id);
    setGuestName(person.name);
    setGuestRelationship(person.relationship);
    setShowSuggestions(false);
  };

  // Save guest from modal (add or edit)
  const handleSaveGuestModal = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = guestName.trim();
    if (!trimmedName || !event) return;

    let finalPersonId = guestPersonId;

    // Check if person exists or create new contact
    const existing = people.find(
      (p) => p.id === finalPersonId || p.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existing) {
      finalPersonId = existing.id;
    } else {
      const newPerson = addPerson({
        name: trimmedName,
        nickname: trimmedName,
        relationship: guestRelationship,
        notes: `Added from past event: ${event.name}`,
      });
      finalPersonId = newPerson.id;
    }

    const updatedGuests = [...event.guests];

    const guestPayload: GuestRecord = {
      id: modalType === 'editGuest' && selectedGuestIndex !== null ? updatedGuests[selectedGuestIndex].id : generateId('guest'),
      personId: finalPersonId,
      personName: trimmedName,
      relationship: guestRelationship,
      attendance: guestAttendance,
      gift: guestGift.trim() || undefined,
      giftCategory: guestCategory,
      estimatedValue: guestValue ? Number(guestValue) : undefined,
      notes: guestNotes.trim() || undefined,
    };

    if (modalType === 'editGuest' && selectedGuestIndex !== null) {
      updatedGuests[selectedGuestIndex] = guestPayload;
    } else {
      updatedGuests.push(guestPayload);
    }

    updateFamilyEvent(event.id, { guests: updatedGuests });

    addActivityLog({
      userId: isVIP ? 'vip' : currentPrivilegedUser?.id || 'staff',
      userName: isVIP ? 'VIP Principal' : currentPrivilegedUser?.name || 'Staff User',
      action: modalType === 'editGuest'
        ? `updated guest details for "${trimmedName}" in event "${event.name}"`
        : `added missed guest "${trimmedName}" to past event "${event.name}"`,
      entityType: 'event',
      entityId: event.id,
      entityName: event.name,
    });

    setModalType(null);
  };

  // Delete guest from event
  const handleDeleteGuest = (index: number) => {
    if (!event) return;
    const removedGuestName = event.guests[index]?.personName || 'Guest';
    const updatedGuests = event.guests.filter((_, i) => i !== index);
    updateFamilyEvent(event.id, { guests: updatedGuests });

    addActivityLog({
      userId: isVIP ? 'vip' : currentPrivilegedUser?.id || 'staff',
      userName: isVIP ? 'VIP Principal' : currentPrivilegedUser?.name || 'Staff User',
      action: `removed guest "${removedGuestName}" from past event "${event.name}"`,
      entityType: 'event',
      entityId: event.id,
      entityName: event.name,
    });

    setModalType(null);
  };

  return (
    <div className="screen-no-nav" style={{ paddingBottom: '80px' }}>
      {/* Top Bar */}
      <div className="top-bar">
        <button className="top-bar-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <span className="top-bar-title">Event Details</span>
        {canEdit ? (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: 'var(--text-xs)' }}
              onClick={() => navigate(`/edit-event/${event.id}`)}
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>
            <button
              className="btn btn-sm btn-ghost text-danger"
              style={{ padding: '6px', color: 'var(--color-danger)' }}
              onClick={() => setShowDeleteEventModal(true)}
              title="Delete Function"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ) : (
          <div style={{ width: '36px' }} />
        )}
      </div>

      {/* Header Hero Card */}
      <div className="hero-event-card animate-slide-up">
        <div className="flex items-start justify-between">
          <span style={{ fontSize: '32px' }}>{getEventTypeIcon(event.eventType)}</span>
          {canEdit && (
            <button
              className="btn btn-sm btn-ghost text-gold"
              onClick={() => navigate(`/edit-event/${event.id}`)}
              style={{ fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Edit3 size={12} /> Edit Function
            </button>
          )}
        </div>
        <h2 style={{ marginTop: 'var(--space-2)' }}>{event.name}</h2>
        <p className="text-sm text-secondary mt-1">{event.familyMember}</p>

        <div className="flex flex-col gap-2 mt-3 text-sm text-secondary">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gold" /> {formatFullDate(event.date)}
          </div>
          {event.venue && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-gold" /> {event.venue}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid animate-slide-up delay-1 mt-4 mb-4">
        <div className="stat-card">
          <div className="stat-value">{event.guests.length}</div>
          <div className="stat-label">Total Guests</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-confirmed)' }}>
            {attended.length}
          </div>
          <div className="stat-label">Attended</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: 'var(--text-base)' }}>
            {totalGiftValue > 0 ? formatCurrency(totalGiftValue) : '—'}
          </div>
          <div className="stat-label">Gift Total</div>
        </div>
      </div>

      {/* Guest List */}
      <div className="animate-slide-up delay-2">
        <div className="section-header flex items-center justify-between">
          <span className="section-title">
            <Users size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Guest List ({event.guests.length})
          </span>
          {canEdit && (
            <button
              className="btn btn-sm btn-gold"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)' }}
              onClick={handleOpenAddGuest}
            >
              <Plus size={13} /> Add Missed Guest
            </button>
          )}
        </div>

        {event.guests.length === 0 ? (
          <div className="glass-card text-center p-5 mb-4">
            <p className="text-xs text-muted mb-3">No guests recorded yet for this event.</p>
            {canEdit && (
              <button className="btn btn-sm btn-outline" onClick={handleOpenAddGuest}>
                <Plus size={14} /> Add First Guest
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {event.guests.map((guest, i) => {
              const linkedPerson = people.find((p) => p.id === guest.personId);
              const relationship = guest.relationship || linkedPerson?.relationship;

              return (
                <div
                  key={guest.id}
                  className="glass-card glass-card-interactive"
                  style={{ padding: 'var(--space-3) var(--space-4)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="avatar avatar-sm cursor-pointer"
                      onClick={() => guest.personId && navigate(`/person/${guest.personId}`)}
                    >
                      {getInitials(guest.personName)}
                    </div>
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        if (canEdit) {
                          handleOpenEditGuest(guest, i);
                        } else if (guest.personId) {
                          navigate(`/person/${guest.personId}`);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{guest.personName}</span>
                        {relationship && (
                          <span className="badge badge-gold" style={{ fontSize: '8px' }}>
                            {getRelationshipLabel(relationship)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-1 flex items-center gap-2">
                        <span
                          className={`badge badge-${
                            guest.attendance === 'attended'
                              ? 'confirmed'
                              : guest.attendance === 'invited_not_attended'
                              ? 'ignored'
                              : 'pending'
                          }`}
                          style={{ fontSize: '8px' }}
                        >
                          {guest.attendance === 'attended'
                            ? '✓ Attended'
                            : guest.attendance === 'invited_not_attended'
                            ? '✕ Not Attended'
                            : 'Unknown'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <div>
                        {guest.gift && (
                          <div className="flex items-center gap-1 text-sm text-gold">
                            <Gift size={12} /> {guest.gift}
                          </div>
                        )}
                        {guest.estimatedValue && (
                          <div className="text-xs text-muted mt-1">
                            {formatCurrency(guest.estimatedValue)}
                          </div>
                        )}
                      </div>

                      {canEdit && (
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost text-muted"
                          title="Edit guest & gift details"
                          style={{ padding: '6px' }}
                          onClick={() => handleOpenEditGuest(guest, i)}
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {guest.notes && (
                    <p className="text-xs text-muted mt-2" style={{ paddingLeft: 'var(--space-10)' }}>
                      {guest.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes Section */}
      {event.notes && (
        <div className="glass-card mt-4 animate-slide-up delay-3">
          <div className="text-sm font-semibold mb-2">Event Notes</div>
          <p className="text-sm text-secondary">{event.notes}</p>
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT GUEST ─────────────────────────────────────────── */}
      {modalType !== null && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="flex items-center justify-between mb-2">
              <h3 style={{ margin: 0 }}>
                {modalType === 'editGuest' ? 'Edit Guest & Gift Details' : 'Add Missed Guest'}
              </h3>
              {modalType === 'editGuest' && selectedGuestIndex !== null && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost text-danger"
                  onClick={() => handleDeleteGuest(selectedGuestIndex)}
                  title="Remove Guest"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px' }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
            <p className="text-xs text-secondary mb-4">
              {modalType === 'editGuest'
                ? 'Update attendance, gift values, and contact relationship'
                : 'Add a missed attendee and auto-save them to your People directory'}
            </p>

            <form onSubmit={handleSaveGuestModal} className="flex flex-col gap-3">
              {/* Guest Name & Autocomplete */}
              <div style={{ position: 'relative' }}>
                <label className="label">Guest Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    value={guestName}
                    onChange={(e) => {
                      setGuestName(e.target.value);
                      if (guestPersonId) setGuestPersonId('');
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Type name (e.g. Ramesh, Priya Sharma)..."
                    required
                  />
                  {guestPersonId && (
                    <button
                      type="button"
                      onClick={() => {
                        setGuestPersonId('');
                      }}
                      title="Unlink contact"
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && matchingContacts.length > 0 && !guestPersonId && (
                  <div
                    className="glass-card animate-scale-in"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 50,
                      marginTop: '4px',
                      maxHeight: '160px',
                      overflowY: 'auto',
                      padding: '4px',
                      boxShadow: 'var(--shadow-xl)',
                      border: '1px solid var(--color-gold)',
                      background: 'var(--color-bg-elevated)',
                    }}
                  >
                    <div
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.65rem',
                        color: 'var(--color-gold)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}
                    >
                      Matching Contacts
                    </div>
                    {matchingContacts.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center justify-between p-2 rounded cursor-pointer"
                        style={{ borderBottom: '1px solid var(--glass-border)' }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectPerson(person);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="avatar avatar-sm">{getInitials(person.name)}</div>
                          <div>
                            <div className="text-xs font-semibold text-primary">{person.name}</div>
                            <div className="text-xs text-muted">
                              {getRelationshipLabel(person.relationship)}
                            </div>
                          </div>
                        </div>
                        <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>
                          Select
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {guestPersonId ? (
                  <div className="badge badge-success mt-1" style={{ fontSize: '0.65rem' }}>
                    <Link2 size={10} style={{ display: 'inline', marginRight: '3px' }} />
                    Linked VIP Contact
                  </div>
                ) : guestName.trim() ? (
                  <div className="badge badge-info mt-1" style={{ fontSize: '0.65rem' }}>
                    <Sparkles size={10} style={{ display: 'inline', marginRight: '3px' }} />
                    New Contact — will be saved to People directory
                  </div>
                ) : null}
              </div>

              {/* Relationship */}
              <div>
                <label className="label">Relationship</label>
                <select
                  className="select"
                  value={guestRelationship}
                  onChange={(e) => setGuestRelationship(e.target.value as RelationshipType)}
                >
                  {relationships.map((r) => (
                    <option key={r} value={r}>
                      {getRelationshipLabel(r)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Attendance */}
              <div>
                <label className="label">Attendance Status</label>
                <select
                  className="select"
                  value={guestAttendance}
                  onChange={(e) =>
                    setGuestAttendance(e.target.value as 'attended' | 'invited_not_attended' | 'unknown')
                  }
                >
                  <option value="attended">Attended</option>
                  <option value="invited_not_attended">Invited (didn&apos;t attend)</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

              {/* Gift description */}
              <div>
                <label className="label">Gift Received / Given</label>
                <input
                  className="input"
                  value={guestGift}
                  onChange={(e) => setGuestGift(e.target.value)}
                  placeholder="e.g., Gold Coin 10g, Cash Envelope ₹5000, Watch"
                />
              </div>

              {/* Gift Category & Estimated Value */}
              <div className="grid-2">
                <div>
                  <label className="label">Category</label>
                  <select
                    className="select"
                    value={guestCategory}
                    onChange={(e) => setGuestCategory(e.target.value as GiftCategory)}
                  >
                    {giftCategories.map((c) => (
                      <option key={c} value={c}>
                        {getGiftCategoryLabel(c)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Value (₹)</label>
                  <input
                    className="input"
                    type="number"
                    value={guestValue ?? ''}
                    onChange={(e) => setGuestValue(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="₹ Value"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="label">Notes / Seating / Family Ties</label>
                <textarea
                  className="textarea"
                  value={guestNotes}
                  onChange={(e) => setGuestNotes(e.target.value)}
                  placeholder="Additional memory notes..."
                  rows={2}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => setModalType(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold flex-1"
                  disabled={!guestName.trim()}
                >
                  {modalType === 'editGuest' ? 'Update Guest' : 'Add Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Event Confirmation Modal */}
      {showDeleteEventModal && (
        <div className="modal-overlay modal-centered" onClick={() => setShowDeleteEventModal(false)}>
          <div className="modal-dialog animate-scale-in text-center" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-3)',
              }}
            >
              <Trash2 size={24} />
            </div>
            <h3 style={{ marginBottom: 'var(--space-1)' }}>Delete Event Function?</h3>
            <p className="text-xs text-secondary mb-4">
              Are you sure you want to delete "{event.name}" and all {event.guests.length} guest records associated with it? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button className="btn btn-ghost flex-1" onClick={() => setShowDeleteEventModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger flex-1" onClick={handleDeleteEvent}>
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
