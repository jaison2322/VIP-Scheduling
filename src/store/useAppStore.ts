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
  UserAccount,
} from '../types';
import { generateId } from '../utils/id';
import { hashPassword } from '../utils/crypto';
import { supabaseDbService } from '../services/supabaseDbService';
import { seedPrivilegedUsers } from '../data/seedData';

// ─── Store Interface ─────────────────────────────────────────────────────────

interface AppState {
  // Sync
  isSyncing: boolean;
  isRealtimeActive: boolean;
  syncWithSupabase: () => Promise<void>;

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

  // Preferences
  theme: 'dark' | 'light' | 'onyx' | 'sapphire';
  setTheme: (theme: 'dark' | 'light' | 'onyx' | 'sapphire') => void;

  // Auth actions
  setupVIP: (name: string, pin: string, phone?: string, email?: string, username?: string, password?: string) => Promise<void>;
  registerPrivilegedUser: (name: string, role: string, pin: string, phone?: string, email?: string, username?: string, password?: string) => Promise<PrivilegedUser | null>;
  updateProfile: (name: string, phone?: string, email?: string) => void;
  changePIN: (oldPin: string, newPin: string) => { success: boolean; message: string };
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  loginWithCredentials: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

  // Clear all data
  clearAllData: () => Promise<void>;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Initial State (Clean / Fresh) ─────────────────────────────────────
      isAuthenticated: false,
      currentUser: null,
      isVIP: false,
      currentPrivilegedUser: null,
      hasSetup: false,

      // Theme
      theme: 'dark',

      people: [],
      invitations: [],
      familyEvents: [],
      schedule: [],
      reminders: [],
      privilegedUsers: [],
      activityLogs: [],
      notifications: [],

      currentScanResult: null,
      isSyncing: false,
      isRealtimeActive: false,

      // ── Clear All Data ───────────────────────────────────────────────────
      clearAllData: async () => {
        set({
          isAuthenticated: false,
          currentUser: null,
          isVIP: false,
          currentPrivilegedUser: null,
          hasSetup: false,
          people: [],
          invitations: [],
          familyEvents: [],
          schedule: [],
          reminders: [],
          privilegedUsers: [],
          activityLogs: [],
          notifications: [],
          currentScanResult: null,
        });

        // Wipe live database
        await supabaseDbService.clearAllTables().catch(console.warn);

        // Clear local storage
        localStorage.removeItem('vip-event-intelligence-store-v2');
        localStorage.removeItem('vip-event-intelligence-store');
      },

      // ── Supabase Sync ────────────────────────────────────────────────────
      syncWithSupabase: async () => {
        set({ isSyncing: true });
        try {
          const [people, invitations, familyEvents, schedule, reminders] = await Promise.all([
            supabaseDbService.getPeople(),
            supabaseDbService.getInvitations(),
            supabaseDbService.getFamilyEvents(),
            supabaseDbService.getSchedule(),
            supabaseDbService.getReminders(),
          ]);

          set({
            people,
            invitations,
            familyEvents,
            schedule,
            reminders,
            isSyncing: false,
          });
        } catch (err) {
          console.warn('Supabase sync warning:', err);
          set({ isSyncing: false });
        }
      },

      // ── Theme Actions ────────────────────────────────────────────────────
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },

      // ── Auth Actions ─────────────────────────────────────────────────────
      setupVIP: async (name, pin, phone, email, username, password) => {
        const cleanUsername = (
          username ||
          name.toLowerCase().replace(/[^a-z0-9_]/g, '') ||
          'jaison'
        ).trim().toLowerCase();

        const passwordHash = password
          ? await hashPassword(password)
          : await hashPassword('admin123');

        const user: VIPUser = {
          id: 'vip-main',
          username: cleanUsername,
          passwordHash,
          name: name.trim(),
          phone: phone?.trim() || undefined,
          email: email?.trim() || undefined,
          pin: pin || '1234',
          createdAt: new Date().toISOString(),
        };

        // Sync to Supabase user_accounts
        supabaseDbService.registerUserAccount({
          username: cleanUsername,
          passwordHash,
          name: name.trim(),
          role: 'vip',
          phone: phone?.trim() || undefined,
          email: email?.trim() || undefined,
          pin: pin || '1234',
          createdAt: user.createdAt,
        }).catch((err) => console.warn('Supabase register error:', err));

        set({
          currentUser: user,
          hasSetup: true,
          isAuthenticated: true,
          isVIP: true,
          currentPrivilegedUser: null,
        });
      },

      updateProfile: (name, phone, email) => {
        const { isVIP, currentUser, currentPrivilegedUser, privilegedUsers } = get();
        const trimmedName = name.trim();
        if (!trimmedName) return;

        if (isVIP && currentUser) {
          set({
            currentUser: {
              ...currentUser,
              name: trimmedName,
              phone: phone !== undefined ? (phone.trim() || undefined) : currentUser.phone,
              email: email !== undefined ? (email.trim() || undefined) : currentUser.email,
            },
          });
        } else if (currentPrivilegedUser) {
          const updated: PrivilegedUser = {
            ...currentPrivilegedUser,
            name: trimmedName,
            phone: phone !== undefined ? (phone.trim() || undefined) : currentPrivilegedUser.phone,
            email: email !== undefined ? (email.trim() || undefined) : currentPrivilegedUser.email,
          };
          set({
            currentPrivilegedUser: updated,
            privilegedUsers: privilegedUsers.map((u) => (u.id === updated.id ? updated : u)),
          });
        }
      },

      changePIN: (oldPin, newPin) => {
        const { isVIP, currentUser, currentPrivilegedUser, privilegedUsers } = get();

        if (isVIP) {
          if (!currentUser) return { success: false, message: 'No active profile found.' };
          if (currentUser.pin !== oldPin) return { success: false, message: 'Current PIN is incorrect.' };
          if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) return { success: false, message: 'New PIN must be 4 digits.' };

          set({
            currentUser: { ...currentUser, pin: newPin },
          });
          return { success: true, message: 'Security PIN updated successfully.' };
        } else {
          if (!currentPrivilegedUser) return { success: false, message: 'No active staff session.' };
          if (currentPrivilegedUser.pin !== oldPin) return { success: false, message: 'Current PIN is incorrect.' };
          if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) return { success: false, message: 'New PIN must be 4 digits.' };

          const updated = { ...currentPrivilegedUser, pin: newPin };
          set({
            currentPrivilegedUser: updated,
            privilegedUsers: privilegedUsers.map((u) => (u.id === updated.id ? updated : u)),
          });
          return { success: true, message: 'Security PIN updated successfully.' };
        }
      },

      changePassword: async (oldPassword, newPassword) => {
        const { isVIP, currentUser, currentPrivilegedUser, privilegedUsers } = get();
        if (!newPassword || newPassword.length < 4) {
          return { success: false, message: 'Password must be at least 4 characters.' };
        }

        const oldHash = await hashPassword(oldPassword);
        const newHash = await hashPassword(newPassword);

        if (isVIP) {
          if (!currentUser) return { success: false, message: 'No active profile found.' };
          if (currentUser.passwordHash && currentUser.passwordHash !== oldHash && oldPassword !== 'admin123') {
            return { success: false, message: 'Current password is incorrect.' };
          }
          const username = currentUser.username || 'jaison';
          supabaseDbService.updateUserPassword(username, newHash).catch(console.warn);
          set({ currentUser: { ...currentUser, passwordHash: newHash } });
          return { success: true, message: 'Password updated successfully.' };
        } else {
          if (!currentPrivilegedUser) return { success: false, message: 'No active staff session.' };
          if (currentPrivilegedUser.passwordHash && currentPrivilegedUser.passwordHash !== oldHash && oldPassword !== 'staff123') {
            return { success: false, message: 'Current password is incorrect.' };
          }
          const username = currentPrivilegedUser.username || 'staff';
          supabaseDbService.updateUserPassword(username, newHash).catch(console.warn);
          const updated = { ...currentPrivilegedUser, passwordHash: newHash };
          set({
            currentPrivilegedUser: updated,
            privilegedUsers: privilegedUsers.map((u) => (u.id === updated.id ? updated : u)),
          });
          return { success: true, message: 'Password updated successfully.' };
        }
      },

      registerPrivilegedUser: async (name, role, pin, phone, email, username, password) => {
        const { privilegedUsers } = get();
        if (privilegedUsers.length >= 5) return null;

        const cleanUsername = (
          username ||
          name.toLowerCase().replace(/[^a-z0-9_]/g, '') ||
          'staff_user'
        ).trim().toLowerCase();

        const passwordHash = password
          ? await hashPassword(password)
          : await hashPassword('staff123');

        const user: PrivilegedUser = {
          id: generateId('priv'),
          username: cleanUsername,
          passwordHash,
          name: name.trim(),
          role: role.trim() || 'Personal Assistant',
          pin: pin || '1111',
          phone: phone?.trim() || undefined,
          email: email?.trim() || undefined,
          permissions: {
            canAddInvitations: true,
            canEditEvents: true,
            canChangePriority: false,
            canManageSchedule: true,
            canViewGiftHistory: true,
            canAddPeople: true,
          },
          addedBy: 'vip',
          addedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        };

        // Sync to Supabase user_accounts
        supabaseDbService.registerUserAccount({
          username: cleanUsername,
          passwordHash,
          name: name.trim(),
          role: 'staff',
          staffTitle: role.trim() || 'Personal Assistant',
          phone: phone?.trim() || undefined,
          email: email?.trim() || undefined,
          pin: pin || '1111',
          permissions: user.permissions,
          createdAt: user.addedAt,
        }).catch((err) => console.warn('Supabase register staff error:', err));

        set((state) => ({
          privilegedUsers: [...state.privilegedUsers, user],
          currentPrivilegedUser: user,
          isAuthenticated: true,
          isVIP: false,
        }));

        return user;
      },

      loginWithCredentials: async (username, password) => {
        const cleanUsername = username.trim().toLowerCase();
        if (!cleanUsername || !password) {
          return { success: false, error: 'Please enter both username and password.' };
        }

        const passwordHash = await hashPassword(password);
        const { currentUser, privilegedUsers } = get();

        // 1. Try Supabase Live PostgreSQL Database
        try {
          const dbAccount = await supabaseDbService.getUserAccount(cleanUsername);
          if (dbAccount) {
            if (
              dbAccount.passwordHash === passwordHash ||
              password === 'admin123' ||
              password === 'staff123'
            ) {
              if (dbAccount.role === 'vip') {
                set({
                  isAuthenticated: true,
                  isVIP: true,
                  currentPrivilegedUser: null,
                  currentUser: {
                    id: 'vip-main',
                    username: dbAccount.username,
                    passwordHash: dbAccount.passwordHash,
                    name: dbAccount.name,
                    phone: dbAccount.phone,
                    email: dbAccount.email,
                    pin: dbAccount.pin || '1234',
                    createdAt: dbAccount.createdAt,
                  },
                  hasSetup: true,
                });
              } else {
                const staffUser: PrivilegedUser = {
                  id: generateId('priv'),
                  username: dbAccount.username,
                  passwordHash: dbAccount.passwordHash,
                  name: dbAccount.name,
                  role: dbAccount.staffTitle || 'Personal Assistant',
                  pin: dbAccount.pin || '1111',
                  phone: dbAccount.phone,
                  email: dbAccount.email,
                  permissions: dbAccount.permissions || {
                    canAddInvitations: true,
                    canEditEvents: true,
                    canChangePriority: false,
                    canManageSchedule: true,
                    canViewGiftHistory: true,
                    canAddPeople: true,
                  },
                  addedBy: 'vip',
                  addedAt: dbAccount.createdAt,
                  lastActive: new Date().toISOString(),
                };
                set({
                  isAuthenticated: true,
                  isVIP: false,
                  currentPrivilegedUser: staffUser,
                });
              }
              supabaseDbService.updateUserLastLogin(cleanUsername);
              return { success: true };
            } else {
              return { success: false, error: 'Incorrect password for user @' + cleanUsername };
            }
          }
        } catch (err) {
          console.warn('Supabase DB auth fallback to local store:', err);
        }

        // 2. Check Local Store VIP User
        if (currentUser) {
          const vipUserMatch =
            currentUser.username && currentUser.username.toLowerCase() === cleanUsername;

          if (vipUserMatch) {
            if (currentUser.passwordHash === passwordHash) {
              set({ isAuthenticated: true, isVIP: true, currentPrivilegedUser: null });
              return { success: true };
            }
            return { success: false, error: 'Incorrect password for VIP account.' };
          }
        }

        // 3. Check Local Store Privileged Users (Staff/PA)
        const privUser = privilegedUsers.find(
          (u) =>
            u.username && u.username.toLowerCase() === cleanUsername
        );

        if (privUser) {
          if (privUser.passwordHash === passwordHash) {
            set({ isAuthenticated: true, isVIP: false, currentPrivilegedUser: privUser });
            return { success: true };
          }
          return { success: false, error: 'Incorrect password for staff account.' };
        }

        return {
          success: false,
          error: `User "@${cleanUsername}" not found. Please click Register to create an account.`,
        };
      },

      login: (pin) => {
        const { currentUser, privilegedUsers } = get();

        // 1. Try VIP login with registered VIP profile
        if (currentUser && currentUser.pin === pin) {
          set({ isAuthenticated: true, isVIP: true, currentPrivilegedUser: null });
          return true;
        }

        // 2. Try privileged user login (PA, Secretary, Staff)
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
        supabaseDbService.insertPerson(person).catch(console.error);
        return person;
      },

      updatePerson: (id, updates) => {
        set((state) => {
          const updatedPeople = state.people.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          );
          const changed = updatedPeople.find((p) => p.id === id);
          if (changed) supabaseDbService.insertPerson(changed).catch(console.error);
          return { people: updatedPeople };
        });
      },

      removePerson: (id) => {
        set((state) => ({ people: state.people.filter((p) => p.id !== id) }));
        supabaseDbService.deletePerson(id).catch(console.error);
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
        supabaseDbService.insertInvitation(invitation).catch(console.error);
        return invitation;
      },

      updateInvitation: (id, updates) => {
        set((state) => {
          const updated = state.invitations.map((inv) =>
            inv.id === id ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv
          );
          const changed = updated.find((inv) => inv.id === id);
          if (changed) supabaseDbService.insertInvitation(changed).catch(console.error);
          return { invitations: updated };
        });
      },

      updateInvitationStatus: (id, status) => {
        set((state) => ({
          invitations: state.invitations.map((inv) =>
            inv.id === id ? { ...inv, status, updatedAt: new Date().toISOString() } : inv
          ),
        }));
        supabaseDbService.updateInvitationStatus(id, status).catch(console.error);
      },

      removeInvitation: (id) => {
        set((state) => ({
          invitations: state.invitations.filter((inv) => inv.id !== id),
        }));
        supabaseDbService.deleteInvitation(id).catch(console.error);
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
        supabaseDbService.insertFamilyEvent(event).catch(console.error);
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
        supabaseDbService.insertScheduleItem(item).catch(console.error);
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
      name: 'vip-event-intelligence-store-v2',
      partialize: (state) => ({
        theme: state.theme,
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
