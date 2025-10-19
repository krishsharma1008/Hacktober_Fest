import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, MessageCircle, Trash2, Send } from 'lucide-react';
import { format } from 'date-fns';

interface DiscussionDetailModalProps {
  discussionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Reply {
  id: string;
  content: string;
  created_by: string;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
  };
}

export const DiscussionDetailModal = ({ discussionId, open, onOpenChange }: DiscussionDetailModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'discussion' | 'reply'; id: string } | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (!error && data) {
        setIsAdmin(data.role === 'admin');
      }
    };
    
    checkAdminStatus();
  }, [user]);

  // Fetch discussion details
  const { data: discussion, isLoading: discussionLoading } = useQuery({
    queryKey: ['discussion', discussionId],
    queryFn: async () => {
      if (!discussionId) return null;
      
      const { data, error } = await supabase
        .from('discussions')
        .select('*')
        .eq('id', discussionId)
        .single();
      
      if (error) throw error;

      // Fetch profile separately
      if (data) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', data.created_by)
          .single();

        return {
          ...data,
          profiles: profile || null
        };
      }
      
      return data;
    },
    enabled: !!discussionId && open,
  });

  // Fetch replies
  const { data: replies = [], isLoading: repliesLoading } = useQuery({
    queryKey: ['discussion_replies', discussionId],
    queryFn: async () => {
      if (!discussionId) return [];
      
      const { data, error } = await supabase
        .from('discussion_replies')
        .select('*')
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.created_by))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        // Merge profiles with replies
        return data.map(reply => ({
          ...reply,
          profiles: profiles?.find(p => p.id === reply.created_by) || null
        })) as Reply[];
      }
      
      return (data || []) as Reply[];
    },
    enabled: !!discussionId && open,
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!discussionId || !user) throw new Error('Missing required data');
      
      const { error } = await supabase
        .from('discussion_replies')
        .insert({
          discussion_id: discussionId,
          content: content.trim(),
          created_by: user.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setReplyContent('');
      queryClient.invalidateQueries({ queryKey: ['discussion_replies', discussionId] });
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      toast({
        title: 'Reply posted! 💬',
        description: 'Your reply has been added to the discussion.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error posting reply',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: 'discussion' | 'reply'; id: string }) => {
      if (type === 'discussion') {
        const { error } = await supabase
          .from('discussions')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('discussion_replies')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      if (variables.type === 'discussion') {
        queryClient.invalidateQueries({ queryKey: ['discussions'] });
        onOpenChange(false);
        toast({
          title: 'Thread deleted',
          description: 'The discussion thread has been removed.',
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['discussion_replies', discussionId] });
        queryClient.invalidateQueries({ queryKey: ['discussions'] });
        toast({
          title: 'Reply deleted',
          description: 'The reply has been removed.',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to reply',
        variant: 'destructive',
      });
      return;
    }
    if (replyContent.trim()) {
      createReplyMutation.mutate(replyContent);
    }
  };

  const handleDelete = (type: 'discussion' | 'reply', id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const canDelete = (createdBy: string) => {
    return user && (user.id === createdBy || isAdmin);
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const isLoading = discussionLoading || repliesLoading;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : discussion ? (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">{discussion.title}</DialogTitle>
                    <DialogDescription className="flex items-center gap-3 text-sm">
                      <span>by {discussion.profiles?.full_name || discussion.profiles?.email || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{format(new Date(discussion.created_at), 'MMM d, yyyy h:mm a')}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {discussion.reply_count || 0} {discussion.reply_count === 1 ? 'reply' : 'replies'}
                      </span>
                    </DialogDescription>
                  </div>
                  {canDelete(discussion.created_by) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete('discussion', discussion.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Original Post */}
                <Card className="border-2 border-primary/20">
                  <CardContent className="pt-6">
                    <p className="text-foreground whitespace-pre-wrap">{discussion.content}</p>
                  </CardContent>
                </Card>

                {/* Replies */}
                {replies.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Replies</h3>
                    {replies.map((reply) => (
                      <Card key={reply.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(reply.profiles?.full_name || null, reply.profiles?.email || '')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-medium">
                                    {reply.profiles?.full_name || reply.profiles?.email || 'Anonymous'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(reply.created_at), 'MMM d, yyyy h:mm a')}
                                  </p>
                                </div>
                                {canDelete(reply.created_by) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete('reply', reply.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                              <p className="text-foreground whitespace-pre-wrap">{reply.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                <form onSubmit={handleSubmitReply} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="reply" className="text-sm font-medium">
                      Add a reply
                    </label>
                    <Textarea
                      id="reply"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={user ? "Share your thoughts..." : "Sign in to reply..."}
                      rows={4}
                      disabled={!user || createReplyMutation.isPending}
                      maxLength={2000}
                    />
                    <p className="text-xs text-muted-foreground">
                      {replyContent.length}/2000 characters
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!user || !replyContent.trim() || createReplyMutation.isPending}
                    className="w-full"
                  >
                    {createReplyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Send className="mr-2 h-4 w-4" />
                    Post Reply
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Discussion not found</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this{' '}
              {itemToDelete?.type === 'discussion' ? 'thread and all its replies' : 'reply'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

