-- =====================================================
-- MAKE shreyes.desai@zapcg.com AN ADMIN
-- =====================================================
-- This script finds the user by email and assigns admin role
-- Run this in Supabase SQL Editor
-- =====================================================

-- STEP 1: Find the user by email and get their user_id
DO $$
DECLARE
    user_uuid UUID;
    user_email TEXT := 'shreyes.desai@zapcg.com';
BEGIN
    -- Get the user UUID from auth.users table
    SELECT id INTO user_uuid
    FROM auth.users
    WHERE email = user_email;
    
    -- Check if user exists
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- STEP 2: Insert or update the admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_uuid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- STEP 3: Display the result
    RAISE NOTICE 'Successfully assigned admin role to: % (ID: %)', user_email, user_uuid;
    
END $$;

-- STEP 4: Verify the admin role was assigned
SELECT 
    u.email,
    ur.role,
    ur.created_at as role_assigned_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'shreyes.desai@zapcg.com'
AND ur.role = 'admin';

-- If the above query returns a row, the admin role is successfully assigned!
-- User: shreyes.desai@zapcg.com
-- Role: admin


