import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, ExternalLink, Github, Users, User } from 'lucide-react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Footer } from '@/components/Footer';

interface Project {
  id: string;
  team_id: string | null;
  team_name: string;
  title: string;
  description: string;
  status: string;
  tech_stack: string[];
  tags: string[];
  demo_video_url: string;
  github_url: string;
  created_at: string;
  created_by: string;
}

const MyProjects = () => {
  const { user } = useAuth();
  const { userTeams } = useTeam();
  const navigate = useNavigate();
  const [personalProjects, setPersonalProjects] = useState<Project[]>([]);
  const [teamProjects, setTeamProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch personal projects (created by user, not linked to any team)
      const { data: personal, error: personalError } = await supabase
        .from('projects')
        .select('*')
        .eq('created_by', user.id)
        .is('team_id', null)
        .order('created_at', { ascending: false });

      if (personalError) throw personalError;
      setPersonalProjects(personal || []);

      // Fetch team projects (where user is a team member)
      const teamIds = userTeams
        .filter(ut => ut.teams?.id)
        .map(ut => ut.teams!.id);

      if (teamIds.length > 0) {
        const { data: team, error: teamError } = await supabase
          .from('projects')
          .select('*')
          .in('team_id', teamIds)
          .order('created_at', { ascending: false });

        if (teamError) throw teamError;
        setTeamProjects(team || []);
      } else {
        setTeamProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, [user, userTeams]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const renderProjectCard = (project: Project, isTeamProject: boolean) => {
    const userTeam = userTeams.find(ut => ut.teams?.id === project.team_id);
    
    return (
      <Card key={project.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {isTeamProject ? (
                  <>
                    <Users className="h-4 w-4" />
                    {project.team_name}
                    {userTeam && (
                      <Badge variant="outline" className="text-xs">
                        {userTeam.role}
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    {project.team_name}
                  </>
                )}
              </CardDescription>
            </div>
            <Badge variant={project.status === 'submitted' ? 'default' : 'secondary'}>
              {project.status}
            </Badge>
          </div>
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
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalProjects = personalProjects.length + teamProjects.length;

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">My Projects</h1>
            <p className="text-muted-foreground mt-2">
              Manage your personal and team hackathon submissions
            </p>
          </div>
          <Button onClick={() => navigate('/submit-project')}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {totalProjects === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                You haven't submitted any projects yet
              </p>
              <Button onClick={() => navigate('/submit-project')}>
                <Plus className="mr-2 h-4 w-4" />
                Submit Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">
                All ({totalProjects})
              </TabsTrigger>
              <TabsTrigger value="personal">
                <User className="h-4 w-4 mr-1" />
                Personal ({personalProjects.length})
              </TabsTrigger>
              <TabsTrigger value="team">
                <Users className="h-4 w-4 mr-1" />
                Team ({teamProjects.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...personalProjects, ...teamProjects].map((project) => 
                  renderProjectCard(project, !!project.team_id)
                )}
              </div>
            </TabsContent>

            <TabsContent value="personal" className="mt-6">
              {personalProjects.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No personal projects yet
                    </p>
                    <Button onClick={() => navigate('/submit-project')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Submit Personal Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {personalProjects.map((project) => 
                    renderProjectCard(project, false)
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="team" className="mt-6">
              {teamProjects.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No team projects yet
                    </p>
                    <Button onClick={() => navigate('/submit-project')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Submit Team Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teamProjects.map((project) => 
                    renderProjectCard(project, true)
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyProjects;
