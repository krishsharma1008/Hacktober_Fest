# Quick Admin User Setup Guide

## Email: `krishsharma@zapcg.org`

---

## 🚀 **FASTEST METHOD** (Recommended)

### Step 1: Sign Up Through the App
1. Go to: http://localhost:8081/auth
2. Click "Sign Up"
3. Enter:
   - Email: `krishsharma@zapcg.org`
   - Password: (choose any password)
   - Full Name: Krish Sharma
4. Complete the sign up

### Step 2: Run SQL to Make Admin
Open Supabase Dashboard → SQL Editor → Run this:

```sql
-- Upgrade user to admin
DO $$
DECLARE
  user_uuid UUID;
BEGIN
  SELECT id INTO user_uuid FROM public.profiles WHERE email = 'krishsharma@zapcg.org';
  
  IF user_uuid IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = user_uuid;
    INSERT INTO public.user_roles (user_id, role) VALUES (user_uuid, 'admin');
    RAISE NOTICE 'Success! User is now admin';
  END IF;
END $$;
```

### Step 3: Verify
Refresh the page and check that you have access to:
- `/admin-dashboard` route
- Admin-only features

---

## 📋 **ALTERNATIVE: Direct Database Method**

If you can't sign up through the app, create the user directly in Supabase:

### Go to Supabase Dashboard:
1. **Authentication** → **Users** → **Add user**
2. Enter:
   - Email: `krishsharma@zapcg.org`
   - Password: (set a password)
   - ✅ Auto Confirm User

### Then run this SQL:
```sql
DO $$
DECLARE
  user_uuid UUID;
BEGIN
  SELECT id INTO user_uuid FROM auth.users WHERE email = 'krishsharma@zapcg.org';
  
  -- Create profile if doesn't exist
  INSERT INTO public.profiles (id, email, full_name, created_at)
  VALUES (user_uuid, 'krishsharma@zapcg.org', 'Krish Sharma', NOW())
  ON CONFLICT (id) DO NOTHING;
  
  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_uuid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
```

---

## ✅ **Verification**

Run this to check if admin access is working:

```sql
SELECT 
  p.email,
  p.full_name,
  ur.role,
  p.created_at
FROM public.profiles p
JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.email = 'krishsharma@zapcg.org';
```

Expected result:
```
email: krishsharma@zapcg.org
full_name: Krish Sharma
role: admin
```

---

## 🔑 **Admin Access**

Once setup is complete, you'll have access to:

### Routes:
- ✅ `/admin-dashboard` - Full admin dashboard
- ✅ `/judge-dashboard` - Judge features (admin has all access)
- ✅ All user routes

### Permissions:
- ✅ Manage all projects (view, edit, delete)
- ✅ Manage all users
- ✅ View and manage judge feedback
- ✅ Access all discussions
- ✅ Manage teams

---

## 🐛 Troubleshooting

### "User not found" error
→ Make sure you completed Step 1 (sign up) first

### Can't access /admin-dashboard
→ Clear browser cache and cookies
→ Sign out and sign in again
→ Verify admin role is set (run verification SQL)

### Email confirmation required
→ Go to Supabase Dashboard → Authentication → Email Templates
→ Disable email confirmation OR check spam folder for confirmation email

---

## 📝 Notes

- Admin users have ALL permissions across the platform
- The role system uses: `user`, `admin`, `judge`
- Admins can access judge features automatically
- First admin should be created manually, then admins can promote other users

---

**Need help?** Check the database migrations in `/supabase/migrations/` for role system details.

