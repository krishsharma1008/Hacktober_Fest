-- =====================================================
-- ACCESS CONTROL VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor AFTER applying migrations
-- =====================================================

-- Check 1: Verify all RLS policies exist
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected output: Should see policies for all tables
-- profiles, projects, project_likes, project_views, user_roles, 
-- judge_feedback, updates, discussions, registrations

-- Check 2: Verify RLS is enabled on all tables
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: rls_enabled should be 't' (true) for all tables

-- Check 3: Verify role-checking functions exist
-- =====================================================
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'has_role',
    'get_user_role',
    'toggle_project_like',
    'record_project_view',
    'handle_new_user'
  )
ORDER BY routine_name;

-- Expected: 5 functions, all with security_type = 'DEFINER'

-- Check 4: Verify user roles enum exists
-- =====================================================
SELECT 
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'app_role'
ORDER BY e.enumsortorder;

-- Expected: user, admin, judge

-- Check 5: Verify storage buckets exist
-- =====================================================
SELECT 
  id,
  name,
  public
FROM storage.buckets
WHERE name IN ('project-files', 'project-images');

-- Expected: 2 buckets, both public = true

-- Check 6: Verify storage policies exist
-- =====================================================
SELECT 
  name,
  bucket_id,
  operation
FROM storage.policies
WHERE bucket_id IN ('project-files', 'project-images')
ORDER BY bucket_id, operation;

-- Expected: Multiple policies for SELECT, INSERT, UPDATE, DELETE

-- Check 7: Test project_likes structure
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'project_likes'
ORDER BY ordinal_position;

-- Expected: id, project_id, user_id, created_at

-- Check 8: Test project_views structure
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'project_views'
ORDER BY ordinal_position;

-- Expected: id, project_id, user_id (nullable), ip_address (nullable), created_at

-- Check 9: Verify UNIQUE constraints
-- =====================================================
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'UNIQUE'
  AND tc.table_name IN ('project_likes', 'user_roles', 'judge_feedback', 'registrations')
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name;

-- Expected: 
-- project_likes: UNIQUE(project_id, user_id)
-- user_roles: UNIQUE(user_id, role)
-- judge_feedback: UNIQUE(project_id, judge_id)

-- Check 10: Verify foreign key constraints
-- =====================================================
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('project_likes', 'project_views')
ORDER BY tc.table_name, kcu.column_name;

-- Expected: Foreign keys to projects and auth.users tables

-- =====================================================
-- MANUAL TEST QUERIES (Test with different users)
-- =====================================================

-- Test 1: Check if current user can view projects
-- (Should work for everyone)
SELECT id, title, team_name, likes, views 
FROM projects 
LIMIT 5;

-- Test 2: Check current user's likes
-- (Replace YOUR_USER_ID with actual user ID)
-- SELECT project_id, created_at
-- FROM project_likes
-- WHERE user_id = 'YOUR_USER_ID';

-- Test 3: Try to toggle a like
-- (Replace PROJECT_ID with actual project ID)
-- SELECT * FROM toggle_project_like('PROJECT_ID');

-- Test 4: Check user role
-- (Replace USER_ID with actual user ID)
-- SELECT get_user_role('USER_ID');

-- Test 5: Check if user has specific role
-- (Replace USER_ID with actual user ID)
-- SELECT has_role('USER_ID', 'admin');
-- SELECT has_role('USER_ID', 'judge');
-- SELECT has_role('USER_ID', 'user');

-- =====================================================
-- ACCESS CONTROL TEST SCENARIOS
-- =====================================================

-- Scenario 1: Regular User trying to like a project
-- Expected: SUCCESS if authenticated
-- Expected: FAIL if not authenticated

-- Scenario 2: Regular User trying to delete a like
-- Expected: SUCCESS if it's their own like
-- Expected: FAIL if it's someone else's like

-- Scenario 3: Regular User trying to edit someone else's project
-- Expected: FAIL (RLS policy blocks this)

-- Scenario 4: Admin trying to edit any project
-- Expected: SUCCESS (RLS policy allows this)

-- Scenario 5: Judge trying to submit feedback
-- Expected: SUCCESS (RLS policy allows this)

-- Scenario 6: Regular User trying to submit feedback
-- Expected: FAIL (RLS policy blocks this)

-- =====================================================
-- VERIFICATION SUMMARY
-- =====================================================

-- If all checks pass, you should see:
-- ✅ 20+ RLS policies across all tables
-- ✅ RLS enabled on 9+ tables
-- ✅ 5 security functions created
-- ✅ app_role enum with 3 values
-- ✅ 2 storage buckets
-- ✅ Multiple storage policies
-- ✅ Proper table structures
-- ✅ UNIQUE constraints in place
-- ✅ Foreign key relationships established

-- Your database is ready! 🎉

-- Next steps:
-- 1. Test the application with different user roles
-- 2. Verify likes/views work correctly
-- 3. Check admin panel access
-- 4. Test judge feedback functionality

