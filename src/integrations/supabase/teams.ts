/**
 * Team Management API Functions
 * Provides comprehensive team operations with proper error handling
 */

import { supabase } from './client';
import { Tables, TablesInsert, TablesUpdate } from './types';

export type Team = Tables<'teams'>;
export type TeamMember = Tables<'team_members'>;
export type TeamInsert = TablesInsert<'teams'>;
export type TeamMemberInsert = TablesInsert<'team_members'>;

/**
 * Team Operations
 */

// Create a new team
export const createTeam = async (teamData: Omit<TeamInsert, 'created_by'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('teams')
    .insert({
      ...teamData,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get team by ID with member details
export const getTeam = async (teamId: string) => {
  // First get the team with team_members
  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select(`
      *,
      team_members (
        id,
        role,
        joined_at,
        user_id
      ),
      projects (
        id,
        title,
        status,
        created_at
      )
    `)
    .eq('id', teamId)
    .single();

  if (teamError) throw teamError;
  
  // Then fetch profile data for each team member
  if (teamData && teamData.team_members && teamData.team_members.length > 0) {
    const userIds = teamData.team_members.map((m: any) => m.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, github, linkedin')
      .in('id', userIds);
    
    if (profilesError) throw profilesError;
    
    // Merge profile data into team_members
    teamData.team_members = teamData.team_members.map((member: any) => ({
      ...member,
      profiles: profiles?.find(p => p.id === member.user_id) || null
    }));
  }

  return teamData;
};

// Get all teams (with optional filters)
export const getTeams = async (filters?: { isActive?: boolean; createdBy?: string }) => {
  let query = supabase
    .from('teams')
    .select(`
      *,
      team_members (count),
      projects (count)
    `)
    .order('created_at', { ascending: false });

  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  if (filters?.createdBy) {
    query = query.eq('created_by', filters.createdBy);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Get user's teams
export const getUserTeams = async (userId?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  const targetUserId = userId || user?.id;
  
  if (!targetUserId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('team_members')
    .select(`
      id,
      role,
      joined_at,
      teams (
        id,
        name,
        description,
        created_by,
        created_at,
        max_members,
        is_active,
        projects (
          id,
          title,
          status
        )
      )
    `)
    .eq('user_id', targetUserId);

  if (error) throw error;
  return data;
};

// Update team
export const updateTeam = async (teamId: string, updates: TablesUpdate<'teams'>) => {
  const { data, error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', teamId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete team (soft delete by setting is_active to false)
export const deleteTeam = async (teamId: string, hard: boolean = false) => {
  if (hard) {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);
    
    if (error) throw error;
  } else {
    return updateTeam(teamId, { is_active: false });
  }
};

/**
 * Team Member Operations
 */

// Add member to team
export const addTeamMember = async (teamId: string, userEmail: string, role: string = 'member') => {
  // First, find the user by email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, github, linkedin')
    .eq('email', userEmail)
    .single();

  if (profileError) throw new Error(`User with email ${userEmail} not found`);

  // Check if team already has a project - if so, verify team size limit
  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select('max_members, team_members(count)')
    .eq('id', teamId)
    .single();

  if (teamError) throw teamError;

  // Add the member
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id: profile.id,
      role,
    })
    .select('*')
    .single();

  if (error) throw error;
  
  // Return the member with profile data
  return {
    ...data,
    profiles: profile
  };
};

// Remove member from team
export const removeTeamMember = async (teamMemberId: string) => {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', teamMemberId);

  if (error) throw error;
};

// Update member role
export const updateMemberRole = async (teamMemberId: string, role: string) => {
  const { data, error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('id', teamMemberId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Leave team (for current user)
export const leaveTeam = async (teamId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', user.id);

  if (error) throw error;
};

/**
 * Team Utility Functions
 */

// Check if user is team member
export const isTeamMember = async (teamId: string, userId?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  const targetUserId = userId || user?.id;
  
  if (!targetUserId) return false;

  const { data, error } = await supabase.rpc('is_team_member', {
    _team_id: teamId,
    _user_id: targetUserId,
  });

  if (error) throw error;
  return data;
};

// Check if user is team admin
export const isTeamAdmin = async (teamId: string, userId?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  const targetUserId = userId || user?.id;
  
  if (!targetUserId) return false;

  const { data, error } = await supabase.rpc('is_team_admin', {
    _team_id: teamId,
    _user_id: targetUserId,
  });

  if (error) throw error;
  return data;
};

// Check if team has a project
export const teamHasProject = async (teamId: string) => {
  const { data, error } = await supabase.rpc('team_has_project', {
    _team_id: teamId,
  });

  if (error) throw error;
  return data;
};

// Get team member count
export const getTeamMemberCount = async (teamId: string) => {
  const { data, error } = await supabase.rpc('get_team_member_count', {
    _team_id: teamId,
  });

  if (error) throw error;
  return data;
};

// Get available teams (teams user can join)
export const getAvailableTeams = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get teams where user is not already a member
  const { data: userTeamIds, error: memberError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id);

  if (memberError) throw memberError;

  const excludeTeamIds = userTeamIds?.map(tm => tm.team_id) || [];

  let query = supabase
    .from('teams')
    .select(`
      *,
      team_members (count),
      projects (count)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (excludeTeamIds.length > 0) {
    query = query.not('id', 'in', `(${excludeTeamIds.join(',')})`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

