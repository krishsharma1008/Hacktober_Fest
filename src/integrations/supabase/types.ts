export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      discussion_replies: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          discussion_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          discussion_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          discussion_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          }
        ]
      }
      discussions: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          reply_count: number | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          reply_count?: number | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          reply_count?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      judge_feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          judge_id: string
          note: string | null
          project_id: string
          score: number | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          judge_id: string
          note?: string | null
          project_id: string
          score?: number | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          judge_id?: string
          note?: string | null
          project_id?: string
          score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "judge_feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          github: string | null
          id: string
          linkedin: string | null
          team_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          github?: string | null
          id: string
          linkedin?: string | null
          team_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          github?: string | null
          id?: string
          linkedin?: string | null
          team_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_likes: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_likes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_views: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          project_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          project_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          project_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_views_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          created_by: string
          cover_image: string | null
          demo_video_url: string | null
          description: string | null
          github_url: string | null
          id: string
          images: string[] | null
          learnings: string | null
          likes: number | null
          ppt_url: string | null
          presentation_url: string | null
          problem: string | null
          solution: string | null
          status: string | null
          tags: string[] | null
          team_id: string | null
          team_name: string
          tech_stack: string[] | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          cover_image?: string | null
          demo_video_url?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          images?: string[] | null
          learnings?: string | null
          likes?: number | null
          ppt_url?: string | null
          presentation_url?: string | null
          problem?: string | null
          solution?: string | null
          status?: string | null
          tags?: string[] | null
          team_id?: string | null
          team_name: string
          tech_stack?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          cover_image?: string | null
          demo_video_url?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          images?: string[] | null
          learnings?: string | null
          likes?: number | null
          ppt_url?: string | null
          presentation_url?: string | null
          problem?: string | null
          solution?: string | null
          status?: string | null
          tags?: string[] | null
          team_id?: string | null
          team_name?: string
          tech_stack?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: string
          joined_at: string | null
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: string
          joined_at?: string | null
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: string
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          created_at: string | null
          updated_at: string | null
          max_members: number | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by: string
          created_at?: string | null
          updated_at?: string | null
          max_members?: number | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
          max_members?: number | null
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          created_at: string | null
          id: string
          leader_id: string
          member1_designation: string | null
          member1_email: string | null
          member1_name: string | null
          member1_phone: string | null
          member2_designation: string | null
          member2_email: string | null
          member2_name: string | null
          member2_phone: string | null
          member3_designation: string | null
          member3_email: string | null
          member3_name: string | null
          member3_phone: string | null
          member4_designation: string | null
          member4_email: string | null
          member4_name: string | null
          member4_phone: string | null
          team_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          leader_id: string
          member1_designation?: string | null
          member1_email?: string | null
          member1_name?: string | null
          member1_phone?: string | null
          member2_designation?: string | null
          member2_email?: string | null
          member2_name?: string | null
          member2_phone?: string | null
          member3_designation?: string | null
          member3_email?: string | null
          member3_name?: string | null
          member3_phone?: string | null
          member4_designation?: string | null
          member4_email?: string | null
          member4_name?: string | null
          member4_phone?: string | null
          team_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          leader_id?: string
          member1_designation?: string | null
          member1_email?: string | null
          member1_name?: string | null
          member1_phone?: string | null
          member2_designation?: string | null
          member2_email?: string | null
          member2_name?: string | null
          member2_phone?: string | null
          member3_designation?: string | null
          member3_email?: string | null
          member3_name?: string | null
          member3_phone?: string | null
          member4_designation?: string | null
          member4_email?: string | null
          member4_name?: string | null
          member4_phone?: string | null
          team_name?: string
        }
        Relationships: []
      }
      updates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_team_member_count: {
        Args: { _team_id: string }
        Returns: number
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_team_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      record_project_view: {
        Args: { p_ip_address?: string; p_project_id: string }
        Returns: number
      }
      team_has_project: {
        Args: { _team_id: string }
        Returns: boolean
      }
      toggle_project_like: {
        Args: { p_project_id: string }
        Returns: {
          liked: boolean
          total_likes: number
        }[]
      }
    }
    Enums: {
      app_role: "user" | "admin" | "judge"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin", "judge"],
    },
  },
} as const
