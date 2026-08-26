import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Calendar, Clock, MapPin, Search } from 'lucide-react';
import { formatDate, formatTime, getEventTypeIcon } from '../utils/formatters';
import type { InvitationStatus } from '../types';

export default function UpcomingInvitationsScreen() {
  const navigate = useNavigate();
  const { invitations, updateInvitationStatus } = useAppStore();
  const [activeTab, setActiveTab] = useState<'all' | InvitationStatus>('all');
  const [search, setSearch] = useState('');

  const filtered = invitations
    .filter((inv) => activeTab === 'all' || inv.status === activeTab)
    .filter((inv) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        inv.title.toLowerCase().includes(q) ||
        (inv.nickname || '').toLowerCase().includes(q) ||
        (inv.venue || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'ignored', label: 'Ignored' },
  ];

  return (
    <div className="screen">
      <div className="screen-header">
        <h2>Invitations</h2>
        <p className="text-sm text-secondary" style={{ marginTop: '4px' }}>
          {invitations.length} total invitations
        </p>
      </div>

      {/* Search */}
      <div className="search-bar" style={{ marginBottom: 'var(--space-3)' }}>
        <Search size={16} className="search-bar-icon" />
        <input
          placeholder="Search invitations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-4)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {filtered.map((inv, i) => (
          <div
            key={inv.id}
            className={`event-card event-card-${inv.priority} animate-slide-up`}
            style={{ animationDelay: `${i * 0.05}s` }}
            onClick={() => navigate(`/event/${inv.id}`)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span>{getEventTypeIcon(inv.eventType)}</span>
                <span className={`badge badge-${inv.priority}`} style={{ fontSize: '9px' }}>
                  {inv.priority}
                </span>
              </div>
              <span className={`badge badge-${inv.status}`} style={{ fontSize: '9px' }}>
                {inv.status}
              </span>
            </div>

            <div className="event-card-title">{inv.nickname || inv.title}</div>

            <div className="event-card-meta" style={{ marginTop: 'var(--space-2)' }}>
              <span className="event-card-meta-item">
                <Calendar size={12} /> {formatDate(inv.date)}
              </span>
              {inv.time && (
                <span className="event-card-meta-item">
                  <Clock size={12} /> {formatTime(inv.time)}
                </span>
              )}
              {inv.venue && (
                <span className="event-card-meta-item">
                  <MapPin size={12} /> {inv.venue}
                </span>
              )}
            </div>

            {/* Quick actions for pending */}
            {inv.status === 'pending' && (
              <div className="flex gap-2" style={{ marginTop: 'var(--space-3)' }}>
                <button
                  className="btn btn-sm btn-confirm flex-1"
                  style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2)' }}
                  onClick={(e) => { e.stopPropagation(); updateInvitationStatus(inv.id, 'confirmed'); }}
                >
                  ✓ Confirm
                </button>
                <button
                  className="btn btn-sm btn-ignore flex-1"
                  style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2)' }}
                  onClick={(e) => { e.stopPropagation(); updateInvitationStatus(inv.id, 'ignored'); }}
                >
                  ✕ Ignore
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Calendar size={28} />
            </div>
            <div className="empty-state-title">No Invitations</div>
            <div className="empty-state-text">
              {search ? 'No results matching your search.' : 'No invitations in this category.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
