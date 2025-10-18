import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Footer } from '@/components/Footer';

const SubmitProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    teamName: '',
    title: '',
    description: '',
    problem: '',
    solution: '',
    techStack: '',
    learnings: '',
    demoVideoUrl: '',
    githubUrl: '',
    presentationUrl: '',
    tags: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          team_name: formData.teamName,
          title: formData.title,
          description: formData.description,
          problem: formData.problem,
          solution: formData.solution,
          tech_stack: formData.techStack.split(',').map(s => s.trim()),
          learnings: formData.learnings,
          demo_video_url: formData.demoVideoUrl,
          github_url: formData.githubUrl,
          presentation_url: formData.presentationUrl,
          tags: formData.tags.split(',').map(s => s.trim()),
          created_by: user?.id,
          status: 'submitted'
        });

      if (error) throw error;

      toast({
        title: 'Project submitted!',
        description: 'Your project has been successfully submitted.'
      });

      navigate('/my-projects');
    } catch (error: any) {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Submit Your Project</CardTitle>
            <CardDescription>
              Fill in the details about your hackathon project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name *</Label>
                  <Input
                    id="teamName"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    required
                    placeholder="Innovation Squad"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="AI-Powered Task Manager"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Brief overview of your project..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="problem">Problem Statement</Label>
                  <Textarea
                    id="problem"
                    name="problem"
                    value={formData.problem}
                    onChange={handleChange}
                    placeholder="What problem does this solve?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solution">Solution</Label>
                  <Textarea
                    id="solution"
                    name="solution"
                    value={formData.solution}
                    onChange={handleChange}
                    placeholder="How does your project solve it?"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="techStack">Tech Stack (comma-separated)</Label>
                <Input
                  id="techStack"
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleChange}
                  placeholder="React, Node.js, PostgreSQL, TailwindCSS"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="learnings">Key Learnings</Label>
                <Textarea
                  id="learnings"
                  name="learnings"
                  value={formData.learnings}
                  onChange={handleChange}
                  placeholder="What did you learn during this hackathon?"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="demoVideoUrl">Demo Video URL</Label>
                  <Input
                    id="demoVideoUrl"
                    name="demoVideoUrl"
                    type="url"
                    value={formData.demoVideoUrl}
                    onChange={handleChange}
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub Repository</Label>
                  <Input
                    id="githubUrl"
                    name="githubUrl"
                    type="url"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="presentationUrl">Presentation URL</Label>
                <Input
                  id="presentationUrl"
                  name="presentationUrl"
                  type="url"
                  value={formData.presentationUrl}
                  onChange={handleChange}
                  placeholder="https://docs.google.com/presentation/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="AI, Healthcare, Education"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SubmitProject;
