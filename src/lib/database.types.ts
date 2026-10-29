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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      games: {
        Row: {
          created_at: string
          game_no: number
          id: string
          rubber_id: string
          score_a: number
          score_b: number
          tie_id: string
          tournament_id: string
          winner_side: Database["public"]["Enums"]["side"] | null
        }
        Insert: {
          created_at?: string
          game_no: number
          id?: string
          rubber_id: string
          score_a?: number
          score_b?: number
          tie_id: string
          tournament_id: string
          winner_side?: Database["public"]["Enums"]["side"] | null
        }
        Update: {
          created_at?: string
          game_no?: number
          id?: string
          rubber_id?: string
          score_a?: number
          score_b?: number
          tie_id?: string
          tournament_id?: string
          winner_side?: Database["public"]["Enums"]["side"] | null
        }
        Relationships: [
          {
            foreignKeyName: "games_rubber_id_fkey"
            columns: ["rubber_id"]
            isOneToOne: false
            referencedRelation: "rubbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_tie_id_fkey"
            columns: ["tie_id"]
            isOneToOne: false
            referencedRelation: "ties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string
          full_name: string
          gender: Database["public"]["Enums"]["gender"] | null
          id: string
          sort_order: number
          team_id: string
          tournament_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          sort_order?: number
          team_id: string
          tournament_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          sort_order?: number
          team_id?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      referee_tokens: {
        Row: {
          referee_id: string
          token: string
        }
        Insert: {
          referee_id: string
          token: string
        }
        Update: {
          referee_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "referee_tokens_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: true
            referencedRelation: "referees"
            referencedColumns: ["id"]
          },
        ]
      }
      referees: {
        Row: {
          created_at: string
          id: string
          name: string
          tournament_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          tournament_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referees_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      rubber_players: {
        Row: {
          created_at: string
          id: string
          player_id: string
          rubber_id: string
          side: Database["public"]["Enums"]["side"]
          tournament_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          player_id: string
          rubber_id: string
          side: Database["public"]["Enums"]["side"]
          tournament_id: string
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string
          rubber_id?: string
          side?: Database["public"]["Enums"]["side"]
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rubber_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rubber_players_rubber_id_fkey"
            columns: ["rubber_id"]
            isOneToOne: false
            referencedRelation: "rubbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rubber_players_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      rubbers: {
        Row: {
          court: string | null
          created_at: string
          current_game: number
          end_reason: Database["public"]["Enums"]["rubber_end_reason"] | null
          ended_at: string | null
          games_won_a: number
          games_won_b: number
          id: string
          kind: Database["public"]["Enums"]["rubber_kind"]
          position: number
          referee_id: string | null
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["rubber_status"]
          tie_id: string
          tournament_id: string
          winner_side: Database["public"]["Enums"]["side"] | null
        }
        Insert: {
          court?: string | null
          created_at?: string
          current_game?: number
          end_reason?: Database["public"]["Enums"]["rubber_end_reason"] | null
          ended_at?: string | null
          games_won_a?: number
          games_won_b?: number
          id?: string
          kind: Database["public"]["Enums"]["rubber_kind"]
          position: number
          referee_id?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["rubber_status"]
          tie_id: string
          tournament_id: string
          winner_side?: Database["public"]["Enums"]["side"] | null
        }
        Update: {
          court?: string | null
          created_at?: string
          current_game?: number
          end_reason?: Database["public"]["Enums"]["rubber_end_reason"] | null
          ended_at?: string | null
          games_won_a?: number
          games_won_b?: number
          id?: string
          kind?: Database["public"]["Enums"]["rubber_kind"]
          position?: number
          referee_id?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["rubber_status"]
          tie_id?: string
          tournament_id?: string
          winner_side?: Database["public"]["Enums"]["side"] | null
        }
        Relationships: [
          {
            foreignKeyName: "rubbers_referee_id_tournament_id_fkey"
            columns: ["referee_id", "tournament_id"]
            isOneToOne: false
            referencedRelation: "referees"
            referencedColumns: ["id", "tournament_id"]
          },
          {
            foreignKeyName: "rubbers_tie_id_fkey"
            columns: ["tie_id"]
            isOneToOne: false
            referencedRelation: "ties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rubbers_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          flag_emoji: string | null
          group_id: string | null
          id: string
          name: string
          seed: number | null
          short_name: string
          tournament_id: string
        }
        Insert: {
          created_at?: string
          flag_emoji?: string | null
          group_id?: string | null
          id?: string
          name: string
          seed?: number | null
          short_name: string
          tournament_id: string
        }
        Update: {
          created_at?: string
          flag_emoji?: string | null
          group_id?: string | null
          id?: string
          name?: string
          seed?: number | null
          short_name?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_group_id_tournament_id_fkey"
            columns: ["group_id", "tournament_id"]
            isOneToOne: false
            referencedRelation: "tournament_groups"
            referencedColumns: ["id", "tournament_id"]
          },
          {
            foreignKeyName: "teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      ties: {
        Row: {
          court: string | null
          created_at: string
          group_id: string | null
          id: string
          round_label: string
          round_order: number
          rubbers_won_a: number
          rubbers_won_b: number
          scheduled_at: string | null
          stage: Database["public"]["Enums"]["tie_stage"]
          status: Database["public"]["Enums"]["tie_status"]
          team_a_id: string | null
          team_b_id: string | null
          tournament_id: string
          winner_team_id: string | null
        }
        Insert: {
          court?: string | null
          created_at?: string
          group_id?: string | null
          id?: string
          round_label: string
          round_order?: number
          rubbers_won_a?: number
          rubbers_won_b?: number
          scheduled_at?: string | null
          stage: Database["public"]["Enums"]["tie_stage"]
          status?: Database["public"]["Enums"]["tie_status"]
          team_a_id?: string | null
          team_b_id?: string | null
          tournament_id: string
          winner_team_id?: string | null
        }
        Update: {
          court?: string | null
          created_at?: string
          group_id?: string | null
          id?: string
          round_label?: string
          round_order?: number
          rubbers_won_a?: number
          rubbers_won_b?: number
          scheduled_at?: string | null
          stage?: Database["public"]["Enums"]["tie_stage"]
          status?: Database["public"]["Enums"]["tie_status"]
          team_a_id?: string | null
          team_b_id?: string | null
          tournament_id?: string
          winner_team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ties_group_id_tournament_id_fkey"
            columns: ["group_id", "tournament_id"]
            isOneToOne: false
            referencedRelation: "tournament_groups"
            referencedColumns: ["id", "tournament_id"]
          },
          {
            foreignKeyName: "ties_team_a_id_tournament_id_fkey"
            columns: ["team_a_id", "tournament_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id", "tournament_id"]
          },
          {
            foreignKeyName: "ties_team_b_id_tournament_id_fkey"
            columns: ["team_b_id", "tournament_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id", "tournament_id"]
          },
          {
            foreignKeyName: "ties_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ties_winner_team_id_tournament_id_fkey"
            columns: ["winner_team_id", "tournament_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id", "tournament_id"]
          },
        ]
      }
      tournament_groups: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          tournament_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          tournament_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_groups_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_organizers: {
        Row: {
          created_at: string
          email: string | null
          tournament_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          tournament_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_organizers_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          rubber_template: Database["public"]["Enums"]["rubber_kind"][]
          rule_games_to_win: number
          rule_points_cap: number
          rule_points_to_win: number
          rule_rubbers_to_win_tie: number
          rule_tie_win_points: number
          slug: string
          start_date: string | null
          status: Database["public"]["Enums"]["tournament_status"]
          venue: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          rubber_template?: Database["public"]["Enums"]["rubber_kind"][]
          rule_games_to_win?: number
          rule_points_cap?: number
          rule_points_to_win?: number
          rule_rubbers_to_win_tie?: number
          rule_tie_win_points?: number
          slug: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["tournament_status"]
          venue?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          rubber_template?: Database["public"]["Enums"]["rubber_kind"][]
          rule_games_to_win?: number
          rule_points_cap?: number
          rule_points_to_win?: number
          rule_rubbers_to_win_tie?: number
          rule_tie_win_points?: number
          slug?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["tournament_status"]
          venue?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      group_standings: {
        Row: {
          games_diff: number | null
          group_id: string | null
          lost: number | null
          played: number | null
          points: number | null
          points_diff: number | null
          rubbers_against: number | null
          rubbers_for: number | null
          team_id: string | null
          tournament_id: string | null
          won: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_organizer_by_email: {
        Args: { p_email: string; p_tournament_id: string }
        Returns: undefined
      }
      assert_can_score: {
        Args: { p_rubber_id: string; p_token?: string }
        Returns: string
      }
      end_rubber_early: {
        Args: {
          p_rubber_id: string
          p_token?: string
          p_winner_side: Database["public"]["Enums"]["side"]
        }
        Returns: undefined
      }
      end_rubber_walkover: {
        Args: {
          p_rubber_id: string
          p_winner_side: Database["public"]["Enums"]["side"]
        }
        Returns: undefined
      }
      finish_tournament: {
        Args: { p_tournament_id: string }
        Returns: undefined
      }
      is_organizer: { Args: { p_tournament_id: string }; Returns: boolean }
      is_tournament_visible: {
        Args: { p_tournament_id: string }
        Returns: boolean
      }
      recompute_tie: { Args: { p_tie_id: string }; Returns: undefined }
      referee_whoami: {
        Args: { p_token: string }
        Returns: {
          name: string
          referee_id: string
          tournament_id: string
        }[]
      }
      score_point: {
        Args: {
          p_rubber_id: string
          p_side: Database["public"]["Enums"]["side"]
          p_token?: string
        }
        Returns: undefined
      }
      start_rubber: {
        Args: { p_rubber_id: string; p_token?: string }
        Returns: undefined
      }
      undo_point: {
        Args: {
          p_rubber_id: string
          p_side: Database["public"]["Enums"]["side"]
          p_token?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      gender: "m" | "f"
      rubber_end_reason: "normal" | "retired" | "walkover"
      rubber_kind: "singles" | "doubles"
      rubber_status: "scheduled" | "live" | "finished" | "skipped"
      side: "a" | "b"
      tie_stage: "group" | "knockout"
      tie_status: "scheduled" | "live" | "finished"
      tournament_status: "draft" | "published" | "finished"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      gender: ["m", "f"],
      rubber_end_reason: ["normal", "retired", "walkover"],
      rubber_kind: ["singles", "doubles"],
      rubber_status: ["scheduled", "live", "finished", "skipped"],
      side: ["a", "b"],
      tie_stage: ["group", "knockout"],
      tie_status: ["scheduled", "live", "finished"],
      tournament_status: ["draft", "published", "finished"],
    },
  },
} as const
