import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ArrowLeft, Bell, Clock, Calendar } from 'lucide-react';
import { formatDate, daysUntil, getEventTypeIcon } from '../utils/formatters';

export default function ReminderCenterScreen() {
  const navigate = useNavigate();
  const { invitations } = useAppStore();

  const confirmed = invitations
    .filter((i) => i.status === 'confirmed' && daysUntil(i.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  const getUrgencyColor = (days: number): string => {
    if (days === 0) return 'var(--color-danger)';
    if (days <= 2) return 'var(--color-priority-high)';
    if (days <= 5) return 'var(--color-priority-medium)';
    return 'var(--color-priority-low)';
  };

  const getUrgencyLabel = (days: number): string => {
    if (days === 0) return 'TODAY';
    if (days === 1) return 'TOMORROW';
    return `${days} DAYS`;
  };

  return (
    <div className="screen-no-nav">
      <div className="top-bar">
        <button className="top-bar-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <span className="top-bar-title">Reminders</span>
        <div style={{ width: '36px' }} />
      </div>

      {confirmed.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Bell size={28} /></div>
          <div className="empty-state-title">No Upcoming Events</div>
          <div className="empty-state-text">Confirm invitations to see reminders here.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {confirmed.map((inv, i) => {
            const days = daysUntil(inv.date);
            return (
              <div
                key={inv.id}
                className={`glass-card glass-card-interactive animate-slide-up`}
                style={{ animationDelay: `${i * 0.06}s`, borderLeft: `3px solid ${getUrgencyColor(days)}` }}
                onClick={() => navigate(`/event/${inv.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div style={{
                    minWidth: '52px', textAlign: 'center', padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-sm)', background: `${getUrgencyColor(days)}15`,
                  }}>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, fontFamily: 'var(--font-heading)', color: getUrgencyColor(days), lineHeight: 1 }}>
                      {days}
                    </div>
                    <div style={{ fontSize: '8px', fontWeight: 700, color: getUrgencyColor(days), textTransform: 'uppercase', marginTop: '2px' }}>
                      {days === 1 ? 'day' : 'days'}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{getEventTypeIcon(inv.eventType)}</span>
                      <span className={`badge badge-${inv.priority}`} style={{ fontSize: '8px' }}>{inv.priority}</span>
                    </div>
                    <div className="font-semibold text-sm">{inv.nickname || inv.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> {formatDate(inv.date)}
                      </span>
                      {inv.time && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {inv.time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
