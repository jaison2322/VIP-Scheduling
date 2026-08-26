import { format, formatDistanceToNow, parseISO, isToday, isTomorrow, differenceInDays } from 'date-fns';
import type { Priority, EventType, InvitationStatus, GiftCategory } from '../types';

export function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  } catch {
    return dateStr;
  }
}

export function formatFullDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

export function formatTimeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
}

export function daysUntil(dateStr: string): number {
  try {
    return differenceInDays(parseISO(dateStr), new Date());
  } catch {
    return 0;
  }
}

export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 'high': return 'var(--color-priority-high)';
    case 'medium': return 'var(--color-priority-medium)';
    case 'low': return 'var(--color-priority-low)';
  }
}

export function getPriorityLabel(priority: Priority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function getStatusLabel(status: InvitationStatus): string {
  switch (status) {
    case 'pending': return 'Pending Review';
    case 'confirmed': return 'Confirmed';
    case 'ignored': return 'Ignored';
  }
}

export function getEventTypeLabel(type: EventType): string {
  const labels: Record<EventType, string> = {
    wedding: '💒 Wedding',
    engagement: '💍 Engagement',
    birthday: '🎂 Birthday',
    anniversary: '🎉 Anniversary',
    house_warming: '🏠 House Warming',
    baby_shower: '👶 Baby Shower',
    graduation: '🎓 Graduation',
    retirement: '🏖️ Retirement',
    funeral: '🕊️ Memorial',
    business_event: '💼 Business Event',
    reception: '🥂 Reception',
    cultural: '🎭 Cultural Event',
    religious: '🛕 Religious Event',
    other: '📌 Event',
  };
  return labels[type] || '📌 Event';
}

export function getEventTypeIcon(type: EventType): string {
  const icons: Record<EventType, string> = {
    wedding: '💒',
    engagement: '💍',
    birthday: '🎂',
    anniversary: '🎉',
    house_warming: '🏠',
    baby_shower: '👶',
    graduation: '🎓',
    retirement: '🏖️',
    funeral: '🕊️',
    business_event: '💼',
    reception: '🥂',
    cultural: '🎭',
    religious: '🛕',
    other: '📌',
  };
  return icons[type] || '📌';
}

export function getGiftCategoryLabel(cat: GiftCategory): string {
  const labels: Record<GiftCategory, string> = {
    gold: '🪙 Gold',
    silver: '🥈 Silver',
    cash: '💵 Cash',
    clothing: '👗 Clothing',
    electronics: '📱 Electronics',
    household: '🏠 Household',
    jewelry: '💎 Jewelry',
    other: '🎁 Other',
  };
  return labels[cat] || '🎁 Other';
}

export function getRelationshipLabel(rel: string): string {
  const labels: Record<string, string> = {
    business_partner: 'Business Partner',
    client: 'Client',
    colleague: 'Colleague',
    friend: 'Friend',
    family: 'Family',
    relative: 'Relative',
    neighbor: 'Neighbor',
    acquaintance: 'Acquaintance',
    other: 'Other',
  };
  return labels[rel] || rel;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function formatCurrency(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}
