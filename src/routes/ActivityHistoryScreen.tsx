import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ArrowLeft, Search, ArrowRight } from 'lucide-react';
import { formatTimeAgo, getInitials } from '../utils/formatters';

export default function ActivityHistoryScreen() {
  const navigate = useNavigate();
  const { activityLogs } = useAppStore();
  const [search, setSearch] = useState('');

  const filtered = activityLogs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.userName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      (log.entityName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="screen-no-nav">
      <div className="top-bar">
        <button className="top-bar-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <span className="top-bar-title">Activity History</span>
        <div style={{ width: '36px' }} />
      </div>

      <div className="search-bar mb-4">
        <Search size={16} className="search-bar-icon" />
        <input placeholder="Search activity..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((log, i) => (
          <div key={log.id} className="glass-card animate-slide-up" style={{ animationDelay: `${i * 0.04}s`, padding: 'var(--space-3) var(--space-4)' }}>
            <div className="flex items-start gap-3">
              <div className="avatar avatar-sm">{getInitials(log.userName)}</div>
              <div className="flex-1">
                <div className="text-sm">
                  <strong>{log.userName}</strong>{' '}
                  <span className="text-secondary">{log.action}</span>
                </div>
                {log.entityName && (
                  <div className="text-xs text-gold mt-1">{log.entityName}</div>
                )}
                {log.previousValue && log.newValue && (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
                      {log.previousValue}
                    </span>
                    <ArrowRight size={12} className="text-muted" />
                    <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-sm)', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-confirmed)' }}>
                      {log.newValue}
                    </span>
                  </div>
                )}
                <div className="text-xs text-muted mt-1">{formatTimeAgo(log.timestamp)}</div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-title">No Activity</div>
            <div className="empty-state-text">No activity logs found.</div>
          </div>
        )}
      </div>
    </div>
  );
}
