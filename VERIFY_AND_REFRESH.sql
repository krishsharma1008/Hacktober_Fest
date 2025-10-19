-- ============================================================================
-- VERIFICATION AND SCHEMA REFRESH
-- Run this to check if tables exist and refresh the schema cache
-- ============================================================================

-- Check if project_likes table exists
SELECT 
  'project_likes' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_likes')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Check if project_views table exists
SELECT 
  'project_views' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_views')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Check if toggle_project_like function exists
SELECT 
  'toggle_project_like' as function_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'toggle_project_like')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Check if record_project_view function exists
SELECT 
  'record_project_view' as function_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'record_project_view')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Count rows in each table (if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_likes') THEN
    RAISE NOTICE 'project_likes row count: %', (SELECT COUNT(*) FROM public.project_likes);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_views') THEN
    RAISE NOTICE 'project_views row count: %', (SELECT COUNT(*) FROM public.project_views);
  END IF;
END $$;

-- FORCE REFRESH THE SCHEMA CACHE
-- This is critical - PostgREST caches the schema
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Alternative: Restart PostgREST (if NOTIFY doesn't work)
-- You may need to go to Supabase Dashboard > Settings > API and click "Restart API"

SELECT 'Schema cache refresh signal sent!' as message;
SELECT 'If tables still show as missing, go to Supabase Dashboard > Settings > API > Restart API' as next_step;

