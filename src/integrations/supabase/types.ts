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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          team_name: string | null
          linkedin: string | null
          github: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          team_name?: string | null
          linkedin?: string | null
          github?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          team_name?: string | null
          linkedin?: string | null
          github?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          team_name: string
          title: string
          description: string | null
          problem: string | null
          solution: string | null
          tech_stack: string[] | null
          learnings: string | null
          demo_video_url: string | null
          ppt_url: string | null
          github_url: string | null
          presentation_url: string | null
          images: string[] | null
          tags: string[] | null
          likes: number
          views: number
          status: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_name: string
          title: string
          description?: string | null
          problem?: string | null
          solution?: string | null
          tech_stack?: string[] | null
          learnings?: string | null
          demo_video_url?: string | null
          ppt_url?: string | null
          github_url?: string | null
          presentation_url?: string | null
          images?: string[] | null
          tags?: string[] | null
          likes?: number
          views?: number
          status?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_name?: string
          title?: string
          description?: string | null
          problem?: string | null
          solution?: string | null
          tech_stack?: string[] | null
          learnings?: string | null
          demo_video_url?: string | null
          ppt_url?: string | null
          github_url?: string | null
          presentation_url?: string | null
          images?: string[] | null
          tags?: string[] | null
          likes?: number
          views?: number
          status?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_likes: {
        Row: {
          id: string
          project_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          created_at?: string
        }
      }
      project_views: {
        Row: {
          id: string
          project_id: string
          user_id: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'user' | 'admin' | 'judge'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: 'user' | 'admin' | 'judge'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'user' | 'admin' | 'judge'
          created_at?: string
        }
      }
      judge_feedback: {
        Row: {
          id: string
          project_id: string
          judge_id: string
          score: number | null
          comment: string | null
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          judge_id: string
          score?: number | null
          comment?: string | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          judge_id?: string
          score?: number | null
          comment?: string | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      updates: {
        Row: {
          id: string
          title: string
          content: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          created_by?: string
          created_at?: string
        }
      }
      discussions: {
        Row: {
          id: string
          title: string
          content: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          created_by?: string
          created_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          team_name: string
          leader_id: string
          member1_name: string | null
          member1_email: string | null
          member1_phone: string | null
          member1_designation: string | null
          member2_name: string | null
          member2_email: string | null
          member2_phone: string | null
          member2_designation: string | null
          member3_name: string | null
          member3_email: string | null
          member3_phone: string | null
          member3_designation: string | null
          member4_name: string | null
          member4_email: string | null
          member4_phone: string | null
          member4_designation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_name: string
          leader_id: string
          member1_name?: string | null
          member1_email?: string | null
          member1_phone?: string | null
          member1_designation?: string | null
          member2_name?: string | null
          member2_email?: string | null
          member2_phone?: string | null
          member2_designation?: string | null
          member3_name?: string | null
          member3_email?: string | null
          member3_phone?: string | null
          member3_designation?: string | null
          member4_name?: string | null
          member4_email?: string | null
          member4_phone?: string | null
          member4_designation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_name?: string
          leader_id?: string
          member1_name?: string | null
          member1_email?: string | null
          member1_phone?: string | null
          member1_designation?: string | null
          member2_name?: string | null
          member2_email?: string | null
          member2_phone?: string | null
          member2_designation?: string | null
          member3_name?: string | null
          member3_email?: string | null
          member3_phone?: string | null
          member3_designation?: string | null
          member4_name?: string | null
          member4_email?: string | null
          member4_phone?: string | null
          member4_designation?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      toggle_project_like: {
        Args: {
          p_project_id: string
        }
        Returns: {
          liked: boolean
          total_likes: number
        }[]
      }
      record_project_view: {
        Args: {
          p_project_id: string
          p_ip_address?: string
        }
        Returns: number
      }
      has_role: {
        Args: {
          _user_id: string
          _role: 'user' | 'admin' | 'judge'
        }
        Returns: boolean
      }
      get_user_role: {
        Args: {
          _user_id: string
        }
        Returns: 'user' | 'admin' | 'judge'
      }
    }
    Enums: {
      app_role: 'user' | 'admin' | 'judge'
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
    Enums: {},
  },
} as const
