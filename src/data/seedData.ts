import type {
  Person,
  FamilyEvent,
  ScheduleItem,
  Invitation,
  PrivilegedUser,
  ActivityLog,
  Notification,
} from '../types';

// ─── Clean Empty Initial Data ────────────────────────────────────────────────
// All mock/seed records removed. Fresh state ready for user records.

export const seedPeople: Person[] = [];
export const seedFamilyEvents: FamilyEvent[] = [];
export const seedSchedule: ScheduleItem[] = [];
export const seedInvitations: Invitation[] = [];
export const seedPrivilegedUsers: PrivilegedUser[] = [];
export const seedActivityLogs: ActivityLog[] = [];
export const seedNotifications: Notification[] = [];
