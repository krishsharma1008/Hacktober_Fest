# Team Management System - User Guide

## Overview

The Hacktoberfest Team Management System allows participants to:
- ✅ Create teams with up to 5 members
- ✅ Invite team members by email
- ✅ Manage roles (owner, admin, member)
- ✅ Submit ONE project per team
- ✅ Allow all team members to edit the team's project

## Quick Start

### Creating a Team

1. Navigate to the homepage
2. Scroll to the "Don't have a team yet?" section
3. Click **"Create Team"** button
4. Fill in:
   - Team Name (required, max 50 chars)
   - Description (optional, max 200 chars)
5. Click **"Create Team"**
6. You are automatically set as the team **owner**

### Adding Team Members

1. Go to **My Projects** page
2. Select your team project
3. In the **Team Management** section:
   - Enter member's email address
   - Select role (Member or Admin)
   - Click **"Add Member"**

**Requirements:**
- Member must have a registered account
- Team cannot exceed 5 members
- Only admins and owners can add members

### Submitting a Team Project

1. Go to **Submit Project** page
2. In the **Team Configuration** section:
   - Select your team from dropdown, OR
   - Click **"New Team"** to create one
   - Or select "Submit as Individual"
3. Fill out project details (team name auto-fills)
4. Click **"Submit Project"**

**Important:**
- Each team can only submit ONE project
- If a team already has a project, you cannot submit another
- All team members can edit the project

### Managing Team Members

**As Owner or Admin:**
- Change member roles (except owner)
- Remove members (except owner)
- View all team member details

**As Member:**
- View team members
- See your role
- Edit team project
- Leave team anytime

## Team Roles

### Owner 👑
- Full control over team
- Can add/remove members
- Can change member roles
- Can delete team
- **Cannot be removed** (must transfer ownership first)
- Automatically assigned to team creator

### Admin 🛡️
- Can add/remove members (except owner)
- Can change member roles (except owner)
- Can edit team project
- Can update team details
- Cannot delete team

### Member 👤
- Can edit team project
- Can view team members
- Can leave team
- Cannot manage other members
- Cannot change team settings

## Rules & Restrictions

### Team Limits
- ✅ Maximum 5 members per team
- ✅ Only 1 project per team
- ✅ Team names must be unique
- ✅ All members can edit the project

### Member Management
- ❌ Cannot remove team owner
- ❌ Cannot exceed max member limit
- ❌ Cannot add member without registered account
- ✅ Members can leave team anytime
- ✅ Owners can soft-delete teams

### Project Submission
- ❌ Cannot submit multiple projects for one team
- ❌ Cannot submit if team already has project
- ✅ Can submit as individual (without team)
- ✅ All team members have edit access
- ✅ Original creator and team members can edit

## Viewing Your Projects

Navigate to **My Projects** page to see:

### Tabs:
1. **All Projects** - Personal + Team projects combined
2. **Personal Projects** - Projects submitted individually
3. **Team Projects** - Projects submitted with teams

### Project Cards Show:
- Team icon vs User icon
- Your role in the team (if team project)
- Team name
- Project status

## Troubleshooting

### "Team already has a project"
- Each team can only submit one project
- If you need to submit another project:
  - Create a new team, OR
  - Submit as an individual

### "User with email X not found"
- Team member must register first
- Send them the registration link
- They must complete sign-up before being added

### "Team has reached maximum member limit"
- Teams are limited to 5 members
- Remove inactive members to add new ones
- Or create a new team

### "Cannot remove this member"
- Team owners cannot be removed
- To transfer ownership (future feature)
- Admins can only remove regular members

## Database Migration

**IMPORTANT**: Before using the team system, apply the database migration:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Open **SQL Editor**
4. Copy contents from: `supabase/migrations/20251019000000_create_teams_system.sql`
5. Paste into SQL Editor
6. Click **Run**
7. Verify tables appear in Table Editor:
   - `teams`
   - `team_members`
   - Verify `projects` table has `team_id` column

## Technical Details

### Database Schema
- **teams** - Team information
- **team_members** - Member relationships with roles
- **projects** - Updated with optional `team_id` link

### Access Control
- Row Level Security (RLS) enabled on all tables
- Role-based permissions enforced
- SECURITY DEFINER functions for safe access

### API Functions
- `is_team_member()` - Check membership
- `is_team_admin()` - Check admin status
- `team_has_project()` - Check project existence
- `get_team_member_count()` - Get member count

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify database migration was applied
3. Ensure you're logged in
4. Check your team role and permissions

## Future Features (Potential)

- Email invitations with tokens
- Transfer team ownership
- Team chat/discussion
- Team activity feed
- Team analytics
- Bulk member import

---

**Version**: 1.0  
**Date**: October 19, 2025  
**Status**: Production Ready




