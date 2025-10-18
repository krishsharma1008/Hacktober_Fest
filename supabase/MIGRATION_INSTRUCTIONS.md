# Supabase Migration Instructions

## Apply Migrations to New Supabase Project

Since the MCP Supabase server has DDL permission limitations, please apply the migrations manually through the Supabase Dashboard.

### Steps to Apply Migrations:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `tujfuymkzuzvuacnqjos`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the Migration SQL**
   - Open the file: `supabase/migrations/APPLY_ALL_MIGRATIONS.sql`
   - Copy all content from the file
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" button (or press Cmd/Ctrl + Enter)
   - Wait for completion (should take ~5-10 seconds)
   - Verify success message appears

5. **Verify Tables Created**
   - Navigate to "Table Editor" in left sidebar
   - You should see these tables:
     - `profiles`
     - `user_roles`
     - `projects`
     - `project_likes` (NEW)
     - `project_views` (NEW)
     - `judge_feedback`
     - `updates`
     - `discussions`
     - `registrations`

### What This Migration Does:

1. **Core Schema** - Creates all base tables (users, projects, feedback, etc.)
2. **Registrations** - Team registration tracking
3. **Likes & Views** - New tables for interactive likes and view tracking
4. **RLS Policies** - Row Level Security for all tables
5. **Functions** - `toggle_project_like()` and `record_project_view()`
6. **Storage** - Project files and images buckets

### After Migration:

Once the migration is complete, the frontend application will automatically connect to the new database using the updated `.env` credentials.

### Troubleshooting:

If you encounter errors:
1. Check if tables already exist (rerun is safe - uses `IF NOT EXISTS`)
2. Verify you're connected to the correct project
3. Ensure you have admin access to the Supabase project
4. Check for any syntax errors in the console

### Migration Files:

Individual migration files are also available in the `migrations/` folder:
- `20251017085410_ba2e30df-f362-4dce-95c0-2cf3ea946a14.sql` - Core schema
- `20251017091255_4bf9436e-cb29-47b5-aa02-27c1ee7edc89.sql` - Registrations
- `20251018000000_add_likes_views_tracking.sql` - Likes/Views (NEW)

The `APPLY_ALL_MIGRATIONS.sql` file consolidates all of these into a single file for convenience.

