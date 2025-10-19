# 🚨 URGENT: Apply Database Migrations

## The Issue
You're getting 404 errors because the `project_likes` table and functions don't exist in your Supabase database yet.

## Fix It Now (2 minutes)

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard

### Step 2: Select Your Project
Look for project ID: `vfkdyrypekweyqhfqkko`

### Step 3: Open SQL Editor
- Click **"SQL Editor"** in the left sidebar
- Click **"New Query"**

### Step 4: Copy the Migration SQL
1. Open this file: `supabase/migrations/APPLY_ALL_MIGRATIONS.sql`
2. Copy **ALL** content (Cmd+A, then Cmd+C)

### Step 5: Run the Migration
1. Paste into the SQL Editor
2. Click **"Run"** (or press Cmd+Enter)
3. Wait 5-10 seconds for completion

### Step 6: Verify Success
Navigate to **"Table Editor"** and verify these tables exist:
- ✅ `projects`
- ✅ `project_likes` ← NEW
- ✅ `project_views` ← NEW
- ✅ `profiles`
- ✅ `user_roles`
- ✅ `judge_feedback`
- ✅ `updates`
- ✅ `discussions`
- ✅ `registrations`

## After Migration
Refresh your app at http://localhost:8084 - the 404 errors will be gone!

## What This Fixes
- ✅ Like/Unlike functionality
- ✅ View tracking
- ✅ Edit Project button
- ✅ Project interactions

---

**Note:** The migration is safe to run multiple times (uses `IF NOT EXISTS`).
