import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Users, FileText, MessageSquare, Trophy } from "lucide-react";
// import { NavigationHeader } from "@/components/NavigationHeader";
// import { Footer } from "@/components/Footer";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
// import { Eye, Github, ExternalLink } from "lucide-react";

export const AdminProjectsPanel = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    fetchProjects();

    // // Optional: Real-time updates
    // const channel = supabase
    //   .channel("admin-projects")
    //   .on(
    //     "postgres_changes",
    //     { event: "*", schema: "public", table: "projects" },
    //     () => {
    //       fetchProjects(false);
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(channel);
    // };
  }, []);

  const fetchProjects = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*") // you can add .eq('status', 'submitted') if you only want submitted projects
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (e) {
      console.error("Admin projects fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No projects found
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map((p) => (
        <Card key={p.id} className="hover:shadow-sm transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg line-clamp-1">{p.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span className="font-medium">{p.team_name}</span>
              <span className="text-xs rounded-full px-2 py-0.5 border">
                {p.status ?? "—"}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {p.description}
            </p>
            <div className="text-xs text-muted-foreground flex gap-4">
              <span>Likes: {p.likes ?? 0}</span>
              <span>Views: {p.views ?? 0}</span>
              <Button
                size="sm"
                className="ml-auto"
                onClick={() => navigate(`/project/${p.id}`)}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
