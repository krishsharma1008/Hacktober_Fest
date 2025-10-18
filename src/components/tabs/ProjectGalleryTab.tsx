import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Grid3x3, List, Heart, Eye, ExternalLink, Github, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const tags = [
  "All", "AI/ML", "Web", "Mobile", "Cloud", "Automation", 
  "Data/Analytics", "DevTools", "HealthTech", "FinTech", 
  "Sustainability", "Open Source"
];

const sortOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "liked", label: "Most Liked" },
  { value: "judges", label: "Judges' Picks" },
  { value: "alpha", label: "Alphabetical (A–Z)" },
];

export const ProjectGalleryTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>(["All"]);
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'submitted')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Load liked projects from localStorage
  useEffect(() => {
    if (user) {
      const liked = new Set<string>();
      projects.forEach(project => {
        if (localStorage.getItem(`project_liked_${project.id}_${user.id}`)) {
          liked.add(project.id);
        }
      });
      setLikedProjects(liked);
    }
  }, [user, projects]);

  const likeMutation = useMutation({
    mutationFn: async ({ projectId, currentLikes, isLiked }: { projectId: string, currentLikes: number, isLiked: boolean }) => {
      const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;
      
      const { error } = await supabase
        .from('projects')
        .update({ likes: newLikes })
        .eq('id', projectId);
      
      if (error) throw error;
      
      return { projectId, newLikes, isLiked };
    },
    onSuccess: ({ projectId, isLiked }) => {
      if (user) {
        if (isLiked) {
          localStorage.removeItem(`project_liked_${projectId}_${user.id}`);
          setLikedProjects(prev => {
            const next = new Set(prev);
            next.delete(projectId);
            return next;
          });
        } else {
          localStorage.setItem(`project_liked_${projectId}_${user.id}`, 'true');
          setLikedProjects(prev => new Set(prev).add(projectId));
        }
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: () => {
      toast.error('Failed to update like');
    }
  });

  const handleLike = (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to like projects');
      return;
    }
    const isLiked = likedProjects.has(project.id);
    likeMutation.mutate({ 
      projectId: project.id, 
      currentLikes: project.likes || 0,
      isLiked 
    });
  };

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

  const filteredProjects = projects.filter((p) => {
    const title = p.title || '';
    const teamName = p.team_name || '';
    const description = p.description || '';
    const projectTags = p.tags || [];
    
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      projectTags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTags =
      activeTags.includes("All") || projectTags.some((t: string) => activeTags.includes(t));

    return matchesSearch && matchesTags;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "liked":
        return (b.likes || 0) - (a.likes || 0);
      case "alpha":
        return a.title.localeCompare(b.title);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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
          <p className="text-muted-foreground">No projects match your filters. Clear filters to see all projects.</p>
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
                  {images.length > 0 ? (
                    <img
                      src={images[0]}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
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
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{project.team_name}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {projectTags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <button
                        onClick={(e) => handleLike(e, project)}
                        className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${likedProjects.has(project.id) ? 'fill-current text-primary' : ''}`} />
                        {project.likes || 0}
                      </button>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        {project.views || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
};
