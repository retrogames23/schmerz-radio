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
      donations: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          email: string
          id: string
          stripe_payment_intent: string | null
          stripe_session_id: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          email: string
          id?: string
          stripe_payment_intent?: string | null
          stripe_session_id: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          email?: string
          id?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      dsa_group_members: {
        Row: {
          hero_snapshot: Json | null
          joined_at: string
          last_seen_at: string
          position: number
          ready: boolean
          room_id: string
          slot: number
          user_id: string
        }
        Insert: {
          hero_snapshot?: Json | null
          joined_at?: string
          last_seen_at?: string
          position?: number
          ready?: boolean
          room_id: string
          slot?: number
          user_id: string
        }
        Update: {
          hero_snapshot?: Json | null
          joined_at?: string
          last_seen_at?: string
          position?: number
          ready?: boolean
          room_id?: string
          slot?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dsa_group_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "dsa_group_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      dsa_group_messages: {
        Row: {
          author_hero_name: string | null
          author_user_id: string | null
          content: string
          created_at: string
          id: string
          idx: number
          role: string
          room_id: string
        }
        Insert: {
          author_hero_name?: string | null
          author_user_id?: string | null
          content: string
          created_at?: string
          id?: string
          idx: number
          role: string
          room_id: string
        }
        Update: {
          author_hero_name?: string | null
          author_user_id?: string | null
          content?: string
          created_at?: string
          id?: string
          idx?: number
          role?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dsa_group_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "dsa_group_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      dsa_group_pending_actions: {
        Row: {
          action: string
          created_at: string
          hero_name: string
          room_id: string
          turn_idx: number
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          hero_name: string
          room_id: string
          turn_idx: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          hero_name?: string
          room_id?: string
          turn_idx?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dsa_group_pending_actions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "dsa_group_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      dsa_group_rooms: {
        Row: {
          ap_awarded: boolean
          collect_started_at: string | null
          created_at: string
          current_image_tag: string
          has_password: boolean | null
          host_user_id: string
          id: string
          include_npc_companions: boolean
          max_players: number
          name: string
          password_hash: string | null
          session_id: string
          setting: string
          status: string
          summary: string
          turn_idx: number
          updated_at: string
          wish_brief: string | null
        }
        Insert: {
          ap_awarded?: boolean
          collect_started_at?: string | null
          created_at?: string
          current_image_tag?: string
          has_password?: boolean | null
          host_user_id: string
          id?: string
          include_npc_companions?: boolean
          max_players?: number
          name: string
          password_hash?: string | null
          session_id?: string
          setting: string
          status?: string
          summary?: string
          turn_idx?: number
          updated_at?: string
          wish_brief?: string | null
        }
        Update: {
          ap_awarded?: boolean
          collect_started_at?: string | null
          created_at?: string
          current_image_tag?: string
          has_password?: boolean | null
          host_user_id?: string
          id?: string
          include_npc_companions?: boolean
          max_players?: number
          name?: string
          password_hash?: string | null
          session_id?: string
          setting?: string
          status?: string
          summary?: string
          turn_idx?: number
          updated_at?: string
          wish_brief?: string | null
        }
        Relationships: []
      }
      dsa_heroes: {
        Row: {
          adventures_played: number
          adventures_won: number
          ap_spent: number
          ap_total: number
          chronicle: Json
          created_at: string
          hero: Json
          id: string
          npcs: Json
          slot: number
          updated_at: string
          user_id: string
        }
        Insert: {
          adventures_played?: number
          adventures_won?: number
          ap_spent?: number
          ap_total?: number
          chronicle?: Json
          created_at?: string
          hero: Json
          id?: string
          npcs?: Json
          slot: number
          updated_at?: string
          user_id: string
        }
        Update: {
          adventures_played?: number
          adventures_won?: number
          ap_spent?: number
          ap_total?: number
          chronicle?: Json
          created_at?: string
          hero?: Json
          id?: string
          npcs?: Json
          slot?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dsa_llm_adventures: {
        Row: {
          anon_id: string | null
          ap_awarded: number
          ap_reason: string
          character_snapshot: Json
          created_at: string
          current_image_tag: string
          hero_slot: number
          id: string
          messages: Json
          offtopic_streak: number
          session_id: string
          setting: string
          status: string
          summary: string
          updated_at: string
          user_id: string | null
          wish_brief: string | null
        }
        Insert: {
          anon_id?: string | null
          ap_awarded?: number
          ap_reason?: string
          character_snapshot: Json
          created_at?: string
          current_image_tag?: string
          hero_slot?: number
          id?: string
          messages?: Json
          offtopic_streak?: number
          session_id?: string
          setting: string
          status?: string
          summary?: string
          updated_at?: string
          user_id?: string | null
          wish_brief?: string | null
        }
        Update: {
          anon_id?: string | null
          ap_awarded?: number
          ap_reason?: string
          character_snapshot?: Json
          created_at?: string
          current_image_tag?: string
          hero_slot?: number
          id?: string
          messages?: Json
          offtopic_streak?: number
          session_id?: string
          setting?: string
          status?: string
          summary?: string
          updated_at?: string
          user_id?: string | null
          wish_brief?: string | null
        }
        Relationships: []
      }
      dsa_model_telemetry: {
        Row: {
          cache_create_tokens: number | null
          cached_tokens: number | null
          completion_tokens: number | null
          created_at: string
          fallback: boolean
          id: number
          label: string | null
          max_rounds: number | null
          model: string
          prompt_tokens: number | null
          round: number | null
          tool_calls: number | null
          use_tools: boolean | null
        }
        Insert: {
          cache_create_tokens?: number | null
          cached_tokens?: number | null
          completion_tokens?: number | null
          created_at?: string
          fallback?: boolean
          id?: number
          label?: string | null
          max_rounds?: number | null
          model: string
          prompt_tokens?: number | null
          round?: number | null
          tool_calls?: number | null
          use_tools?: boolean | null
        }
        Update: {
          cache_create_tokens?: number | null
          cached_tokens?: number | null
          completion_tokens?: number | null
          created_at?: string
          fallback?: boolean
          id?: number
          label?: string | null
          max_rounds?: number | null
          model?: string
          prompt_tokens?: number | null
          round?: number | null
          tool_calls?: number | null
          use_tools?: boolean | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      game_saves: {
        Row: {
          created_at: string
          flag_count: number
          id: string
          inventory_count: number
          payload: Json
          saved_at: string
          scene: string
          slot: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          flag_count?: number
          id?: string
          inventory_count?: number
          payload: Json
          saved_at?: string
          scene: string
          slot: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          flag_count?: number
          id?: string
          inventory_count?: number
          payload?: Json
          saved_at?: string
          scene?: string
          slot?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marv_state: {
        Row: {
          created_at: string
          empathy_score: number
          message_count: number
          oiled: boolean
          unlocked: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          empathy_score?: number
          message_count?: number
          oiled?: boolean
          unlocked?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          empathy_score?: number
          message_count?: number
          oiled?: boolean
          unlocked?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      npc_gossip: {
        Row: {
          created_at: string
          fact: string
          id: string
          source_npc_id: string
          subjects: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          fact: string
          id?: string
          source_npc_id: string
          subjects?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          fact?: string
          id?: string
          source_npc_id?: string
          subjects?: string[]
          user_id?: string
        }
        Relationships: []
      }
      npc_memory: {
        Row: {
          created_at: string
          id: string
          note: string
          npc_id: string
          recent_messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string
          npc_id: string
          recent_messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          npc_id?: string
          recent_messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cloud_request_count: number
          created_at: string
          donation_unlocked: boolean
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cloud_request_count?: number
          created_at?: string
          donation_unlocked?: boolean
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cloud_request_count?: number
          created_at?: string
          donation_unlocked?: boolean
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pub_chat_message_owners: {
        Row: {
          created_at: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pub_chat_message_owners_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: true
            referencedRelation: "pub_chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      pub_chat_messages: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_anonymous: boolean
          seat_index: number | null
          shift_number: number | null
          text: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_anonymous?: boolean
          seat_index?: number | null
          shift_number?: number | null
          text: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_anonymous?: boolean
          seat_index?: number | null
          shift_number?: number | null
          text?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      toilet_graffiti: {
        Row: {
          color_index: number
          created_at: string
          display_name: string
          expires_at: string | null
          id: string
          is_anonymous: boolean
          rotation: number
          text: string
          x: number
          y: number
        }
        Insert: {
          color_index?: number
          created_at?: string
          display_name: string
          expires_at?: string | null
          id?: string
          is_anonymous?: boolean
          rotation?: number
          text: string
          x: number
          y: number
        }
        Update: {
          color_index?: number
          created_at?: string
          display_name?: string
          expires_at?: string | null
          id?: string
          is_anonymous?: boolean
          rotation?: number
          text?: string
          x?: number
          y?: number
        }
        Relationships: []
      }
      toilet_graffiti_owners: {
        Row: {
          created_at: string
          graffiti_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          graffiti_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          graffiti_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "toilet_graffiti_owners_graffiti_id_fkey"
            columns: ["graffiti_id"]
            isOneToOne: true
            referencedRelation: "toilet_graffiti"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      is_dsa_room_member: {
        Args: { _room_id: string; _user_id: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      try_increment_cloud_request_count: {
        Args: { _hard_limit: number; _user_id: string }
        Returns: {
          donation_unlocked: boolean
          limit_reached: boolean
          new_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
