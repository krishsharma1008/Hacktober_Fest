# Apply Migrations and Test - Quick Guide

## You have 2 windows open:

1. **APPLY_ALL_MIGRATIONS.sql** - The migration file
2. **Supabase SQL Editor** - Where you'll run it

## Steps (2 minutes):

### 1. Copy Migration
In the `APPLY_ALL_MIGRATIONS.sql` file:
- Press **Cmd+A** (select all)
- Press **Cmd+C** (copy)

### 2. Paste and Run
In the Supabase SQL Editor:
- Press **Cmd+V** (paste)
- Click **"Run"** button (or press Cmd+Enter)
- Wait 5-10 seconds

### 3. Verify Success
You should see: **"Success. No rows returned"**

If you see errors about "already exists" - that's OK! It means some parts were already there.

### 4. Run Automated Tests
Come back to this terminal and run:

```bash
npm run test:db
```

This will verify:
- ✅ All 9 tables exist
- ✅ project_likes and project_views are created
- ✅ Row Level Security is working
- ✅ Access controls are enforced

### 5. Start the App
If tests pass:

```bash
npm run dev
```

### 6. Test in Browser

**Test Likes:**
1. Sign in
2. Go to Project Gallery
3. Click ❤️ heart on any project
4. Heart should turn red and fill
5. Like count increases
6. Click again to unlike

**Test Views:**
1. Click "View Project" on any project card
2. Modal opens
3. View count increases by 1
4. Close and reopen same project
5. View count stays same (unique tracking works!)

**Test Without Login:**
1. Sign out
2. Try to click ❤️
3. Should see toast: "Please sign in to like projects"
4. Views still work ✓

## Expected Test Output

```
🧪 Testing Database Setup and Access Controls

📋 Test 1: Checking if tables exist...
   ✅ profiles
   ✅ user_roles
   ✅ projects
   ✅ project_likes
   ✅ project_views
   ✅ judge_feedback
   ✅ updates
   ✅ discussions
   ✅ registrations

🔒 Test 2: Verifying Row Level Security...
   ✅ Can read public project data (expected)

⚙️  Test 3: Checking database functions...
   ℹ️  Functions (toggle_project_like, record_project_view)

👀 Test 4: Testing likes and views tables...
   ✅ project_likes table accessible
   ✅ project_views table accessible

🔐 Test 5: Testing unauthenticated like (should fail)...
   ✅ Correctly blocked unauthenticated like

==================================================
📊 TEST SUMMARY
==================================================
✅ Passed: 12
❌ Failed: 0
📈 Total: 12

🎉 All tests passed! Database is ready!
```

## If Tests Fail

1. **"Table does not exist"** → Migration not applied
   - Go back to Supabase SQL Editor
   - Make sure you ran the migration
   
2. **"Connection error"** → Check internet
   - Verify you're online
   - Try again

3. **"Permission denied"** → Wrong project
   - Check .env has correct project ID
   - Verify: tujfuymkzuzvuacnqjos

## Access Control Testing

After the app starts, test these scenarios:

### As Regular User:
- ✅ Can like/unlike projects
- ✅ Can view projects
- ✅ Can create projects
- ❌ Cannot edit other's projects
- ❌ Cannot delete projects
- ❌ Cannot submit judge feedback

### As Judge (after admin assigns role):
- ✅ Everything users can do, PLUS
- ✅ Can submit feedback and scores
- ❌ Cannot delete projects

### As Admin (after admin assigns role):
- ✅ Can do EVERYTHING
- ✅ Can edit any project
- ✅ Can delete projects
- ✅ Can manage user roles

## Quick Commands

```bash
# Test database setup
npm run test:db

# Start dev server
npm run dev

# Build for production
npm run build
```

## Help

If you get stuck:
- Check `RBAC_ACCESS_CONTROL.md` for access control details
- Check `SETUP_GUIDE.md` for feature testing
- Check browser console for errors
- Check `dev_documentation.txt` for technical details

---

**Ready?** Apply the migration in Supabase, then run `npm run test:db` here!

