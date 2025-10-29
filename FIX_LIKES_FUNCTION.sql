-- Fix for missing toggle_project_like function
-- Copy and paste this into Supabase SQL Editor and run it

-- First, ensure the project_likes table exists
CREATE TABLE IF NOT EXISTS public.project_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Enable RLS
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view likes" ON public.project_likes;
DROP POLICY IF EXISTS "Authenticated users can insert likes" ON public.project_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.project_likes;

-- Create policies
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

-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.toggle_project_like(UUID);

-- Create the toggle_project_like function
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.toggle_project_like(UUID) TO authenticated;


