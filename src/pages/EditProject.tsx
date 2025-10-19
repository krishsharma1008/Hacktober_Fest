import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Save, ImagePlus, X } from 'lucide-react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Footer } from '@/components/Footer';

const EditProject = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
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

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            teamName: data.team_name || '',
            title: data.title || '',
            description: data.description || '',
            problem: data.problem || '',
            solution: data.solution || '',
            techStack: data.tech_stack?.join(', ') || '',
            learnings: data.learnings || '',
            demoVideoUrl: data.demo_video_url || '',
            githubUrl: data.github_url || '',
            presentationUrl: data.presentation_url || '',
            tags: data.tags?.join(', ') || ''
          });

          if (data.cover_image) {
            setCoverImagePreview(data.cover_image);
          }
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: 'Error loading project',
          description: 'Failed to load project details',
          variant: 'destructive'
        });
        navigate('/my-projects');
      } finally {
        setIsFetching(false);
      }
    };

    fetchProject();
  }, [id, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file (JPG, PNG, GIF, etc.)',
          variant: 'destructive'
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Cover image must be less than 5MB',
          variant: 'destructive'
        });
        return;
      }

      setCoverImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let coverImageUrl: string | null = null;

      // Upload new cover image if provided
      if (coverImage) {
        setUploadingImage(true);
        const fileExt = coverImage.name.split('.').pop();
        const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
        const filePath = `project-covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, coverImage, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload cover image: ' + uploadError.message);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath);

        coverImageUrl = publicUrl;
        setUploadingImage(false);
      }

      const updateData: any = {
        team_name: formData.teamName,
        title: formData.title,
        description: formData.description,
        problem: formData.problem,
        solution: formData.solution,
        tech_stack: formData.techStack.split(',').map(s => s.trim()).filter(Boolean),
        learnings: formData.learnings,
        demo_video_url: formData.demoVideoUrl,
        github_url: formData.githubUrl,
        presentation_url: formData.presentationUrl,
        tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
        updated_at: new Date().toISOString()
      };

      // Only update cover_image if a new one was uploaded
      if (coverImageUrl) {
        updateData.cover_image = coverImageUrl;
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Project updated! 🎉',
        description: 'Your project has been successfully updated.'
      });

      navigate(`/project/${id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Update failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setUploadingImage(false);
    }
  };

  if (isFetching) {
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
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Edit Your Project</CardTitle>
            <CardDescription>
              Update your project details and information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cover Image Upload Section */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImagePlus className="h-5 w-5 text-primary" />
                    Project Cover Image
                  </CardTitle>
                  <CardDescription>
                    Upload a new cover image (optional, max 5MB)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!coverImagePreview ? (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <label htmlFor="cover-image" className="cursor-pointer">
                          <ImagePlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF up to 5MB
                          </p>
                          <Input
                            id="cover-image"
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={coverImagePreview}
                        alt="Cover preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeCoverImage}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">
                    Team/Individual Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="teamName"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    required
                    placeholder="Innovation Squad"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">
                    Project Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="My Awesome Hackathon Project"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Short Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="A brief description of your project"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem">Problem Statement</Label>
                <Textarea
                  id="problem"
                  name="problem"
                  value={formData.problem}
                  onChange={handleChange}
                  placeholder="What problem does your project solve?"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution">Solution</Label>
                <Textarea
                  id="solution"
                  name="solution"
                  value={formData.solution}
                  onChange={handleChange}
                  placeholder="How does your project solve the problem?"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="techStack">Tech Stack (comma-separated)</Label>
                <Input
                  id="techStack"
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleChange}
                  placeholder="React, Node.js, PostgreSQL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="learnings">Key Learnings</Label>
                <Textarea
                  id="learnings"
                  name="learnings"
                  value={formData.learnings}
                  onChange={handleChange}
                  placeholder="What did you learn while building this project?"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="githubUrl">Repository URL</Label>
                  <Input
                    id="githubUrl"
                    name="githubUrl"
                    type="url"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presentationUrl">Presentation URL</Label>
                  <Input
                    id="presentationUrl"
                    name="presentationUrl"
                    type="url"
                    value={formData.presentationUrl}
                    onChange={handleChange}
                    placeholder="https://docs.google.com/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="AI/ML, Web, Healthcare"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/my-projects')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="flex-1"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {uploadingImage && <Upload className="mr-2 h-4 w-4" />}
                  {!isLoading && !uploadingImage && <Save className="mr-2 h-4 w-4" />}
                  Save Changes
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

export default EditProject;

