-- ==============================================================================
-- VIP EVENT INTELLIGENCE & SCHEDULING - COMPLETE DATABASE SETUP
-- Supabase PostgreSQL Schema & Seed Data
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Open your Supabase project: https://supabase.com/dashboard/project/lliowikzustvebudgsoy/sql/new
-- 2. Paste this entire script into the SQL Editor
-- 3. Click "RUN" (or press Ctrl + Enter / Cmd + Enter)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- User Accounts (Primary Auth: Username as Primary Key & Password)
CREATE TABLE IF NOT EXISTS public.user_accounts (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'vip', -- 'vip' or 'staff'
    staff_title TEXT,
    phone TEXT,
    email TEXT,
    pin TEXT,
    avatar TEXT,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- VIP Users (Profile & PIN)
CREATE TABLE IF NOT EXISTS public.vip_users (
    id TEXT PRIMARY KEY,
    username TEXT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    pin TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- People / Contacts (VIPs, Friends, Relatives, Clients, Business Partners)
CREATE TABLE IF NOT EXISTS public.people (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    nickname TEXT,
    relationship TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invitations
CREATE TABLE IF NOT EXISTS public.invitations (
    id TEXT PRIMARY KEY,
    person_id TEXT REFERENCES public.people(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    nickname TEXT,
    main_person TEXT,
    host_name TEXT,
    date DATE NOT NULL,
    time TEXT,
    venue TEXT,
    location TEXT,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    ai_suggested_priority TEXT CHECK (ai_suggested_priority IN ('high', 'medium', 'low')),
    ai_reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'ignored')),
    image_id TEXT,
    ocr_text TEXT,
    created_by TEXT DEFAULT 'vip',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Past Family Events (Functions, Weddings, Anniversaries)
CREATE TABLE IF NOT EXISTS public.family_events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    date DATE NOT NULL,
    family_member TEXT NOT NULL,
    description TEXT,
    venue TEXT,
    guests JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schedule Items (Meetings, Events, Personal, Travel)
CREATE TABLE IF NOT EXISTS public.schedule_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    type TEXT NOT NULL DEFAULT 'event',
    location TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reminders
CREATE TABLE IF NOT EXISTS public.reminders (
    id TEXT PRIMARY KEY,
    event_id TEXT,
    event_title TEXT NOT NULL,
    days_before_event INTEGER NOT NULL DEFAULT 1,
    date DATE NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Privileged Users (PA, Secretary, Event Managers)
CREATE TABLE IF NOT EXISTS public.privileged_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    pin TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    added_by TEXT NOT NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active TIMESTAMPTZ
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_name TEXT,
    previous_value TEXT,
    new_value TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action_url TEXT,
    related_entity_id TEXT
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_people_name ON public.people(name);
CREATE INDEX IF NOT EXISTS idx_people_relationship ON public.people(relationship);
CREATE INDEX IF NOT EXISTS idx_invitations_person_id ON public.invitations(person_id);
CREATE INDEX IF NOT EXISTS idx_invitations_date ON public.invitations(date);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_priority ON public.invitations(priority);
CREATE INDEX IF NOT EXISTS idx_family_events_date ON public.family_events(date);
CREATE INDEX IF NOT EXISTS idx_schedule_items_date ON public.schedule_items(date);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON public.reminders(date);
CREATE INDEX IF NOT EXISTS idx_reminders_read ON public.reminders(read);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs(timestamp DESC);

-- 4. ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privileged_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Permissions for Data API
GRANT ALL ON TABLE public.user_accounts TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.vip_users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.people TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.invitations TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.family_events TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.schedule_items TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.reminders TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.privileged_users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.activity_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.notifications TO anon, authenticated, service_role;

-- CRUD policies for anon and authenticated
DO $$ 
BEGIN
    -- user_accounts
    DROP POLICY IF EXISTS "Allow select on user_accounts" ON public.user_accounts;
    CREATE POLICY "Allow select on user_accounts" ON public.user_accounts FOR SELECT TO anon, authenticated USING (true);
    DROP POLICY IF EXISTS "Allow insert on user_accounts" ON public.user_accounts;
    CREATE POLICY "Allow insert on user_accounts" ON public.user_accounts FOR INSERT TO anon, authenticated WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow update on user_accounts" ON public.user_accounts;
    CREATE POLICY "Allow update on user_accounts" ON public.user_accounts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow delete on user_accounts" ON public.user_accounts;
    CREATE POLICY "Allow delete on user_accounts" ON public.user_accounts FOR DELETE TO anon, authenticated USING (true);

    -- vip_users
    DROP POLICY IF EXISTS "Allow select on vip_users" ON public.vip_users;
    CREATE POLICY "Allow select on vip_users" ON public.vip_users FOR SELECT TO anon, authenticated USING (true);
    DROP POLICY IF EXISTS "Allow insert on vip_users" ON public.vip_users;
    CREATE POLICY "Allow insert on vip_users" ON public.vip_users FOR INSERT TO anon, authenticated WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow update on vip_users" ON public.vip_users;
    CREATE POLICY "Allow update on vip_users" ON public.vip_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow delete on vip_users" ON public.vip_users;
    CREATE POLICY "Allow delete on vip_users" ON public.vip_users FOR DELETE TO anon, authenticated USING (true);

    -- people
    DROP POLICY IF EXISTS "Allow select on people" ON public.people;
    CREATE POLICY "Allow select on people" ON public.people FOR SELECT TO anon, authenticated USING (true);
    DROP POLICY IF EXISTS "Allow insert on people" ON public.people;
    CREATE POLICY "Allow insert on people" ON public.people FOR INSERT TO anon, authenticated WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow update on people" ON public.people;
    CREATE POLICY "Allow update on people" ON public.people FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow delete on people" ON public.people;
    CREATE POLICY "Allow delete on people" ON public.people FOR DELETE TO anon, authenticated USING (true);

    -- invitations
    DROP POLICY IF EXISTS "Allow select on invitations" ON public.invitations;
    CREATE POLICY "Allow select on invitations" ON public.invitations FOR SELECT TO anon, authenticated USING (true);
    DROP POLICY IF EXISTS "Allow insert on invitations" ON public.invitations;
    CREATE POLICY "Allow insert on invitations" ON public.invitations FOR INSERT TO anon, authenticated WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow update on invitations" ON public.invitations;
    CREATE POLICY "Allow update on invitations" ON public.invitations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow delete on invitations" ON public.invitations;
    CREATE POLICY "Allow delete on invitations" ON public.invitations FOR DELETE TO anon, authenticated USING (true);

    -- family_events
    DROP POLICY IF EXISTS "Allow select on family_events" ON public.family_events;
    CREATE POLICY "Allow select on family_events" ON public.family_events FOR SELECT TO anon, authenticated USING (true);
    DROP POLICY IF EXISTS "Allow insert on family_events" ON public.family_events;
    CREATE POLICY "Allow insert on family_events" ON public.family_events FOR INSERT TO anon, authenticated WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow update on family_events" ON public.family_events;
    CREATE POLICY "Allow update on family_events" ON public.family_events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow delete on family_events" ON public.family_events;
    CREATE POLICY "Allow delete on family_events" ON public.family_events FOR DELETE TO anon, authenticated USING (true);

    -- schedule_items
    DROP POLICY IF EXISTS "Allow select on schedule_items" ON public.schedule_items;
    CREATE POLICY "Allow select on schedule_items" ON public.schedule_items FOR SELECT TO anon, authenticated USING (true);
    DROP POLICY IF EXISTS "Allow insert on schedule_items" ON public.schedule_items;
    CREATE POLICY "Allow insert on schedule_items" ON public.schedule_items FOR INSERT TO anon, authenticated WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow update on schedule_items" ON public.schedule_items;
    CREATE POLICY "Allow update on schedule_items" ON public.schedule_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow delete on schedule_items" ON public.schedule_items;
    CREATE POLICY "Allow delete on schedule_items" ON public.schedule_items FOR DELETE TO anon, authenticated USING (true);

    -- reminders
    DROP POLICY IF EXISTS "Allow select on reminders" ON public.reminders;
    CREATE POLICY "Allow select on reminders" ON public.reminders FOR SELECT TO anon, authenticated USING (true);
    DROP POLICY IF EXISTS "Allow insert on reminders" ON public.reminders;
    CREATE POLICY "Allow insert on reminders" ON public.reminders FOR INSERT TO anon, authenticated WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow update on reminders" ON public.reminders;
    CREATE POLICY "Allow update on reminders" ON public.reminders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow delete on reminders" ON public.reminders;
    CREATE POLICY "Allow delete on reminders" ON public.reminders FOR DELETE TO anon, authenticated USING (true);

    -- privileged_users
    DROP POLICY IF EXISTS "Allow select on privileged_users" ON public.privileged_users;
    CREATE POLICY "Allow select on privileged_users" ON public.privileged_users FOR SELECT TO anon, authenticated USING (true);
    DROP POLICY IF EXISTS "Allow insert on privileged_users" ON public.privileged_users;
    CREATE POLICY "Allow insert on privileged_users" ON public.privileged_users FOR INSERT TO anon, authenticated WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow update on privileged_users" ON public.privileged_users;
    CREATE POLICY "Allow update on privileged_users" ON public.privileged_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow delete on privileged_users" ON public.privileged_users;
    CREATE POLICY "Allow delete on privileged_users" ON public.privileged_users FOR DELETE TO anon, authenticated USING (true);

    -- activity_logs
    DROP POLICY IF EXISTS "Allow select on activity_logs" ON public.activity_logs;
    CREATE POLICY "Allow select on activity_logs" ON public.activity_logs FOR SELECT TO anon, authenticated USING (true);
    DROP POLICY IF EXISTS "Allow insert on activity_logs" ON public.activity_logs;
    CREATE POLICY "Allow insert on activity_logs" ON public.activity_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow update on activity_logs" ON public.activity_logs;
    CREATE POLICY "Allow update on activity_logs" ON public.activity_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow delete on activity_logs" ON public.activity_logs;
    CREATE POLICY "Allow delete on activity_logs" ON public.activity_logs FOR DELETE TO anon, authenticated USING (true);

    -- notifications
    DROP POLICY IF EXISTS "Allow select on notifications" ON public.notifications;
    CREATE POLICY "Allow select on notifications" ON public.notifications FOR SELECT TO anon, authenticated USING (true);
    DROP POLICY IF EXISTS "Allow insert on notifications" ON public.notifications;
    CREATE POLICY "Allow insert on notifications" ON public.notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow update on notifications" ON public.notifications;
    CREATE POLICY "Allow update on notifications" ON public.notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow delete on notifications" ON public.notifications;
    CREATE POLICY "Allow delete on notifications" ON public.notifications FOR DELETE TO anon, authenticated USING (true);
END $$;

-- 5. DATABASE READY
-- All tables and security policies are successfully initialized.
-- Tables are clean and ready to store user profiles, invitations, events, and schedules.
