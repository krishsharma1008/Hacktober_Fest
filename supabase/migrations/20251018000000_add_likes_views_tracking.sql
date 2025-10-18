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
CREATE POLICY "Anyone can view likes" 
  ON public.project_likes FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert likes" 
  ON public.project_likes FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own likes" 
  ON public.project_likes FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid());

-- RLS Policies for project_views
CREATE POLICY "Anyone can view project_views" 
  ON public.project_views FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert views" 
  ON public.project_views FOR INSERT 
  WITH CHECK (true);

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

