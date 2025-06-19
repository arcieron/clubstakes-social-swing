export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clubs: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          club_id: string | null
          created_at: string
          id: string
          name: string
          rating: number
          slope: number
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          id?: string
          name: string
          rating: number
          slope: number
        }
        Update: {
          club_id?: string | null
          created_at?: string
          id?: string
          name?: string
          rating?: number
          slope?: number
        }
        Relationships: [
          {
            foreignKeyName: "courses_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      hole_scores: {
        Row: {
          created_at: string
          hole_number: number
          id: string
          match_id: string
          player_id: string
          score: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          hole_number: number
          id?: string
          match_id: string
          player_id: string
          score?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          hole_number?: number
          id?: string
          match_id?: string
          player_id?: string
          score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hole_scores_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hole_scores_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_confirmations: {
        Row: {
          confirmed_at: string
          id: string
          match_id: string
          player_id: string
        }
        Insert: {
          confirmed_at?: string
          id?: string
          match_id: string
          player_id: string
        }
        Update: {
          confirmed_at?: string
          id?: string
          match_id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_confirmations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_confirmations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_players: {
        Row: {
          id: string
          joined_at: string
          match_id: string
          player_id: string
          team_number: number | null
        }
        Insert: {
          id?: string
          joined_at?: string
          match_id: string
          player_id: string
          team_number?: number | null
        }
        Update: {
          id?: string
          joined_at?: string
          match_id?: string
          player_id?: string
          team_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          club_id: string
          completed_at: string | null
          course_id: string | null
          created_at: string
          creator_id: string
          format: Database["public"]["Enums"]["match_format"]
          id: string
          is_public: boolean | null
          match_date: string
          max_players: number | null
          status: Database["public"]["Enums"]["match_status"] | null
          team_format: Database["public"]["Enums"]["team_format"] | null
          updated_at: string
          wager_amount: number
          winner_id: string | null
        }
        Insert: {
          club_id: string
          completed_at?: string | null
          course_id?: string | null
          created_at?: string
          creator_id: string
          format: Database["public"]["Enums"]["match_format"]
          id?: string
          is_public?: boolean | null
          match_date: string
          max_players?: number | null
          status?: Database["public"]["Enums"]["match_status"] | null
          team_format?: Database["public"]["Enums"]["team_format"] | null
          updated_at?: string
          wager_amount: number
          winner_id?: string | null
        }
        Update: {
          club_id?: string
          completed_at?: string | null
          course_id?: string | null
          created_at?: string
          creator_id?: string
          format?: Database["public"]["Enums"]["match_format"]
          id?: string
          is_public?: boolean | null
          match_date?: string
          max_players?: number | null
          status?: Database["public"]["Enums"]["match_status"] | null
          team_format?: Database["public"]["Enums"]["team_format"] | null
          updated_at?: string
          wager_amount?: number
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          club_id: string
          credits: number | null
          email: string
          full_name: string
          ghin_id: string | null
          handicap: number | null
          id: string
          id_number: number
          is_admin: boolean | null
          joined_at: string
          updated_at: string
        }
        Insert: {
          club_id: string
          credits?: number | null
          email: string
          full_name: string
          ghin_id?: string | null
          handicap?: number | null
          id: string
          id_number: number
          is_admin?: boolean | null
          joined_at?: string
          updated_at?: string
        }
        Update: {
          club_id?: string
          credits?: number | null
          email?: string
          full_name?: string
          ghin_id?: string | null
          handicap?: number | null
          id?: string
          id_number?: number
          is_admin?: boolean | null
          joined_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: { user_id: string; amount: number }
        Returns: undefined
      }
      get_user_club_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      match_format:
        | "match-play"
        | "stroke-play"
        | "nassau"
        | "scramble"
        | "better-ball"
        | "skins"
      match_status:
        | "pending"
        | "open"
        | "in_progress"
        | "completed"
        | "cancelled"
      team_format: "individual" | "teams"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      match_format: [
        "match-play",
        "stroke-play",
        "nassau",
        "scramble",
        "better-ball",
        "skins",
      ],
      match_status: [
        "pending",
        "open",
        "in_progress",
        "completed",
        "cancelled",
      ],
      team_format: ["individual", "teams"],
    },
  },
} as const
