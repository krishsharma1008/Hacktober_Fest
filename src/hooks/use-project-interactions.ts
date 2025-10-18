import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useProjectInteractions = (projectId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check if current user liked the project
  const { data: userLiked = false } = useQuery({
    queryKey: ['project-like', projectId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('project_likes')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking like status:', error);
        return false;
      }
      return !!data;
    },
    enabled: !!user && !!projectId,
  });

  // Toggle like mutation
  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast.error('Please sign in to like projects');
        throw new Error('Must be authenticated');
      }

      const { data, error } = await supabase.rpc('toggle_project_like', {
        p_project_id: projectId,
      });

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-like', projectId] });
      
      if (data?.liked) {
        toast.success('Project liked!');
      } else {
        toast.info('Like removed');
      }
    },
    onError: (error) => {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like. Please try again.');
    },
  });

  // Record view mutation
  const recordView = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('record_project_view', {
        p_project_id: projectId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      // Silent fail for views - not critical functionality
      console.error('Error recording view:', error);
    },
  });

  return {
    userLiked,
    toggleLike: toggleLike.mutate,
    isTogglingLike: toggleLike.isPending,
    recordView: recordView.mutate,
  };
};

