/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Team Context
 * Manages team state and provides team operations throughout the application
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  getUserTeams,
  getTeam,
  createTeam as createTeamAPI,
  addTeamMember as addTeamMemberAPI,
  removeTeamMember as removeTeamMemberAPI,
  updateMemberRole as updateMemberRoleAPI,
  leaveTeam as leaveTeamAPI,
  updateTeam as updateTeamAPI,
  isTeamAdmin as checkIsTeamAdmin,
  teamHasProject as checkTeamHasProject,
  Team,
} from '@/integrations/supabase/teams';

interface TeamWithDetails extends Team {
  team_members?: any[];
  projects?: any[];
}

interface UserTeamMembership {
  id: string;
  role: string;
  joined_at: string | null;
  teams: TeamWithDetails | null;
}

interface TeamContextType {
  userTeams: UserTeamMembership[];
  currentTeam: TeamWithDetails | null;
  loading: boolean;
  error: string | null;
  
  // Team operations
  refreshTeams: () => Promise<void>;
  selectTeam: (teamId: string) => Promise<void>;
  createTeam: (name: string, description?: string) => Promise<Team>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  
  // Member operations
  addMember: (teamId: string, email: string, role?: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: string) => Promise<void>;
  leaveTeam: (teamId: string) => Promise<void>;
  
  // Utility functions
  isAdmin: (teamId: string) => Promise<boolean>;
  canSubmitProject: (teamId: string) => Promise<boolean>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

interface TeamProviderProps {
  children: ReactNode;
}

export const TeamProvider = ({ children }: TeamProviderProps) => {
  const { user } = useAuth();
  const [userTeams, setUserTeams] = useState<UserTeamMembership[]>([]);
  const [currentTeam, setCurrentTeam] = useState<TeamWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's teams
  const refreshTeams = useCallback(async () => {
    if (!user) {
      setUserTeams([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const teams = await getUserTeams(user.id);
      setUserTeams(teams as UserTeamMembership[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load teams';
      setError(errorMessage);
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load teams when user changes
  useEffect(() => {
    refreshTeams();
  }, [refreshTeams]);

  // Select a team and load its details
  const selectTeam = useCallback(async (teamId: string) => {
    try {
      setLoading(true);
      setError(null);
      const team = await getTeam(teamId);
      setCurrentTeam(team as TeamWithDetails);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load team details';
      setError(errorMessage);
      console.error('Error selecting team:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new team
  const createTeam = useCallback(async (name: string, description?: string) => {
    try {
      setError(null);
      const team = await createTeamAPI({ name, description });
      await refreshTeams();
      return team;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create team';
      setError(errorMessage);
      console.error('Error creating team:', err);
      throw err;
    }
  }, [refreshTeams]);

  // Update team
  const updateTeam = useCallback(async (teamId: string, updates: Partial<Team>) => {
    try {
      setError(null);
      await updateTeamAPI(teamId, updates);
      await refreshTeams();
      if (currentTeam?.id === teamId) {
        await selectTeam(teamId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update team';
      setError(errorMessage);
      console.error('Error updating team:', err);
      throw err;
    }
  }, [refreshTeams, currentTeam, selectTeam]);

  // Delete team (soft delete)
  const deleteTeam = useCallback(async (teamId: string) => {
    try {
      setError(null);
      await updateTeamAPI(teamId, { is_active: false });
      await refreshTeams();
      if (currentTeam?.id === teamId) {
        setCurrentTeam(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete team';
      setError(errorMessage);
      console.error('Error deleting team:', err);
      throw err;
    }
  }, [refreshTeams, currentTeam]);

  // Add member to team
  const addMember = useCallback(async (teamId: string, email: string, role: string = 'member') => {
    try {
      setError(null);
      await addTeamMemberAPI(teamId, email, role);
      await refreshTeams();
      if (currentTeam?.id === teamId) {
        await selectTeam(teamId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add member';
      setError(errorMessage);
      console.error('Error adding member:', err);
      throw err;
    }
  }, [refreshTeams, currentTeam, selectTeam]);

  // Remove member from team
  const removeMember = useCallback(async (memberId: string) => {
    try {
      setError(null);
      await removeTeamMemberAPI(memberId);
      await refreshTeams();
      if (currentTeam) {
        await selectTeam(currentTeam.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove member';
      setError(errorMessage);
      console.error('Error removing member:', err);
      throw err;
    }
  }, [refreshTeams, currentTeam, selectTeam]);

  // Update member role
  const updateMemberRole = useCallback(async (memberId: string, role: string) => {
    try {
      setError(null);
      await updateMemberRoleAPI(memberId, role);
      await refreshTeams();
      if (currentTeam) {
        await selectTeam(currentTeam.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update member role';
      setError(errorMessage);
      console.error('Error updating member role:', err);
      throw err;
    }
  }, [refreshTeams, currentTeam, selectTeam]);

  // Leave team
  const leaveTeam = useCallback(async (teamId: string) => {
    try {
      setError(null);
      await leaveTeamAPI(teamId);
      await refreshTeams();
      if (currentTeam?.id === teamId) {
        setCurrentTeam(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave team';
      setError(errorMessage);
      console.error('Error leaving team:', err);
      throw err;
    }
  }, [refreshTeams, currentTeam]);

  // Check if user is admin of team
  const isAdmin = useCallback(async (teamId: string) => {
    try {
      return await checkIsTeamAdmin(teamId);
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  }, []);

  // Check if team can submit a project (doesn't already have one)
  const canSubmitProject = useCallback(async (teamId: string) => {
    try {
      const hasProject = await checkTeamHasProject(teamId);
      return !hasProject;
    } catch (err) {
      console.error('Error checking project status:', err);
      return false;
    }
  }, []);

  const value: TeamContextType = {
    userTeams,
    currentTeam,
    loading,
    error,
    refreshTeams,
    selectTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember,
    updateMemberRole,
    leaveTeam,
    isAdmin,
    canSubmitProject,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

