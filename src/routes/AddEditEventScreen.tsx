import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ArrowLeft, Plus, Trash2, UserPlus } from 'lucide-react';
import type { EventType, GuestRecord, GiftCategory } from '../types';
import { getEventTypeLabel } from '../utils/formatters';
import { generateId } from '../utils/id';

export default function AddEditEventScreen() {
  const navigate = useNavigate();
  const { addFamilyEvent, people } = useAppStore();

  const [name, setName] = useState('');
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [date, setDate] = useState('');
  const [familyMember, setFamilyMember] = useState('');
  const [venue, setVenue] = useState('');
  const [notes, setNotes] = useState('');
  const [guests, setGuests] = useState<GuestRecord[]>([]);

  const eventTypes: EventType[] = [
    'wedding', 'engagement', 'birthday', 'anniversary', 'house_warming',
    'baby_shower', 'graduation', 'retirement', 'reception', 'religious', 'other',
  ];

  const giftCategories: GiftCategory[] = ['gold', 'silver', 'cash', 'clothing', 'electronics', 'household', 'jewelry', 'other'];

  const addGuest = () => {
    setGuests([...guests, {
      id: generateId('guest'),
      personId: '',
      personName: '',
      attendance: 'attended',
      gift: '',
      giftDescription: '',
      giftCategory: 'other',
      estimatedValue: undefined,
      notes: '',
    }]);
  };

  const updateGuest = (index: number, field: string, value: any) => {
    const updated = [...guests];
    (updated[index] as any)[field] = value;
    // If person selected from dropdown, update personId and name
    if (field === 'personId' && value) {
      const person = people.find((p) => p.id === value);
      if (person) {
        updated[index].personName = person.name;
      }
    }
    setGuests(updated);
  };

  const removeGuest = (index: number) => {
    setGuests(guests.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim() || !date) return;
    addFamilyEvent({
      name: name.trim(),
      eventType,
      date,
      familyMember: familyMember.trim(),
      description: '',
      venue: venue.trim() || undefined,
      guests,
      notes: notes.trim() || undefined,
    });
    navigate(-1);
  };

  return (
    <div className="screen-no-nav" style={{ paddingBottom: '100px' }}>
      <div className="top-bar">
        <button className="top-bar-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <span className="top-bar-title">Add Family Event</span>
        <div style={{ width: '36px' }} />
      </div>

      <div className="flex flex-col gap-4 animate-slide-up">
        <div>
          <label className="label">Event Name *</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Daughter's Wedding" />
        </div>

        <div>
          <label className="label">Event Type</label>
          <select className="select" value={eventType} onChange={(e) => setEventType(e.target.value as EventType)}>
            {eventTypes.map((t) => <option key={t} value={t}>{getEventTypeLabel(t)}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Date *</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div>
          <label className="label">Family Member</label>
          <input className="input" value={familyMember} onChange={(e) => setFamilyMember(e.target.value)} placeholder="e.g., Daughter - Meera" />
        </div>

        <div>
          <label className="label">Venue</label>
          <input className="input" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Event venue" />
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." />
        </div>

        {/* Guest List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="label" style={{ margin: 0 }}>Guest List</label>
            <button className="btn btn-sm btn-outline" onClick={addGuest}>
              <UserPlus size={14} /> Add Guest
            </button>
          </div>

          {guests.map((guest, i) => (
            <div key={guest.id} className="glass-card mb-3" style={{ padding: 'var(--space-3)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Guest #{i + 1}</span>
                <button className="btn btn-sm btn-ghost" onClick={() => removeGuest(i)}>
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <select className="select" value={guest.personId} onChange={(e) => updateGuest(i, 'personId', e.target.value)}>
                  <option value="">Select a person...</option>
                  {people.map((p) => <option key={p.id} value={p.id}>{p.nickname} ({p.name})</option>)}
                </select>

                {!guest.personId && (
                  <input className="input" value={guest.personName} onChange={(e) => updateGuest(i, 'personName', e.target.value)} placeholder="Or type a name" />
                )}

                <select className="select" value={guest.attendance} onChange={(e) => updateGuest(i, 'attendance', e.target.value)}>
                  <option value="attended">Attended</option>
                  <option value="invited_not_attended">Invited (didn't attend)</option>
                  <option value="unknown">Unknown</option>
                </select>

                <input className="input" value={guest.gift || ''} onChange={(e) => updateGuest(i, 'gift', e.target.value)} placeholder="Gift (e.g., Gold Coin)" />

                <div className="grid-2">
                  <select className="select" value={guest.giftCategory || 'other'} onChange={(e) => updateGuest(i, 'giftCategory', e.target.value)}>
                    {giftCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input className="input" type="number" value={guest.estimatedValue || ''} onChange={(e) => updateGuest(i, 'estimatedValue', parseInt(e.target.value) || undefined)} placeholder="Value ₹" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: 'var(--space-4) var(--space-6)',
        paddingBottom: 'calc(var(--space-6) + var(--safe-area-bottom))',
        background: 'rgba(6, 10, 19, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--glass-border)',
      }}>
        <button className="btn btn-gold w-full" onClick={handleSave} disabled={!name.trim() || !date}>
          Save Event
        </button>
      </div>
    </div>
  );
}
