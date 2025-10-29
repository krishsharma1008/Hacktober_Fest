import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Upload,
  Users,
  AlertCircle,
  ImagePlus,
  X,
} from "lucide-react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { CreateTeamModal } from "@/components/CreateTeamModal";
import { TeamManagement } from "@/components/TeamManagement";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SubmitProject = () => {
  const { user } = useAuth();
  const { userTeams, refreshTeams } = useTeam();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("individual");
  const [teamHasProject, setTeamHasProject] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    teamName: "",
    title: "",
    description: "",
    problem: "",
    solution: "",
    techStack: "",
    learnings: "",
    demoVideoUrl: "",
    githubUrl: "",
    presentationUrl: "",
    tags: "",
  });

  useEffect(() => {
    refreshTeams();
  }, [refreshTeams]);

  // Check if selected team already has a project
  useEffect(() => {
    const checkTeamProject = async () => {
      if (!selectedTeamId || selectedTeamId === "individual") {
        setTeamHasProject(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("projects")
          .select("id")
          .eq("team_id", selectedTeamId)
          .maybeSingle();

        if (error) throw error;
        setTeamHasProject(!!data);
      } catch (error) {
        console.error("Error checking team project:", error);
      }
    };

    checkTeamProject();
  }, [selectedTeamId]);

  // Auto-fill team name when team is selected
  useEffect(() => {
    if (selectedTeamId && selectedTeamId !== "individual") {
      const team = userTeams.find((ut) => ut.teams?.id === selectedTeamId);
      if (team?.teams?.name) {
        setFormData((prev) => ({ ...prev, teamName: team.teams!.name }));
      }
    } else {
      // Clear team name if switching to individual
      setFormData((prev) => ({ ...prev, teamName: "" }));
    }
  }, [selectedTeamId, userTeams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate team selection for team projects
      if (selectedTeamId && selectedTeamId !== "individual" && teamHasProject) {
        throw new Error("This team already has a project submission");
      }

      let coverImageUrl: string | null = null;

      // Upload cover image if provided
      if (coverImage) {
        setUploadingImage(true);
        const fileExt = coverImage.name.split(".").pop();
        const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
        const filePath = `project-covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("project-images")
          .upload(filePath, coverImage, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(
            "Failed to upload cover image: " + uploadError.message
          );
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("project-images").getPublicUrl(filePath);

        coverImageUrl = publicUrl;
        setUploadingImage(false);
      }

      const { error } = await supabase.from("projects").insert({
        team_id: selectedTeamId === "individual" ? null : selectedTeamId,
        team_name: formData.teamName,
        title: formData.title,
        description: formData.description,
        problem: formData.problem,
        solution: formData.solution,
        tech_stack: formData.techStack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        learnings: formData.learnings,
        demo_video_url: formData.demoVideoUrl,
        github_url: formData.githubUrl,
        presentation_url: formData.presentationUrl,
        tags: formData.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        cover_image: coverImageUrl,
        created_by: user?.id,
        status: "submitted",
      });

      if (error) throw error;

      toast({
        title: "Project submitted! 🎉",
        description:
          selectedTeamId && selectedTeamId !== "individual"
            ? "Your team project has been successfully submitted."
            : "Your project has been successfully submitted.",
      });

      navigate("/my-projects");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Submission failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPG, PNG, GIF, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Cover image must be less than 5MB",
          variant: "destructive",
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

  const availableTeams = userTeams.filter((ut) => ut.teams?.is_active);
  const hasTeams = availableTeams.length > 0;

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
              {/* Team Selection Section */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Team Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasTeams ? (
                    <div className="space-y-2">
                      <Label htmlFor="team">Select Team (Optional)</Label>
                      <div className="flex gap-2">
                        <Select
                          value={selectedTeamId}
                          onValueChange={setSelectedTeamId}
                        >
                          <SelectTrigger id="team" className="flex-1">
                            <SelectValue placeholder="Submit as individual or select a team" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">
                              Submit as Individual
                            </SelectItem>
                            {availableTeams.map((userTeam) => (
                              <SelectItem
                                key={userTeam.teams!.id}
                                value={userTeam.teams!.id}
                              >
                                {userTeam.teams!.name} ({userTeam.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreateTeamModal(true)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          New Team
                        </Button>
                      </div>
                      {selectedTeamId &&
                        selectedTeamId !== "individual" &&
                        teamHasProject && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              This team already has a project submission. Each
                              team can only submit one project.
                            </AlertDescription>
                          </Alert>
                        )}
                      {selectedTeamId &&
                        selectedTeamId !== "individual" &&
                        !teamHasProject && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              All team members will be able to edit this
                              project.
                            </AlertDescription>
                          </Alert>
                        )}
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-3">
                      <p className="text-muted-foreground text-sm">
                        Don't have a team yet?
                      </p>
                      <Button
                        type="button"
                        variant="default"
                        onClick={() => setShowCreateTeamModal(true)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Create Your Team
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Or continue to submit as an individual
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Member Management - Show when team is selected */}
              {selectedTeamId && selectedTeamId !== "individual" && (
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Team Members</CardTitle>
                    <CardDescription>
                      Add and manage your team members for this project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TeamManagement teamId={selectedTeamId} />
                  </CardContent>
                </Card>
              )}

              {/* Cover Image Upload Section */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImagePlus className="h-5 w-5 text-primary" />
                    Project Cover Image
                  </CardTitle>
                  <CardDescription>
                    Upload a cover image for your project (max 5MB){" "}
                    <span className="text-destructive">*</span>
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
                            required
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
                    Team/Individual Name{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="teamName"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    required
                    placeholder="Innovation Squad"
                    disabled={selectedTeamId !== "individual"}
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
                    placeholder="AI-Powered Task Manager"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
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
                  <Label htmlFor="problem">
                    Problem Statement{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="problem"
                    name="problem"
                    required
                    value={formData.problem}
                    onChange={handleChange}
                    placeholder="What problem does this solve?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solution">
                    Solution <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="solution"
                    name="solution"
                    value={formData.solution}
                    onChange={handleChange}
                    required
                    placeholder="How does your project solve it?"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="techStack">
                  Tech Stack (comma-separated){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="techStack"
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleChange}
                  required
                  placeholder="React, Node.js, PostgreSQL, TailwindCSS"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="learnings">
                  Key Learnings <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="learnings"
                  name="learnings"
                  value={formData.learnings}
                  onChange={handleChange}
                  required
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
                  <Label htmlFor="githubUrl">
                    Repository URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="githubUrl"
                    name="githubUrl"
                    type="url"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    required
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="presentationUrl">
                  Presentation URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="presentationUrl"
                  name="presentationUrl"
                  type="url"
                  value={formData.presentationUrl}
                  onChange={handleChange}
                  required
                  placeholder="https://docs.google.com/presentation/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">
                  Tags (comma-separated){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  required
                  placeholder="AI, Healthcare, Education"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    (selectedTeamId !== "individual" && teamHasProject)
                  }
                  className="flex-1"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />

      <CreateTeamModal
        open={showCreateTeamModal}
        onOpenChange={setShowCreateTeamModal}
        onSuccess={refreshTeams}
      />
    </div>
  );
};

export default SubmitProject;
