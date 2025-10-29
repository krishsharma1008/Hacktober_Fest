-- Fix for missing record_project_view function
-- Copy and paste this into Supabase SQL Editor and run it

-- First, ensure the project_views table exists
CREATE TABLE IF NOT EXISTS public.project_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view project_views" ON public.project_views;
DROP POLICY IF EXISTS "Anyone can insert views" ON public.project_views;

-- Create policies
CREATE POLICY "Anyone can view project_views" 
  ON public.project_views FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert views" 
  ON public.project_views FOR INSERT 
  WITH CHECK (true);

-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.record_project_view(UUID, TEXT);

-- Create the record_project_view function
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
  
  RETURN COALESCE(v_total_views, 0);
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.record_project_view(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_project_view(UUID, TEXT) TO anon;


