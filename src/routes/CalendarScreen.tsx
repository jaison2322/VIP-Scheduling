import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, addMonths, subMonths, isSameMonth, isToday, isSameDay, parseISO,
} from 'date-fns';
import { formatTime, getEventTypeIcon } from '../utils/formatters';

export default function CalendarScreen() {
  const navigate = useNavigate();
  const { invitations, schedule } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayInvitations = invitations.filter((i) => i.date === dateStr && i.status !== 'ignored');
    const daySchedule = schedule.filter((s) => s.date === dateStr);
    return { invitations: dayInvitations, schedule: daySchedule };
  };

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : { invitations: [], schedule: [] };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="screen">
      <div className="screen-header">
        <h2>Calendar</h2>
      </div>

      {/* Month Navigation */}
      <div className="glass-card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)' }}>
        <div className="flex items-center justify-between">
          <button className="btn-icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft size={18} />
          </button>
          <span className="font-heading font-semibold text-lg">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button className="btn-icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Week headers */}
        <div className="calendar-grid" style={{ marginTop: 'var(--space-3)' }}>
          {weekDays.map((day) => (
            <div key={day} className="calendar-header-cell">{day}</div>
          ))}

          {/* Days */}
          {calendarDays.map((day, i) => {
            const events = getEventsForDate(day);
            const hasEvents = events.invitations.length > 0 || events.schedule.length > 0;
            const hasConflict = events.invitations.length + events.schedule.length > 1;
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={i}
                className={`calendar-cell ${isToday(day) ? 'today' : ''} ${isSelected ? 'selected' : ''} ${!isCurrentMonth ? 'other-month' : ''} ${hasEvents ? 'has-events' : ''} ${hasConflict ? 'has-conflict' : ''}`}
                onClick={() => setSelectedDate(day)}
              >
                {format(day, 'd')}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="animate-slide-up">
          <div className="section-header">
            <span className="section-title">
              {format(selectedDate, 'EEEE, MMMM d')}
            </span>
          </div>

          {selectedEvents.invitations.length === 0 && selectedEvents.schedule.length === 0 ? (
            <div className="glass-card text-center" style={{ padding: 'var(--space-6)' }}>
              <p className="text-sm text-muted">No events on this day</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedEvents.schedule.map((item) => (
                <div key={item.id} className="glass-card flex items-center gap-3" style={{ padding: 'var(--space-3)' }}>
                  <div style={{ width: '4px', height: '36px', borderRadius: '2px', background: 'var(--color-info)' }} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="text-xs text-muted">
                      {formatTime(item.startTime)}{item.endTime ? ` - ${formatTime(item.endTime)}` : ''}
                      {item.location ? ` · ${item.location}` : ''}
                    </div>
                  </div>
                </div>
              ))}

              {selectedEvents.invitations.map((inv) => (
                <div
                  key={inv.id}
                  className={`event-card event-card-${inv.priority}`}
                  onClick={() => navigate(`/event/${inv.id}`)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{getEventTypeIcon(inv.eventType)}</span>
                    <span className={`badge badge-${inv.priority}`} style={{ fontSize: '9px' }}>
                      {inv.priority}
                    </span>
                    <span className={`badge badge-${inv.status}`} style={{ fontSize: '9px' }}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="event-card-title">{inv.nickname || inv.title}</div>
                  <div className="text-xs text-muted" style={{ marginTop: '4px' }}>
                    {inv.time ? formatTime(inv.time) : ''}{inv.venue ? ` · ${inv.venue}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
