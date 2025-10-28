/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TeamManagement Component
 * Displays and manages team members with role management
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Loader2, UserPlus, UserMinus, Crown, Shield, User, Mail } from 'lucide-react';

interface TeamManagementProps {
  teamId: string;
}

interface TeamMemberWithProfile {
  id: string;
  role: string;
  joined_at: string | null;
  user_id: string;
  profiles?: {
    id: string;
    email: string;
    full_name: string | null;
    github: string | null;
    linkedin: string | null;
  };
}

export const TeamManagement = ({ teamId }: TeamManagementProps) => {
  const { user } = useAuth();
  const { currentTeam, selectTeam, addMember, removeMember, updateMemberRole } = useTeam();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  // Load team details
  useEffect(() => {
    const loadTeam = async () => {
      try {
        await selectTeam(teamId);
      } catch (error) {
        console.error('Error loading team:', error);
      }
    };
    loadTeam();
  }, [teamId, selectTeam]);

  // Check if current user is admin
  useEffect(() => {
    if (!currentTeam || !user) return;
    
    const currentUserMember = currentTeam.team_members?.find(
      (m: any) => m.user_id === user.id
    );
    
    setIsUserAdmin(
      currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin'
    );
  }, [currentTeam, user]);

  const handleAddMember = async () => {
    
    if (!newMemberEmail.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await addMember(teamId, newMemberEmail.trim(), newMemberRole);
      
      toast({
        title: 'Member Added! 🎉',
        description: `${newMemberEmail} has been added to the team.`,
      });
      
      setNewMemberEmail('');
      setNewMemberRole('member');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add member';
      toast({
        title: 'Error Adding Member',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setIsLoading(true);

    try {
      await removeMember(memberId);
      
      toast({
        title: 'Member Removed',
        description: 'The member has been removed from the team.',
      });
      
      setMemberToRemove(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove member';
      toast({
        title: 'Error Removing Member',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setIsLoading(true);

    try {
      await updateMemberRole(memberId, newRole);
      
      toast({
        title: 'Role Updated',
        description: 'Member role has been updated successfully.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update role';
      toast({
        title: 'Error Updating Role',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!currentTeam) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const members = (currentTeam.team_members || []) as TeamMemberWithProfile[];
  const memberCount = members.length;
  const maxMembers = currentTeam.max_members || 5;

  return (
    <div className="space-y-6">
      {/* Add Member Section */}
      {isUserAdmin && memberCount < maxMembers && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Invite Team Member
            </CardTitle>
            <CardDescription>
              Add members by their registered email address ({memberCount}/{maxMembers} members)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newMemberEmail.trim()) {
                          e.preventDefault();
                          handleAddMember();
                        }
                      }}
                      placeholder="teammate@example.com"
                      disabled={isLoading}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newMemberRole}
                    onValueChange={setNewMemberRole}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="button"
                onClick={handleAddMember}
                disabled={isLoading || !newMemberEmail.trim()}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({memberCount})</CardTitle>
          <CardDescription>
            Manage your team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                    {member.profiles?.full_name?.[0]?.toUpperCase() || 
                     member.profiles?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium">
                      {member.profiles?.full_name || 'Unknown User'}
                      {member.user_id === user?.id && (
                        <span className="text-xs text-muted-foreground ml-2">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isUserAdmin && member.role !== 'owner' ? (
                      <Select
                        value={member.role}
                        onValueChange={(role) => handleRoleChange(member.id, role)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-32">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(member.role)}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </Badge>
                    )}

                    {isUserAdmin && member.role !== 'owner' && member.user_id !== user?.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setMemberToRemove(member.id)}
                        disabled={isLoading}
                      >
                        <UserMinus className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the team? They will lose access to the team's project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToRemove && handleRemoveMember(memberToRemove)}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

