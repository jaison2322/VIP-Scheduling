import { supabase } from '../utils/supabase';
import type {
  Person,
  Invitation,
  FamilyEvent,
  ScheduleItem,
  Reminder,
  Notification,
  ActivityLog,
  VIPUser,
  PrivilegedUser,
  UserAccount,
} from '../types';

// ─── Supabase Database Service ────────────────────────────────────────────────
// Handles all CRUD operations with the live Supabase PostgreSQL database

export const supabaseDbService = {
  // ── People ──────────────────────────────────────────────────────────────────
  async getPeople(): Promise<Person[]> {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .order('name');
    if (error) {
      console.error('Error fetching people:', error);
      return [];
    }
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      nickname: row.nickname || '',
      relationship: row.relationship,
      phone: row.phone,
      email: row.email,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async insertPerson(person: Person): Promise<boolean> {
    const { error } = await supabase.from('people').upsert({
      id: person.id,
      name: person.name,
      nickname: person.nickname,
      relationship: person.relationship,
      phone: person.phone,
      email: person.email,
      notes: person.notes,
      created_at: person.createdAt,
      updated_at: person.updatedAt,
    });
    if (error) console.error('Error inserting person:', error);
    return !error;
  },

  async deletePerson(id: string): Promise<boolean> {
    const { error } = await supabase.from('people').delete().eq('id', id);
    if (error) console.error('Error deleting person:', error);
    return !error;
  },

  // ── Invitations ─────────────────────────────────────────────────────────────
  async getInvitations(): Promise<Invitation[]> {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .order('date', { ascending: true });
    if (error) {
      console.error('Error fetching invitations:', error);
      return [];
    }
    return (data || []).map((row) => ({
      id: row.id,
      personId: row.person_id,
      eventType: row.event_type,
      title: row.title,
      nickname: row.nickname,
      mainPerson: row.main_person,
      hostName: row.host_name,
      date: row.date,
      time: row.time,
      venue: row.venue,
      location: row.location,
      description: row.description,
      priority: row.priority,
      aiSuggestedPriority: row.ai_suggested_priority,
      aiReason: row.ai_reason,
      status: row.status,
      imageId: row.image_id,
      ocrText: row.ocr_text,
      createdBy: row.created_by || 'vip',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async insertInvitation(inv: Invitation): Promise<boolean> {
    const { error } = await supabase.from('invitations').upsert({
      id: inv.id,
      person_id: inv.personId,
      event_type: inv.eventType,
      title: inv.title,
      nickname: inv.nickname,
      main_person: inv.mainPerson,
      host_name: inv.hostName,
      date: inv.date,
      time: inv.time,
      venue: inv.venue,
      location: inv.location,
      description: inv.description,
      priority: inv.priority,
      ai_suggested_priority: inv.aiSuggestedPriority,
      ai_reason: inv.aiReason,
      status: inv.status,
      image_id: inv.imageId,
      ocr_text: inv.ocrText,
      created_by: inv.createdBy,
      created_at: inv.createdAt,
      updated_at: inv.updatedAt,
    });
    if (error) console.error('Error saving invitation:', error);
    return !error;
  },

  async updateInvitationStatus(id: string, status: string): Promise<boolean> {
    const { error } = await supabase
      .from('invitations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) console.error('Error updating invitation status:', error);
    return !error;
  },

  async deleteInvitation(id: string): Promise<boolean> {
    const { error } = await supabase.from('invitations').delete().eq('id', id);
    if (error) console.error('Error deleting invitation:', error);
    return !error;
  },

  // ── Family Events ───────────────────────────────────────────────────────────
  async getFamilyEvents(): Promise<FamilyEvent[]> {
    const { data, error } = await supabase
      .from('family_events')
      .select('*')
      .order('date', { ascending: false });
    if (error) {
      console.error('Error fetching family events:', error);
      return [];
    }
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      eventType: row.event_type,
      date: row.date,
      familyMember: row.family_member,
      description: row.description,
      venue: row.venue,
      guests: row.guests || [],
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async insertFamilyEvent(event: FamilyEvent): Promise<boolean> {
    const { error } = await supabase.from('family_events').upsert({
      id: event.id,
      name: event.name,
      event_type: event.eventType,
      date: event.date,
      family_member: event.familyMember,
      description: event.description,
      venue: event.venue,
      guests: event.guests,
      notes: event.notes,
      created_at: event.createdAt,
      updated_at: event.updatedAt,
    });
    if (error) console.error('Error saving family event:', error);
    return !error;
  },

  // ── Schedule Items ──────────────────────────────────────────────────────────
  async getSchedule(): Promise<ScheduleItem[]> {
    const { data, error } = await supabase
      .from('schedule_items')
      .select('*')
      .order('date', { ascending: true });
    if (error) {
      console.error('Error fetching schedule:', error);
      return [];
    }
    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      type: row.type,
      location: row.location,
      notes: row.notes,
      createdAt: row.created_at,
    }));
  },

  async insertScheduleItem(item: ScheduleItem): Promise<boolean> {
    const { error } = await supabase.from('schedule_items').upsert({
      id: item.id,
      title: item.title,
      date: item.date,
      start_time: item.startTime,
      end_time: item.endTime,
      type: item.type,
      location: item.location,
      notes: item.notes,
      created_at: item.createdAt,
    });
    if (error) console.error('Error saving schedule item:', error);
    return !error;
  },

  // ── Reminders ───────────────────────────────────────────────────────────────
  async getReminders(): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('date', { ascending: true });
    if (error) {
      console.error('Error fetching reminders:', error);
      return [];
    }
    return (data || []).map((row) => ({
      id: row.id,
      eventId: row.event_id,
      eventTitle: row.event_title,
      daysBeforeEvent: row.days_before_event,
      date: row.date,
      message: row.message,
      read: row.read,
      priority: row.priority,
    }));
  },

  // ── User Accounts & Authentication ──────────────────────────────────────────
  async getUserAccount(username: string): Promise<UserAccount | null> {
    try {
      const cleanUsername = username.trim().toLowerCase();
      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching user account:', error);
        return null;
      }
      if (!data) return null;

      return {
        username: data.username,
        passwordHash: data.password_hash,
        name: data.name,
        role: data.role as 'vip' | 'staff',
        staffTitle: data.staff_title,
        phone: data.phone,
        email: data.email,
        pin: data.pin,
        avatar: data.avatar,
        permissions: data.permissions,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        lastLogin: data.last_login,
      };
    } catch (err) {
      console.warn('Supabase getUserAccount exception:', err);
      return null;
    }
  },

  async isUsernameTaken(username: string): Promise<boolean> {
    try {
      const cleanUsername = username.trim().toLowerCase();
      const { data, error } = await supabase
        .from('user_accounts')
        .select('username')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error checking username availability:', error);
        return false;
      }
      return !!data;
    } catch (err) {
      return false;
    }
  },

  async registerUserAccount(account: UserAccount): Promise<{ success: boolean; error?: string }> {
    try {
      const cleanUsername = account.username.trim().toLowerCase();
      const { error } = await supabase.from('user_accounts').insert({
        username: cleanUsername,
        password_hash: account.passwordHash,
        name: account.name.trim(),
        role: account.role,
        staff_title: account.staffTitle,
        phone: account.phone,
        email: account.email,
        pin: account.pin,
        avatar: account.avatar,
        permissions: account.permissions || {},
        created_at: account.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error registering user in Supabase:', error);
        return { success: false, error: error.message };
      }

      // If VIP, also sync to vip_users table
      if (account.role === 'vip') {
        await supabase.from('vip_users').upsert({
          id: 'vip-main',
          username: cleanUsername,
          name: account.name.trim(),
          phone: account.phone,
          email: account.email,
          pin: account.pin || '1234',
          avatar: account.avatar,
          updated_at: new Date().toISOString(),
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error('Exception registering user account:', err);
      return { success: false, error: err.message || 'Database error occurred' };
    }
  },

  async updateUserLastLogin(username: string): Promise<void> {
    try {
      const cleanUsername = username.trim().toLowerCase();
      await supabase
        .from('user_accounts')
        .update({ last_login: new Date().toISOString() })
        .eq('username', cleanUsername);
    } catch (err) {
      console.warn('Error updating last login:', err);
    }
  },

  async updateUserPassword(username: string, newPasswordHash: string): Promise<boolean> {
    try {
      const cleanUsername = username.trim().toLowerCase();
      const { error } = await supabase
        .from('user_accounts')
        .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
        .eq('username', cleanUsername);

      return !error;
    } catch (err) {
      console.error('Error updating password:', err);
      return false;
    }
  },

  // ── Clear All Database Tables ───────────────────────────────────────────────
  async clearAllTables(): Promise<{ success: boolean; error?: string }> {
    try {
      const tables = [
        { name: 'reminders', col: 'id' },
        { name: 'invitations', col: 'id' },
        { name: 'family_events', col: 'id' },
        { name: 'schedule_items', col: 'id' },
        { name: 'activity_logs', col: 'id' },
        { name: 'notifications', col: 'id' },
        { name: 'people', col: 'id' },
        { name: 'privileged_users', col: 'id' },
        { name: 'vip_users', col: 'id' },
        { name: 'user_accounts', col: 'username' },
      ];

      for (const t of tables) {
        await supabase.from(t.name).delete().neq(t.col, '__none__');
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error clearing database tables:', err);
      return { success: false, error: err.message };
    }
  },

  // ── Health Check / Ping ─────────────────────────────────────────────────────
  async checkConnection(): Promise<{ connected: boolean; tablesFound: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.from('people').select('id').limit(1);
      if (error) {
        // Table does not exist in schema cache yet
        if (error.code === 'PGRST205' || error.message.includes('schema cache')) {
          return { connected: true, tablesFound: false, error: 'Tables not yet created in Supabase.' };
        }
        return { connected: false, tablesFound: false, error: error.message };
      }
      return { connected: true, tablesFound: true };
    } catch (e: any) {
      return { connected: false, tablesFound: false, error: e.message };
    }
  },
};
