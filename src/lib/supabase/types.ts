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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          cancelled_at: string | null
          check_in: string
          check_out: string
          confirmed_at: string | null
          created_at: string
          currency: string
          error_message: string | null
          guest_count: number
          guest_email: string
          guest_first_name: string
          guest_last_name: string
          guest_phone_e164: string | null
          hotel_id: string
          id: string
          idempotency_key: string | null
          liteapi_booking_id: string | null
          liteapi_confirmation: string | null
          liteapi_prebook_id: string | null
          rooms_count: number
          status: Database["public"]["Enums"]["booking_status"]
          stripe_payment_intent: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          check_in: string
          check_out: string
          confirmed_at?: string | null
          created_at?: string
          currency: string
          error_message?: string | null
          guest_count: number
          guest_email: string
          guest_first_name: string
          guest_last_name: string
          guest_phone_e164?: string | null
          hotel_id: string
          id?: string
          idempotency_key?: string | null
          liteapi_booking_id?: string | null
          liteapi_confirmation?: string | null
          liteapi_prebook_id?: string | null
          rooms_count?: number
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_payment_intent?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          check_in?: string
          check_out?: string
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          error_message?: string | null
          guest_count?: number
          guest_email?: string
          guest_first_name?: string
          guest_last_name?: string
          guest_phone_e164?: string | null
          hotel_id?: string
          id?: string
          idempotency_key?: string | null
          liteapi_booking_id?: string | null
          liteapi_confirmation?: string | null
          liteapi_prebook_id?: string | null
          rooms_count?: number
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_payment_intent?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          session_id: string
          tool_call_id: string | null
          tool_name: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
          tool_call_id?: string | null
          tool_name?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
          tool_call_id?: string | null
          tool_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          locale: Database["public"]["Enums"]["supported_locale"]
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          locale?: Database["public"]["Enums"]["supported_locale"]
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          locale?: Database["public"]["Enums"]["supported_locale"]
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          country_code: string
          created_at: string
          id: string
          latitude: number
          longitude: number
          name_en: string
          name_th: string
          slug: string
          timezone: string
        }
        Insert: {
          country_code: string
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          name_en: string
          name_th: string
          slug: string
          timezone: string
        }
        Update: {
          country_code?: string
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          name_en?: string
          name_th?: string
          slug?: string
          timezone?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: Database["public"]["Enums"]["event_category"]
          city_id: string
          created_at: string
          currency: string | null
          description: string | null
          description_th: string | null
          embedding: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          last_synced_at: string
          latitude: number | null
          longitude: number | null
          name: string
          name_th: string | null
          price_max: number | null
          price_min: number | null
          raw_data: Json | null
          source: string
          source_id: string | null
          starts_at: string
          timezone: string
          url: string | null
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["event_category"]
          city_id: string
          created_at?: string
          currency?: string | null
          description?: string | null
          description_th?: string | null
          embedding?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          last_synced_at?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          name_th?: string | null
          price_max?: number | null
          price_min?: number | null
          raw_data?: Json | null
          source: string
          source_id?: string | null
          starts_at: string
          timezone?: string
          url?: string | null
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["event_category"]
          city_id?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          description_th?: string | null
          embedding?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          last_synced_at?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_th?: string | null
          price_max?: number | null
          price_min?: number | null
          raw_data?: Json | null
          source?: string
          source_id?: string | null
          starts_at?: string
          timezone?: string
          url?: string | null
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          address: string | null
          amenities: string[] | null
          city_id: string
          created_at: string
          description: string | null
          description_th: string | null
          embedding: string | null
          id: string
          image_urls: string[] | null
          last_synced_at: string
          latitude: number | null
          liteapi_hotel_id: string
          longitude: number | null
          name: string
          raw_data: Json | null
          star_rating: number | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          city_id: string
          created_at?: string
          description?: string | null
          description_th?: string | null
          embedding?: string | null
          id?: string
          image_urls?: string[] | null
          last_synced_at?: string
          latitude?: number | null
          liteapi_hotel_id: string
          longitude?: number | null
          name: string
          raw_data?: Json | null
          star_rating?: number | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          city_id?: string
          created_at?: string
          description?: string | null
          description_th?: string | null
          embedding?: string | null
          id?: string
          image_urls?: string[] | null
          last_synced_at?: string
          latitude?: number | null
          liteapi_hotel_id?: string
          longitude?: number | null
          name?: string
          raw_data?: Json | null
          star_rating?: number | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotels_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone_e164: string | null
          preferred_locale: Database["public"]["Enums"]["supported_locale"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          phone_e164?: string | null
          preferred_locale?: Database["public"]["Enums"]["supported_locale"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone_e164?: string | null
          preferred_locale?: Database["public"]["Enums"]["supported_locale"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_events: {
        Args: {
          filter_city_id?: string
          filter_end_date?: string
          filter_start_date?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          description: string
          id: string
          name: string
          similarity: number
          starts_at: string
        }[]
      }
      match_hotels: {
        Args: {
          filter_city_id?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          description: string
          id: string
          liteapi_hotel_id: string
          name: string
          similarity: number
        }[]
      }
    }
    Enums: {
      booking_status: "draft" | "pending" | "confirmed" | "cancelled" | "failed"
      event_category:
        | "festival"
        | "concert"
        | "exhibition"
        | "sports"
        | "conference"
        | "food"
        | "other"
      supported_locale: "th" | "en"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      booking_status: ["draft", "pending", "confirmed", "cancelled", "failed"],
      event_category: [
        "festival",
        "concert",
        "exhibition",
        "sports",
        "conference",
        "food",
        "other",
      ],
      supported_locale: ["th", "en"],
    },
  },
} as const
