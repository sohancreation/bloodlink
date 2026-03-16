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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      blood_inventory: {
        Row: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at: string
          expiry_date: string | null
          hospital_id: string
          id: string
          units_available: number
          updated_at: string
        }
        Insert: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at?: string
          expiry_date?: string | null
          hospital_id: string
          id?: string
          units_available?: number
          updated_at?: string
        }
        Update: {
          blood_type?: Database["public"]["Enums"]["blood_type"]
          created_at?: string
          expiry_date?: string | null
          hospital_id?: string
          id?: string
          units_available?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blood_inventory_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_requests: {
        Row: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at: string
          hospital_id: string
          hospital_name: string
          id: string
          latitude: number
          longitude: number
          patient_condition: string | null
          requester_mobile: string | null
          requester_name: string | null
          status: Database["public"]["Enums"]["request_status"]
          units_needed: number
          updated_at: string
          upozilla: string | null
          urgency: Database["public"]["Enums"]["urgency_level"]
          zilla: string | null
        }
        Insert: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at?: string
          hospital_id: string
          hospital_name?: string
          id?: string
          latitude?: number
          longitude?: number
          patient_condition?: string | null
          requester_mobile?: string | null
          requester_name?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          units_needed?: number
          updated_at?: string
          upozilla?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"]
          zilla?: string | null
        }
        Update: {
          blood_type?: Database["public"]["Enums"]["blood_type"]
          created_at?: string
          hospital_id?: string
          hospital_name?: string
          id?: string
          latitude?: number
          longitude?: number
          patient_condition?: string | null
          requester_mobile?: string | null
          requester_name?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          units_needed?: number
          updated_at?: string
          upozilla?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"]
          zilla?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blood_requests_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_packages: {
        Row: {
          created_at: string
          credits: number
          id: string
          is_active: boolean
          name: string
          price_bdt: number
        }
        Insert: {
          created_at?: string
          credits: number
          id?: string
          is_active?: boolean
          name: string
          price_bdt: number
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          is_active?: boolean
          name?: string
          price_bdt?: number
        }
        Relationships: []
      }
      credit_purchase_requests: {
        Row: {
          created_at: string
          hospital_id: string
          id: string
          package_id: string
          payment_method: string
          payment_reference: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hospital_id: string
          id?: string
          package_id: string
          payment_method?: string
          payment_reference?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hospital_id?: string
          id?: string
          package_id?: string
          payment_method?: string
          payment_reference?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_purchase_requests_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_purchase_requests_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "credit_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          hospital_id: string
          id: string
          request_id: string | null
          type: Database["public"]["Enums"]["credit_transaction_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string
          hospital_id: string
          id?: string
          request_id?: string | null
          type: Database["public"]["Enums"]["credit_transaction_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          hospital_id?: string
          id?: string
          request_id?: string | null
          type?: Database["public"]["Enums"]["credit_transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at: string
          date: string
          donor_id: string
          hospital_name: string
          id: string
          request_id: string | null
          status: Database["public"]["Enums"]["donation_status"]
        }
        Insert: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at?: string
          date?: string
          donor_id: string
          hospital_name?: string
          id?: string
          request_id?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
        }
        Update: {
          blood_type?: Database["public"]["Enums"]["blood_type"]
          created_at?: string
          date?: string
          donor_id?: string
          hospital_name?: string
          id?: string
          request_id?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_live_locations: {
        Row: {
          created_at: string
          donor_id: string
          id: string
          latitude: number
          longitude: number
          mission_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          donor_id: string
          id?: string
          latitude?: number
          longitude?: number
          mission_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          donor_id?: string
          id?: string
          latitude?: number
          longitude?: number
          mission_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donor_live_locations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donor_live_locations_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          city: string
          created_at: string
          donation_count: number
          id: string
          is_available: boolean
          last_donation_date: string | null
          latitude: number
          longitude: number
          updated_at: string
          upozilla: string | null
          user_id: string
          zilla: string | null
        }
        Insert: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          city?: string
          created_at?: string
          donation_count?: number
          id?: string
          is_available?: boolean
          last_donation_date?: string | null
          latitude?: number
          longitude?: number
          updated_at?: string
          upozilla?: string | null
          user_id: string
          zilla?: string | null
        }
        Update: {
          blood_type?: Database["public"]["Enums"]["blood_type"]
          city?: string
          created_at?: string
          donation_count?: number
          id?: string
          is_available?: boolean
          last_donation_date?: string | null
          latitude?: number
          longitude?: number
          updated_at?: string
          upozilla?: string | null
          user_id?: string
          zilla?: string | null
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
      hospital_credits: {
        Row: {
          balance: number
          created_at: string
          hospital_id: string
          id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          hospital_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          hospital_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_credits_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: true
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_subscriptions: {
        Row: {
          created_at: string
          credits_per_month: number
          expires_at: string | null
          hospital_id: string
          id: string
          payment_method: string
          payment_reference: string
          plan_name: string
          price_bdt: number
          starts_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_per_month: number
          expires_at?: string | null
          hospital_id: string
          id?: string
          payment_method?: string
          payment_reference?: string
          plan_name: string
          price_bdt: number
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_per_month?: number
          expires_at?: string | null
          hospital_id?: string
          id?: string
          payment_method?: string
          payment_reference?: string
          plan_name?: string
          price_bdt?: number
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_subscriptions_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          address: string
          contact_number: string | null
          created_at: string
          id: string
          latitude: number
          longitude: number
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string
          contact_number?: string | null
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          contact_number?: string | null
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          created_at: string
          donor_id: string
          donor_user_id: string
          id: string
          request_id: string
          status: Database["public"]["Enums"]["mission_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          donor_id: string
          donor_user_id: string
          id?: string
          request_id: string
          status?: Database["public"]["Enums"]["mission_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          donor_id?: string
          donor_user_id?: string
          id?: string
          request_id?: string
          status?: Database["public"]["Enums"]["mission_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          blood_type: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          request_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          blood_type: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          request_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          blood_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          request_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      requester_credit_packages: {
        Row: {
          created_at: string
          credits: number
          id: string
          is_active: boolean
          name: string
          price_bdt: number
        }
        Insert: {
          created_at?: string
          credits: number
          id?: string
          is_active?: boolean
          name: string
          price_bdt: number
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          is_active?: boolean
          name?: string
          price_bdt?: number
        }
        Relationships: []
      }
      requester_credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          request_id: string | null
          type: Database["public"]["Enums"]["credit_transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string
          id?: string
          request_id?: string | null
          type: Database["public"]["Enums"]["credit_transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          request_id?: string | null
          type?: Database["public"]["Enums"]["credit_transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requester_credit_transactions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requester_credits: {
        Row: {
          balance: number
          created_at: string
          free_used: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          free_used?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          free_used?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      requester_purchase_requests: {
        Row: {
          created_at: string
          id: string
          package_id: string
          payment_method: string
          payment_reference: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          package_id: string
          payment_method?: string
          payment_reference?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          package_id?: string
          payment_method?: string
          payment_reference?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requester_purchase_requests_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "requester_credit_packages"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
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
    }
    Enums: {
      app_role: "donor" | "hospital" | "admin"
      blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
      credit_transaction_type:
        | "purchase"
        | "match_deduction"
        | "refund"
        | "signup_bonus"
      donation_status: "pending" | "completed" | "cancelled"
      mission_status:
        | "accepted"
        | "departed"
        | "on_the_way"
        | "halfway"
        | "almost_there"
        | "arrived"
      request_status: "OPEN" | "MATCHED" | "FULFILLED" | "CANCELLED"
      urgency_level: "CRITICAL" | "URGENT" | "STABLE"
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
      app_role: ["donor", "hospital", "admin"],
      blood_type: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      credit_transaction_type: [
        "purchase",
        "match_deduction",
        "refund",
        "signup_bonus",
      ],
      donation_status: ["pending", "completed", "cancelled"],
      mission_status: [
        "accepted",
        "departed",
        "on_the_way",
        "halfway",
        "almost_there",
        "arrived",
      ],
      request_status: ["OPEN", "MATCHED", "FULFILLED", "CANCELLED"],
      urgency_level: ["CRITICAL", "URGENT", "STABLE"],
    },
  },
} as const
