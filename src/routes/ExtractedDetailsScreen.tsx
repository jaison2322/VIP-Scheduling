import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { EventType } from '../types';
import { getEventTypeLabel } from '../utils/formatters';

export default function ExtractedDetailsScreen() {
  const navigate = useNavigate();
  const { currentScanResult } = useAppStore();

  if (!currentScanResult) {
    navigate('/scan', { replace: true });
    return null;
  }

  const { extractedFields, analysis } = currentScanResult;
  const [fields, setFields] = useState({ ...extractedFields });
  const [nickname, setNickname] = useState(
    analysis.relatedPerson
      ? `${analysis.relatedPerson.nickname} — ${getEventTypeLabel(fields.eventType || 'other').replace(/^.+\s/, '')}`
      : ''
  );

  const updateField = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const getConfidenceColor = (field: string): string => {
    const confidence = fields.confidence[field] || 0;
    if (confidence >= 0.7) return '';
    if (confidence >= 0.4) return 'input-uncertain';
    return 'input-uncertain';
  };

  const getConfidenceIcon = (field: string) => {
    const confidence = fields.confidence[field] || 0;
    if (confidence >= 0.7) {
      return <CheckCircle2 size={14} style={{ color: 'var(--color-confirmed)' }} />;
    }
    return <AlertCircle size={14} style={{ color: 'var(--color-pending)' }} />;
  };

  const handleContinue = () => {
    // Update the scan result with edited fields
    const updatedResult = {
      ...currentScanResult,
      extractedFields: fields,
    };
    // Store nickname in sessionStorage for the confirm screen
    sessionStorage.setItem('invitation-nickname', nickname);
    sessionStorage.setItem('edited-fields', JSON.stringify(fields));
    navigate('/confirm-ignore');
  };

  const eventTypes: EventType[] = [
    'wedding', 'engagement', 'birthday', 'anniversary', 'house_warming',
    'baby_shower', 'graduation', 'retirement', 'business_event', 'reception',
    'cultural', 'religious', 'other',
  ];

  return (
    <div className="screen-no-nav" style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Header */}
      <div className="top-bar">
        <button className="top-bar-back" onClick={() => navigate('/scan')}>
          <ArrowLeft size={18} />
        </button>
        <span className="top-bar-title">Extracted Details</span>
        <div style={{ width: '36px' }} />
      </div>

      {/* Confidence */}
      <div className="glass-card glass-card-gold animate-slide-up" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">AI Confidence</span>
          <span className="badge badge-gold">
            {Math.round(analysis.confidence * 100)}%
          </span>
        </div>
        <p className="text-xs text-muted" style={{ marginTop: 'var(--space-1)' }}>
          Amber fields have lower confidence — tap to edit
        </p>
      </div>

      {/* Matched Person */}
      {analysis.relatedPerson && (
        <div className="glass-card animate-slide-up delay-1" style={{ marginBottom: 'var(--space-4)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} style={{ color: 'var(--color-confirmed)' }} />
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--color-confirmed)' }}>Person Match Found</div>
              <div className="text-sm text-secondary">
                {analysis.relatedPerson.nickname} ({analysis.relatedPerson.name})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="flex flex-col gap-4 animate-slide-up delay-2">
        {/* Nickname */}
        <div>
          <label className="label flex items-center gap-2">
            Custom Nickname / Identity
            <span className="badge badge-gold" style={{ fontSize: '9px' }}>Recommended</span>
          </label>
          <input
            className="input"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g., Business Partner Ramesh — Son's Wedding"
          />
          <p className="text-xs text-muted" style={{ marginTop: '4px' }}>
            How you'd like to identify this event
          </p>
        </div>

        {/* Event Type */}
        <div>
          <label className="label flex items-center gap-2">
            Event Type {getConfidenceIcon('eventType')}
          </label>
          <select
            className={`select ${getConfidenceColor('eventType')}`}
            value={fields.eventType || 'other'}
            onChange={(e) => updateField('eventType', e.target.value)}
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {getEventTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        {/* Main Person */}
        <div>
          <label className="label flex items-center gap-2">
            Main Person / Couple {getConfidenceIcon('mainPerson')}
          </label>
          <input
            className={`input ${getConfidenceColor('mainPerson')}`}
            value={fields.mainPerson || ''}
            onChange={(e) => updateField('mainPerson', e.target.value)}
            placeholder="Person or couple name"
          />
        </div>

        {/* Host */}
        <div>
          <label className="label flex items-center gap-2">
            Host Name {getConfidenceIcon('hostName')}
          </label>
          <input
            className={`input ${getConfidenceColor('hostName')}`}
            value={fields.hostName || ''}
            onChange={(e) => updateField('hostName', e.target.value)}
            placeholder="Who is hosting the event"
          />
        </div>

        {/* Date */}
        <div>
          <label className="label flex items-center gap-2">
            Date {getConfidenceIcon('date')}
          </label>
          <input
            className={`input ${getConfidenceColor('date')}`}
            type="date"
            value={fields.date || ''}
            onChange={(e) => updateField('date', e.target.value)}
          />
        </div>

        {/* Time */}
        <div>
          <label className="label flex items-center gap-2">
            Time {getConfidenceIcon('time')}
          </label>
          <input
            className={`input ${getConfidenceColor('time')}`}
            type="time"
            value={fields.time || ''}
            onChange={(e) => updateField('time', e.target.value)}
          />
        </div>

        {/* Venue */}
        <div>
          <label className="label flex items-center gap-2">
            Venue {getConfidenceIcon('venue')}
          </label>
          <input
            className={`input ${getConfidenceColor('venue')}`}
            value={fields.venue || ''}
            onChange={(e) => updateField('venue', e.target.value)}
            placeholder="Event venue"
          />
        </div>

        {/* Location */}
        <div>
          <label className="label flex items-center gap-2">
            Location
          </label>
          <input
            className="input"
            value={fields.location || ''}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="City or address"
          />
        </div>
      </div>

      {/* Continue Button */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: 'var(--space-4) var(--space-6)',
        paddingBottom: 'calc(var(--space-6) + var(--safe-area-bottom))',
        background: 'rgba(6, 10, 19, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--glass-border)',
      }}>
        <button className="btn btn-gold w-full" onClick={handleContinue}>
          Continue to Review
        </button>
      </div>
    </div>
  );
}
