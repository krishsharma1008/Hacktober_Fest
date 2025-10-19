-- ============================================================================
-- ABSOLUTE FINAL FIX - Run this and wait 2 minutes
-- ============================================================================

-- Drop existing objects
DROP TABLE IF EXISTS public.project_likes CASCADE;
DROP TABLE IF EXISTS public.project_views CASCADE;

-- Create project_likes
CREATE TABLE public.project_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT project_likes_unique UNIQUE(project_id, user_id),
  CONSTRAINT project_likes_project_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT project_likes_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create project_views  
CREATE TABLE public.project_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  user_id UUID,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT project_views_project_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;

-- RLS for project_likes
CREATE POLICY "project_likes_select_policy" ON public.project_likes FOR SELECT USING (true);
CREATE POLICY "project_likes_insert_policy" ON public.project_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "project_likes_delete_policy" ON public.project_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS for project_views
CREATE POLICY "project_views_select_policy" ON public.project_views FOR SELECT USING (true);
CREATE POLICY "project_views_insert_policy" ON public.project_views FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.project_likes TO anon, authenticated;
GRANT INSERT, DELETE ON public.project_likes TO authenticated;
GRANT SELECT, INSERT ON public.project_views TO anon, authenticated;

-- Create toggle_project_like function
CREATE OR REPLACE FUNCTION public.toggle_project_like(p_project_id UUID)
RETURNS TABLE(liked BOOLEAN, total_likes BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_liked BOOLEAN;
  v_count BIGINT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated';
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.project_likes WHERE project_id = p_project_id AND user_id = v_user_id) INTO v_liked;

  IF v_liked THEN
    DELETE FROM public.project_likes WHERE project_id = p_project_id AND user_id = v_user_id;
    v_liked := false;
  ELSE
    INSERT INTO public.project_likes (project_id, user_id) VALUES (p_project_id, v_user_id) ON CONFLICT DO NOTHING;
    v_liked := true;
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.project_likes WHERE project_id = p_project_id;
  UPDATE public.projects SET likes = v_count WHERE id = p_project_id;

  RETURN QUERY SELECT v_liked, v_count;
END;
$$;

-- Create record_project_view function
CREATE OR REPLACE FUNCTION public.record_project_view(p_project_id UUID, p_ip_address TEXT DEFAULT NULL)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_total_views BIGINT;
BEGIN
  IF v_user_id IS NOT NULL THEN
    IF NOT EXISTS(SELECT 1 FROM public.project_views WHERE project_id = p_project_id AND user_id = v_user_id) THEN
      INSERT INTO public.project_views (project_id, user_id) VALUES (p_project_id, v_user_id);
    END IF;
  ELSIF p_ip_address IS NOT NULL THEN
    IF NOT EXISTS(SELECT 1 FROM public.project_views WHERE project_id = p_project_id AND ip_address = p_ip_address AND user_id IS NULL) THEN
      INSERT INTO public.project_views (project_id, user_id, ip_address) VALUES (p_project_id, NULL, p_ip_address);
    END IF;
  END IF;

  SELECT COUNT(*) INTO v_total_views FROM public.project_views WHERE project_id = p_project_id;
  UPDATE public.projects SET views = v_total_views WHERE id = p_project_id;

  RETURN COALESCE(v_total_views, 0);
END;
$$;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.toggle_project_like(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_project_view(UUID, TEXT) TO anon, authenticated;

-- Reload schema
NOTIFY pgrst, 'reload schema';

-- Verify
SELECT 'SUCCESS: Tables created' AS status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_likes')
  AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_views');

SELECT 'SUCCESS: Functions created' AS status
WHERE EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'toggle_project_like')
  AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'record_project_view');

