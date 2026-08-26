import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Search, Gift } from 'lucide-react';
import { formatDate, formatCurrency, getGiftCategoryLabel, getInitials } from '../utils/formatters';

export default function GiftHistoryScreen() {
  const navigate = useNavigate();
  const { familyEvents } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Flatten all gift records
  const allGifts = familyEvents.flatMap((event) =>
    event.guests
      .filter((g) => g.gift)
      .map((g) => ({
        ...g,
        eventName: event.name,
        eventDate: event.date,
      }))
  );

  const filtered = allGifts
    .filter((g) => {
      if (filterCategory !== 'all' && g.giftCategory !== filterCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          g.personName.toLowerCase().includes(q) ||
          (g.gift || '').toLowerCase().includes(q) ||
          g.eventName.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate));

  const totalValue = filtered.reduce((s, g) => s + (g.estimatedValue || 0), 0);

  const categories = ['all', 'gold', 'silver', 'cash', 'clothing', 'electronics', 'household', 'jewelry', 'other'];

  return (
    <div className="screen">
      <div className="screen-header">
        <h2>Gift History</h2>
        <p className="text-sm text-secondary mt-1">
          {allGifts.length} gifts recorded · Total: {formatCurrency(totalValue)}
        </p>
      </div>

      <div className="search-bar" style={{ marginBottom: 'var(--space-3)' }}>
        <Search size={16} className="search-bar-icon" />
        <input placeholder="Search gifts..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="overflow-x-auto" style={{ marginBottom: 'var(--space-4)', margin: '0 calc(-1 * var(--space-4)) var(--space-4))', padding: '0 var(--space-4)' }}>
        <div className="tabs" style={{ width: 'max-content' }}>
          {categories.map((cat) => (
            <button key={cat} className={`tab ${filterCategory === cat ? 'active' : ''}`} onClick={() => setFilterCategory(cat)}>
              {cat === 'all' ? 'All' : getGiftCategoryLabel(cat as any)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((g, i) => (
          <div
            key={i}
            className="glass-card glass-card-interactive animate-slide-up"
            style={{ animationDelay: `${i * 0.04}s` }}
            onClick={() => navigate(`/person/${g.personId}`)}
          >
            <div className="flex items-center gap-3">
              <div className="avatar avatar-sm">{getInitials(g.personName)}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{g.personName}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Gift size={12} style={{ color: 'var(--color-gold)' }} />
                  <span className="text-sm text-gold">{g.gift}</span>
                </div>
                <div className="text-xs text-muted mt-1">
                  {g.eventName} · {formatDate(g.eventDate)}
                </div>
              </div>
              <div className="text-right">
                {g.estimatedValue && (
                  <div className="badge badge-gold" style={{ fontSize: '10px' }}>{formatCurrency(g.estimatedValue)}</div>
                )}
                {g.giftCategory && (
                  <div className="text-xs text-muted mt-1">{getGiftCategoryLabel(g.giftCategory)}</div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Gift size={28} /></div>
            <div className="empty-state-title">No Gifts Found</div>
            <div className="empty-state-text">
              {search ? 'No results matching your search.' : 'No gift records in this category.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
