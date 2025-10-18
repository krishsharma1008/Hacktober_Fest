# 🚀 Apply Migrations NOW - Step by Step

## Why Manual Application is Required

The MCP Supabase server and programmatic methods lack the necessary DDL (Data Definition Language) permissions to create tables, functions, and policies. The **ONLY** reliable way to apply these migrations is through the Supabase Dashboard SQL Editor, which has full administrative access.

## ⏱️ Time Required: 5 Minutes

---

## 🎯 STEP-BY-STEP INSTRUCTIONS

### Step 1: Open Supabase Dashboard
1. Go to: **https://supabase.com/dashboard**
2. Sign in if needed
3. Click on your project: **tujfuymkzuzvuacnqjos**

### Step 2: Open SQL Editor
1. In the left sidebar, click **"SQL Editor"**
2. Click the **"New Query"** button (top right)
3. You'll see an empty SQL editor

### Step 3: Copy Migration File
1. On your computer, open this file:
   ```
   Hacktober_fest/supabase/migrations/APPLY_ALL_MIGRATIONS.sql
   ```

2. Select **ALL** content (Cmd+A or Ctrl+A)
3. Copy it (Cmd+C or Ctrl+C)

### Step 4: Paste and Run
1. Go back to the Supabase SQL Editor
2. Paste the copied SQL (Cmd+V or Ctrl+V)
3. Click the **"Run"** button (or press Cmd+Enter / Ctrl+Enter)
4. Wait 5-10 seconds for completion

### Step 5: Verify Success
You should see: **"Success. No rows returned"**

If you see errors, read them carefully. Most common issues:
- **"already exists"** → This is OK! It means some parts were already created
- **Permission denied** → Make sure you're the project owner
- **Syntax error** → Check you copied the entire file

### Step 6: Verify Tables Created
1. Click **"Table Editor"** in the left sidebar
2. You should see these tables:
   - ✅ profiles
   - ✅ user_roles
   - ✅ projects
   - ✅ **project_likes** ← NEW
   - ✅ **project_views** ← NEW
   - ✅ judge_feedback
   - ✅ updates
   - ✅ discussions
   - ✅ registrations

### Step 7: Test Your App
1. Return to your terminal
2. Run: `npm run dev`
3. Open the app in your browser
4. Test likes and views functionality!

---

## 🔐 ACCESS CONTROL VERIFICATION

Your migration includes comprehensive role-based access control for:

### 👤 Regular Users (Participants)
**CAN:**
- ✅ View all projects
- ✅ Like/unlike projects (authenticated only)
- ✅ View project details (records view count)
- ✅ Create and submit projects
- ✅ Edit their own projects
- ✅ Update their own profile
- ✅ Create discussions
- ✅ Register for hackathon

**CANNOT:**
- ❌ Edit other users' projects
- ❌ Delete any projects
- ❌ Give judge feedback
- ❌ Create announcements/updates
- ❌ Manage user roles
- ❌ Access admin features

### 👨‍⚖️ Judges
**CAN (Everything users can, PLUS):**
- ✅ Create judge feedback on projects
- ✅ Score projects (0-10)
- ✅ Add comments and notes to projects
- ✅ Update their own feedback

**CANNOT:**
- ❌ Delete projects
- ❌ Manage user roles
- ❌ Create announcements
- ❌ Access admin features

### 👑 Admins
**CAN (Everything):**
- ✅ All user permissions
- ✅ All judge permissions
- ✅ Edit ANY project
- ✅ Delete ANY project
- ✅ Create announcements/updates
- ✅ Manage all discussions
- ✅ Assign user roles
- ✅ Full database access

---

## 🧪 TEST ACCESS CONTROLS

After migration, test these scenarios:

### Test 1: Likes (Regular Users)
1. **Sign in** as regular user
2. Click ❤️ on a project
3. ✅ Should work - heart turns red
4. **Sign out**
5. Click ❤️ on a project
6. ✅ Should show: "Please sign in to like projects"

### Test 2: Project Editing (Users vs Admin)
1. **Sign in** as User A
2. Create a project
3. ✅ Can edit your own project
4. Try to edit User B's project
5. ✅ Should fail (no edit button or permission denied)
6. **Sign in** as Admin
7. ✅ Can edit ANY project

### Test 3: Judge Feedback
1. **Sign in** as regular user
2. Try to submit judge feedback
3. ✅ Should be blocked (no UI access)
4. **Sign in** as Judge
5. ✅ Can submit feedback and scores

### Test 4: Admin Features
1. **Sign in** as regular user
2. Check navigation/features
3. ✅ No admin options visible
4. **Sign in** as Admin
5. ✅ Admin dashboard accessible
6. ✅ Can create announcements

---

## 🔒 Security Features Included

Your migration includes:

### Row Level Security (RLS)
- ✅ Enabled on ALL tables
- ✅ Policies prevent unauthorized access
- ✅ Users can only modify their own data
- ✅ Admins have override permissions

### Database Functions
- ✅ `has_role()` - Check if user has specific role
- ✅ `get_user_role()` - Get user's highest role
- ✅ `toggle_project_like()` - Secure like/unlike
- ✅ `record_project_view()` - Secure view tracking
- ✅ All functions use SECURITY DEFINER

### Automatic User Setup
- ✅ New users auto-get 'user' role
- ✅ Profile created on signup
- ✅ Trigger handles auth.users events

---

## ❓ Troubleshooting

### "Permission Denied" Error
**Solution:** You need to be the project owner/admin
- Check you're signed into the correct Supabase account
- Verify project ownership in Settings

### "Table Already Exists" Messages
**Status:** ✅ This is FINE!
- Script is idempotent (safe to run multiple times)
- Existing tables won't be affected
- New tables will still be created

### Migration Takes Forever
**Action:** 
- Wait at least 30 seconds
- Check for popup blockers
- Refresh page and try again
- Check Supabase status page

### Tables Not Showing Up
**Check:**
1. Scroll down in Table Editor
2. Refresh the page (Cmd+R / Ctrl+R)
3. Check you're in the correct project
4. Verify "Success" message appeared

---

## 📞 If You Need Help

1. **Check the console** - Errors provide clues
2. **Read error messages** - Usually self-explanatory
3. **Supabase Docs** - https://supabase.com/docs
4. **Verify project** - Make sure you're in tujfuymkzuzvuacnqjos

---

## ✅ Success Checklist

After running migration:

- [ ] Saw "Success" message in SQL Editor
- [ ] 9 tables visible in Table Editor
- [ ] `project_likes` table exists
- [ ] `project_views` table exists
- [ ] `npm run dev` starts without errors
- [ ] Can click ❤️ on projects
- [ ] Heart turns red when liked
- [ ] View count increases on project open
- [ ] Toast notifications appear

---

## 🎉 You're Done!

Once you see "Success" in the SQL Editor and all tables in Table Editor, your database is ready!

**Next:** Start your app and test the features:
```bash
npm run dev
```

**Then:** Check the SETUP_GUIDE.md for feature testing instructions.

---

**Need the migration file?**
`supabase/migrations/APPLY_ALL_MIGRATIONS.sql`

**Questions about access control?**
See the RLS policies section in `dev_documentation.txt`

**Ready to deploy?**
All access controls are production-ready! 🚀

