import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, FileText, MessageSquare, Trophy } from 'lucide-react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    totalUpdates: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [projects, profiles, discussions, updates] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('discussions').select('id', { count: 'exact', head: true }),
        supabase.from('updates').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalProjects: projects.count || 0,
        totalParticipants: profiles.count || 0,
        totalDiscussions: discussions.count || 0,
        totalUpdates: updates.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your hackathon platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants}</div>
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
              </TabsList>

              <TabsContent value="projects" className="mt-6">
                <p className="text-muted-foreground">
                  Project management features will be displayed here
                </p>
              </TabsContent>

              <TabsContent value="users" className="mt-6">
                <p className="text-muted-foreground">
                  User management features will be displayed here
                </p>
              </TabsContent>

              <TabsContent value="updates" className="mt-6">
                <p className="text-muted-foreground">
                  Updates management features will be displayed here
                </p>
              </TabsContent>

              <TabsContent value="discussions" className="mt-6">
                <p className="text-muted-foreground">
                  Discussions management features will be displayed here
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
