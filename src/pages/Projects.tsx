import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Heart, Github, ExternalLink } from 'lucide-react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Footer } from '@/components/Footer';
import { useProjectInteractions } from '@/hooks/use-project-interactions';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  id: string;
  team_name: string;
  title: string;
  description: string;
  tech_stack: string[];
  tags: string[];
  demo_video_url: string;
  github_url: string;
  views: number;
  likes: number;
}

// Project Like Button Component
const ProjectLikeButton = ({ projectId, likes }: { projectId: string; likes: number }) => {
  const { userLiked, toggleLike, isTogglingLike } = useProjectInteractions(projectId);
  const { user } = useAuth();

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      return; // Hook will show toast
    }
    toggleLike();
  };

  return (
    <button
      onClick={handleLikeClick}
      disabled={isTogglingLike}
      className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
      title={user ? (userLiked ? 'Unlike' : 'Like') : 'Sign in to like'}
    >
      <Heart 
        className={`w-4 h-4 transition-all ${
          userLiked ? 'fill-red-500 text-red-500' : ''
        } ${isTogglingLike ? 'scale-110' : ''}`} 
      />
      {likes || 0}
    </button>
  );
};

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'submitted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Project Gallery</h1>
          <p className="text-muted-foreground mt-2">
            Explore innovative projects from our hackathon participants
          </p>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                No projects have been submitted yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl line-clamp-1">{project.title}</CardTitle>
                  <CardDescription>{project.team_name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {project.description}
                  </p>

                  {project.tech_stack && project.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.tech_stack.slice(0, 3).map((tech, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.tech_stack.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tech_stack.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <ProjectLikeButton projectId={project.id} likes={project.likes || 0} />
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      {project.views || 0}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {project.github_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(project.github_url, '_blank')}
                      >
                        <Github className="h-4 w-4" />
                      </Button>
                    )}
                    {project.demo_video_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(project.demo_video_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="ml-auto"
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Projects;
