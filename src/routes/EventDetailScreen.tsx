import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  ArrowLeft, Calendar, Clock, MapPin, Sparkles, AlertTriangle,
  History, Gift, User, Edit3, CheckCircle2,
} from 'lucide-react';
import {
  formatFullDate, formatTime, formatDate, getEventTypeIcon, getEventTypeLabel,
  getInitials, formatCurrency, getRelationshipLabel,
} from '../utils/formatters';
import { getRelationshipHistory, getGiftHistory, detectScheduleConflicts } from '../services/aiService';

export default function EventDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invitations, people, familyEvents, schedule, updateInvitationStatus } = useAppStore();

  const invitation = invitations.find((i) => i.id === id);
  if (!invitation) {
    return (
      <div className="screen-no-nav flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted">Event not found</p>
          <button className="btn btn-ghost mt-4" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  const person = invitation.personId ? people.find((p) => p.id === invitation.personId) : null;
  const relHistory = person ? getRelationshipHistory(person.id, familyEvents) : [];
  const giftHist = person ? getGiftHistory(person.id, familyEvents) : [];
  const conflicts = detectScheduleConflicts(invitation.date, invitation.time, schedule, invitations.filter((i) => i.id !== invitation.id));

  return (
    <div className="screen-no-nav" style={{ paddingBottom: invitation.status === 'pending' ? '120px' : 'var(--space-6)' }}>
      {/* Header */}
      <div className="top-bar">
        <button className="top-bar-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <span className="top-bar-title">Event Details</span>
        <div style={{ width: '36px' }} />
      </div>

      {/* Main Card */}
      <div className="hero-event-card animate-slide-up">
        <div className="flex items-start justify-between mb-2">
          <span style={{ fontSize: '32px' }}>{getEventTypeIcon(invitation.eventType)}</span>
          <div className="flex gap-2">
            <span className={`badge badge-${invitation.priority}`}>{invitation.priority}</span>
            <span className={`badge badge-${invitation.status}`}>{invitation.status}</span>
          </div>
        </div>

        <h2 style={{ marginBottom: 'var(--space-1)' }}>
          {invitation.nickname || invitation.title}
        </h2>
        {invitation.nickname && (
          <p className="text-sm text-secondary">{invitation.title}</p>
        )}

        <div className="separator" />

        <div className="flex flex-col gap-3" style={{ fontSize: 'var(--text-sm)' }}>
          <div className="flex items-center gap-3 text-secondary">
            <Calendar size={16} />
            <span>{formatFullDate(invitation.date)}</span>
          </div>
          {invitation.time && (
            <div className="flex items-center gap-3 text-secondary">
              <Clock size={16} /> <span>{formatTime(invitation.time)}</span>
            </div>
          )}
          {invitation.venue && (
            <div className="flex items-center gap-3 text-secondary">
              <MapPin size={16} /> <span>{invitation.venue}</span>
            </div>
          )}
          {invitation.mainPerson && (
            <div className="flex items-center gap-3 text-secondary">
              <User size={16} /> <span>{invitation.mainPerson}</span>
            </div>
          )}
        </div>
      </div>

      {/* AI Insight */}
      {invitation.aiReason && (
        <div className="glass-card glass-card-gold animate-slide-up delay-1" style={{ marginTop: 'var(--space-4)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} style={{ color: 'var(--color-gold)' }} />
            <span className="font-heading font-semibold text-sm">AI Insight</span>
          </div>
          <p className="text-sm text-secondary" style={{ lineHeight: '1.6' }}>
            {invitation.aiReason}
          </p>
        </div>
      )}

      {/* Schedule Conflicts */}
      {conflicts.length > 0 && (
        <div className="animate-slide-up delay-2" style={{ marginTop: 'var(--space-4)' }}>
          {conflicts.map((c, i) => (
            <div key={i} className="conflict-card" style={{ marginBottom: 'var(--space-2)' }}>
              <div className="conflict-icon"><AlertTriangle size={14} /></div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--color-danger)' }}>
                  {c.type === 'time_overlap' ? 'Time Conflict' : 'Same Day'}
                </div>
                <div className="text-sm text-secondary">{c.conflictingItemTitle} at {c.conflictingTime}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Person Profile Link */}
      {person && (
        <div
          className="glass-card glass-card-interactive animate-slide-up delay-2"
          style={{ marginTop: 'var(--space-4)' }}
          onClick={() => navigate(`/person/${person.id}`)}
        >
          <div className="flex items-center gap-3">
            <div className="avatar">{getInitials(person.name)}</div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{person.nickname}</div>
              <div className="text-xs text-muted">{person.name} · {getRelationshipLabel(person.relationship)}</div>
            </div>
            <span className="text-xs text-gold">View Profile →</span>
          </div>
        </div>
      )}

      {/* Relationship History */}
      {relHistory.length > 0 && (
        <div className="glass-card animate-slide-up delay-3" style={{ marginTop: 'var(--space-4)' }}>
          <div className="flex items-center gap-2 mb-3">
            <History size={16} style={{ color: 'var(--color-info)' }} />
            <span className="font-heading font-semibold text-sm">Relationship History</span>
          </div>
          <div className="timeline">
            {relHistory.map((item, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-date">{formatDate(item.eventDate)}</div>
                <div className="text-sm">
                  <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px', color: 'var(--color-confirmed)' }} />
                  {item.role} — {item.eventName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gift History */}
      {giftHist.length > 0 && (
        <div className="glass-card animate-slide-up delay-4" style={{ marginTop: 'var(--space-4)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Gift size={16} style={{ color: 'var(--color-gold)' }} />
            <span className="font-heading font-semibold text-sm">Gift History</span>
          </div>
          <div className="flex flex-col gap-2">
            {giftHist.map((g, i) => (
              <div key={i} className="flex items-center justify-between" style={{ padding: 'var(--space-2) var(--space-3)', background: 'rgba(212, 168, 83, 0.04)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div className="text-sm">{g.gift}</div>
                  <div className="text-xs text-muted">{g.eventName}</div>
                </div>
                {g.estimatedValue && (
                  <span className="badge badge-gold">{formatCurrency(g.estimatedValue)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Bar for pending */}
      {invitation.status === 'pending' && (
        <div className="decision-bar">
          <button className="btn btn-confirm" onClick={() => { updateInvitationStatus(invitation.id, 'confirmed'); navigate(-1); }}>
            ✓ CONFIRM
          </button>
          <button className="btn btn-ignore" onClick={() => { updateInvitationStatus(invitation.id, 'ignored'); navigate(-1); }}>
            ✕ IGNORE
          </button>
        </div>
      )}
    </div>
  );
}
