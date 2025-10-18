import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const UpdatesTab = () => {
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Updates</h1>
          <p className="text-lg text-muted-foreground">
            Stay informed with the latest news and announcements
          </p>
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
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(update.created_at), 'MMMM d, yyyy')}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{update.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-12 shadow-medium bg-muted">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Want to receive updates via email?{" "}
              <a href="mailto:zapminds@zapcomgroup.com" className="text-primary hover:underline font-medium">
                Subscribe to our newsletter
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
