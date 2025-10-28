/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminProjectsPanel } from "@/components/admin/AdminProjectsPanel";
import { ParticipantsTab } from "@/components/tabs/ParticipantsTab";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Stats {
  totalProjects: number;
  totalParticipants: number;
  totalDiscussions: number;
  totalUpdates: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalParticipants: 0,
    totalDiscussions: 0,
    totalUpdates: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
    };
    fetchUser();
  }, []);

  const fetchStats = async () => {
    try {
      const [projects, profiles, discussions, updates] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("discussions")
          .select("id", { count: "exact", head: true }),
        supabase.from("updates").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalProjects: projects.count || 0,
        totalParticipants: profiles.count || 0,
        totalDiscussions: discussions.count || 0,
        totalUpdates: updates.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const { data: isAdmin = false } = useQuery({
    queryKey: ["is-admin", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      if (error) throw error;
      return Boolean(data);
    },
    enabled: !!userId, // prevents running when userId = null
  });

  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async (userIdToDelete: string) => {
      if (!isAdmin) throw new Error("Only admins can delete users");

      // 1) memberships
      const { error: tmErr } = await supabase
        .from("team_members")
        .delete()
        .eq("user_id", userIdToDelete);
      if (tmErr) throw tmErr;

      // 2) roles
      const { error: urErr } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userIdToDelete);
      if (urErr) throw urErr;

      // 3) profile
      const { error: profErr } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userIdToDelete);
      if (profErr) throw profErr;

      // ✅ verify deletion actually happened
      const { data: stillThere, error: verifyErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userIdToDelete)
        .maybeSingle();
      if (verifyErr) throw verifyErr;
      if (stillThere) {
        throw new Error("Profile delete did not apply (RLS or policy issue).");
      }
    },
    onSuccess: () => {
      toast.success("User removed");
      // Invalidate EXACTLY what ParticipantsTab uses
      // (adjust if your keys differ)
      queryClient.invalidateQueries({
        queryKey: ["participants-with-teams-multi"],
      });
    },
    onError: (e: any) => {
      console.error(e);
      toast.error(e?.message || "Failed to remove user");
    },
  });

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
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your hackathon platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Projects
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Participants
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalParticipants}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Discussions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDiscussions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Updates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUpdates}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Management</CardTitle>
            <CardDescription>Manage platform content and users</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="projects">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                {/* <TabsTrigger value="updates">Updates</TabsTrigger> */}
                {/* <TabsTrigger value="discussions">Discussions</TabsTrigger> */}
              </TabsList>

              {/* <TabsContent value="projects" className="mt-6">
                <p className="text-muted-foreground">
                  Project management features will be displayed here
                </p>
              </TabsContent> */}
              <TabsContent value="projects" className="mt-6">
                <AdminProjectsPanel />
              </TabsContent>

              {/* <TabsContent value="users" className="mt-6">
                <p className="text-muted-foreground">
                  User management features will be displayed here
                </p>
              </TabsContent> */}
              <TabsContent value="users" className="mt-6">
                <ParticipantsTab
                  hideHeader
                  renderActions={(u) =>
                    isAdmin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const ok = window.confirm(
                            `Remove ${
                              u.full_name || u.email
                            }? This deletes profile, roles, and team memberships. (Auth account remains)`
                          );
                          if (ok) deleteUserMutation.mutate(u.id);
                        }}
                        disabled={deleteUserMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deleteUserMutation.isPending
                          ? "Removing…"
                          : "Remove User"}
                      </Button>
                    )
                  }
                />
              </TabsContent>

              {/* <TabsContent value="updates" className="mt-6">
                <p className="text-muted-foreground">
                  Updates management features will be displayed here
                </p>
              </TabsContent>

              <TabsContent value="discussions" className="mt-6">
                <p className="text-muted-foreground">
                  Discussions management features will be displayed here
                </p>
              </TabsContent> */}
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
