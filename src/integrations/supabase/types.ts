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
      client_health_assessments: {
        Row: {
          client_id: string | null
          coach_id: string | null
          created_at: string | null
          current_activity_level: string | null
          dietary_restrictions: string | null
          gender: string | null
          gym_equipment_access: string | null
          health_goals: string | null
          height_cm: number | null
          id: string
          medical_conditions: string | null
          previous_exercise_experience: string | null
          sleep_patterns: string | null
          starting_weight: number | null
          stress_levels: string | null
          target_weight: number | null
        }
        Insert: {
          client_id?: string | null
          coach_id?: string | null
          created_at?: string | null
          current_activity_level?: string | null
          dietary_restrictions?: string | null
          gender?: string | null
          gym_equipment_access?: string | null
          health_goals?: string | null
          height_cm?: number | null
          id?: string
          medical_conditions?: string | null
          previous_exercise_experience?: string | null
          sleep_patterns?: string | null
          starting_weight?: number | null
          stress_levels?: string | null
          target_weight?: number | null
        }
        Update: {
          client_id?: string | null
          coach_id?: string | null
          created_at?: string | null
          current_activity_level?: string | null
          dietary_restrictions?: string | null
          gender?: string | null
          gym_equipment_access?: string | null
          health_goals?: string | null
          height_cm?: number | null
          id?: string
          medical_conditions?: string | null
          previous_exercise_experience?: string | null
          sleep_patterns?: string | null
          starting_weight?: number | null
          stress_levels?: string | null
          target_weight?: number | null
        }
        Relationships: []
      }
      client_nutrition_plans: {
        Row: {
          assigned_at: string | null
          client_id: string | null
          created_at: string | null
          id: string
          nutrition_plan_id: string | null
          status: string | null
        }
        Insert: {
          assigned_at?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          nutrition_plan_id?: string | null
          status?: string | null
        }
        Update: {
          assigned_at?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          nutrition_plan_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_nutrition_plans_nutrition_plan_id_fkey"
            columns: ["nutrition_plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plan_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      client_training_plans: {
        Row: {
          assigned_at: string | null
          client_id: string | null
          created_at: string | null
          id: string
          status: string | null
          training_plan_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          training_plan_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          training_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_training_plans_training_plan_id_fkey"
            columns: ["training_plan_id"]
            isOneToOne: false
            referencedRelation: "training_plan_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      clients_not_connected: {
        Row: {
          coach_id: string
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
        }
        Relationships: []
      }
      coach_clients: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          deactivated_at: string | null
          id: string
          requested_services: string[] | null
          status: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          deactivated_at?: string | null
          id?: string
          requested_services?: string[] | null
          status?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          deactivated_at?: string | null
          id?: string
          requested_services?: string[] | null
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
      exercise_datab_all_coaches: {
        Row: {
          description: string | null
          difficulty_level: string | null
          equitment_needed: string | null
          ID: string | null
          mid_posisiton_image: string | null
          muscle_group: string | null
          name: string | null
          start_position_image: string | null
          Type: string | null
        }
        Insert: {
          description?: string | null
          difficulty_level?: string | null
          equitment_needed?: string | null
          ID?: string | null
          mid_posisiton_image?: string | null
          muscle_group?: string | null
          name?: string | null
          start_position_image?: string | null
          Type?: string | null
        }
        Update: {
          description?: string | null
          difficulty_level?: string | null
          equitment_needed?: string | null
          ID?: string | null
          mid_posisiton_image?: string | null
          muscle_group?: string | null
          name?: string | null
          start_position_image?: string | null
          Type?: string | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          coach_id: string
          created_at: string | null
          description: string
          difficulty_level: string
          equipment_needed: string | null
          id: string
          instructions: string
          mid_position_image: string | null
          muscle_group: string
          name: string
          start_position_image: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          description: string
          difficulty_level: string
          equipment_needed?: string | null
          id?: string
          instructions: string
          mid_position_image?: string | null
          muscle_group: string
          name: string
          start_position_image?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          description?: string
          difficulty_level?: string
          equipment_needed?: string | null
          id?: string
          instructions?: string
          mid_position_image?: string | null
          muscle_group?: string
          name?: string
          start_position_image?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          calories_per_100g: number
          carbs_per_100g: number
          coach_id: string
          created_at: string | null
          fats_per_100g: number
          fiber_per_100g: number
          group_name: string | null
          id: string
          name: string
          protein_per_100g: number
        }
        Insert: {
          calories_per_100g: number
          carbs_per_100g: number
          coach_id: string
          created_at?: string | null
          fats_per_100g: number
          fiber_per_100g?: number
          group_name?: string | null
          id?: string
          name: string
          protein_per_100g: number
        }
        Update: {
          calories_per_100g?: number
          carbs_per_100g?: number
          coach_id?: string
          created_at?: string | null
          fats_per_100g?: number
          fiber_per_100g?: number
          group_name?: string | null
          id?: string
          name?: string
          protein_per_100g?: number
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients_all_coaches: {
        Row: {
          calories_per_100g: number | null
          carbs_per_100g: string | null
          fats_per_100g: string | null
          fibers_per_100g: string | null
          grop: string | null
          name: string | null
          protein_per_100g: string | null
        }
        Insert: {
          calories_per_100g?: number | null
          carbs_per_100g?: string | null
          fats_per_100g?: string | null
          fibers_per_100g?: string | null
          grop?: string | null
          name?: string | null
          protein_per_100g?: string | null
        }
        Update: {
          calories_per_100g?: number | null
          carbs_per_100g?: string | null
          fats_per_100g?: string | null
          fibers_per_100g?: string | null
          grop?: string | null
          name?: string | null
          protein_per_100g?: string | null
        }
        Relationships: []
      }
      meal_ingredients: {
        Row: {
          created_at: string | null
          id: string
          ingredient_id: string
          meal_id: string
          quantity_grams: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          ingredient_id: string
          meal_id: string
          quantity_grams: number
        }
        Update: {
          created_at?: string | null
          id?: string
          ingredient_id?: string
          meal_id?: string
          quantity_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_ingredients_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          created_at: string | null
          id: string
          name: string
          nutrition_plan_id: string
          order_index: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          nutrition_plan_id: string
          order_index: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          nutrition_plan_id?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "meals_nutrition_plan_id_fkey"
            columns: ["nutrition_plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      measurements: {
        Row: {
          "-- Först lägger vi till kolumnen ALTER TABLE measurements ADD":
            | string
            | null
          arm_cm: number | null
          back_photo_url: string | null
          checkin_id: string
          chest_cm: number | null
          created_at: string | null
          front_photo_url: string | null
          hips_cm: number | null
          id: string
          neck_cm: number | null
          side_photo_url: string | null
          thigh_cm: number | null
          waist_cm: number | null
          weekly_checkin_id: string | null
          weight_kg: number | null
        }
        Insert: {
          "-- Först lägger vi till kolumnen ALTER TABLE measurements ADD"?:
            | string
            | null
          arm_cm?: number | null
          back_photo_url?: string | null
          checkin_id: string
          chest_cm?: number | null
          created_at?: string | null
          front_photo_url?: string | null
          hips_cm?: number | null
          id?: string
          neck_cm?: number | null
          side_photo_url?: string | null
          thigh_cm?: number | null
          waist_cm?: number | null
          weekly_checkin_id?: string | null
          weight_kg?: number | null
        }
        Update: {
          "-- Först lägger vi till kolumnen ALTER TABLE measurements ADD"?:
            | string
            | null
          arm_cm?: number | null
          back_photo_url?: string | null
          checkin_id?: string
          chest_cm?: number | null
          created_at?: string | null
          front_photo_url?: string | null
          hips_cm?: number | null
          id?: string
          neck_cm?: number | null
          side_photo_url?: string | null
          thigh_cm?: number | null
          waist_cm?: number | null
          weekly_checkin_id?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "measurements_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "weekly_checkins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_checkins_measurements"
            columns: ["weekly_checkin_id"]
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
      nutrition_plan_templates: {
        Row: {
          coach_id: string
          created_at: string | null
          description: string | null
          id: string
          meals: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          meals?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          meals?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plan_templates_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plans: {
        Row: {
          calories_target: number | null
          carbs_target: number | null
          client_id: string | null
          coach_id: string | null
          created_at: string | null
          description: string | null
          fats_target: number | null
          id: string
          meal_plan: Json | null
          protein_target: number | null
          status: string | null
          title: string
        }
        Insert: {
          calories_target?: number | null
          carbs_target?: number | null
          client_id?: string | null
          coach_id?: string | null
          created_at?: string | null
          description?: string | null
          fats_target?: number | null
          id?: string
          meal_plan?: Json | null
          protein_target?: number | null
          status?: string | null
          title: string
        }
        Update: {
          calories_target?: number | null
          carbs_target?: number | null
          client_id?: string | null
          coach_id?: string | null
          created_at?: string | null
          description?: string | null
          fats_target?: number | null
          id?: string
          meal_plan?: Json | null
          protein_target?: number | null
          status?: string | null
          title?: string
        }
        Relationships: []
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
          first_name: string | null
          full_name: string | null
          has_changed_password: boolean | null
          has_completed_assessment: boolean | null
          id: string
          last_name: string | null
          raw_user_meta_data: Json | null
          registration_status: string | null
          requested_services: string[] | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_profile: Database["public"]["Enums"]["user_profile_type"]
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          full_name?: string | null
          has_changed_password?: boolean | null
          has_completed_assessment?: boolean | null
          id: string
          last_name?: string | null
          raw_user_meta_data?: Json | null
          registration_status?: string | null
          requested_services?: string[] | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_profile?: Database["public"]["Enums"]["user_profile_type"]
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          full_name?: string | null
          has_changed_password?: boolean | null
          has_completed_assessment?: boolean | null
          id?: string
          last_name?: string | null
          raw_user_meta_data?: Json | null
          registration_status?: string | null
          requested_services?: string[] | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_profile?: Database["public"]["Enums"]["user_profile_type"]
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
      subscription_plans: {
        Row: {
          active: boolean | null
          amount: number
          coach_id: string
          created_at: string | null
          currency: string
          description: string | null
          id: string
          interval: string
          name: string
          price_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          amount: number
          coach_id: string
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          interval?: string
          name: string
          price_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          amount?: number
          coach_id?: string
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          interval?: string
          name?: string
          price_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plans_coach_id_fkey"
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
      temp_coach_clients: {
        Row: {
          client_id: string | null
          coach_id: string | null
          created_at: string | null
          deactivated_at: string | null
          id: string | null
          requested_services: string[] | null
          status: string | null
        }
        Insert: {
          client_id?: string | null
          coach_id?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          id?: string | null
          requested_services?: string[] | null
          status?: string | null
        }
        Update: {
          client_id?: string | null
          coach_id?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          id?: string | null
          requested_services?: string[] | null
          status?: string | null
        }
        Relationships: []
      }
      theme_preferences: {
        Row: {
          accent_color: string
          company_name: string | null
          created_at: string
          id: string
          primary_color: string
          secondary_color: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string
          company_name?: string | null
          created_at?: string
          id?: string
          primary_color?: string
          secondary_color?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string
          company_name?: string | null
          created_at?: string
          id?: string
          primary_color?: string
          secondary_color?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_plan_exercises: {
        Row: {
          created_at: string | null
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          plan_id: string
          reps: number
          sets: number
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          id?: string
          notes?: string | null
          order_index: number
          plan_id: string
          reps: number
          sets: number
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          plan_id?: string
          reps?: number
          sets?: number
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "training_plan_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_plan_exercises_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plan_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plan_templates: {
        Row: {
          coach_id: string
          created_at: string | null
          description: string | null
          exercise_details: Json | null
          exercises: string[] | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          description?: string | null
          exercise_details?: Json | null
          exercises?: string[] | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          description?: string | null
          exercise_details?: Json | null
          exercises?: string[] | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_plan_templates_coach_id_fkey"
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
      workout_plans: {
        Row: {
          client_id: string | null
          coach_id: string | null
          created_at: string | null
          description: string | null
          id: string
          program_details: Json | null
          status: string | null
          title: string
        }
        Insert: {
          client_id?: string | null
          coach_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          program_details?: Json | null
          status?: string | null
          title: string
        }
        Update: {
          client_id?: string | null
          coach_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          program_details?: Json | null
          status?: string | null
          title?: string
        }
        Relationships: []
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
      can_create_checkin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      invite_client: {
        Args: {
          client_email: string
          client_name: string
          client_password: string
        }
        Returns: string
      }
      is_coach: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      answer_status: "pending" | "completed"
      message_status: "sent" | "delivered" | "read"
      session_status: "pending" | "confirmed" | "completed" | "cancelled"
      subscription_status: "active" | "pending" | "cancelled" | "expired"
      user_profile_type: "client" | "coach" | "operator" | "therapist"
      user_role: "admin" | "coach" | "client"
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
