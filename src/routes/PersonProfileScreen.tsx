import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ArrowLeft, Calendar, Gift, History, Edit3, User } from 'lucide-react';
import { getInitials, getRelationshipLabel, formatDate, formatCurrency, getEventTypeIcon } from '../utils/formatters';
import { getRelationshipHistory, getGiftHistory } from '../services/aiService';

export default function PersonProfileScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { people, familyEvents, invitations } = useAppStore();

  const person = people.find((p) => p.id === id);
  if (!person) {
    return (
      <div className="screen-no-nav flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted">Person not found</p>
          <button className="btn btn-ghost mt-4" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  const relHistory = getRelationshipHistory(person.id, familyEvents);
  const giftHist = getGiftHistory(person.id, familyEvents);
  const personInvitations = invitations.filter((i) => i.personId === person.id);
  const totalGiftValue = giftHist.reduce((sum, g) => sum + (g.estimatedValue || 0), 0);

  return (
    <div className="screen-no-nav">
      {/* Header */}
      <div className="top-bar">
        <button className="top-bar-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <span className="top-bar-title">Person Profile</span>
        <div style={{ width: '36px' }} />
      </div>

      {/* Profile Header */}
      <div className="text-center animate-slide-up" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="avatar avatar-xl" style={{ margin: '0 auto var(--space-3)' }}>
          {getInitials(person.name)}
        </div>
        <h2>{person.nickname}</h2>
        <p className="text-secondary text-sm">{person.name}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="badge badge-gold">{getRelationshipLabel(person.relationship)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid animate-slide-up delay-1" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="stat-card">
          <div className="stat-value">{relHistory.filter((h) => h.role === 'Attended').length}</div>
          <div className="stat-label">Events Attended</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{giftHist.length}</div>
          <div className="stat-label">Gifts Given</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: 'var(--text-lg)' }}>
            {totalGiftValue > 0 ? formatCurrency(totalGiftValue) : '—'}
          </div>
          <div className="stat-label">Total Value</div>
        </div>
      </div>

      {/* Notes */}
      {person.notes && (
        <div className="glass-card animate-slide-up delay-1" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Edit3 size={14} style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-sm font-semibold">Notes</span>
          </div>
          <p className="text-sm text-secondary">{person.notes}</p>
        </div>
      )}

      {/* Interaction History */}
      {relHistory.length > 0 && (
        <div className="glass-card animate-slide-up delay-2" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="flex items-center gap-2 mb-3">
            <History size={16} style={{ color: 'var(--color-info)' }} />
            <span className="font-heading font-semibold text-sm">Events Attended</span>
          </div>
          <div className="timeline">
            {relHistory.map((item, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-date">{formatDate(item.eventDate)}</div>
                <div className="text-sm">
                  {getEventTypeIcon(item.eventType)} {item.role} — {item.eventName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gift History */}
      {giftHist.length > 0 && (
        <div className="glass-card animate-slide-up delay-3" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Gift size={16} style={{ color: 'var(--color-gold)' }} />
            <span className="font-heading font-semibold text-sm">Gift History</span>
          </div>
          <div className="flex flex-col gap-2">
            {giftHist.map((g, i) => (
              <div key={i} className="flex items-center justify-between" style={{ padding: 'var(--space-2) var(--space-3)', background: 'rgba(212, 168, 83, 0.04)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div className="text-sm">{g.gift}</div>
                  <div className="text-xs text-muted">{g.eventName} · {formatDate(g.eventDate)}</div>
                </div>
                {g.estimatedValue && <span className="badge badge-gold">{formatCurrency(g.estimatedValue)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invitations from this person */}
      {personInvitations.length > 0 && (
        <div className="glass-card animate-slide-up delay-4" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} style={{ color: 'var(--color-pending)' }} />
            <span className="font-heading font-semibold text-sm">Invitations Received</span>
          </div>
          <div className="flex flex-col gap-2">
            {personInvitations.map((inv) => (
              <div
                key={inv.id}
                className="glass-card glass-card-interactive"
                style={{ padding: 'var(--space-3)' }}
                onClick={() => navigate(`/event/${inv.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{inv.nickname || inv.title}</div>
                    <div className="text-xs text-muted">{formatDate(inv.date)}</div>
                  </div>
                  <span className={`badge badge-${inv.status}`} style={{ fontSize: '9px' }}>{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
