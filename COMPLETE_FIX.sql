-- ============================================================================
-- COMPLETE FIX FOR PROJECT LIKES AND VIEWS
-- Run this entire file in Supabase SQL Editor
-- Safe to run multiple times
-- ============================================================================

-- Step 1: Create project_likes table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.project_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT project_likes_unique UNIQUE(project_id, user_id)
);

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_likes_project_id_fkey'
  ) THEN
    ALTER TABLE public.project_likes 
    ADD CONSTRAINT project_likes_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_likes_user_id_fkey'
  ) THEN
    ALTER TABLE public.project_likes 
    ADD CONSTRAINT project_likes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 2: Create project_views table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.project_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  user_id UUID,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_views_project_id_fkey'
  ) THEN
    ALTER TABLE public.project_views 
    ADD CONSTRAINT project_views_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 3: Enable RLS on both tables
-- ============================================================================
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies (if any)
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view likes" ON public.project_likes;
DROP POLICY IF EXISTS "Authenticated users can insert likes" ON public.project_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.project_likes;
DROP POLICY IF EXISTS "Anyone can view project_views" ON public.project_views;
DROP POLICY IF EXISTS "Anyone can insert views" ON public.project_views;

-- Step 5: Create RLS policies for project_likes
-- ============================================================================
CREATE POLICY "Anyone can view likes" 
  ON public.project_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert likes" 
  ON public.project_likes 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
  ON public.project_likes 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Step 6: Create RLS policies for project_views
-- ============================================================================
CREATE POLICY "Anyone can view project_views" 
  ON public.project_views 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert views" 
  ON public.project_views 
  FOR INSERT 
  WITH CHECK (true);

-- Step 7: Drop existing functions (if any)
-- ============================================================================
DROP FUNCTION IF EXISTS public.toggle_project_like(UUID);
DROP FUNCTION IF EXISTS public.record_project_view(UUID, TEXT);

-- Step 8: Create toggle_project_like function
-- ============================================================================
CREATE OR REPLACE FUNCTION public.toggle_project_like(p_project_id UUID)
RETURNS TABLE(liked BOOLEAN, total_likes BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_liked BOOLEAN;
  v_count BIGINT;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check authentication
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to like projects';
  END IF;

  -- Check if already liked
  SELECT EXISTS(
    SELECT 1 FROM public.project_likes 
    WHERE project_id = p_project_id AND user_id = v_user_id
  ) INTO v_liked;

  IF v_liked THEN
    -- Unlike: Delete the like
    DELETE FROM public.project_likes 
    WHERE project_id = p_project_id AND user_id = v_user_id;
    v_liked := false;
  ELSE
    -- Like: Insert new like
    INSERT INTO public.project_likes (project_id, user_id) 
    VALUES (p_project_id, v_user_id)
    ON CONFLICT (project_id, user_id) DO NOTHING;
    v_liked := true;
  END IF;

  -- Get total likes count
  SELECT COUNT(*) INTO v_count
  FROM public.project_likes 
  WHERE project_id = p_project_id;

  -- Update counter in projects table (if likes column exists)
  UPDATE public.projects 
  SET likes = v_count
  WHERE id = p_project_id;

  -- Return result
  RETURN QUERY SELECT v_liked, v_count;
END;
$$;

-- Step 9: Create record_project_view function
-- ============================================================================
CREATE OR REPLACE FUNCTION public.record_project_view(
  p_project_id UUID, 
  p_ip_address TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_total_views BIGINT;
  v_view_exists BOOLEAN;
BEGIN
  -- Get current user ID (null if anonymous)
  v_user_id := auth.uid();
  
  -- Check if this user/IP already viewed this project
  IF v_user_id IS NOT NULL THEN
    -- Authenticated user: check by user_id
    SELECT EXISTS(
      SELECT 1 FROM public.project_views 
      WHERE project_id = p_project_id AND user_id = v_user_id
    ) INTO v_view_exists;
    
    IF NOT v_view_exists THEN
      INSERT INTO public.project_views (project_id, user_id) 
      VALUES (p_project_id, v_user_id);
    END IF;
  ELSIF p_ip_address IS NOT NULL THEN
    -- Anonymous user: check by IP address
    SELECT EXISTS(
      SELECT 1 FROM public.project_views 
      WHERE project_id = p_project_id 
        AND ip_address = p_ip_address
        AND user_id IS NULL
    ) INTO v_view_exists;
    
    IF NOT v_view_exists THEN
      INSERT INTO public.project_views (project_id, user_id, ip_address) 
      VALUES (p_project_id, NULL, p_ip_address);
    END IF;
  END IF;

  -- Count total unique views
  SELECT COUNT(*) INTO v_total_views
  FROM public.project_views 
  WHERE project_id = p_project_id;

  -- Update counter in projects table (if views column exists)
  UPDATE public.projects 
  SET views = v_total_views
  WHERE id = p_project_id;

  RETURN COALESCE(v_total_views, 0);
END;
$$;

-- Step 10: Grant permissions
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.project_likes TO anon, authenticated;
GRANT INSERT, DELETE ON public.project_likes TO authenticated;
GRANT SELECT, INSERT ON public.project_views TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_project_like(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_project_view(UUID, TEXT) TO anon, authenticated;

-- Step 11: Refresh schema cache
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- VERIFICATION QUERIES (Optional - uncomment to test)
-- ============================================================================
-- SELECT 'project_likes table exists' as check, COUNT(*) as count FROM public.project_likes;
-- SELECT 'project_views table exists' as check, COUNT(*) as count FROM public.project_views;
-- SELECT 'toggle_project_like function exists' as check FROM pg_proc WHERE proname = 'toggle_project_like';
-- SELECT 'record_project_view function exists' as check FROM pg_proc WHERE proname = 'record_project_view';

-- ============================================================================
-- DONE! You should see "Success. No rows returned"
-- Now refresh your app at http://localhost:8084
-- ============================================================================


