-- ============================================================================
-- CREATE ADMIN USER SCRIPT
-- Email: krishsharma@zapcg.org
-- Date: October 19, 2025
-- ============================================================================

-- STEP 1: First sign up at http://localhost:8081/auth with the email
-- Then come back and run this script to upgrade to admin

-- STEP 2: Update the user role to admin
-- Find the user by email and assign admin role
DO $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Get the user ID from the email
  SELECT id INTO user_uuid
  FROM public.profiles
  WHERE email = 'krishsharma@zapcg.org';

  -- If user exists, update their role to admin
  IF user_uuid IS NOT NULL THEN
    -- Remove existing role if any
    DELETE FROM public.user_roles WHERE user_id = user_uuid;
    
    -- Insert admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_uuid, 'admin');
    
    RAISE NOTICE 'User % upgraded to admin successfully!', user_uuid;
  ELSE
    RAISE NOTICE 'User with email krishsharma@zapcg.org not found. Please sign up first at /auth';
  END IF;
END $$;

-- STEP 3: Verify the admin role
SELECT 
  p.id,
  p.email,
  p.full_name,
  ur.role,
  p.created_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.email = 'krishsharma@zapcg.org';

-- ============================================================================
-- ALTERNATIVE: Manual user creation (if you can't sign up)
-- ============================================================================
-- NOTE: This creates a profile entry but you'll still need to set up
-- authentication through Supabase Dashboard -> Authentication -> Users
-- ============================================================================

/*
-- Uncomment this section if you need to manually create the user

DO $$
DECLARE
  new_user_uuid UUID := gen_random_uuid();
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, created_at)
  VALUES (
    new_user_uuid,
    'krishsharma@zapcg.org',
    'Krish Sharma',
    NOW()
  );
  
  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_uuid, 'admin');
  
  RAISE NOTICE 'Manual profile created with UUID: %', new_user_uuid;
  RAISE NOTICE 'IMPORTANT: You must still create this user in Supabase Dashboard';
  RAISE NOTICE 'Go to: Authentication -> Users -> Invite User';
  RAISE NOTICE 'Use email: krishsharma@zapcg.org';
END $$;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check all admin users
SELECT 
  p.email,
  p.full_name,
  ur.role,
  p.created_at
FROM public.profiles p
JOIN public.user_roles ur ON p.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY p.created_at DESC;

-- Check if the specific user has admin access
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM public.profiles p
      JOIN public.user_roles ur ON p.id = ur.user_id
      WHERE p.email = 'krishsharma@zapcg.org' 
      AND ur.role = 'admin'
    ) THEN 'YES - User has admin access'
    ELSE 'NO - User does not have admin access'
  END AS admin_status;

