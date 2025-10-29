import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { NewThreadModal } from "@/components/NewThreadModal";
import { DiscussionDetailModal } from "@/components/DiscussionDetailModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const DiscussionsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<
    string | null
  >(null);

  const {
    data: discussions = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["discussions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((d) => d.created_by))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        // Merge profiles with discussions
        return data.map((discussion) => ({
          ...discussion,
          profiles:
            profiles?.find((p) => p.id === discussion.created_by) || null,
        }));
      }

      return data || [];
    },
  });

  const handleNewThread = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a discussion",
        variant: "destructive",
      });
      return;
    }
    setShowNewThreadModal(true);
  };

  const handleThreadClick = (discussionId: string) => {
    setSelectedDiscussionId(discussionId);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Discussions</h1>
            <p className="text-lg text-muted-foreground">
              Connect with participants and get your questions answered
            </p>
          </div>
          <Button
            className="bg-accent hover:bg-accent/90"
            onClick={handleNewThread}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            New Thread
          </Button>
        </div>

        {/* Thread List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading discussions...</p>
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No discussions yet. Be the first to start one!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Card
                key={discussion.id}
                className="shadow-soft hover:shadow-medium transition-all hover:scale-[1.01] cursor-pointer"
                onClick={() => handleThreadClick(discussion.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {discussion.title}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>
                          by{" "}
                          {discussion.profiles?.full_name ||
                            discussion.profiles?.email ||
                            "Anonymous"}
                        </span>
                        <span>•</span>
                        <span>
                          {format(
                            new Date(discussion.created_at),
                            "MMM d, yyyy"
                          )}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {discussion.reply_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {discussion.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Popular Topics */}
        {/* <Card className="mt-12 shadow-medium">
          <CardHeader>
            <CardTitle>Popular Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["Team Building", "React", "AI/ML", "AWS", "Docker", "UI/UX", "API Integration", "Testing"].map(
                (topic) => (
                  <Badge key={topic} variant="outline" className="cursor-pointer hover:bg-muted">
                    {topic}
                  </Badge>
                )
              )}
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Modals */}
      <NewThreadModal
        open={showNewThreadModal}
        onOpenChange={setShowNewThreadModal}
        onSuccess={refetch}
      />
      <DiscussionDetailModal
        discussionId={selectedDiscussionId}
        open={!!selectedDiscussionId}
        onOpenChange={(open) => !open && setSelectedDiscussionId(null)}
      />
    </div>
  );
};
