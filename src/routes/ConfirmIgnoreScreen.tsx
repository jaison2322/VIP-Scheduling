import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  Calendar, Clock, MapPin, Sparkles, AlertTriangle,
  History, Gift, CheckCircle2, ArrowLeft,
} from 'lucide-react';
import {
  formatDate, formatTime, formatFullDate, getEventTypeIcon,
  getEventTypeLabel, formatCurrency, getInitials,
} from '../utils/formatters';
import type { ExtractedFields, Priority } from '../types';

export default function ConfirmIgnoreScreen() {
  const navigate = useNavigate();
  const { currentScanResult, addInvitation, setScanResult } = useAppStore();

  if (!currentScanResult) {
    navigate('/scan', { replace: true });
    return null;
  }

  const { analysis } = currentScanResult;
  const editedFieldsStr = sessionStorage.getItem('edited-fields');
  const fields: ExtractedFields = editedFieldsStr
    ? JSON.parse(editedFieldsStr)
    : analysis.extractedFields;
  const nickname = sessionStorage.getItem('invitation-nickname') || '';

  const handleDecision = (status: 'confirmed' | 'ignored') => {
    addInvitation({
      personId: analysis.relatedPerson?.id,
      eventType: fields.eventType || 'other',
      title: fields.title || 'New Event',
      nickname: nickname || undefined,
      mainPerson: fields.mainPerson,
      hostName: fields.hostName,
      date: fields.date || new Date().toISOString().split('T')[0],
      time: fields.time,
      venue: fields.venue,
      location: fields.location,
      description: fields.description,
      priority: analysis.suggestedPriority,
      aiSuggestedPriority: analysis.suggestedPriority,
      aiReason: analysis.priorityReason,
      status,
      ocrText: analysis.ocrText,
      createdBy: 'vip',
    });

    // Clean up
    setScanResult(null);
    sessionStorage.removeItem('scan-image');
    sessionStorage.removeItem('invitation-nickname');
    sessionStorage.removeItem('edited-fields');

    navigate('/dashboard', { replace: true });
  };

  const priorityColors: Record<Priority, string> = {
    high: 'var(--color-priority-high)',
    medium: 'var(--color-priority-medium)',
    low: 'var(--color-priority-low)',
  };

  return (
    <div className="screen-no-nav" style={{ paddingBottom: '120px' }}>
      {/* Header */}
      <div className="top-bar">
        <button className="top-bar-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <span className="top-bar-title">Review & Decide</span>
        <div style={{ width: '36px' }} />
      </div>

      {/* Event Summary Card */}
      <div className="hero-event-card animate-slide-up">
        <div className="flex items-start justify-between mb-3">
          <span style={{ fontSize: '32px' }}>{getEventTypeIcon(fields.eventType || 'other')}</span>
          <span className={`badge badge-${analysis.suggestedPriority}`}>
            {analysis.suggestedPriority} priority
          </span>
        </div>

        <h2 style={{ marginBottom: 'var(--space-1)' }}>
          {nickname || fields.title || 'New Event'}
        </h2>
        {nickname && fields.title && nickname !== fields.title && (
          <p className="text-secondary text-sm">{fields.title}</p>
        )}

        <div className="flex flex-col gap-2 mt-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          <div className="flex items-center gap-2">
            <Calendar size={15} />
            <span>{fields.date ? formatFullDate(fields.date) : 'Date not specified'}</span>
          </div>
          {fields.time && (
            <div className="flex items-center gap-2">
              <Clock size={15} /> <span>{formatTime(fields.time)}</span>
            </div>
          )}
          {fields.venue && (
            <div className="flex items-center gap-2">
              <MapPin size={15} /> <span>{fields.venue}</span>
            </div>
          )}
        </div>
      </div>

      {/* AI Priority Recommendation */}
      <div className="glass-card glass-card-gold animate-slide-up delay-1" style={{ marginTop: 'var(--space-4)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} style={{ color: 'var(--color-gold)' }} />
          <span className="font-heading font-semibold text-sm">AI Recommendation</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">Suggested Priority:</span>
          <span style={{
            color: priorityColors[analysis.suggestedPriority],
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            textTransform: 'uppercase',
          }}>
            {analysis.suggestedPriority}
          </span>
        </div>
        <p className="text-sm text-secondary" style={{ lineHeight: '1.6' }}>
          {analysis.priorityReason}
        </p>
      </div>

      {/* Relationship History */}
      {analysis.relationshipHistory.length > 0 && (
        <div className="glass-card animate-slide-up delay-2" style={{ marginTop: 'var(--space-4)' }}>
          <div className="flex items-center gap-2 mb-3">
            <History size={16} style={{ color: 'var(--color-info)' }} />
            <span className="font-heading font-semibold text-sm">Relationship History</span>
          </div>

          {analysis.relatedPerson && (
            <div className="flex items-center gap-3 mb-3" style={{ padding: 'var(--space-2)', background: 'rgba(34, 197, 94, 0.06)', borderRadius: 'var(--radius-sm)' }}>
              <div className="avatar avatar-sm">{getInitials(analysis.relatedPerson.name)}</div>
              <div>
                <div className="text-sm font-semibold">{analysis.relatedPerson.nickname}</div>
                <div className="text-xs text-muted">{analysis.relatedPerson.name}</div>
              </div>
            </div>
          )}

          <div className="timeline">
            {analysis.relationshipHistory.map((item, i) => (
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
      {analysis.giftHistory.length > 0 && (
        <div className="glass-card animate-slide-up delay-3" style={{ marginTop: 'var(--space-4)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Gift size={16} style={{ color: 'var(--color-gold)' }} />
            <span className="font-heading font-semibold text-sm">Gift History</span>
          </div>

          <div className="flex flex-col gap-2">
            {analysis.giftHistory.map((gift, i) => (
              <div key={i} className="flex items-center justify-between" style={{
                padding: 'var(--space-2) var(--space-3)',
                background: 'rgba(212, 168, 83, 0.04)',
                borderRadius: 'var(--radius-sm)',
              }}>
                <div>
                  <div className="text-sm">{gift.gift}</div>
                  <div className="text-xs text-muted">{gift.eventName}</div>
                </div>
                {gift.estimatedValue && (
                  <span className="badge badge-gold">{formatCurrency(gift.estimatedValue)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Conflicts */}
      {analysis.scheduleConflicts.length > 0 && (
        <div className="animate-slide-up delay-4" style={{ marginTop: 'var(--space-4)' }}>
          {analysis.scheduleConflicts.map((conflict, i) => (
            <div key={i} className="conflict-card" style={{ marginBottom: 'var(--space-2)' }}>
              <div className="conflict-icon">
                <AlertTriangle size={14} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--color-danger)' }}>
                  {conflict.type === 'time_overlap' ? 'Time Conflict!' : 'Same Day Event'}
                </div>
                <div className="text-sm text-secondary">
                  {conflict.conflictingItemTitle} at {conflict.conflictingTime}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decision Bar */}
      <div className="decision-bar">
        <button
          className="btn btn-confirm"
          onClick={() => handleDecision('confirmed')}
        >
          ✓ CONFIRM
        </button>
        <button
          className="btn btn-ignore"
          onClick={() => handleDecision('ignored')}
        >
          ✕ IGNORE
        </button>
      </div>
    </div>
  );
}
