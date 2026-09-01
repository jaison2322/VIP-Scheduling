-- ==============================================================================
-- ENABLE SUPABASE REALTIME ON ALL TABLES
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Open your Supabase SQL Editor: https://supabase.com/dashboard/project/lliowikzustvebudgsoy/sql/new
-- 2. Paste this script and click "RUN"
-- ==============================================================================

-- 1. Set Replica Identity to FULL (ensures old + new record payloads in Realtime events)
ALTER TABLE public.user_accounts REPLICA IDENTITY FULL;
ALTER TABLE public.invitations REPLICA IDENTITY FULL;
ALTER TABLE public.people REPLICA IDENTITY FULL;
ALTER TABLE public.family_events REPLICA IDENTITY FULL;
ALTER TABLE public.schedule_items REPLICA IDENTITY FULL;
ALTER TABLE public.reminders REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.activity_logs REPLICA IDENTITY FULL;
ALTER TABLE public.privileged_users REPLICA IDENTITY FULL;
ALTER TABLE public.vip_users REPLICA IDENTITY FULL;

-- 2. Add all tables to supabase_realtime publication
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE 
      public.user_accounts,
      public.invitations,
      public.people,
      public.family_events,
      public.schedule_items,
      public.reminders,
      public.notifications,
      public.activity_logs,
      public.privileged_users,
      public.vip_users;
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Tables already in supabase_realtime publication';
  END;
END $$;
