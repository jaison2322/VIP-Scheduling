import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Search, Plus, Users } from 'lucide-react';
import { getInitials, getRelationshipLabel } from '../utils/formatters';
import type { RelationshipType } from '../types';

export default function PeopleListScreen() {
  const navigate = useNavigate();
  const { people, addPerson } = useAppStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newRelationship, setNewRelationship] = useState<RelationshipType>('friend');

  const filtered = people.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.nickname.toLowerCase().includes(q);
  });

  const relationships: RelationshipType[] = [
    'business_partner', 'client', 'colleague', 'friend', 'family',
    'relative', 'neighbor', 'acquaintance', 'other',
  ];

  const handleAdd = () => {
    if (!newName.trim()) return;
    addPerson({
      name: newName.trim(),
      nickname: newNickname.trim() || newName.trim(),
      relationship: newRelationship,
    });
    setShowAdd(false);
    setNewName('');
    setNewNickname('');
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="flex items-center justify-between">
          <h2>People</h2>
          <button className="btn btn-sm btn-outline" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Add
          </button>
        </div>
        <p className="text-sm text-secondary mt-1">{people.length} contacts</p>
      </div>

      <div className="search-bar mb-4">
        <Search size={16} className="search-bar-icon" />
        <input placeholder="Search people..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Add Person Form */}
      {showAdd && (
        <div className="glass-card glass-card-gold mb-4 animate-scale-in">
          <h4 style={{ marginBottom: 'var(--space-3)' }}>Add New Person</h4>
          <div className="flex flex-col gap-3">
            <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full Name *" autoFocus />
            <input className="input" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} placeholder="Nickname (e.g., Business Partner Ramesh)" />
            <select className="select" value={newRelationship} onChange={(e) => setNewRelationship(e.target.value as RelationshipType)}>
              {relationships.map((r) => <option key={r} value={r}>{getRelationshipLabel(r)}</option>)}
            </select>
            <div className="flex gap-2">
              <button className="btn btn-ghost flex-1" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-gold flex-1" onClick={handleAdd} disabled={!newName.trim()}>Add</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((person, i) => (
          <div
            key={person.id}
            className="glass-card glass-card-interactive animate-slide-up"
            style={{ animationDelay: `${i * 0.04}s`, padding: 'var(--space-3) var(--space-4)' }}
            onClick={() => navigate(`/person/${person.id}`)}
          >
            <div className="flex items-center gap-3">
              <div className="avatar">{getInitials(person.name)}</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{person.nickname}</div>
                <div className="text-xs text-muted">{person.name}</div>
              </div>
              <span className="badge badge-gold" style={{ fontSize: '9px' }}>
                {getRelationshipLabel(person.relationship)}
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={28} /></div>
            <div className="empty-state-title">No People Found</div>
            <div className="empty-state-text">Add contacts to build your network.</div>
          </div>
        )}
      </div>
    </div>
  );
}
