-- ================================================
-- Teams System Migration
-- ================================================
-- Creates a comprehensive team management system with:
-- 1. Teams table for team metadata
-- 2. Team members table for team membership
-- 3. Updates to projects table to link with teams
-- 4. RLS policies for secure team collaboration
-- ================================================

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  max_members INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create team members table with roles
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Add team_id to projects table (nullable for backward compatibility)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON public.projects(team_id);

-- ================================================
-- Helper Functions
-- ================================================

-- Function to check if user is a team member
CREATE OR REPLACE FUNCTION public.is_team_member(_team_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE team_id = _team_id AND user_id = _user_id
  )
$$;

-- Function to check if user is team owner or admin
CREATE OR REPLACE FUNCTION public.is_team_admin(_team_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE team_id = _team_id 
      AND user_id = _user_id 
      AND role IN ('owner', 'admin')
  )
$$;

-- Function to check if team already has a project
CREATE OR REPLACE FUNCTION public.team_has_project(_team_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects
    WHERE team_id = _team_id
  )
$$;

-- Function to get team member count
CREATE OR REPLACE FUNCTION public.get_team_member_count(_team_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.team_members
  WHERE team_id = _team_id
$$;

-- ================================================
-- Triggers
-- ================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_teams_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_teams_updated_at();

-- Trigger to automatically add creator as team owner
CREATE OR REPLACE FUNCTION public.add_team_creator_as_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_team_created
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.add_team_creator_as_owner();

-- ================================================
-- RLS Policies for Teams
-- ================================================

-- Anyone can view active teams
CREATE POLICY "Anyone can view active teams"
  ON public.teams FOR SELECT
  USING (is_active = true);

-- Authenticated users can create teams
CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Team admins and owners can update their team
CREATE POLICY "Team admins can update their team"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (
    public.is_team_admin(id, auth.uid()) 
    OR public.has_role(auth.uid(), 'admin')
  );

-- Team owners can delete their team
CREATE POLICY "Team owners can delete their team"
  ON public.teams FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() 
    OR public.has_role(auth.uid(), 'admin')
  );

-- ================================================
-- RLS Policies for Team Members
-- ================================================

-- Team members can view their team's members
CREATE POLICY "Team members can view team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (
    public.is_team_member(team_id, auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Team admins can add members
CREATE POLICY "Team admins can add members"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_team_admin(team_id, auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Team admins can update member roles (but not owner role)
CREATE POLICY "Team admins can update member roles"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (
    public.is_team_admin(team_id, auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    role != 'owner' OR public.has_role(auth.uid(), 'admin')
  );

-- Team admins can remove members (except owners)
CREATE POLICY "Team admins can remove members"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (
    (public.is_team_admin(team_id, auth.uid()) AND role != 'owner')
    OR public.has_role(auth.uid(), 'admin')
  );

-- Members can remove themselves
CREATE POLICY "Members can leave team"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND role != 'owner');

-- ================================================
-- Update Projects RLS Policies
-- ================================================

-- Drop existing update policy for projects
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;

-- Create new policy that allows team members to edit team projects
CREATE POLICY "Team members can update team projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() 
    OR (team_id IS NOT NULL AND public.is_team_member(team_id, auth.uid()))
    OR public.has_role(auth.uid(), 'admin')
  );

-- Update insert policy to check for existing team project
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;

CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by 
    AND (
      team_id IS NULL 
      OR NOT public.team_has_project(team_id)
    )
  );

-- ================================================
-- Validation Constraints
-- ================================================

-- Add constraint to ensure team doesn't exceed max members
CREATE OR REPLACE FUNCTION public.validate_team_size()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  SELECT max_members INTO max_allowed
  FROM public.teams
  WHERE id = NEW.team_id;

  SELECT COUNT(*) INTO current_count
  FROM public.team_members
  WHERE team_id = NEW.team_id;

  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Team has reached maximum member limit of %', max_allowed;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER check_team_size
  BEFORE INSERT ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_team_size();

-- ================================================
-- Helpful Views
-- ================================================

-- View to see teams with member counts
CREATE OR REPLACE VIEW public.teams_with_stats AS
SELECT 
  t.id,
  t.name,
  t.description,
  t.created_by,
  t.created_at,
  t.updated_at,
  t.max_members,
  t.is_active,
  COUNT(tm.id) as member_count,
  BOOL_OR(p.id IS NOT NULL) as has_project
FROM public.teams t
LEFT JOIN public.team_members tm ON t.id = tm.team_id
LEFT JOIN public.projects p ON t.id = p.team_id
GROUP BY t.id;

COMMENT ON TABLE public.teams IS 'Teams for hackathon collaboration';
COMMENT ON TABLE public.team_members IS 'Team membership with roles (owner, admin, member)';
COMMENT ON COLUMN public.projects.team_id IS 'Optional team association - teams can only have one project';

