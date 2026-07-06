export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      activity_log: {
        Row: {
          action: string
          actor_role: Database["public"]["Enums"]["user_role"] | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json
          user_id: string | null
        }
        Insert: {
          action: string
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          action?: string
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          contractor_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
        }
        Insert: {
          contractor_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
        }
        Update: {
          contractor_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_blocks: {
        Row: {
          contractor_id: string
          created_at: string
          end_datetime: string
          id: string
          reason: string | null
          start_datetime: string
        }
        Insert: {
          contractor_id: string
          created_at?: string
          end_datetime: string
          id?: string
          reason?: string | null
          start_datetime: string
        }
        Update: {
          contractor_id?: string
          created_at?: string
          end_datetime?: string
          id?: string
          reason?: string | null
          start_datetime?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_blocks_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          accepted_at: string | null
          address_id: string | null
          address_line1: string | null
          address_line2: string | null
          booking_number: string
          cancel_reason: string | null
          cancelled_at: string | null
          city: string | null
          completed_at: string | null
          contractor_id: string
          contractor_payout: number | null
          created_at: string
          currency: string
          customer_id: string
          deleted_at: string | null
          final_price: number | null
          id: string
          job_notes: string | null
          lat: number | null
          lng: number | null
          photos: string[]
          platform_fee: number | null
          quoted_price: number | null
          scheduled_end: string | null
          scheduled_start: string | null
          service_id: string
          state: string | null
          status: Database["public"]["Enums"]["booking_status"]
          tip: number
          updated_at: string
          zip: string | null
        }
        Insert: {
          accepted_at?: string | null
          address_id?: string | null
          address_line1?: string | null
          address_line2?: string | null
          booking_number?: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          city?: string | null
          completed_at?: string | null
          contractor_id: string
          contractor_payout?: number | null
          created_at?: string
          currency?: string
          customer_id: string
          deleted_at?: string | null
          final_price?: number | null
          id?: string
          job_notes?: string | null
          lat?: number | null
          lng?: number | null
          photos?: string[]
          platform_fee?: number | null
          quoted_price?: number | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          service_id: string
          state?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          tip?: number
          updated_at?: string
          zip?: string | null
        }
        Update: {
          accepted_at?: string | null
          address_id?: string | null
          address_line1?: string | null
          address_line2?: string | null
          booking_number?: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          city?: string | null
          completed_at?: string | null
          contractor_id?: string
          contractor_payout?: number | null
          created_at?: string
          currency?: string
          customer_id?: string
          deleted_at?: string | null
          final_price?: number | null
          id?: string
          job_notes?: string | null
          lat?: number | null
          lng?: number | null
          photos?: string[]
          platform_fee?: number | null
          quoted_price?: number | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          service_id?: string
          state?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          tip?: number
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "customer_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_profiles: {
        Row: {
          avatar_url: string | null
          background_check_status: Database["public"]["Enums"]["check_status"]
          base_city: string | null
          base_lat: number | null
          base_lng: number | null
          base_state: string | null
          bio: string | null
          business_name: string
          created_at: string
          deleted_at: string | null
          headline: string | null
          id: string
          id_doc_url: string | null
          insurance_url: string | null
          is_active: boolean
          jobs_completed: number
          payouts_enabled: boolean
          rating_avg: number
          rating_count: number
          response_time_mins: number | null
          service_radius_miles: number
          slug: string | null
          stripe_account_id: string | null
          updated_at: string
          user_id: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          years_experience: number
        }
        Insert: {
          avatar_url?: string | null
          background_check_status?: Database["public"]["Enums"]["check_status"]
          base_city?: string | null
          base_lat?: number | null
          base_lng?: number | null
          base_state?: string | null
          bio?: string | null
          business_name: string
          created_at?: string
          deleted_at?: string | null
          headline?: string | null
          id?: string
          id_doc_url?: string | null
          insurance_url?: string | null
          is_active?: boolean
          jobs_completed?: number
          payouts_enabled?: boolean
          rating_avg?: number
          rating_count?: number
          response_time_mins?: number | null
          service_radius_miles?: number
          slug?: string | null
          stripe_account_id?: string | null
          updated_at?: string
          user_id: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          years_experience?: number
        }
        Update: {
          avatar_url?: string | null
          background_check_status?: Database["public"]["Enums"]["check_status"]
          base_city?: string | null
          base_lat?: number | null
          base_lng?: number | null
          base_state?: string | null
          bio?: string | null
          business_name?: string
          created_at?: string
          deleted_at?: string | null
          headline?: string | null
          id?: string
          id_doc_url?: string | null
          insurance_url?: string | null
          is_active?: boolean
          jobs_completed?: number
          payouts_enabled?: boolean
          rating_avg?: number
          rating_count?: number
          response_time_mins?: number | null
          service_radius_miles?: number
          slug?: string | null
          stripe_account_id?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          years_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: "contractor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_services: {
        Row: {
          contractor_id: string
          created_at: string
          id: string
          is_active: boolean
          price: number | null
          price_unit: string
          pricing_type: Database["public"]["Enums"]["pricing_type"]
          service_id: string
          updated_at: string
        }
        Insert: {
          contractor_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          price?: number | null
          price_unit?: string
          pricing_type?: Database["public"]["Enums"]["pricing_type"]
          service_id: string
          updated_at?: string
        }
        Update: {
          contractor_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          price?: number | null
          price_unit?: string
          pricing_type?: Database["public"]["Enums"]["pricing_type"]
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractor_services_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractor_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          booking_id: string | null
          contractor_id: string
          created_at: string
          customer_id: string
          id: string
          last_message_at: string | null
        }
        Insert: {
          booking_id?: string | null
          contractor_id: string
          created_at?: string
          customer_id: string
          id?: string
          last_message_at?: string | null
        }
        Update: {
          booking_id?: string | null
          contractor_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          last_message_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          city: string
          created_at: string
          customer_id: string
          deleted_at: string | null
          id: string
          is_default: boolean
          label: string | null
          lat: number | null
          line1: string
          line2: string | null
          lng: number | null
          state: string
          updated_at: string
          zip: string
        }
        Insert: {
          city: string
          created_at?: string
          customer_id: string
          deleted_at?: string | null
          id?: string
          is_default?: boolean
          label?: string | null
          lat?: number | null
          line1: string
          line2?: string | null
          lng?: number | null
          state: string
          updated_at?: string
          zip: string
        }
        Update: {
          city?: string
          created_at?: string
          customer_id?: string
          deleted_at?: string | null
          id?: string
          is_default?: boolean
          label?: string | null
          lat?: number | null
          line1?: string
          line2?: string | null
          lng?: number | null
          state?: string
          updated_at?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          created_at: string
          default_address: string | null
          id: string
          lat: number | null
          lng: number | null
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_address?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_address?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          booking_id: string
          created_at: string
          description: string | null
          id: string
          opened_by: string
          resolution: string | null
          status: Database["public"]["Enums"]["dispute_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          description?: string | null
          id?: string
          opened_by: string
          resolution?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          description?: string | null
          id?: string
          opened_by?: string
          resolution?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          contractor_id: string
          created_at: string
          customer_id: string
          id: string
        }
        Insert: {
          contractor_id: string
          created_at?: string
          customer_id: string
          id?: string
        }
        Update: {
          contractor_id?: string
          created_at?: string
          customer_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_url: string | null
          body: string | null
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          body?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          body?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          contractor_id: string
          created_at: string
          currency: string
          customer_id: string
          id: string
          paid_at: string | null
          payout_amount: number
          platform_fee: number
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id: string | null
          tip: number
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          contractor_id: string
          created_at?: string
          currency?: string
          customer_id: string
          id?: string
          paid_at?: string | null
          payout_amount?: number
          platform_fee?: number
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          tip?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          contractor_id?: string
          created_at?: string
          currency?: string
          customer_id?: string
          id?: string
          paid_at?: string | null
          payout_amount?: number
          platform_fee?: number
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          tip?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          expires_at: string | null
          id: string
          max_uses: number | null
          min_subtotal: number | null
          type: Database["public"]["Enums"]["promo_type"]
          updated_at: string
          used_count: number
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_subtotal?: number | null
          type: Database["public"]["Enums"]["promo_type"]
          updated_at?: string
          used_count?: number
          value: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_subtotal?: number | null
          type?: Database["public"]["Enums"]["promo_type"]
          updated_at?: string
          used_count?: number
          value?: number
        }
        Relationships: []
      }
      quotes: {
        Row: {
          amount: number
          booking_id: string
          contractor_id: string
          created_at: string
          expires_at: string | null
          id: string
          message: string | null
          status: Database["public"]["Enums"]["quote_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          contractor_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          contractor_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          code: string
          created_at: string
          id: string
          referred_user_id: string | null
          referrer_user_id: string
          reward_status: Database["public"]["Enums"]["referral_status"]
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          referred_user_id?: string | null
          referrer_user_id: string
          reward_status?: Database["public"]["Enums"]["referral_status"]
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          referred_user_id?: string | null
          referrer_user_id?: string
          reward_status?: Database["public"]["Enums"]["referral_status"]
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          contractor_id: string
          contractor_reply: string | null
          created_at: string
          customer_display_name: string | null
          customer_id: string
          id: string
          rating: number
          reverse_comment: string | null
          reverse_rating: number | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          contractor_id: string
          contractor_reply?: string | null
          created_at?: string
          customer_display_name?: string | null
          customer_id: string
          id?: string
          rating: number
          reverse_comment?: string | null
          reverse_rating?: number | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          contractor_id?: string
          contractor_reply?: string | null
          created_at?: string
          customer_display_name?: string | null
          customer_id?: string
          id?: string
          rating?: number
          reverse_comment?: string | null
          reverse_rating?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category_id: string
          created_at: string
          default_pricing_type: Database["public"]["Enums"]["pricing_type"]
          description: string | null
          est_duration_mins: number | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          suggested_min_price: number | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          default_pricing_type?: Database["public"]["Enums"]["pricing_type"]
          description?: string | null
          est_duration_mins?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          suggested_min_price?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          default_pricing_type?: Database["public"]["Enums"]["pricing_type"]
          description?: string | null
          est_duration_mins?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          suggested_min_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      reviews_public: {
        Row: {
          booking_id: string | null
          comment: string | null
          contractor_id: string | null
          contractor_reply: string | null
          created_at: string | null
          customer_display_name: string | null
          id: string | null
          rating: number | null
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          contractor_id?: string | null
          contractor_reply?: string | null
          created_at?: string | null
          customer_display_name?: string | null
          id?: string | null
          rating?: number | null
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          contractor_id?: string | null
          contractor_reply?: string | null
          created_at?: string | null
          customer_display_name?: string | null
          id?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      current_contractor_id: { Args: never; Returns: string }
      haversine_miles: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      is_admin: { Args: never; Returns: boolean }
      is_booking_party: { Args: { p_booking_id: string }; Returns: boolean }
      is_conversation_party: {
        Args: { p_conversation_id: string }
        Returns: boolean
      }
      is_live_contractor: { Args: { p_id: string }; Returns: boolean }
      owns_contractor: { Args: { p_id: string }; Returns: boolean }
    }
    Enums: {
      booking_status:
        | "requested"
        | "accepted"
        | "declined"
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "refunded"
      check_status: "not_started" | "pending" | "passed" | "failed"
      dispute_status: "open" | "under_review" | "resolved" | "rejected"
      payment_status: "pending" | "paid" | "refunded" | "failed"
      pricing_type: "hourly" | "fixed" | "quote"
      promo_type: "percent" | "fixed"
      quote_status: "sent" | "accepted" | "declined" | "expired"
      referral_status: "pending" | "completed" | "rewarded"
      user_role: "customer" | "contractor" | "admin"
      user_status: "active" | "suspended"
      verification_status: "pending" | "approved" | "rejected"
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
      booking_status: [
        "requested",
        "accepted",
        "declined",
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "refunded",
      ],
      check_status: ["not_started", "pending", "passed", "failed"],
      dispute_status: ["open", "under_review", "resolved", "rejected"],
      payment_status: ["pending", "paid", "refunded", "failed"],
      pricing_type: ["hourly", "fixed", "quote"],
      promo_type: ["percent", "fixed"],
      quote_status: ["sent", "accepted", "declined", "expired"],
      referral_status: ["pending", "completed", "rewarded"],
      user_role: ["customer", "contractor", "admin"],
      user_status: ["active", "suspended"],
      verification_status: ["pending", "approved", "rejected"],
    },
  },
} as const

