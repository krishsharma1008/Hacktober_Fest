-- Create role enum
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'judge');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
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
CREATE TABLE public.profiles (
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
CREATE TABLE public.projects (
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
CREATE TABLE public.judge_feedback (
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
CREATE TABLE public.updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

-- Discussions table
CREATE TABLE public.discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- RLS Policies for projects
CREATE POLICY "Anyone can view projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for judge_feedback
CREATE POLICY "Anyone can view feedback"
  ON public.judge_feedback FOR SELECT
  USING (true);

CREATE POLICY "Judges can insert feedback"
  ON public.judge_feedback FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'judge') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Judges can update their own feedback"
  ON public.judge_feedback FOR UPDATE
  TO authenticated
  USING (judge_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for updates
CREATE POLICY "Anyone can view updates"
  ON public.updates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage updates"
  ON public.updates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for discussions
CREATE POLICY "Anyone can view discussions"
  ON public.discussions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create discussions"
  ON public.discussions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage discussions"
  ON public.discussions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

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

-- Storage policies
CREATE POLICY "Anyone can view project files"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('project-files', 'project-images'));

CREATE POLICY "Authenticated users can upload project files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('project-files', 'project-images'));

CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('project-files', 'project-images'));

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('project-files', 'project-images'));