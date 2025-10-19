-- ============================================================================
-- NUCLEAR OPTION: Complete Rebuild with Explicit Permissions
-- This will DROP and RECREATE everything to ensure it works
-- ============================================================================

-- Step 1: Drop everything first
-- ============================================================================
DROP TABLE IF EXISTS public.project_likes CASCADE;
DROP TABLE IF EXISTS public.project_views CASCADE;
DROP FUNCTION IF EXISTS public.toggle_project_like(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.record_project_view(UUID, TEXT) CASCADE;

-- Step 2: Create project_likes table
-- ============================================================================
CREATE TABLE public.project_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Step 3: Create project_views table
-- ============================================================================
CREATE TABLE public.project_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create indexes for performance
-- ============================================================================
CREATE INDEX idx_project_likes_project_id ON public.project_likes(project_id);
CREATE INDEX idx_project_likes_user_id ON public.project_likes(user_id);
CREATE INDEX idx_project_views_project_id ON public.project_views(project_id);
CREATE INDEX idx_project_views_user_id ON public.project_views(user_id);

-- Step 5: Enable RLS
-- ============================================================================
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
-- ============================================================================

-- project_likes policies
CREATE POLICY "Enable read access for all users"
  ON public.project_likes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON public.project_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id"
  ON public.project_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- project_views policies
CREATE POLICY "Enable read access for all users"
  ON public.project_views FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for all users"
  ON public.project_views FOR INSERT
  TO public
  WITH CHECK (true);

-- Step 7: Grant table permissions
-- ============================================================================
GRANT ALL ON public.project_likes TO postgres;
GRANT SELECT ON public.project_likes TO anon;
GRANT SELECT ON public.project_likes TO authenticated;
GRANT INSERT, DELETE ON public.project_likes TO authenticated;

GRANT ALL ON public.project_views TO postgres;
GRANT SELECT, INSERT ON public.project_views TO anon;
GRANT SELECT, INSERT ON public.project_views TO authenticated;

-- Step 8: Create toggle_project_like function
-- ============================================================================
CREATE FUNCTION public.toggle_project_like(p_project_id UUID)
RETURNS TABLE(liked BOOLEAN, total_likes BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_liked BOOLEAN;
  v_count BIGINT;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to like projects';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.project_likes 
    WHERE project_id = p_project_id AND user_id = v_user_id
  ) INTO v_liked;

  IF v_liked THEN
    DELETE FROM public.project_likes 
    WHERE project_id = p_project_id AND user_id = v_user_id;
    v_liked := false;
  ELSE
    INSERT INTO public.project_likes (project_id, user_id) 
    VALUES (p_project_id, v_user_id)
    ON CONFLICT (project_id, user_id) DO NOTHING;
    v_liked := true;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.project_likes 
  WHERE project_id = p_project_id;

  UPDATE public.projects 
  SET likes = v_count
  WHERE id = p_project_id;

  RETURN QUERY SELECT v_liked, v_count;
END;
$$;

-- Step 9: Create record_project_view function
-- ============================================================================
CREATE FUNCTION public.record_project_view(
  p_project_id UUID, 
  p_ip_address TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_total_views BIGINT;
  v_view_exists BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.project_views 
      WHERE project_id = p_project_id AND user_id = v_user_id
    ) INTO v_view_exists;
    
    IF NOT v_view_exists THEN
      INSERT INTO public.project_views (project_id, user_id) 
      VALUES (p_project_id, v_user_id);
    END IF;
  ELSIF p_ip_address IS NOT NULL THEN
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

  SELECT COUNT(*) INTO v_total_views
  FROM public.project_views 
  WHERE project_id = p_project_id;

  UPDATE public.projects 
  SET views = v_total_views
  WHERE id = p_project_id;

  RETURN COALESCE(v_total_views, 0);
END;
$$;

-- Step 10: Grant function permissions explicitly
-- ============================================================================
GRANT EXECUTE ON FUNCTION public.toggle_project_like(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_project_view(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.record_project_view(UUID, TEXT) TO authenticated;

-- Step 11: Alter function ownership (critical for SECURITY DEFINER)
-- ============================================================================
ALTER FUNCTION public.toggle_project_like(UUID) OWNER TO postgres;
ALTER FUNCTION public.record_project_view(UUID, TEXT) OWNER TO postgres;

-- Step 12: Force schema reload
-- ============================================================================
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Step 13: Verify everything was created
-- ============================================================================
DO $$
DECLARE
  likes_count INTEGER;
  views_count INTEGER;
  func1_exists BOOLEAN;
  func2_exists BOOLEAN;
BEGIN
  -- Check tables
  SELECT COUNT(*) INTO likes_count FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'project_likes';
  
  SELECT COUNT(*) INTO views_count FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'project_views';
  
  -- Check functions
  SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'toggle_project_like') INTO func1_exists;
  SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'record_project_view') INTO func2_exists;
  
  -- Report
  RAISE NOTICE '================================================';
  RAISE NOTICE 'VERIFICATION RESULTS:';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'project_likes table: %', CASE WHEN likes_count > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'project_views table: %', CASE WHEN views_count > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'toggle_project_like function: %', CASE WHEN func1_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'record_project_view function: %', CASE WHEN func2_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '================================================';
  
  IF likes_count > 0 AND views_count > 0 AND func1_exists AND func2_exists THEN
    RAISE NOTICE '✅ ALL OBJECTS CREATED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Go to Supabase Dashboard > Settings > API';
    RAISE NOTICE '2. Click "Restart API" button';
    RAISE NOTICE '3. Wait 30 seconds';
    RAISE NOTICE '4. Refresh your app at http://localhost:8084';
  ELSE
    RAISE EXCEPTION 'Some objects failed to create. Check errors above.';
  END IF;
END $$;

-- ============================================================================
-- DONE! Now you MUST restart the API in Supabase Dashboard
-- ============================================================================

