import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ArrowLeft, Calendar, Users, Gift, Plus } from 'lucide-react';
import { formatDate, getEventTypeIcon, formatCurrency } from '../utils/formatters';

export default function PastFamilyFunctionsScreen() {
  const navigate = useNavigate();
  const { familyEvents } = useAppStore();

  const sorted = [...familyEvents].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="flex items-center justify-between">
          <h2>Past Family Events</h2>
          <button className="btn btn-sm btn-outline" onClick={() => navigate('/add-event')}>
            <Plus size={14} /> Add
          </button>
        </div>
        <p className="text-sm text-secondary mt-1">{familyEvents.length} events recorded</p>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.map((event, i) => {
          const totalGuests = event.guests.length;
          const attended = event.guests.filter((g) => g.attendance === 'attended').length;
          const totalGifts = event.guests.reduce((s, g) => s + (g.estimatedValue || 0), 0);

          return (
            <div
              key={event.id}
              className="glass-card glass-card-interactive animate-slide-up"
              style={{ animationDelay: `${i * 0.08}s` }}
              onClick={() => navigate(`/past-event/${event.id}`)}
            >
              <div className="flex items-start gap-3">
                <span style={{ fontSize: '28px' }}>{getEventTypeIcon(event.eventType)}</span>
                <div className="flex-1">
                  <div className="font-heading font-semibold">{event.name}</div>
                  <div className="text-xs text-muted mt-1">{event.familyMember}</div>

                  <div className="flex items-center gap-3 mt-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {formatDate(event.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {attended}/{totalGuests} attended
                    </span>
                    {totalGifts > 0 && (
                      <span className="flex items-center gap-1">
                        <Gift size={11} /> {formatCurrency(totalGifts)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Guest preview */}
              {event.guests.length > 0 && (
                <div className="flex items-center gap-1 mt-3" style={{ paddingLeft: 'var(--space-10)' }}>
                  {event.guests.slice(0, 4).map((g, gi) => (
                    <div key={gi} className="avatar avatar-sm" style={{ marginLeft: gi > 0 ? '-8px' : 0, border: '2px solid var(--color-bg-primary)' }}>
                      {g.personName.charAt(0)}
                    </div>
                  ))}
                  {event.guests.length > 4 && (
                    <span className="text-xs text-muted" style={{ marginLeft: '4px' }}>
                      +{event.guests.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
