-- ==============================================================================
-- VIP EVENT INTELLIGENCE - CLEAR ALL TABLE DATA
-- Supabase PostgreSQL Script
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Open your Supabase project: https://supabase.com/dashboard/project/lliowikzustvebudgsoy/sql/new
-- 2. Paste this entire script into the SQL Editor
-- 3. Click "RUN" (or press Ctrl + Enter / Cmd + Enter)
-- ==============================================================================

-- Delete all records from every table in dependency order
DELETE FROM public.reminders;
DELETE FROM public.invitations;
DELETE FROM public.family_events;
DELETE FROM public.schedule_items;
DELETE FROM public.activity_logs;
DELETE FROM public.notifications;
DELETE FROM public.people;
DELETE FROM public.privileged_users;
DELETE FROM public.vip_users;
DELETE FROM public.user_accounts;

-- Verification: Check that all tables are now 0 rows
SELECT 
    (SELECT COUNT(*) FROM public.user_accounts) AS user_accounts_count,
    (SELECT COUNT(*) FROM public.vip_users) AS vip_users_count,
    (SELECT COUNT(*) FROM public.privileged_users) AS privileged_users_count,
    (SELECT COUNT(*) FROM public.people) AS people_count,
    (SELECT COUNT(*) FROM public.invitations) AS invitations_count,
    (SELECT COUNT(*) FROM public.family_events) AS family_events_count,
    (SELECT COUNT(*) FROM public.schedule_items) AS schedule_items_count,
    (SELECT COUNT(*) FROM public.reminders) AS reminders_count,
    (SELECT COUNT(*) FROM public.activity_logs) AS activity_logs_count,
    (SELECT COUNT(*) FROM public.notifications) AS notifications_count;
