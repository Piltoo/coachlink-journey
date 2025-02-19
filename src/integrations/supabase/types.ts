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
      checkin_answers: {
        Row: {
          answer: string
          checkin_id: string
          created_at: string | null
          id: string
          question_id: string
        }
        Insert: {
          answer: string
          checkin_id: string
          created_at?: string | null
          id?: string
          question_id: string
        }
        Update: {
          answer?: string
          checkin_id?: string
          created_at?: string | null
          id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkin_answers_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "weekly_checkins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "weekly_checkin_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_clients: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          id: string
          status: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          id?: string
          status?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_clients_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      measurements: {
        Row: {
          arm_cm: number | null
          checkin_id: string
          chest_cm: number | null
          created_at: string | null
          hips_cm: number | null
          id: string
          thigh_cm: number | null
          waist_cm: number | null
        }
        Insert: {
          arm_cm?: number | null
          checkin_id: string
          chest_cm?: number | null
          created_at?: string | null
          hips_cm?: number | null
          id?: string
          thigh_cm?: number | null
          waist_cm?: number | null
        }
        Update: {
          arm_cm?: number | null
          checkin_id?: string
          chest_cm?: number | null
          created_at?: string | null
          hips_cm?: number | null
          id?: string
          thigh_cm?: number | null
          waist_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "measurements_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "weekly_checkins"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: Database["public"]["Enums"]["message_status"] | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"] | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          paid_at: string | null
          status: string | null
          subscription_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          paid_at?: string | null
          status?: string | null
          subscription_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          paid_at?: string | null
          status?: string | null
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          billing_cycle_days: number
          client_id: string
          coach_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          billing_cycle_days: number
          client_id: string
          coach_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          billing_cycle_days?: number
          client_id?: string
          coach_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_checkin_questions: {
        Row: {
          created_at: string | null
          id: string
          question: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          question: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      weekly_checkins: {
        Row: {
          check_in_date: string | null
          client_id: string
          created_at: string | null
          id: string
          status: Database["public"]["Enums"]["answer_status"] | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          check_in_date?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["answer_status"] | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          check_in_date?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["answer_status"] | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_checkins_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string | null
          end_time: string
          id: string
          notes: string | null
          start_time: string
          status: Database["public"]["Enums"]["session_status"] | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string | null
          end_time: string
          id?: string
          notes?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["session_status"] | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["session_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      book_workout_session: {
        Args: {
          p_client_id: string
          p_coach_id: string
          p_start_time: string
          p_end_time: string
        }
        Returns: undefined
      }
      invite_client:
        | {
            Args: {
              client_email: string
              client_name: string
            }
            Returns: string
          }
        | {
            Args: {
              client_email: string
              client_name: string
              client_password: string
            }
            Returns: string
          }
    }
    Enums: {
      answer_status: "pending" | "completed"
      message_status: "sent" | "delivered" | "read"
      session_status: "pending" | "confirmed" | "completed" | "cancelled"
      subscription_status: "active" | "pending" | "cancelled" | "expired"
      user_role: "admin" | "trainer" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
