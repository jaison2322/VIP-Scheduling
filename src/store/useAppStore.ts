import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  VIPUser,
  PrivilegedUser,
  Person,
  Invitation,
  FamilyEvent,
  ScheduleItem,
  Reminder,
  ActivityLog,
  Notification,
  InvitationStatus,
  Priority,
  ScanResult,
} from '../types';
import {
  seedPeople,
  seedFamilyEvents,
  seedSchedule,
  seedInvitations,
  seedPrivilegedUsers,
  seedActivityLogs,
  seedNotifications,
} from '../data/seedData';
import { generateId } from '../utils/id';

// ─── Store Interface ─────────────────────────────────────────────────────────

interface AppState {
  // Auth
  isAuthenticated: boolean;
  currentUser: VIPUser | null;
  isVIP: boolean;
  currentPrivilegedUser: PrivilegedUser | null;
  hasSetup: boolean;

  // Data
  people: Person[];
  invitations: Invitation[];
  familyEvents: FamilyEvent[];
  schedule: ScheduleItem[];
  reminders: Reminder[];
  privilegedUsers: PrivilegedUser[];
  activityLogs: ActivityLog[];
  notifications: Notification[];

  // Scan state
  currentScanResult: ScanResult | null;

  // Auth actions
  setupVIP: (name: string, pin: string) => void;
  login: (pin: string) => boolean;
  logout: () => void;

  // People actions
  addPerson: (person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => Person;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  removePerson: (id: string) => void;
  getPersonById: (id: string) => Person | undefined;
  searchPeople: (query: string) => Person[];

  // Invitation actions
  addInvitation: (invitation: Omit<Invitation, 'id' | 'createdAt' | 'updatedAt'>) => Invitation;
  updateInvitation: (id: string, updates: Partial<Invitation>) => void;
  updateInvitationStatus: (id: string, status: InvitationStatus) => void;
  removeInvitation: (id: string) => void;
  getInvitationById: (id: string) => Invitation | undefined;
  getInvitationsByStatus: (status: InvitationStatus) => Invitation[];
  getInvitationsByDate: (date: string) => Invitation[];

  // Family event actions
  addFamilyEvent: (event: Omit<FamilyEvent, 'id' | 'createdAt' | 'updatedAt'>) => FamilyEvent;
  updateFamilyEvent: (id: string, updates: Partial<FamilyEvent>) => void;
  removeFamilyEvent: (id: string) => void;
  getFamilyEventById: (id: string) => FamilyEvent | undefined;

  // Schedule actions
  addScheduleItem: (item: Omit<ScheduleItem, 'id' | 'createdAt'>) => ScheduleItem;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;
  removeScheduleItem: (id: string) => void;
  getScheduleByDate: (date: string) => ScheduleItem[];

  // Privileged user actions
  addPrivilegedUser: (user: Omit<PrivilegedUser, 'id' | 'addedAt'>) => PrivilegedUser | null;
  updatePrivilegedUser: (id: string, updates: Partial<PrivilegedUser>) => void;
  removePrivilegedUser: (id: string) => void;

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getUnreadCount: () => number;

  // Activity log actions
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;

  // Reminder actions
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  markReminderRead: (id: string) => void;

  // Scan actions
  setScanResult: (result: ScanResult | null) => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Initial State ────────────────────────────────────────────────────
      isAuthenticated: false,
      currentUser: null,
      isVIP: false,
      currentPrivilegedUser: null,
      hasSetup: false,

      people: seedPeople,
      invitations: seedInvitations,
      familyEvents: seedFamilyEvents,
      schedule: seedSchedule,
      reminders: [],
      privilegedUsers: seedPrivilegedUsers,
      activityLogs: seedActivityLogs,
      notifications: seedNotifications,

      currentScanResult: null,

      // ── Auth Actions ─────────────────────────────────────────────────────
      setupVIP: (name, pin) => {
        const user: VIPUser = {
          id: 'vip-main',
          name,
          pin,
          createdAt: new Date().toISOString(),
        };
        set({
          currentUser: user,
          hasSetup: true,
          isAuthenticated: true,
          isVIP: true,
        });
      },

      login: (pin) => {
        const { currentUser, privilegedUsers } = get();

        // Try VIP login
        if (currentUser && currentUser.pin === pin) {
          set({ isAuthenticated: true, isVIP: true, currentPrivilegedUser: null });
          return true;
        }

        // Try privileged user login
        const privUser = privilegedUsers.find((u) => u.pin === pin);
        if (privUser) {
          set({
            isAuthenticated: true,
            isVIP: false,
            currentPrivilegedUser: privUser,
          });
          return true;
        }

        return false;
      },

      logout: () => {
        set({
          isAuthenticated: false,
          isVIP: false,
          currentPrivilegedUser: null,
        });
      },

      // ── People Actions ───────────────────────────────────────────────────
      addPerson: (personData) => {
        const person: Person = {
          ...personData,
          id: generateId('person'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ people: [...state.people, person] }));
        return person;
      },

      updatePerson: (id, updates) => {
        set((state) => ({
          people: state.people.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      removePerson: (id) => {
        set((state) => ({ people: state.people.filter((p) => p.id !== id) }));
      },

      getPersonById: (id) => get().people.find((p) => p.id === id),

      searchPeople: (query) => {
        const q = query.toLowerCase();
        return get().people.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.nickname.toLowerCase().includes(q) ||
            p.relationship.toLowerCase().includes(q)
        );
      },

      // ── Invitation Actions ───────────────────────────────────────────────
      addInvitation: (invData) => {
        const invitation: Invitation = {
          ...invData,
          id: generateId('inv'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ invitations: [...state.invitations, invitation] }));
        return invitation;
      },

      updateInvitation: (id, updates) => {
        set((state) => ({
          invitations: state.invitations.map((inv) =>
            inv.id === id ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv
          ),
        }));
      },

      updateInvitationStatus: (id, status) => {
        set((state) => ({
          invitations: state.invitations.map((inv) =>
            inv.id === id ? { ...inv, status, updatedAt: new Date().toISOString() } : inv
          ),
        }));
      },

      removeInvitation: (id) => {
        set((state) => ({
          invitations: state.invitations.filter((inv) => inv.id !== id),
        }));
      },

      getInvitationById: (id) => get().invitations.find((inv) => inv.id === id),

      getInvitationsByStatus: (status) =>
        get().invitations.filter((inv) => inv.status === status),

      getInvitationsByDate: (date) =>
        get().invitations.filter((inv) => inv.date === date),

      // ── Family Event Actions ─────────────────────────────────────────────
      addFamilyEvent: (eventData) => {
        const event: FamilyEvent = {
          ...eventData,
          id: generateId('event'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ familyEvents: [...state.familyEvents, event] }));
        return event;
      },

      updateFamilyEvent: (id, updates) => {
        set((state) => ({
          familyEvents: state.familyEvents.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        }));
      },

      removeFamilyEvent: (id) => {
        set((state) => ({
          familyEvents: state.familyEvents.filter((e) => e.id !== id),
        }));
      },

      getFamilyEventById: (id) => get().familyEvents.find((e) => e.id === id),

      // ── Schedule Actions ─────────────────────────────────────────────────
      addScheduleItem: (itemData) => {
        const item: ScheduleItem = {
          ...itemData,
          id: generateId('sched'),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ schedule: [...state.schedule, item] }));
        return item;
      },

      updateScheduleItem: (id, updates) => {
        set((state) => ({
          schedule: state.schedule.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      removeScheduleItem: (id) => {
        set((state) => ({
          schedule: state.schedule.filter((s) => s.id !== id),
        }));
      },

      getScheduleByDate: (date) =>
        get().schedule.filter((s) => s.date === date),

      // ── Privileged User Actions ──────────────────────────────────────────
      addPrivilegedUser: (userData) => {
        const { privilegedUsers } = get();
        if (privilegedUsers.length >= 5) return null;

        const user: PrivilegedUser = {
          ...userData,
          id: generateId('priv'),
          addedAt: new Date().toISOString(),
        };
        set((state) => ({
          privilegedUsers: [...state.privilegedUsers, user],
        }));
        return user;
      },

      updatePrivilegedUser: (id, updates) => {
        set((state) => ({
          privilegedUsers: state.privilegedUsers.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        }));
      },

      removePrivilegedUser: (id) => {
        set((state) => ({
          privilegedUsers: state.privilegedUsers.filter((u) => u.id !== id),
        }));
      },

      // ── Notification Actions ─────────────────────────────────────────────
      addNotification: (notifData) => {
        const notification: Notification = {
          ...notifData,
          id: generateId('notif'),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      getUnreadCount: () => get().notifications.filter((n) => !n.read).length,

      // ── Activity Log Actions ─────────────────────────────────────────────
      addActivityLog: (logData) => {
        const log: ActivityLog = {
          ...logData,
          id: generateId('log'),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          activityLogs: [log, ...state.activityLogs],
        }));
      },

      // ── Reminder Actions ─────────────────────────────────────────────────
      addReminder: (reminderData) => {
        const reminder: Reminder = {
          ...reminderData,
          id: generateId('rem'),
        };
        set((state) => ({
          reminders: [...state.reminders, reminder],
        }));
      },

      markReminderRead: (id) => {
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, read: true } : r
          ),
        }));
      },

      // ── Scan Actions ─────────────────────────────────────────────────────
      setScanResult: (result) => {
        set({ currentScanResult: result });
      },
    }),
    {
      name: 'vip-event-intelligence-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        hasSetup: state.hasSetup,
        people: state.people,
        invitations: state.invitations,
        familyEvents: state.familyEvents,
        schedule: state.schedule,
        reminders: state.reminders,
        privilegedUsers: state.privilegedUsers,
        activityLogs: state.activityLogs,
        notifications: state.notifications,
      }),
    }
  )
);
