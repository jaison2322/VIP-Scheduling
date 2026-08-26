import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ArrowLeft, Calendar, Users, Gift, MapPin } from 'lucide-react';
import { formatFullDate, formatCurrency, getEventTypeIcon, getInitials, getGiftCategoryLabel } from '../utils/formatters';

export default function PastEventDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { familyEvents } = useAppStore();

  const event = familyEvents.find((e) => e.id === id);
  if (!event) {
    return (
      <div className="screen-no-nav flex items-center justify-center">
        <p className="text-muted">Event not found</p>
      </div>
    );
  }

  const attended = event.guests.filter((g) => g.attendance === 'attended');
  const totalGiftValue = event.guests.reduce((s, g) => s + (g.estimatedValue || 0), 0);

  return (
    <div className="screen-no-nav">
      <div className="top-bar">
        <button className="top-bar-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <span className="top-bar-title">Event Details</span>
        <div style={{ width: '36px' }} />
      </div>

      {/* Header Card */}
      <div className="hero-event-card animate-slide-up">
        <span style={{ fontSize: '32px' }}>{getEventTypeIcon(event.eventType)}</span>
        <h2 style={{ marginTop: 'var(--space-2)' }}>{event.name}</h2>
        <p className="text-sm text-secondary mt-1">{event.familyMember}</p>

        <div className="flex flex-col gap-2 mt-3 text-sm text-secondary">
          <div className="flex items-center gap-2">
            <Calendar size={14} /> {formatFullDate(event.date)}
          </div>
          {event.venue && (
            <div className="flex items-center gap-2">
              <MapPin size={14} /> {event.venue}
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
          <div className="stat-value" style={{ color: 'var(--color-confirmed)' }}>{attended.length}</div>
          <div className="stat-label">Attended</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: 'var(--text-base)' }}>{totalGiftValue > 0 ? formatCurrency(totalGiftValue) : '—'}</div>
          <div className="stat-label">Gift Total</div>
        </div>
      </div>

      {/* Guest List */}
      <div className="animate-slide-up delay-2">
        <div className="section-header">
          <span className="section-title">
            <Users size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Guest List
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {event.guests.map((guest, i) => (
            <div
              key={guest.id}
              className="glass-card glass-card-interactive"
              style={{ padding: 'var(--space-3) var(--space-4)' }}
              onClick={() => guest.personId && navigate(`/person/${guest.personId}`)}
            >
              <div className="flex items-center gap-3">
                <div className="avatar avatar-sm">{getInitials(guest.personName)}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{guest.personName}</div>
                  <div className="text-xs mt-1">
                    <span className={`badge badge-${guest.attendance === 'attended' ? 'confirmed' : 'ignored'}`} style={{ fontSize: '8px' }}>
                      {guest.attendance === 'attended' ? '✓ Attended' : guest.attendance === 'invited_not_attended' ? '✕ Not Attended' : 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {guest.gift && (
                    <div className="flex items-center gap-1 text-sm text-gold">
                      <Gift size={12} /> {guest.gift}
                    </div>
                  )}
                  {guest.estimatedValue && (
                    <div className="text-xs text-muted mt-1">{formatCurrency(guest.estimatedValue)}</div>
                  )}
                </div>
              </div>
              {guest.notes && (
                <p className="text-xs text-muted mt-2" style={{ paddingLeft: 'var(--space-10)' }}>
                  {guest.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {event.notes && (
        <div className="glass-card mt-4 animate-slide-up delay-3">
          <div className="text-sm font-semibold mb-2">Notes</div>
          <p className="text-sm text-secondary">{event.notes}</p>
        </div>
      )}
    </div>
  );
}
