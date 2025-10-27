# Make shreyes.desaiyasai@zapcg.com an Admin

## Quick Instructions

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your Hacktoberfest project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `MAKE_ADMIN_USER.sql`
6. Click **Run** (or press Ctrl+Enter)

## What This Script Does

- Finds the user with email `shreyes.desai@zapcg.com`
- Assigns them the `admin` role in the `user_roles` table
- Verifies that the admin role was successfully assigned

## Verification

After running the script, you should see:
- A success message in the Supabase console
- A query result showing:
  - Email: shreyes.desai@zapcg.com
  - Role: admin
  - Role assigned at: [timestamp]

## What Admin Access Gives

- Full access to Admin Dashboard
- Can edit/delete any project
- Can manage user roles (assign admin, judge, user)
- Can create/edit/delete announcements
- Can moderate discussions
- Can manage registrations
- All system administrative privileges

## Troubleshooting

**If you get "User not found" error:**
- The user needs to sign up for the application first
- Go to your app and have shreyes.desai@zapcg.com register/login
- Then run this script again

**If admin role doesn't appear:**
- Sign out and sign back in to refresh the user session
- Check that you're running the script in the correct Supabase project

