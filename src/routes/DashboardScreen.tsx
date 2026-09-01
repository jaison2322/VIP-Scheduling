import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  Crown, Bell, Calendar, Clock, MapPin, AlertTriangle,
  ChevronRight, Sparkles, TrendingUp, Users, Gift,
} from 'lucide-react';
import { formatDate, formatTime, daysUntil, getEventTypeIcon, getInitials, formatTimeAgo } from '../utils/formatters';
import type { Invitation } from '../types';

export default function DashboardScreen() {
  const navigate = useNavigate();
  const {
    currentUser, currentPrivilegedUser, isVIP, invitations, schedule, notifications,
    activityLogs, people, familyEvents, updateInvitationStatus, isRealtimeActive,
  } = useAppStore();

  const activeUser = isVIP ? currentUser : currentPrivilegedUser;
  const activeUserName = activeUser?.name || (isVIP ? 'VIP User' : 'Staff User');
  const activeUserRole = isVIP ? 'VIP Principal' : (currentPrivilegedUser?.role || 'Personal Assistant');

  const pendingInvitations = invitations.filter((i) => i.status === 'pending');
  const confirmedInvitations = invitations.filter((i) => i.status === 'confirmed');
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // Today's events
  const today = new Date().toISOString().split('T')[0];
  const todaySchedule = schedule.filter((s) => s.date === today);
  const todayInvitations = invitations.filter((i) => i.date === today && i.status === 'confirmed');

  // Next important event (first pending sorted by date)
  const nextPending = [...pendingInvitations].sort(
    (a, b) => a.date.localeCompare(b.date)
  )[0];

  // Upcoming confirmed (next 7 days)
  const upcomingConfirmed = confirmedInvitations
    .filter((i) => daysUntil(i.date) >= 0 && daysUntil(i.date) <= 7)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Conflicts detection
  const dateConflicts = new Map<string, Invitation[]>();
  invitations
    .filter((i) => i.status !== 'ignored')
    .forEach((inv) => {
      const existing = dateConflicts.get(inv.date) || [];
      existing.push(inv);
      dateConflicts.set(inv.date, existing);
    });
  const conflictDates = [...dateConflicts.entries()].filter(
    ([date, invs]) => invs.length > 1 || schedule.some((s) => s.date === date)
  );

  const handleConfirm = (id: string) => {
    updateInvitationStatus(id, 'confirmed');
  };

  const handleIgnore = (id: string) => {
    updateInvitationStatus(id, 'ignored');
  };

  return (
    <div className="screen">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between" style={{ paddingTop: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        <div className="flex items-center gap-3">
          <div className="avatar">
            {getInitials(activeUserName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {isVIP ? 'Welcome back' : `Logged in as ${activeUserRole}`}
              </span>
              {/* Realtime Live Pulse Badge */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 600,
                  background: isRealtimeActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.12)',
                  color: isRealtimeActive ? '#4ade80' : 'var(--color-text-muted)',
                  border: isRealtimeActive ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)',
                }}
                title={isRealtimeActive ? 'Supabase Real-Time Live Sync Active' : 'Connecting to Real-Time...'}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isRealtimeActive ? '#22c55e' : '#94a3b8',
                    boxShadow: isRealtimeActive ? '0 0 6px #22c55e' : 'none',
                    animation: isRealtimeActive ? 'pulse 2s infinite' : 'none',
                  }}
                />
                {isRealtimeActive ? 'LIVE' : 'SYNC'}
              </span>
            </div>
            <div className="font-heading font-semibold" style={{ fontSize: 'var(--text-lg)' }}>
              {activeUserName}
            </div>
          </div>
        </div>
        <button
          className="btn-icon"
          onClick={() => navigate('/notifications')}
          style={{ position: 'relative' }}
        >
          <Bell size={20} />
          {unreadNotifications > 0 && (
            <span className="nav-badge">{unreadNotifications}</span>
          )}
        </button>
      </div>

      {/* ── Quick Stats ────────────────────────────────────────── */}
      <div className="stat-grid animate-slide-up delay-1">
        <div className="stat-card glass-card-interactive" onClick={() => navigate('/upcoming')} style={{ cursor: 'pointer' }}>
          <div className="stat-value">{pendingInvitations.length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card glass-card-interactive" onClick={() => navigate('/reminders')} style={{ cursor: 'pointer' }}>
          <div className="stat-value" style={{ color: 'var(--color-confirmed)' }}>
            {confirmedInvitations.length}
          </div>
          <div className="stat-label">Confirmed</div>
        </div>
        <div className="stat-card glass-card-interactive" onClick={() => navigate('/conflicts')} style={{ cursor: 'pointer' }}>
          <div className="stat-value" style={{ color: conflictDates.length > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
            {conflictDates.length}
          </div>
          <div className="stat-label">Conflicts</div>
        </div>
      </div>

      {/* ── Next Important Event ───────────────────────────────── */}
      {nextPending && (
        <div className="animate-slide-up delay-2" style={{ marginTop: 'var(--space-5)' }}>
          <div className="section-header">
            <span className="section-title">
              <Sparkles size={14} style={{ display: 'inline', marginRight: '6px', color: 'var(--color-gold)' }} />
              Next Invitation — Review Required
            </span>
          </div>

          <div className="hero-event-card" onClick={() => navigate(`/event/${nextPending.id}`)}>
            <div className="flex items-start justify-between mb-2">
              <span style={{ fontSize: '28px' }}>{getEventTypeIcon(nextPending.eventType)}</span>
              <span className={`badge badge-${nextPending.priority}`}>
                {nextPending.priority}
              </span>
            </div>

            <h3 style={{ marginBottom: 'var(--space-1)', fontSize: 'var(--text-lg)' }}>
              {nextPending.nickname || nextPending.title}
            </h3>

            <div className="flex flex-col gap-2 mt-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              <div className="flex items-center gap-2">
                <Calendar size={14} /> {formatDate(nextPending.date)}
                {nextPending.time && (
                  <><Clock size={14} style={{ marginLeft: '8px' }} /> {formatTime(nextPending.time)}</>
                )}
              </div>
              {nextPending.venue && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} /> {nextPending.venue}
                </div>
              )}
            </div>

            {/* AI Reason */}
            {nextPending.aiReason && (
              <div className="insight-card" style={{ marginTop: 'var(--space-3)' }}>
                <div className="insight-card-icon">
                  <Sparkles size={14} />
                </div>
                <div style={{ fontSize: 'var(--text-xs)', lineHeight: '1.5' }}>
                  <strong style={{ color: 'var(--color-gold)' }}>AI Insight:</strong> {nextPending.aiReason.substring(0, 120)}...
                </div>
              </div>
            )}

            {/* Conflict warning */}
            {schedule.some((s) => s.date === nextPending.date) && (
              <div className="conflict-card" style={{ marginTop: 'var(--space-3)' }}>
                <div className="conflict-icon">
                  <AlertTriangle size={14} />
                </div>
                <div style={{ fontSize: 'var(--text-xs)' }}>
                  <strong style={{ color: 'var(--color-danger)' }}>Schedule Conflict:</strong>{' '}
                  {schedule.filter((s) => s.date === nextPending.date).map((s) => s.title).join(', ')}
                </div>
              </div>
            )}

            {/* Confirm / Ignore */}
            <div className="flex gap-3" style={{ marginTop: 'var(--space-4)' }}>
              <button
                className="btn btn-confirm flex-1"
                onClick={(e) => { e.stopPropagation(); handleConfirm(nextPending.id); }}
              >
                ✓ Confirm
              </button>
              <button
                className="btn btn-ignore flex-1"
                onClick={(e) => { e.stopPropagation(); handleIgnore(nextPending.id); }}
              >
                ✕ Ignore
              </button>
            </div>

            <div style={{
              textAlign: 'center',
              marginTop: 'var(--space-2)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}>
              {daysUntil(nextPending.date) > 0
                ? `${daysUntil(nextPending.date)} days away`
                : 'Today'}
            </div>
          </div>
        </div>
      )}

      {/* ── Upcoming Invitations ──────────────────────────────── */}
      {pendingInvitations.length > 1 && (
        <div className="animate-slide-up delay-3" style={{ marginTop: 'var(--space-5)' }}>
          <div className="section-header">
            <span className="section-title">Upcoming Invitations</span>
            <span className="section-action" onClick={() => navigate('/upcoming')}>
              View All <ChevronRight size={14} style={{ display: 'inline' }} />
            </span>
          </div>

          <div className="overflow-x-auto" style={{ margin: '0 calc(-1 * var(--space-4))', padding: '0 var(--space-4)' }}>
            <div className="flex gap-3" style={{ paddingRight: 'var(--space-4)' }}>
              {pendingInvitations.slice(1, 5).map((inv) => (
                <div
                  key={inv.id}
                  className={`event-card event-card-${inv.priority}`}
                  onClick={() => navigate(`/event/${inv.id}`)}
                  style={{ minWidth: '240px', flexShrink: 0 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span>{getEventTypeIcon(inv.eventType)}</span>
                    <span className={`badge badge-${inv.priority}`} style={{ fontSize: '9px' }}>{inv.priority}</span>
                  </div>
                  <div className="event-card-title truncate" style={{ maxWidth: '200px' }}>
                    {inv.nickname || inv.title}
                  </div>
                  <div className="event-card-meta" style={{ marginTop: 'var(--space-2)' }}>
                    <span className="event-card-meta-item">
                      <Calendar size={12} /> {formatDate(inv.date)}
                    </span>
                    {inv.time && (
                      <span className="event-card-meta-item">
                        <Clock size={12} /> {formatTime(inv.time)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Today's Schedule ───────────────────────────────────── */}
      {(todaySchedule.length > 0 || todayInvitations.length > 0) && (
        <div className="animate-slide-up delay-4" style={{ marginTop: 'var(--space-5)' }}>
          <div className="section-header">
            <span className="section-title">📅 Today's Schedule</span>
          </div>

          <div className="flex flex-col gap-2">
            {todaySchedule.map((item) => (
              <div key={item.id} className="glass-card flex items-center gap-3" style={{ padding: 'var(--space-3)' }}>
                <div style={{
                  width: '4px', height: '36px', borderRadius: '2px',
                  background: 'var(--color-info)',
                }} />
                <div className="flex-1">
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{item.title}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {formatTime(item.startTime)}{item.endTime ? ` - ${formatTime(item.endTime)}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Smart Insights ─────────────────────────────────────── */}
      <div className="animate-slide-up delay-4" style={{ marginTop: 'var(--space-5)' }}>
        <div className="section-header">
          <span className="section-title">
            <TrendingUp size={14} style={{ display: 'inline', marginRight: '6px', color: 'var(--color-gold)' }} />
            Smart Insights
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {conflictDates.length > 0 && (
            <div
              className="conflict-card glass-card-interactive"
              onClick={() => navigate('/conflicts')}
              style={{ cursor: 'pointer' }}
            >
              <div className="conflict-icon">
                <AlertTriangle size={14} />
              </div>
              <div style={{ fontSize: 'var(--text-sm)', flex: 1 }}>
                <strong style={{ color: 'var(--color-danger)' }}>{conflictDates.length} schedule conflict{conflictDates.length > 1 ? 's' : ''}</strong>
                <span style={{ color: 'var(--color-text-muted)' }}> detected. Tap to review & resolve.</span>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </div>
          )}

          {upcomingConfirmed.length > 0 && (
            <div
              className="insight-card glass-card-interactive"
              onClick={() => navigate('/reminders')}
              style={{ cursor: 'pointer' }}
            >
              <div className="insight-card-icon">
                <Calendar size={14} />
              </div>
              <div style={{ fontSize: 'var(--text-sm)', flex: 1 }}>
                <strong>{upcomingConfirmed.length} confirmed event{upcomingConfirmed.length > 1 ? 's' : ''}</strong>
                <span style={{ color: 'var(--color-text-muted)' }}> in next 7 days. Tap for reminders.</span>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </div>
          )}

          <div
            className="insight-card glass-card-interactive"
            onClick={() => navigate('/people')}
            style={{ cursor: 'pointer' }}
          >
            <div className="insight-card-icon" style={{ background: 'rgba(212, 168, 83, 0.12)' }}>
              <Users size={14} style={{ color: 'var(--color-gold)' }} />
            </div>
            <div style={{ fontSize: 'var(--text-sm)', flex: 1 }}>
              <strong>{people.length} VIP contacts</strong>
              <span style={{ color: 'var(--color-text-muted)' }}> with relationship memory.</span>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </div>

          <div
            className="insight-card glass-card-interactive"
            onClick={() => navigate('/past-events')}
            style={{ cursor: 'pointer' }}
          >
            <div className="insight-card-icon" style={{ background: 'rgba(34, 197, 94, 0.12)' }}>
              <Gift size={14} style={{ color: 'var(--color-confirmed)' }} />
            </div>
            <div style={{ fontSize: 'var(--text-sm)', flex: 1 }}>
              <strong>{familyEvents.length} family events & gifts</strong>
              <span style={{ color: 'var(--color-text-muted)' }}> stored in relationship vault.</span>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </div>
        </div>
      </div>

      {/* ── Quick Hub Grid ─────────────────────────────────────── */}
      <div className="animate-slide-up delay-4" style={{ marginTop: 'var(--space-5)' }}>
        <div className="section-header">
          <span className="section-title">Relationship & Event Vault</span>
        </div>
        <div className="grid-2">
          <div
            className="glass-card glass-card-interactive flex items-center gap-3"
            onClick={() => navigate('/calendar')}
            style={{ padding: 'var(--space-3)', cursor: 'pointer' }}
          >
            <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'rgba(212, 168, 83, 0.12)', color: 'var(--color-gold)' }}>
              <Calendar size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold">Calendar</div>
              <div className="text-xs text-muted">Monthly Grid</div>
            </div>
          </div>

          <div
            className="glass-card glass-card-interactive flex items-center gap-3"
            onClick={() => navigate('/gifts')}
            style={{ padding: 'var(--space-3)', cursor: 'pointer' }}
          >
            <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'rgba(34, 197, 94, 0.12)', color: 'var(--color-confirmed)' }}>
              <Gift size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold">Gift History</div>
              <div className="text-xs text-muted">Memory Ledger</div>
            </div>
          </div>

          <div
            className="glass-card glass-card-interactive flex items-center gap-3"
            onClick={() => navigate('/past-events')}
            style={{ padding: 'var(--space-3)', cursor: 'pointer' }}
          >
            <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-info)' }}>
              <Users size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold">Past Events</div>
              <div className="text-xs text-muted">Guest Attendance</div>
            </div>
          </div>

          <div
            className="glass-card glass-card-interactive flex items-center gap-3"
            onClick={() => navigate('/add-event')}
            style={{ padding: 'var(--space-3)', cursor: 'pointer' }}
          >
            <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-pending)' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold">Add Event</div>
              <div className="text-xs text-muted">Record Function</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Activity ────────────────────────────────────── */}
      {activityLogs.length > 0 && (
        <div className="animate-slide-up delay-5" style={{ marginTop: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
          <div className="section-header">
            <span className="section-title">Recent Activity</span>
            <span className="section-action" onClick={() => navigate('/activity')}>
              View All <ChevronRight size={14} style={{ display: 'inline' }} />
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {activityLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="glass-card flex items-start gap-3" style={{ padding: 'var(--space-3)' }}>
                <div className="avatar avatar-sm">
                  {getInitials(log.userName)}
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 'var(--text-sm)' }}>
                    <strong>{log.userName}</strong>{' '}
                    <span style={{ color: 'var(--color-text-secondary)' }}>{log.action}</span>
                  </div>
                  {log.entityName && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {log.entityName}
                    </div>
                  )}
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {formatTimeAgo(log.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty State ────────────────────────────────────────── */}
      {pendingInvitations.length === 0 && confirmedInvitations.length === 0 && (
        <div className="empty-state" style={{ marginTop: 'var(--space-10)' }}>
          <div className="empty-state-icon">
            <Crown size={28} />
          </div>
          <div className="empty-state-title">All Clear</div>
          <div className="empty-state-text">
            No pending invitations. Scan a new invitation to get started.
          </div>
          <div className="flex gap-3 mt-6">
            <button className="btn btn-gold flex-1" onClick={() => navigate('/scan')}>
              Scan Invitation
            </button>
            <button className="btn btn-outline flex-1" onClick={() => navigate('/add-invitation')}>
              Add Manually
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
