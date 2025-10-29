import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface NewThreadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const NewThreadModal = ({ open, onOpenChange, onSuccess }: NewThreadModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create a discussion',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('discussions')
        .insert({
          title: formData.title.trim(),
          content: formData.content.trim(),
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Thread Created! 🎉',
        description: 'Your discussion thread has been created successfully.',
      });

      // Reset form
      setFormData({ title: '', content: '' });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating thread:', error);
      toast({
        title: 'Error Creating Thread',
        description: error.message || 'Failed to create discussion thread',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Start a New Discussion</DialogTitle>
          <DialogDescription>
            Ask questions, share ideas, or start a conversation with other participants
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Thread Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What's on your mind?"
              required
              disabled={isLoading}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/200 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Describe your question or topic in detail..."
              required
              disabled={isLoading}
              rows={6}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {formData.content.length}/2000 characters
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.title.trim() || !formData.content.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Thread
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};




