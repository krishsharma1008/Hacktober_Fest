import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Eye, Github, Play, ExternalLink, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [hasLiked, setHasLiked] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Increment view count on mount
  useEffect(() => {
    if (id) {
      incrementViews();
    }
  }, [id]);

  // Check if user has liked this project
  useEffect(() => {
    if (user && id) {
      const liked = localStorage.getItem(`project_liked_${id}_${user.id}`);
      setHasLiked(!!liked);
    }
  }, [user, id]);

  const incrementViews = async () => {
    if (!id) return;
    
    try {
      const { error } = await supabase.rpc('increment_project_views', {
        project_id: id
      });
      
      if (error) {
        // Fallback if RPC doesn't exist
        const { data: currentProject } = await supabase
          .from('projects')
          .select('views')
          .eq('id', id)
          .single();
        
        if (currentProject) {
          await supabase
            .from('projects')
            .update({ views: (currentProject.views || 0) + 1 })
            .eq('id', id);
        }
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!project || !user) return;

      const newLikes = hasLiked ? (project.likes || 0) - 1 : (project.likes || 0) + 1;
      
      const { error } = await supabase
        .from('projects')
        .update({ likes: newLikes })
        .eq('id', project.id);
      
      if (error) throw error;
      
      return { newLikes };
    },
    onSuccess: () => {
      if (user) {
        if (hasLiked) {
          localStorage.removeItem(`project_liked_${id}_${user.id}`);
          setHasLiked(false);
        } else {
          localStorage.setItem(`project_liked_${id}_${user.id}`, 'true');
          setHasLiked(true);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: () => {
      toast.error('Failed to update like');
    }
  });

  const handleLike = () => {
    if (!user) {
      toast.error('Please sign in to like projects');
      return;
    }
    likeMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavigationHeader />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwner = user?.id === project.created_by;

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            ← Back
          </Button>
          
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
              <p className="text-xl text-muted-foreground">by {project.team_name}</p>
            </div>
            {isOwner && (
              <Button onClick={() => navigate('/my-projects')} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 items-center mb-6">
            <Button
              onClick={handleLike}
              variant={hasLiked ? "default" : "outline"}
              disabled={likeMutation.isPending}
            >
              <Heart className={`w-5 h-5 mr-2 ${hasLiked ? 'fill-current' : ''}`} />
              {project.likes || 0} Likes
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="w-5 h-5" />
              <span>{project.views || 0} views</span>
            </div>
          </div>

          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Media Section */}
        {project.images && project.images.length > 0 && (
          <Card className="mb-8 overflow-hidden">
            <div className="aspect-video bg-muted">
              <img
                src={project.images[0]}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          </Card>
        )}

        {/* Action Links */}
        <div className="flex flex-wrap gap-3 mb-8">
          {project.demo_video_url && (
            <Button asChild>
              <a href={project.demo_video_url} target="_blank" rel="noopener noreferrer">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </a>
            </Button>
          )}
          {project.github_url && (
            <Button variant="outline" asChild>
              <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </a>
            </Button>
          )}
          {project.presentation_url && (
            <Button variant="outline" asChild>
              <a href={project.presentation_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Presentation
              </a>
            </Button>
          )}
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="description" className="mb-8">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="problem">Problem</TabsTrigger>
            <TabsTrigger value="solution">Solution</TabsTrigger>
            <TabsTrigger value="learnings">Learnings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description">
            <Card>
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {project.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="problem">
            <Card>
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {project.problem || 'No problem statement provided.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="solution">
            <Card>
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {project.solution || 'No solution provided.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="learnings">
            <Card>
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed whitespace-pre-wrap mb-6">
                  {project.learnings || 'No learnings provided.'}
                </p>
                
                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="pt-6 border-t">
                    <h3 className="font-semibold text-lg mb-3">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tech_stack.map((tech: string) => (
                        <Badge key={tech} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
