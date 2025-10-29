import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Grid3x3,
  List,
  Heart,
  Eye,
  ExternalLink,
  Github,
  Play,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useProjectInteractions } from "@/hooks/use-project-interactions";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;

const tags = [
  "All",
  "AI/ML",
  "WEB",
  "Mobile",
  "Cloud",
  "Automation",
  "Data/Analytics",
  "DevTools",
  "HealthTech",
  "FinTech",
  "Sustainability",
  "Open Source",
];

const sortOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "liked", label: "Most Liked" },
  { value: "judges", label: "Judges' Picks" },
  { value: "alpha", label: "Alphabetical (A–Z)" },
];

// Project Like Button Component
const ProjectLikeButton = ({
  projectId,
  likes,
}: {
  projectId: string;
  likes: number;
}) => {
  const { userLiked, toggleLike, isTogglingLike } =
    useProjectInteractions(projectId);
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
      title={user ? (userLiked ? "Unlike" : "Like") : "Sign in to like"}
    >
      <Heart
        className={`w-4 h-4 transition-all ${
          userLiked ? "fill-red-500 text-red-500" : ""
        } ${isTogglingLike ? "scale-110" : ""}`}
      />
      {likes || 0}
    </button>
  );
};

export const ProjectGalleryTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>(["All"]);
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const selectedProjectInteractions = useProjectInteractions(
    selectedProject?.id || ""
  );

  // Record view when project modal opens
  useEffect(() => {
    if (selectedProject?.id) {
      selectedProjectInteractions.recordView();
    }
  }, [selectedProject?.id, selectedProjectInteractions]);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "submitted")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Project[];
    },
  });

  const toggleTag = (tag: string) => {
    if (tag === "All") {
      setActiveTags(["All"]);
    } else {
      const newTags = activeTags.includes(tag)
        ? activeTags.filter((t) => t !== tag)
        : [...activeTags.filter((t) => t !== "All"), tag];
      setActiveTags(newTags.length === 0 ? ["All"] : newTags);
    }
  };

  // const filteredProjects = projects.filter((p) => {
  //   const title = p.title || "";
  //   const teamName = p.team_name || "";
  //   const description = p.description || "";
  //   const projectTags = p.tags || [];

  //   const matchesSearch =
  //     title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     description.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     projectTags.some((t: string) =>
  //       t.toLowerCase().includes(searchQuery.toLowerCase())
  //     );

  //   const matchesTags =
  //     activeTags.includes("All") ||
  //     projectTags.some((t: string) => activeTags.includes(t));

  //   return matchesSearch && matchesTags;
  // });

  const filteredProjects = projects.filter((p) => {
    const title = p.title || "";
    const teamName = p.team_name || "";
    const description = p.description || "";
    const projectTags = (p.tags || []).map(String);

    const q = searchQuery.toLowerCase();

    const matchesSearch =
      title.toLowerCase().includes(q) ||
      teamName.toLowerCase().includes(q) ||
      description.toLowerCase().includes(q) ||
      projectTags.some((t) => t.toLowerCase().includes(q));

    // ✅ Case-insensitive tag comparison
    const activeSet = new Set(activeTags.map((t) => t.toLowerCase()));
    const matchesTags =
      activeSet.has("all") ||
      projectTags.some((t) => activeSet.has(t.toLowerCase()));

    return matchesSearch && matchesTags;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "liked":
        return (b.likes || 0) - (a.likes || 0);
      case "alpha":
        return a.title.localeCompare(b.title);
      default:
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Project Gallery</h1>
        <p className="text-lg text-muted-foreground">
          Explore innovative submissions from Hacktoberfest 2025
        </p>
      </div>

      {/* Controls */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm py-4 mb-8 space-y-4 border-b border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-input rounded-md bg-background"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="w-5 h-5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={activeTags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects Grid/List */}
      {isLoading ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      ) : sortedProjects.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            No projects match your filters. Clear filters to see all projects.
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {sortedProjects.map((project) => {
            const images = project.images || [];
            const projectTags = project.tags || [];

            return (
              <Card
                key={project.id}
                className="shadow-soft hover:shadow-medium transition-all hover:scale-[1.02] cursor-pointer overflow-hidden group"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {project.cover_image || images.length > 0 ? (
                    <img
                      src={project.cover_image || images[0]}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                      onError={(e) => {
                        if (project.cover_image && images.length > 0) {
                          e.currentTarget.src = images[0];
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <p className="text-muted-foreground">No image</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="sm" variant="secondary" className="shadow-lg">
                      View Details
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                    {project.team_name}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {projectTags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <ProjectLikeButton
                      projectId={project.id}
                      likes={project.likes || 0}
                    />
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      {project.views || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Project Modal */}
      <Dialog
        open={!!selectedProject}
        onOpenChange={() => setSelectedProject(null)}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedProject.title}
                </DialogTitle>
                <p className="text-muted-foreground">
                  by {selectedProject.team_name}
                </p>
              </DialogHeader>

              <div className="space-y-6">
                {/* Media Gallery */}
                {(selectedProject.cover_image ||
                  (selectedProject.images &&
                    selectedProject.images.length > 0)) && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={
                        selectedProject.cover_image || selectedProject.images[0]
                      }
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        if (
                          selectedProject.cover_image &&
                          selectedProject.images &&
                          selectedProject.images.length > 0
                        ) {
                          e.currentTarget.src = selectedProject.images[0];
                        }
                      }}
                    />
                  </div>
                )}

                {/* Tags */}
                {selectedProject.tags && selectedProject.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-wrap gap-3">
                  {selectedProject.demo_video_url && (
                    <Button size="sm" variant="default" asChild>
                      <a
                        href={selectedProject.demo_video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Demo Video
                      </a>
                    </Button>
                  )}
                  {selectedProject.github_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={selectedProject.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        Repository
                      </a>
                    </Button>
                  )}
                  {selectedProject.presentation_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={selectedProject.presentation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Presentation
                      </a>
                    </Button>
                  )}
                </div>

                {/* Details Tabs */}
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="problem">Problem</TabsTrigger>
                    <TabsTrigger value="solution">Solution</TabsTrigger>
                    <TabsTrigger value="learnings">Learnings</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="mt-4">
                    <p className="text-muted-foreground">
                      {selectedProject.description ||
                        "No description provided."}
                    </p>
                  </TabsContent>
                  <TabsContent value="problem" className="mt-4">
                    <p className="text-muted-foreground">
                      {selectedProject.problem ||
                        "No problem statement provided."}
                    </p>
                  </TabsContent>
                  <TabsContent value="solution" className="mt-4">
                    <p className="text-muted-foreground">
                      {selectedProject.solution || "No solution provided."}
                    </p>
                  </TabsContent>
                  <TabsContent value="learnings" className="mt-4">
                    <p className="text-muted-foreground">
                      {selectedProject.learnings || "No learnings provided."}
                    </p>
                    {selectedProject.tech_stack &&
                      selectedProject.tech_stack.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Tech Stack:</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.tech_stack.map((tech: string) => (
                              <Badge key={tech} variant="outline">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </TabsContent>
                </Tabs>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex gap-6 items-center">
                    <button
                      onClick={() => selectedProjectInteractions.toggleLike()}
                      disabled={selectedProjectInteractions.isTogglingLike}
                      className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <Heart
                        className={`w-5 h-5 transition-all ${
                          selectedProjectInteractions.userLiked
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                      {selectedProject.likes || 0} likes
                    </button>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="w-5 h-5" />
                      {selectedProject.views || 0} views
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
