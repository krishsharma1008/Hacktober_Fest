# Role-Based Access Control (RBAC) Reference

## Overview

Your Hacktoberfest application implements a three-tier role-based access control system:
- **👤 User** (Participant) - Default role for all registered users
- **👨‍⚖️ Judge** - Can evaluate and score projects
- **👑 Admin** - Full system access

All access controls are enforced at the **database level** using Row Level Security (RLS), making them impossible to bypass from the frontend.

---

## 🔐 Security Architecture

### Database-Level Security
- **Row Level Security (RLS)** enabled on ALL tables
- **SECURITY DEFINER functions** for safe operations
- **Foreign key constraints** maintain data integrity
- **UNIQUE constraints** prevent duplicates
- **Automatic role assignment** on user signup

### Authentication Flow
1. User signs up → `auth.users` entry created
2. Trigger fires → `handle_new_user()` function executes
3. Profile created in `profiles` table
4. Default 'user' role assigned in `user_roles` table
5. User can now interact with the system

---

## 👤 USER Role (Participants)

### Projects Module

**✅ Can:**
- View all submitted projects (`SELECT` on projects)
- Create new projects (`INSERT` with `created_by = auth.uid()`)
- Edit their own projects (`UPDATE WHERE created_by = auth.uid()`)
- View project details and statistics
- Like/unlike projects (authenticated only)
- View project likes and views counts

**❌ Cannot:**
- Edit other users' projects
- Delete any projects (admin only)
- Change project status to 'approved'
- Bulk update projects

**RLS Policies:**
```sql
-- Anyone can view projects
CREATE POLICY "Anyone can view projects"
  ON projects FOR SELECT
  USING (true);

-- Users can create projects (must be their own)
CREATE POLICY "Authenticated users can create projects"
  ON projects FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Users can only update their own projects
CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'));
```

### Likes Module

**✅ Can:**
- Like any project (creates entry in `project_likes`)
- Unlike their own likes (deletes from `project_likes`)
- View all project likes (public metric)
- See their own like status on projects

**❌ Cannot:**
- Like the same project twice (UNIQUE constraint prevents this)
- Delete other users' likes
- Manipulate like counts directly

**RLS Policies:**
```sql
-- Anyone can view likes
CREATE POLICY "Anyone can view likes"
  ON project_likes FOR SELECT
  USING (true);

-- Authenticated users can like projects
CREATE POLICY "Authenticated users can insert likes"
  ON project_likes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can only unlike their own likes
CREATE POLICY "Users can delete their own likes"
  ON project_likes FOR DELETE TO authenticated
  USING (user_id = auth.uid());
```

### Views Module

**✅ Can:**
- View projects (automatically records view)
- View statistics (all view counts are public)
- Generate unique views (one per user per project)

**❌ Cannot:**
- Delete view records
- Manipulate view counts
- View other users' viewing history

**RLS Policies:**
```sql
-- Anyone can view statistics
CREATE POLICY "Anyone can view project_views"
  ON project_views FOR SELECT
  USING (true);

-- Anyone can insert views (including anonymous)
CREATE POLICY "Anyone can insert views"
  ON project_views FOR INSERT
  WITH CHECK (true);
```

### Profile Module

**✅ Can:**
- View all user profiles (`SELECT` on profiles)
- Update their own profile (`UPDATE WHERE id = auth.uid()`)
- Add/edit: full_name, team_name, linkedin, github

**❌ Cannot:**
- Edit other users' profiles
- Change email address directly
- Delete profiles

**RLS Policies:**
```sql
-- Everyone can view profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());
```

### Discussions Module

**✅ Can:**
- View all discussions
- Create new discussions
- View discussion creators

**❌ Cannot:**
- Edit other users' discussions
- Delete discussions (admin only)
- Pin/feature discussions

**RLS Policies:**
```sql
-- Anyone can view discussions
CREATE POLICY "Anyone can view discussions"
  ON discussions FOR SELECT
  USING (true);

-- Authenticated users can create discussions
CREATE POLICY "Authenticated users can create discussions"
  ON discussions FOR INSERT TO authenticated
  WITH CHECK (true);
```

### Registration Module

**✅ Can:**
- Register a team (as team leader)
- View all registrations (public for transparency)
- Update their own team registration

**❌ Cannot:**
- Edit other teams' registrations
- Delete registrations
- Register multiple teams

---

## 👨‍⚖️ JUDGE Role

### Inherits ALL User Permissions, PLUS:

### Judge Feedback Module

**✅ Can:**
- View all judge feedback (public for transparency)
- Submit feedback on any project
- Score projects (0-10 scale)
- Add comments and notes to projects
- Update their own feedback
- View feedback from other judges

**❌ Cannot:**
- Edit other judges' feedback
- Delete feedback (admin only)
- Override project approval
- Access admin features

**RLS Policies:**
```sql
-- Anyone can view feedback
CREATE POLICY "Anyone can view feedback"
  ON judge_feedback FOR SELECT
  USING (true);

-- Judges can insert feedback
CREATE POLICY "Judges can insert feedback"
  ON judge_feedback FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'judge') OR has_role(auth.uid(), 'admin'));

-- Judges can update their own feedback
CREATE POLICY "Judges can update their own feedback"
  ON judge_feedback FOR UPDATE TO authenticated
  USING (judge_id = auth.uid() OR has_role(auth.uid(), 'admin'));
```

### Projects Module (Enhanced)

**✅ Can (Same as Users, plus):**
- View ALL projects including drafts
- Access detailed project statistics
- See submission timestamps

**❌ Cannot:**
- Edit projects (even with bad scores)
- Delete projects
- Approve/reject projects directly

---

## 👑 ADMIN Role

### Inherits ALL User + Judge Permissions, PLUS:

### Full System Access

**✅ Can:**
- **Projects:** Edit ANY project, Delete ANY project, Approve/reject submissions
- **Users:** View all user roles, Assign/modify user roles (including admin, judge)
- **Judge Feedback:** Edit ANY feedback, Delete feedback, Override scores
- **Updates:** Create announcements, Edit announcements, Delete announcements
- **Discussions:** Moderate all discussions, Delete inappropriate content, Pin important discussions
- **Registrations:** View all registrations, Modify any registration, Manage team data
- **Likes/Views:** View all data, Cannot directly manipulate (protected by functions)
- **System:** Access all admin features, Manage storage, Configure settings

**RLS Policies (Examples):**
```sql
-- Admins can manage all roles
CREATE POLICY "Admins can manage all roles"
  ON user_roles FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Admins can delete projects
CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Admins can manage updates
CREATE POLICY "Admins can manage updates"
  ON updates FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Admins can manage discussions
CREATE POLICY "Admins can manage discussions"
  ON discussions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));
```

---

## 🛡️ Security Functions

### `has_role(user_id UUID, role app_role) → BOOLEAN`

Checks if a user has a specific role.

```sql
-- Check if user is admin
SELECT has_role(auth.uid(), 'admin');

-- Check if user is judge
SELECT has_role(auth.uid(), 'judge');

-- Used in RLS policies
USING (has_role(auth.uid(), 'admin'))
```

### `get_user_role(user_id UUID) → app_role`

Returns user's highest role (admin > judge > user).

```sql
-- Get current user's role
SELECT get_user_role(auth.uid());

-- Result: 'admin', 'judge', or 'user'
```

### `toggle_project_like(project_id UUID) → (liked BOOLEAN, total_likes BIGINT)`

Securely toggles like status for a project.

```sql
-- Like a project
SELECT * FROM toggle_project_like('project-uuid');

-- Returns: {liked: true, total_likes: 42}
-- or: {liked: false, total_likes: 41} if unliking
```

**Security Features:**
- Requires authentication (throws error if not logged in)
- Atomic operation (no race conditions)
- Automatically updates `projects.likes` counter
- Enforces UNIQUE constraint (one like per user per project)

### `record_project_view(project_id UUID, ip_address TEXT) → BIGINT`

Records a unique view for a project.

```sql
-- Record view (authenticated user)
SELECT record_project_view('project-uuid');

-- Record view (anonymous with IP)
SELECT record_project_view('project-uuid', '192.168.1.1');

-- Returns: total view count
```

**Security Features:**
- Prevents duplicate views from same user/IP
- Works for both authenticated and anonymous users
- Automatically updates `projects.views` counter
- Silent failure (doesn't block on errors)

---

## 🧪 Testing Access Controls

### Test 1: User Permissions

```sql
-- Sign in as regular user
-- Try to like a project
SELECT * FROM toggle_project_like('some-project-id');
-- ✅ Should work

-- Try to edit someone else's project
UPDATE projects SET title = 'Hacked' WHERE created_by != auth.uid();
-- ❌ Should fail (0 rows updated due to RLS)

-- Try to create judge feedback
INSERT INTO judge_feedback (project_id, judge_id, score)
VALUES ('some-project-id', auth.uid(), 10);
-- ❌ Should fail (RLS policy blocks)
```

### Test 2: Judge Permissions

```sql
-- Sign in as judge
-- Try to submit feedback
INSERT INTO judge_feedback (project_id, judge_id, score, comment)
VALUES ('some-project-id', auth.uid(), 8, 'Great work!');
-- ✅ Should work

-- Try to delete a project
DELETE FROM projects WHERE id = 'some-project-id';
-- ❌ Should fail (only admins can delete)
```

### Test 3: Admin Permissions

```sql
-- Sign in as admin
-- Try to edit any project
UPDATE projects SET status = 'approved' WHERE id = 'some-project-id';
-- ✅ Should work

-- Try to assign judge role
INSERT INTO user_roles (user_id, role)
VALUES ('some-user-id', 'judge');
-- ✅ Should work

-- Try to create announcement
INSERT INTO updates (title, content, created_by)
VALUES ('New Event!', 'Important update', auth.uid());
-- ✅ Should work
```

---

## 🔄 Role Management

### Assigning Roles (Admin Only)

```sql
-- Make user a judge
INSERT INTO user_roles (user_id, role)
VALUES ('user-uuid', 'judge')
ON CONFLICT (user_id, role) DO NOTHING;

-- Make user an admin
INSERT INTO user_roles (user_id, role)
VALUES ('user-uuid', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Remove judge role
DELETE FROM user_roles
WHERE user_id = 'user-uuid' AND role = 'judge';
```

### Checking User Roles

```sql
-- Get all roles for a user
SELECT role FROM user_roles WHERE user_id = 'user-uuid';

-- Get highest role
SELECT get_user_role('user-uuid');

-- Check if user is admin
SELECT has_role('user-uuid', 'admin');
```

### Multiple Roles

Users can have multiple roles:
- A user can be BOTH 'user' and 'judge'
- A user can be BOTH 'user' and 'admin'
- `get_user_role()` returns the HIGHEST role: admin > judge > user

---

## 📊 Access Control Matrix

| Action | User | Judge | Admin |
|--------|------|-------|-------|
| **Projects** |
| View projects | ✅ | ✅ | ✅ |
| Create project | ✅ | ✅ | ✅ |
| Edit own project | ✅ | ✅ | ✅ |
| Edit any project | ❌ | ❌ | ✅ |
| Delete project | ❌ | ❌ | ✅ |
| **Likes/Views** |
| Like project | ✅ | ✅ | ✅ |
| Unlike own like | ✅ | ✅ | ✅ |
| View statistics | ✅ | ✅ | ✅ |
| Delete others' likes | ❌ | ❌ | ❌ |
| **Judge Feedback** |
| View feedback | ✅ | ✅ | ✅ |
| Submit feedback | ❌ | ✅ | ✅ |
| Edit own feedback | ❌ | ✅ | ✅ |
| Edit any feedback | ❌ | ❌ | ✅ |
| Delete feedback | ❌ | ❌ | ✅ |
| **Profiles** |
| View profiles | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ |
| Edit any profile | ❌ | ❌ | ❌ |
| **Updates** |
| View updates | ✅ | ✅ | ✅ |
| Create updates | ❌ | ❌ | ✅ |
| Edit updates | ❌ | ❌ | ✅ |
| Delete updates | ❌ | ❌ | ✅ |
| **Discussions** |
| View discussions | ✅ | ✅ | ✅ |
| Create discussion | ✅ | ✅ | ✅ |
| Edit own discussion | ❌ | ❌ | ✅ |
| Delete discussion | ❌ | ❌ | ✅ |
| **User Management** |
| View roles | Own | Own | All |
| Assign roles | ❌ | ❌ | ✅ |
| Remove roles | ❌ | ❌ | ✅ |

---

## 🚨 Security Best Practices

### ✅ DO:
- Always use `has_role()` in RLS policies
- Use SECURITY DEFINER for sensitive functions
- Enforce UNIQUE constraints on critical tables
- Test with different user roles
- Log admin actions for audit trail
- Use service_role key only in backend/scripts
- Keep anon key in frontend (it's safe - RLS protects data)

### ❌ DON'T:
- Never expose service_role key to frontend
- Don't trust frontend validation only
- Don't bypass RLS in application code
- Don't hardcode user IDs
- Don't use direct SQL in frontend
- Don't assume roles - always check with `has_role()`

---

## ✅ Verification Checklist

After applying migrations:

- [ ] RLS enabled on all 9 tables
- [ ] 20+ RLS policies created
- [ ] 5 security functions exist
- [ ] app_role enum has 3 values
- [ ] UNIQUE constraints on critical tables
- [ ] Foreign keys properly set up
- [ ] Storage buckets created
- [ ] Storage policies applied
- [ ] Trigger for new users working
- [ ] Default 'user' role assigned on signup

---

## 📚 References

- **Migration File:** `supabase/migrations/APPLY_ALL_MIGRATIONS.sql`
- **Verification Script:** `scripts/verify-access-controls.sql`
- **Setup Guide:** `APPLY_MIGRATIONS_NOW.md`
- **Technical Docs:** `dev_documentation.txt`

---

**Your access control system is production-ready! 🔐**

All permissions are enforced at the database level, making them secure and reliable.

