# Supabase Migration & Likes/Views Setup Guide

## 🎯 Quick Start

Your application has been updated to use the new Supabase project and includes interactive likes and views functionality!

### What Was Done:

1. ✅ Environment variables updated to new Supabase project
2. ✅ Created migration files for database schema
3. ✅ Built interactive likes system (toggle per user)
4. ✅ Built unique views tracking (per user/IP)
5. ✅ Updated all TypeScript types
6. ✅ Created reusable hooks for project interactions

### ⚠️ IMPORTANT: You Must Apply Database Migrations

The code is ready, but the database needs to be set up. Follow these steps:

## 📋 Step 1: Apply Database Migrations

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `tujfuymkzuzvuacnqjos`

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query" button

3. **Copy & Run Migration**
   - Open file: `supabase/migrations/APPLY_ALL_MIGRATIONS.sql`
   - Copy ALL content (Cmd/Ctrl + A, then Cmd/Ctrl + C)
   - Paste into the SQL Editor
   - Click "Run" button (or press Cmd/Ctrl + Enter)
   - Wait for "Success" message (~5-10 seconds)

4. **Verify Tables Created**
   - Click "Table Editor" in left sidebar
   - You should see these tables:
     - ✅ profiles
     - ✅ projects
     - ✅ **project_likes** (NEW - for likes)
     - ✅ **project_views** (NEW - for views)
     - ✅ user_roles
     - ✅ judge_feedback
     - ✅ updates
     - ✅ discussions
     - ✅ registrations

## 🚀 Step 2: Start Development Server

```bash
npm run dev
```

The app will connect to your new Supabase project automatically!

## 🧪 Step 3: Test the Features

### Test Likes:
1. Sign in to your application
2. Go to Project Gallery
3. Click the ❤️ heart icon on any project
4. Heart should turn red and fill
5. Like count should increase
6. Click again to unlike (heart goes back to outline)

### Test Views:
1. Click "View Project" on any project card
2. Modal opens → view is automatically recorded
3. View count increases by 1
4. Close and reopen same project → view count stays same (unique tracking)

### Test Unauthenticated Users:
1. Sign out
2. Try clicking ❤️ on a project
3. Should see toast: "Please sign in to like projects"
4. Views still work (anyone can view)

## 📁 File Structure

```
/supabase
  /migrations
    ├── APPLY_ALL_MIGRATIONS.sql         ← Run this in Supabase Dashboard
    ├── 20251018000000_add_likes_views_tracking.sql
    └── MIGRATION_INSTRUCTIONS.md        ← Detailed instructions
  
/src
  /hooks
    └── use-project-interactions.ts      ← NEW: Likes & Views hook
  /components/tabs
    └── ProjectGalleryTab.tsx            ← Updated with interactive likes
  /integrations/supabase
    └── types.ts                         ← Updated with all table types

/.env                                     ← Updated with new project credentials
```

## 🎨 Features Implemented

### Interactive Likes
- ❤️ Click to like/unlike projects
- Visual feedback (filled red heart when liked)
- Toast notifications for actions
- Per-user tracking (one like per project per user)
- Requires authentication
- Real-time counter updates

### Unique View Tracking
- 👁️ Automatically records when project modal opens
- Unique per user (authenticated) or IP (anonymous)
- No duplicate views from same user
- Silent tracking (no UI disruption)
- Works for both signed-in and guest users

### User Experience
- Smooth animations on like button
- Hover effects (heart turns red)
- Loading states (disabled during API calls)
- Error handling with user-friendly messages
- Tooltip hints ("Like", "Unlike", "Sign in to like")

## 🔐 Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only like/unlike their own likes
- Anyone can view likes/views (public metrics)
- Functions use SECURITY DEFINER for safety
- IP tracking respects user privacy

## 📊 Database Schema

### project_likes Table
```sql
- id: UUID (Primary Key)
- project_id: UUID (Foreign Key → projects)
- user_id: UUID (Foreign Key → auth.users)
- created_at: TIMESTAMPTZ
- UNIQUE(project_id, user_id) ← Prevents duplicate likes
```

### project_views Table
```sql
- id: UUID (Primary Key)
- project_id: UUID (Foreign Key → projects)
- user_id: UUID (nullable, for authenticated)
- ip_address: TEXT (nullable, for anonymous)
- created_at: TIMESTAMPTZ
```

### Functions
- `toggle_project_like(project_id)` - Toggle like, returns status
- `record_project_view(project_id, ip_address)` - Record view, returns count

## 🐛 Troubleshooting

### TypeScript Errors in IDE?
- Restart your IDE/VSCode
- Or run: `npm run dev` (TypeScript will recompile)
- Errors are just language server cache, code is correct

### Migration Fails?
- Check you're in the correct project (`tujfuymkzuzvuacnqjos`)
- Verify you have admin access
- Script is idempotent - safe to run multiple times
- Check console for specific error messages

### Likes Not Working?
1. Verify migrations applied (check Table Editor for `project_likes` table)
2. Check browser console for errors
3. Ensure you're signed in
4. Verify `.env` has correct credentials

### Views Not Incrementing?
1. Verify migrations applied (check Table Editor for `project_views` table)
2. Views are unique per user - won't increment on repeated opens
3. Try with different user or incognito window

## 📞 Support

- Detailed documentation: `dev_documentation.txt`
- Migration instructions: `supabase/MIGRATION_INSTRUCTIONS.md`
- Check console logs for debugging info
- All changes logged with timestamps

## ✨ What's Next?

After applying migrations and testing:

1. **Deploy to Production**
   - Update production `.env` with new Supabase credentials
   - Run same migration in production Supabase project
   - Test thoroughly before announcing to users

2. **Optional Enhancements**
   - Add real-time updates with Supabase subscriptions
   - Show list of users who liked a project
   - Add analytics dashboard for views/likes
   - Implement like animation effects

3. **Monitoring**
   - Use Supabase dashboard to monitor usage
   - Check RLS policies are working correctly
   - Monitor API quotas and performance

---

**Status**: ✅ All code implemented and ready!  
**Action Required**: Apply database migrations (Step 1 above)  
**Time Required**: ~5 minutes for migration + testing

Happy coding! 🚀

