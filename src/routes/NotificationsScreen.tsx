import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ArrowLeft, Bell, AlertTriangle, Calendar, UserCheck, CheckCheck } from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters';

const TYPE_ICONS: Record<string, ReactNode> = {
  change_alert: <UserCheck size={16} />,
  new_invitation: <Calendar size={16} />,
  reminder: <Bell size={16} />,
  conflict_warning: <AlertTriangle size={16} />,
  system: <Bell size={16} />,
};

const TYPE_COLORS: Record<string, string> = {
  change_alert: 'var(--color-pending)',
  new_invitation: 'var(--color-gold)',
  reminder: 'var(--color-info)',
  conflict_warning: 'var(--color-danger)',
  system: 'var(--color-text-muted)',
};

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppStore();

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="screen-no-nav">
      <div className="top-bar">
        <button className="top-bar-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <span className="top-bar-title">Notifications</span>
        {unread > 0 && (
          <button className="btn btn-sm btn-ghost" onClick={markAllNotificationsRead}>
            <CheckCheck size={16} /> Read All
          </button>
        )}
      </div>

      {unread > 0 && (
        <div className="badge badge-gold mb-4" style={{ fontSize: 'var(--text-xs)' }}>
          {unread} unread
        </div>
      )}

      <div className="flex flex-col gap-2">
        {notifications.map((notif, i) => (
          <div
            key={notif.id}
            className={`glass-card animate-slide-up ${!notif.read ? 'glass-card-gold' : ''}`}
            style={{
              animationDelay: `${i * 0.04}s`,
              padding: 'var(--space-3) var(--space-4)',
              opacity: notif.read ? 0.7 : 1,
              cursor: 'pointer',
            }}
            onClick={() => {
              markNotificationRead(notif.id);
              if (notif.relatedEntityId) {
                navigate(`/event/${notif.relatedEntityId}`);
              }
            }}
          >
            <div className="flex items-start gap-3">
              <div style={{
                width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                background: `${TYPE_COLORS[notif.type]}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: TYPE_COLORS[notif.type],
                flexShrink: 0,
              }}>
                {TYPE_ICONS[notif.type]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{notif.title}</span>
                  {!notif.read && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-gold)' }} />
                  )}
                </div>
                <p className="text-sm text-secondary" style={{ marginTop: '2px', lineHeight: '1.5' }}>
                  {notif.message}
                </p>
                <div className="text-xs text-muted mt-1">{formatTimeAgo(notif.timestamp)}</div>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Bell size={28} /></div>
            <div className="empty-state-title">No Notifications</div>
            <div className="empty-state-text">You're all caught up!</div>
          </div>
        )}
      </div>
    </div>
  );
}
