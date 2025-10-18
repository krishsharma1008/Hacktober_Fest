-- =====================================================
-- COMPLETE DATABASE SETUP FOR NEW SUPABASE PROJECT
-- Project: tujfuymkzuzvuacnqjos
-- Run this in Supabase SQL Editor to set up the entire database
-- 
-- IMPORTANT: This script is idempotent - safe to run multiple times
-- It will skip already-created objects and only create new ones
-- =====================================================

-- MIGRATION 1: Core Schema (20251017085410)
-- =====================================================

-- Create role enum (using DO block for IF NOT EXISTS)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'judge');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table (separate from profiles for security)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user role function
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'judge' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;

-- Profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  team_name TEXT,
  linkedin TEXT,
  github TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Projects table with multiple media support
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  problem TEXT,
  solution TEXT,
  tech_stack TEXT[],
  learnings TEXT,
  demo_video_url TEXT,
  ppt_url TEXT,
  github_url TEXT,
  presentation_url TEXT,
  images TEXT[],
  tags TEXT[],
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Judge feedback table
CREATE TABLE IF NOT EXISTS public.judge_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  judge_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 10),
  comment TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, judge_id)
);

ALTER TABLE public.judge_feedback ENABLE ROW LEVEL SECURITY;

-- Updates table for announcements
CREATE TABLE IF NOT EXISTS public.updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

-- Discussions table
CREATE TABLE IF NOT EXISTS public.discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_roles' AND policyname = 'Users can view their own role'
  ) THEN
    CREATE POLICY "Users can view their own role"
      ON public.user_roles FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_roles' AND policyname = 'Admins can manage all roles'
  ) THEN
    CREATE POLICY "Admins can manage all roles"
      ON public.user_roles FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- RLS Policies for profiles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Profiles are viewable by everyone"
      ON public.profiles FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON public.profiles FOR UPDATE
      TO authenticated
      USING (id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.profiles FOR INSERT
      TO authenticated
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- RLS Policies for projects
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' AND policyname = 'Anyone can view projects'
  ) THEN
    CREATE POLICY "Anyone can view projects"
      ON public.projects FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' AND policyname = 'Authenticated users can create projects'
  ) THEN
    CREATE POLICY "Authenticated users can create projects"
      ON public.projects FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' AND policyname = 'Users can update their own projects'
  ) THEN
    CREATE POLICY "Users can update their own projects"
      ON public.projects FOR UPDATE
      TO authenticated
      USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' AND policyname = 'Admins can delete projects'
  ) THEN
    CREATE POLICY "Admins can delete projects"
      ON public.projects FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- RLS Policies for judge_feedback
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'judge_feedback' AND policyname = 'Anyone can view feedback'
  ) THEN
    CREATE POLICY "Anyone can view feedback"
      ON public.judge_feedback FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'judge_feedback' AND policyname = 'Judges can insert feedback'
  ) THEN
    CREATE POLICY "Judges can insert feedback"
      ON public.judge_feedback FOR INSERT
      TO authenticated
      WITH CHECK (public.has_role(auth.uid(), 'judge') OR public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'judge_feedback' AND policyname = 'Judges can update their own feedback'
  ) THEN
    CREATE POLICY "Judges can update their own feedback"
      ON public.judge_feedback FOR UPDATE
      TO authenticated
      USING (judge_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- RLS Policies for updates
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'updates' AND policyname = 'Anyone can view updates'
  ) THEN
    CREATE POLICY "Anyone can view updates"
      ON public.updates FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'updates' AND policyname = 'Admins can manage updates'
  ) THEN
    CREATE POLICY "Admins can manage updates"
      ON public.updates FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- RLS Policies for discussions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'discussions' AND policyname = 'Anyone can view discussions'
  ) THEN
    CREATE POLICY "Anyone can view discussions"
      ON public.discussions FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'discussions' AND policyname = 'Authenticated users can create discussions'
  ) THEN
    CREATE POLICY "Authenticated users can create discussions"
      ON public.discussions FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'discussions' AND policyname = 'Admins can manage discussions'
  ) THEN
    CREATE POLICY "Admins can manage discussions"
      ON public.discussions FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('project-files', 'project-files', true),
  ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view project files" ON storage.objects;
CREATE POLICY "Anyone can view project files"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('project-files', 'project-images'));

DROP POLICY IF EXISTS "Authenticated users can upload project files" ON storage.objects;
CREATE POLICY "Authenticated users can upload project files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('project-files', 'project-images'));

DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('project-files', 'project-images'));

DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('project-files', 'project-images'));

-- MIGRATION 2: Registrations Table (20251017091255)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member1_name TEXT,
  member1_email TEXT,
  member1_phone TEXT,
  member1_designation TEXT,
  member2_name TEXT,
  member2_email TEXT,
  member2_phone TEXT,
  member2_designation TEXT,
  member3_name TEXT,
  member3_email TEXT,
  member3_phone TEXT,
  member3_designation TEXT,
  member4_name TEXT,
  member4_email TEXT,
  member4_phone TEXT,
  member4_designation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'registrations' AND policyname = 'Anyone can view registrations'
  ) THEN
    CREATE POLICY "Anyone can view registrations"
      ON public.registrations FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'registrations' AND policyname = 'Authenticated users can create registrations'
  ) THEN
    CREATE POLICY "Authenticated users can create registrations"
      ON public.registrations FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = leader_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'registrations' AND policyname = 'Users can update their own registrations'
  ) THEN
    CREATE POLICY "Users can update their own registrations"
      ON public.registrations FOR UPDATE
      TO authenticated
      USING (auth.uid() = leader_id);
  END IF;
END $$;

-- MIGRATION 3: Likes and Views Tracking (20251018000000)
-- =====================================================

-- Track which users liked which projects
CREATE TABLE IF NOT EXISTS public.project_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Track unique views per user per project
CREATE TABLE IF NOT EXISTS public.project_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID,  -- Nullable for anonymous users
  ip_address TEXT,  -- Fallback for anonymous tracking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_likes
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_likes' AND policyname = 'Anyone can view likes'
  ) THEN
    CREATE POLICY "Anyone can view likes" 
      ON public.project_likes FOR SELECT 
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_likes' AND policyname = 'Authenticated users can insert likes'
  ) THEN
    CREATE POLICY "Authenticated users can insert likes" 
      ON public.project_likes FOR INSERT 
      TO authenticated 
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_likes' AND policyname = 'Users can delete their own likes'
  ) THEN
    CREATE POLICY "Users can delete their own likes" 
      ON public.project_likes FOR DELETE 
      TO authenticated 
      USING (user_id = auth.uid());
  END IF;
END $$;

-- RLS Policies for project_views
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_views' AND policyname = 'Anyone can view project_views'
  ) THEN
    CREATE POLICY "Anyone can view project_views" 
      ON public.project_views FOR SELECT 
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_views' AND policyname = 'Anyone can insert views'
  ) THEN
    CREATE POLICY "Anyone can insert views" 
      ON public.project_views FOR INSERT 
      WITH CHECK (true);
  END IF;
END $$;

-- Function to toggle like
CREATE OR REPLACE FUNCTION public.toggle_project_like(p_project_id UUID)
RETURNS TABLE(liked BOOLEAN, total_likes BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_liked BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to like projects';
  END IF;

  -- Check if already liked
  SELECT EXISTS(
    SELECT 1 FROM project_likes 
    WHERE project_id = p_project_id AND user_id = v_user_id
  ) INTO v_liked;

  IF v_liked THEN
    -- Unlike
    DELETE FROM project_likes 
    WHERE project_id = p_project_id AND user_id = v_user_id;
    v_liked := false;
  ELSE
    -- Like
    INSERT INTO project_likes (project_id, user_id) 
    VALUES (p_project_id, v_user_id);
    v_liked := true;
  END IF;

  -- Update counter in projects table
  UPDATE projects 
  SET likes = (
    SELECT COUNT(*) FROM project_likes 
    WHERE project_id = p_project_id
  ) 
  WHERE id = p_project_id;

  -- Return status
  RETURN QUERY 
  SELECT v_liked, (
    SELECT COUNT(*) FROM project_likes 
    WHERE project_id = p_project_id
  );
END;
$$;

-- Function to record view
CREATE OR REPLACE FUNCTION public.record_project_view(
  p_project_id UUID, 
  p_ip_address TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_total_views BIGINT;
BEGIN
  -- Check if user already viewed (prevent duplicate views)
  IF v_user_id IS NOT NULL THEN
    IF NOT EXISTS(
      SELECT 1 FROM project_views 
      WHERE project_id = p_project_id AND user_id = v_user_id
    ) THEN
      INSERT INTO project_views (project_id, user_id) 
      VALUES (p_project_id, v_user_id);
    END IF;
  ELSIF p_ip_address IS NOT NULL THEN
    IF NOT EXISTS(
      SELECT 1 FROM project_views 
      WHERE project_id = p_project_id AND ip_address = p_ip_address
    ) THEN
      INSERT INTO project_views (project_id, user_id, ip_address) 
      VALUES (p_project_id, NULL, p_ip_address);
    END IF;
  END IF;

  -- Update counter
  UPDATE projects 
  SET views = (
    SELECT COUNT(*) FROM project_views 
    WHERE project_id = p_project_id
  ) 
  WHERE id = p_project_id;

  SELECT views INTO v_total_views 
  FROM projects 
  WHERE id = p_project_id;
  
  RETURN v_total_views;
END;
$$;

-- =====================================================
-- END OF MIGRATIONS
-- =====================================================

