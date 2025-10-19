import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const UpdatesTab = () => {
  const { role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ title: "", content: "" });

  const { data: updates = [], isLoading } = useQuery({
    queryKey: ['updates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Create update mutation
  const createUpdateMutation = useMutation({
    mutationFn: async (updateData: { title: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('updates')
        .insert({
          title: updateData.title,
          content: updateData.content,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['updates'] });
      toast({
        title: "Success",
        description: "Update posted successfully!",
      });
      setIsDialogOpen(false);
      setNewUpdate({ title: "", content: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete update mutation
  const deleteUpdateMutation = useMutation({
    mutationFn: async (updateId: string) => {
      const { error } = await supabase
        .from('updates')
        .delete()
        .eq('id', updateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['updates'] });
      toast({
        title: "Success",
        description: "Update deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateUpdate = () => {
    if (!newUpdate.title.trim() || !newUpdate.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    createUpdateMutation.mutate(newUpdate);
  };

  const handleDeleteUpdate = (updateId: string) => {
    if (confirm("Are you sure you want to delete this update?")) {
      deleteUpdateMutation.mutate(updateId);
    }
  };

  const isAdmin = role === 'admin';

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4">Updates</h1>
              <p className="text-lg text-muted-foreground">
                Stay informed with the latest news and announcements
              </p>
            </div>
            
            {isAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="ml-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Post Update
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Update</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Title
                      </label>
                      <Input
                        id="title"
                        placeholder="Enter update title"
                        value={newUpdate.title}
                        onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="content" className="text-sm font-medium">
                        Content
                      </label>
                      <Textarea
                        id="content"
                        placeholder="Enter update content"
                        value={newUpdate.content}
                        onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
                        rows={6}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateUpdate}
                      disabled={createUpdateMutation.isPending}
                    >
                      {createUpdateMutation.isPending ? "Posting..." : "Post Update"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading updates...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No updates yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {updates.map((update) => (
              <Card key={update.id} className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <CardTitle className="text-xl">{update.title}</CardTitle>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUpdate(update.id)}
                        disabled={deleteUpdateMutation.isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(update.created_at), 'MMMM d, yyyy')}</span>
                    {isAdmin && (
                      <Badge variant="secondary" className="ml-2">Admin</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{update.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-12 shadow-medium bg-muted">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Want to receive updates via email?{" "}
              <a href="mailto:zapminds@zapcg.com" className="text-primary hover:underline font-medium">
                Subscribe to our newsletter
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
