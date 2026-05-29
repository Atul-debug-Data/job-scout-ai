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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      emails: {
        Row: {
          created_at: string
          from_address: string | null
          id: string
          job_id: string | null
          parsed_status: Database["public"]["Enums"]["job_status"] | null
          received_at: string
          snippet: string | null
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string
          from_address?: string | null
          id?: string
          job_id?: string | null
          parsed_status?: Database["public"]["Enums"]["job_status"] | null
          received_at?: string
          snippet?: string | null
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string
          from_address?: string | null
          id?: string
          job_id?: string | null
          parsed_status?: Database["public"]["Enums"]["job_status"] | null
          received_at?: string
          snippet?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          enabled: boolean
          key: string
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          key: string
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      gmail_tokens: {
        Row: {
          access_token: string | null
          connected_at: string
          expiry: string | null
          last_synced_at: string | null
          refresh_token: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connected_at?: string
          expiry?: string | null
          last_synced_at?: string | null
          refresh_token?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          connected_at?: string
          expiry?: string | null
          last_synced_at?: string | null
          refresh_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      interview_sessions: {
        Row: {
          answers: Json
          company_summary: string | null
          created_at: string
          feedback: Json
          id: string
          job_id: string
          questions: Json
          user_id: string
        }
        Insert: {
          answers?: Json
          company_summary?: string | null
          created_at?: string
          feedback?: Json
          id?: string
          job_id: string
          questions?: Json
          user_id: string
        }
        Update: {
          answers?: Json
          company_summary?: string | null
          created_at?: string
          feedback?: Json
          id?: string
          job_id?: string
          questions?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          applied_date: string
          company: string
          created_at: string
          id: string
          last_activity: string
          location: string | null
          notes: string | null
          portal: string | null
          resume_id: string | null
          source: Database["public"]["Enums"]["job_source"]
          status: Database["public"]["Enums"]["job_status"]
          title: string
          user_id: string
        }
        Insert: {
          applied_date?: string
          company: string
          created_at?: string
          id?: string
          last_activity?: string
          location?: string | null
          notes?: string | null
          portal?: string | null
          resume_id?: string | null
          source?: Database["public"]["Enums"]["job_source"]
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          user_id: string
        }
        Update: {
          applied_date?: string
          company?: string
          created_at?: string
          id?: string
          last_activity?: string
          location?: string | null
          notes?: string | null
          portal?: string | null
          resume_id?: string | null
          source?: Database["public"]["Enums"]["job_source"]
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_resume_fk"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          ai_feedback: Json | null
          ai_score: number | null
          file_path: string
          id: string
          label: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: Json | null
          ai_score?: number | null
          file_path: string
          id?: string
          label: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: Json | null
          ai_score?: number | null
          file_path?: string
          id?: string
          label?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      job_source: "manual" | "gmail"
      job_status: "applied" | "in_review" | "interview" | "offer" | "rejected"
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
      app_role: ["admin", "user"],
      job_source: ["manual", "gmail"],
      job_status: ["applied", "in_review", "interview", "offer", "rejected"],
    },
  },
} as const
