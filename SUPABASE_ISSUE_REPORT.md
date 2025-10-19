# 🚨 Supabase Schema Cache Issue - Report for Support

## Problem Summary
After creating tables `project_likes` and `project_views` via SQL Editor and restarting the API multiple times, PostgREST still returns 404 errors saying the tables are not in the schema cache.

---

## Environment
- **Project ID**: `vfkdyrypekweyqhfqkko`
- **Project URL**: `https://vfkdyrypekweyqhfqkko.supabase.co`
- **Region**: (check your dashboard)
- **Plan**: (Free/Pro/etc)

---

## What We Did

### 1. Created Tables via SQL Editor
```sql
CREATE TABLE public.project_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE TABLE public.project_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  user_id UUID,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Enabled RLS and Created Policies
- Enabled RLS on both tables
- Created SELECT policies for all users
- Created INSERT/DELETE policies for authenticated users
- Granted proper permissions to `anon` and `authenticated` roles

### 3. Created Functions
- `toggle_project_like(UUID)` - SECURITY DEFINER
- `record_project_view(UUID, TEXT)` - SECURITY DEFINER
- Granted EXECUTE permissions

### 4. Restarted API Multiple Times
- Used Dashboard → Settings → API → "Restart API"
- Waited 2+ minutes after each restart
- Sent `NOTIFY pgrst, 'reload schema'` via SQL
- Tried at least 5 times

---

## Current State

### Tables Exist in Database
Confirmed via SQL Editor that tables exist with correct schema.

### Tables NOT in PostgREST Schema
API endpoint returns:
```json
{
  "code": "PGRST205",
  "message": "Could not find the table 'public.project_likes' in the schema cache",
  "hint": "Perhaps you meant the table 'public.projects'"
}
```

### Other Tables Work Fine
These tables are accessible via API:
- `projects`
- `profiles`
- `discussions`
- `updates`
- `judge_feedback`
- `user_roles`
- `registrations`

---

## API Schema Check
```bash
curl https://vfkdyrypekweyqhfqkko.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY"
```

Returns schema with 7 tables, but `project_likes` and `project_views` are missing.

---

## Questions for Supabase Support

1. **Why won't PostgREST reload the schema after multiple API restarts?**

2. **Is there a way to manually force PostgREST to reload the schema?**

3. **Could there be a PostgREST configuration issue preventing new tables from being discovered?**

4. **Is there a PostgREST log we can check to see why it's not seeing these tables?**

5. **Should we try recreating the tables with different names?**

---

## Workaround Applied
Temporarily disabled like/view functionality in the frontend to prevent 404 errors while waiting for resolution.

---

## Request
Please help us get `project_likes` and `project_views` tables visible in the PostgREST schema cache so our API endpoints work.

---

## Contact
- GitHub: (your github)
- Email: (your email)
- Project: https://github.com/YOUR_USERNAME/Hacktober_fest

---

**Thank you for your help!** 🙏

