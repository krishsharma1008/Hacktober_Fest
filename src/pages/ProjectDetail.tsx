import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Eye,
  Github,
  Play,
  ExternalLink,
  Edit,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { Trash2 } from "lucide-react";
import JudgeReview from "@/components/JudgeReview";
import AdminFeedbackPanel from "@/components/AdminFeedbackPanel";

const ProjectDetail = () => {
  // const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: projectId } = useParams<{ id: string }>();

  const { data: isAdmin = false } = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user!.id,
        _role: "admin",
      });
      if (error) throw error;
      return Boolean(data);
    },
  });

  const { userTeams } = useTeam();
  const queryClient = useQueryClient();
  const [hasLiked, setHasLiked] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  // Check if user can edit this project
  useEffect(() => {
    console.log("user", user);
    if (!user || !project) {
      setCanEdit(false);
      return;
    }

    // User created the project
    if (project.created_by === user.id || isAdmin) {
      setCanEdit(true);
      return;
    }

    // Check if user is a team member
    if (project.team_id) {
      const isTeamMember = userTeams.some(
        (ut) => ut.teams?.id === project.team_id
      );
      setCanEdit(isTeamMember);
    } else {
      setCanEdit(false);
    }
  }, [user, project, userTeams]);

  // Check if user has liked this project
  useEffect(() => {
    if (user && projectId) {
      const liked = localStorage.getItem(
        `project_liked_${projectId}_${user.id}`
      );
      setHasLiked(!!liked);
    }
  }, [user, projectId]);

  const incrementViews = useCallback(async () => {
    if (!projectId) return;

    try {
      const { error } = await supabase.rpc("record_project_view", {
        p_project_id: projectId,
      });

      if (error) {
        // Fallback if RPC doesn't exist
        const { data: currentProject } = await supabase
          .from("projects")
          .select("views")
          .eq("id", projectId)
          .single();

        if (currentProject) {
          await supabase
            .from("projects")
            .update({ views: (currentProject.views || 0) + 1 })
            .eq("id", projectId);
        }
      }
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  }, [projectId]);

  // Increment view count on mount
  useEffect(() => {
    if (projectId) {
      incrementViews();
    }
  }, [projectId, incrementViews]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!project || !user) return;

      const newLikes = hasLiked
        ? (project.likes || 0) - 1
        : (project.likes || 0) + 1;

      const { error } = await supabase
        .from("projects")
        .update({ likes: newLikes })
        .eq("id", project.id);

      if (error) throw error;

      return { newLikes };
    },
    onSuccess: () => {
      if (user) {
        if (hasLiked) {
          localStorage.removeItem(`project_liked_${projectId}_${user.id}`);
          setHasLiked(false);
        } else {
          localStorage.setItem(`project_liked_${projectId}_${user.id}`, "true");
          setHasLiked(true);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast.error("Failed to update like");
    },
  });

  const handleLike = () => {
    if (!user) {
      toast.error("Please sign in to like projects");
      return;
    }
    likeMutation.mutate();
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) return;

      // Optional: cleanup related rows or storage objects before delete if needed.

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Project deleted");
      // Invalidate lists so UI updates elsewhere
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      // Navigate out of detail view
      navigate("/projects");
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });

  const handleDelete = () => {
    if (!isAdmin) {
      toast.error("Only admins can delete projects");
      return;
    }
    const ok = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    );
    if (ok) deleteMutation.mutate();
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
          <Button onClick={() => navigate("/projects")}>
            Back to Projects
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

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
              <p className="text-xl text-muted-foreground">
                by {project.team_name}
              </p>
            </div>
            <div>
              {canEdit && (
                <Button
                  onClick={() => navigate(`/edit-project/${project.id}`)}
                  variant="outline"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Project
                </Button>
              )}

              {isAdmin && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete Project
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center mb-6">
            <Button
              onClick={handleLike}
              variant={hasLiked ? "default" : "outline"}
              disabled={likeMutation.isPending}
            >
              <Heart
                className={`w-5 h-5 mr-2 ${hasLiked ? "fill-current" : ""}`}
              />
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
              <a
                href={project.demo_video_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </a>
            </Button>
          )}
          {project.github_url && (
            <Button variant="outline" asChild>
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4 mr-2" />
                Repository
              </a>
            </Button>
          )}
          {project.presentation_url && (
            <Button variant="outline" asChild>
              <a
                href={project.presentation_url}
                target="_blank"
                rel="noopener noreferrer"
              >
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
                  {project.description || "No description provided."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="problem">
            <Card>
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {project.problem || "No problem statement provided."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="solution">
            <Card>
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {project.solution || "No solution provided."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learnings">
            <Card>
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed whitespace-pre-wrap mb-6">
                  {project.learnings || "No learnings provided."}
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

        {projectId && <JudgeReview projectId={projectId} />}
        {isAdmin && projectId && <AdminFeedbackPanel projectId={projectId} />}
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
