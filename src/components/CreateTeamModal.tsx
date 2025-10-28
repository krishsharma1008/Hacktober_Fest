/**
 * CreateTeamModal Component
 * Modal for creating a new team with validation
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '@/contexts/TeamContext';
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
import { Loader2, Users } from 'lucide-react';

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateTeamModal = ({ open, onOpenChange, onSuccess }: CreateTeamModalProps) => {
  const navigate = useNavigate();
  const { createTeam } = useTeam();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Team name is required',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const team = await createTeam(formData.name.trim(), formData.description.trim() || undefined);
      
      toast({
        title: 'Team Created! 🎉',
        description: `${team.name} has been successfully created.`,
      });

      // Reset form
      setFormData({ name: '', description: '' });
      onOpenChange(false);
      
      // Call success callback if provided, otherwise navigate to submit project
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/submit-project');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Handle specific error cases
      let errorMessage = 'Failed to create team';
      
      if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
        errorMessage = `Team name "${formData.name}" is already taken. Please choose a different name.`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error Creating Team',
        description: errorMessage,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Create Your Team
          </DialogTitle>
          <DialogDescription>
            Start collaborating with your teammates. You'll be the team owner and can add members later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Team Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Innovation Squad"
              required
              disabled={isLoading}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              Choose a unique name for your team (max 50 characters)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your team's focus or goals..."
              rows={3}
              disabled={isLoading}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/200 characters
            </p>
          </div>

          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium mb-1">Team Guidelines:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Maximum 5 members per team</li>
              <li>• Each team can submit only 1 project</li>
              <li>• All team members can edit the project</li>
              <li>• You'll be the team owner with admin privileges</li>
            </ul>
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
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

