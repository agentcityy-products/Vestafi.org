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
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      applications: {
        Row: {
          age_range: string | null
          category: number | null
          contribution_capacity: string | null
          contribution_frequency: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string
          goals: string[] | null
          id: string
          investment_timeline: string | null
          joining_as: string | null
          location: string | null
          meeting_link_sent: boolean
          monthly_income: string | null
          phone: string
          phone_country_code: string
          referral_source: string | null
          referred_by: string | null
          savings: string
          status: Database["public"]["Enums"]["application_status_enum"]
          updated_at: string
          webinar_willing: boolean | null
          why_vestafi: string[]
        }
        Insert: {
          age_range?: string | null
          category?: number | null
          contribution_capacity?: string | null
          contribution_frequency?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          goals?: string[] | null
          id?: string
          investment_timeline?: string | null
          joining_as?: string | null
          location?: string | null
          meeting_link_sent?: boolean
          monthly_income?: string | null
          phone: string
          phone_country_code: string
          referral_source?: string | null
          referred_by?: string | null
          savings: string
          status?: Database["public"]["Enums"]["application_status_enum"]
          updated_at?: string
          webinar_willing?: boolean | null
          why_vestafi: string[]
        }
        Update: {
          age_range?: string | null
          category?: number | null
          contribution_capacity?: string | null
          contribution_frequency?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          goals?: string[] | null
          id?: string
          investment_timeline?: string | null
          joining_as?: string | null
          location?: string | null
          meeting_link_sent?: boolean
          monthly_income?: string | null
          phone?: string
          phone_country_code?: string
          referral_source?: string | null
          referred_by?: string | null
          savings?: string
          status?: Database["public"]["Enums"]["application_status_enum"]
          updated_at?: string
          webinar_willing?: boolean | null
          why_vestafi?: string[]
        }
        Relationships: []
      }
      bank_info: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          profile_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_name: string
          profile_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_info_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_info_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      exit_window_orders: {
        Row: {
          amount_remaining: number
          amount_total: number
          created_at: string
          exit_window_id: string
          expires_at: string
          id: string
          property_id: string
          seller_user_id: string
          status: Database["public"]["Enums"]["exit_window_order_status_enum"]
        }
        Insert: {
          amount_remaining: number
          amount_total: number
          created_at?: string
          exit_window_id: string
          expires_at: string
          id?: string
          property_id: string
          seller_user_id: string
          status?: Database["public"]["Enums"]["exit_window_order_status_enum"]
        }
        Update: {
          amount_remaining?: number
          amount_total?: number
          created_at?: string
          exit_window_id?: string
          expires_at?: string
          id?: string
          property_id?: string
          seller_user_id?: string
          status?: Database["public"]["Enums"]["exit_window_order_status_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "exit_window_orders_exit_window_id_fkey"
            columns: ["exit_window_id"]
            isOneToOne: false
            referencedRelation: "exit_windows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_window_orders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "listings_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_window_orders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owned_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_window_orders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_window_orders_seller_user_id_fkey"
            columns: ["seller_user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_window_orders_seller_user_id_fkey"
            columns: ["seller_user_id"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      exit_window_property_prices: {
        Row: {
          created_at: string
          exit_price: number
          exit_window_id: string
          id: string
          property_id: string
        }
        Insert: {
          created_at?: string
          exit_price: number
          exit_window_id: string
          id?: string
          property_id: string
        }
        Update: {
          created_at?: string
          exit_price?: number
          exit_window_id?: string
          id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exit_window_property_prices_exit_window_id_fkey"
            columns: ["exit_window_id"]
            isOneToOne: false
            referencedRelation: "exit_windows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_window_property_prices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "listings_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_window_property_prices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owned_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_window_property_prices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
        ]
      }
      exit_window_trades: {
        Row: {
          amount: number
          buyer_user_id: string
          created_at: string
          fee_amount: number
          id: string
          order_id: string
          property_id: string
          seller_proceeds: number
          seller_user_id: string
        }
        Insert: {
          amount: number
          buyer_user_id: string
          created_at?: string
          fee_amount: number
          id?: string
          order_id: string
          property_id: string
          seller_proceeds: number
          seller_user_id: string
        }
        Update: {
          amount?: number
          buyer_user_id?: string
          created_at?: string
          fee_amount?: number
          id?: string
          order_id?: string
          property_id?: string
          seller_proceeds?: number
          seller_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exit_window_trades_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_window_trades_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "exit_window_trades_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "exit_window_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_window_trades_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "listings_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_window_trades_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owned_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_window_trades_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_window_trades_seller_user_id_fkey"
            columns: ["seller_user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_window_trades_seller_user_id_fkey"
            columns: ["seller_user_id"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      exit_windows: {
        Row: {
          created_at: string
          end_at: string
          id: string
          start_at: string
          status: Database["public"]["Enums"]["exit_window_status_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_at: string
          id?: string
          start_at: string
          status?: Database["public"]["Enums"]["exit_window_status_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_at?: string
          id?: string
          start_at?: string
          status?: Database["public"]["Enums"]["exit_window_status_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      investment: {
        Row: {
          amount: number
          created_at: string
          id: string
          ownership_type: string | null
          payment_method: string | null
          proof_images: string[] | null
          property_id: string
          receipt_url: string | null
          reservation_id: string | null
          status: Database["public"]["Enums"]["investment_status_enum"]
          updated_at: string
          user_id: string
          vault_transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          ownership_type?: string | null
          payment_method?: string | null
          proof_images?: string[] | null
          property_id: string
          receipt_url?: string | null
          reservation_id?: string | null
          status?: Database["public"]["Enums"]["investment_status_enum"]
          updated_at?: string
          user_id: string
          vault_transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          ownership_type?: string | null
          payment_method?: string | null
          proof_images?: string[] | null
          property_id?: string
          receipt_url?: string | null
          reservation_id?: string | null
          status?: Database["public"]["Enums"]["investment_status_enum"]
          updated_at?: string
          user_id?: string
          vault_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "listings_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owned_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "ownership_reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "investment_vault_transaction_id_fkey"
            columns: ["vault_transaction_id"]
            isOneToOne: false
            referencedRelation: "vault_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_activations: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          proof_images: string[] | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["membership_status_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          proof_images?: string[] | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["membership_status_enum"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          proof_images?: string[] | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["membership_status_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_activations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_activations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "membership_activations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_activations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      monthly_rent: {
        Row: {
          created_at: string
          id: string
          month: string
          property_id: string
          total_rent_collected: number
        }
        Insert: {
          created_at?: string
          id?: string
          month: string
          property_id: string
          total_rent_collected: number
        }
        Update: {
          created_at?: string
          id?: string
          month?: string
          property_id?: string
          total_rent_collected?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_rent_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "listings_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_rent_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owned_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_rent_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_return: {
        Row: {
          amount: number
          created_at: string
          id: string
          month: string
          property_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          month: string
          property_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          month?: string
          property_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_return_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "listings_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_return_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owned_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_return_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_return_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_return_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      next_of_kin: {
        Row: {
          address: string | null
          country_code: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          relationship: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          country_code?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          relationship: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          country_code?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          relationship?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "next_of_kin_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "next_of_kin_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      ownership_reservations: {
        Row: {
          completed_at: string | null
          created_at: string
          expires_at: string
          id: string
          investment_id: string | null
          legal_fee: number
          opportunity_type: string
          ownership_amount: number
          payment_method: string
          proof_images: string[]
          property_id: string
          service_fee: number
          status: string
          total_due: number
          updated_at: string
          user_id: string
          vault_transaction_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          investment_id?: string | null
          legal_fee?: number
          opportunity_type: string
          ownership_amount: number
          payment_method: string
          proof_images?: string[]
          property_id: string
          service_fee?: number
          status?: string
          total_due: number
          updated_at?: string
          user_id: string
          vault_transaction_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          investment_id?: string | null
          legal_fee?: number
          opportunity_type?: string
          ownership_amount?: number
          payment_method?: string
          proof_images?: string[]
          property_id?: string
          service_fee?: number
          status?: string
          total_due?: number
          updated_at?: string
          user_id?: string
          vault_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ownership_reservations_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ownership_reservations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "listings_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ownership_reservations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owned_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ownership_reservations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ownership_reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ownership_reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ownership_reservations_vault_transaction_id_fkey"
            columns: ["vault_transaction_id"]
            isOneToOne: false
            referencedRelation: "vault_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          country_code: string
          created_at: string
          email: string
          first_name: string
          id: string
          is_founding_member: boolean
          last_name: string
          membership_expires_at: string | null
          phone: string
          rank_types: Database["public"]["Enums"]["rank_types"] | null
          referral_code: string | null
        }
        Insert: {
          country_code: string
          created_at?: string
          email: string
          first_name: string
          id: string
          is_founding_member?: boolean
          last_name: string
          membership_expires_at?: string | null
          phone: string
          rank_types?: Database["public"]["Enums"]["rank_types"] | null
          referral_code?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_founding_member?: boolean
          last_name?: string
          membership_expires_at?: string | null
          phone?: string
          rank_types?: Database["public"]["Enums"]["rank_types"] | null
          referral_code?: string | null
        }
        Relationships: []
      }
      property: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          allow_first_time_investors: boolean
          city: string
          country: string
          created_at: string
          description: string
          id: string
          images: string[]
          listing_date: string | null
          maximum_monthly_rent: number | null
          minimum_monthly_rent: number | null
          opportunity_type: string
          ownership_proof: string[] | null
          price: number
          price_usd: number | null
          property_type: Database["public"]["Enums"]["property_type_enum"]
          rejection_reason: string | null
          state: string | null
          status: Database["public"]["Enums"]["property_status_enum"] | null
          submitted_by: string | null
          title: string
          zip_code: string | null
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          allow_first_time_investors?: boolean
          city: string
          country: string
          created_at?: string
          description: string
          id?: string
          images: string[]
          listing_date?: string | null
          maximum_monthly_rent?: number | null
          minimum_monthly_rent?: number | null
          opportunity_type?: string
          ownership_proof?: string[] | null
          price: number
          price_usd?: number | null
          property_type?: Database["public"]["Enums"]["property_type_enum"]
          rejection_reason?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status_enum"] | null
          submitted_by?: string | null
          title: string
          zip_code?: string | null
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          allow_first_time_investors?: boolean
          city?: string
          country?: string
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          listing_date?: string | null
          maximum_monthly_rent?: number | null
          minimum_monthly_rent?: number | null
          opportunity_type?: string
          ownership_proof?: string[] | null
          price?: number
          price_usd?: number | null
          property_type?: Database["public"]["Enums"]["property_type_enum"]
          rejection_reason?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status_enum"] | null
          submitted_by?: string | null
          title?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      property_ownership_movements: {
        Row: {
          amount_delta: number
          created_at: string
          id: string
          property_id: string
          reason: Database["public"]["Enums"]["ownership_movement_reason_enum"]
          ref_id: string | null
          user_id: string
        }
        Insert: {
          amount_delta: number
          created_at?: string
          id?: string
          property_id: string
          reason: Database["public"]["Enums"]["ownership_movement_reason_enum"]
          ref_id?: string | null
          user_id: string
        }
        Update: {
          amount_delta?: number
          created_at?: string
          id?: string
          property_id?: string
          reason?: Database["public"]["Enums"]["ownership_movement_reason_enum"]
          ref_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_ownership_movements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "listings_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_ownership_movements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owned_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_ownership_movements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_ownership_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_ownership_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      referral_rewards: {
        Row: {
          id: string
          reward_per_referral: number | null
          total_referrals: number | null
          total_rewards: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          reward_per_referral?: number | null
          total_referrals?: number | null
          total_rewards?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          reward_per_referral?: number | null
          total_referrals?: number | null
          total_rewards?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      referrals: {
        Row: {
          application_id: string | null
          created_at: string | null
          id: string
          referee_id: string | null
          referral_code: string
          referrer_id: string | null
          status: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          id?: string
          referee_id?: string | null
          referral_code: string
          referrer_id?: string | null
          status?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          id?: string
          referee_id?: string | null
          referral_code?: string
          referrer_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      user_role: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_role_enum"]
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["user_role_enum"]
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["user_role_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "profile_role_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_role_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      user_vault: {
        Row: {
          balance: number | null
          created_at: string | null
          total_deployed: number | null
          total_deposited: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          total_deployed?: number | null
          total_deposited?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          total_deployed?: number | null
          total_deposited?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_vault_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_vault_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      vault_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          proof_images: string[] | null
          property_id: string | null
          receipt_url: string | null
          status: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          proof_images?: string[] | null
          property_id?: string | null
          receipt_url?: string | null
          status?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          proof_images?: string[] | null
          property_id?: string | null
          receipt_url?: string | null
          status?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "listings_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owned_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      withdrawal_request: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_proof_url: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["withdrawal_status_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_proof_url?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status_enum"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_proof_url?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_request_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_request_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
    }
    Views: {
      current_ownership_view: {
        Row: {
          current_amount: number | null
          latest_movement_at: string | null
          property_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_ownership_movements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "listings_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_ownership_movements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owned_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_ownership_movements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_ownership_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_ownership_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vault_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      listings_view: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          allow_first_time_investors: boolean | null
          available_ownership: number | null
          average_rent_6_months: number | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          id: string | null
          images: string[] | null
          investment_percentage: number | null
          is_reserved: boolean | null
          maximum_monthly_rent: number | null
          minimum_monthly_rent: number | null
          opportunity_type: string | null
          price: number | null
          reserved_amount: number | null
          state: string | null
          title: string | null
          total_investment: number | null
          zip_code: string | null
        }
        Relationships: []
      }
      owned_properties_view: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          id: string | null
          images: string[] | null
          latest_investment_date: string | null
          maximum_monthly_rent: number | null
          maximum_monthly_return: number | null
          minimum_monthly_rent: number | null
          minimum_monthly_return: number | null
          ownership_percentage: number | null
          pending_investment: number | null
          price: number | null
          state: string | null
          status: string | null
          successful_investment: number | null
          title: string | null
          user_id: string | null
          zip_code: string | null
        }
        Relationships: []
      }
      vault_view: {
        Row: {
          profile_id: string | null
          total_amount_in_vault: number | null
          total_earnings: number | null
          total_withdrawn: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      expire_ownership_reservations: { Args: never; Returns: number }
      generate_referral_code_from_email: {
        Args: { email_address: string }
        Returns: string
      }
      make_user_admin: { Args: { user_email: string }; Returns: boolean }
      send_email_trigger: { Args: never; Returns: Json }
    }
    Enums: {
      application_status_enum: "pending" | "approved" | "rejected"
      exit_window_order_status_enum:
        | "open"
        | "partially_filled"
        | "filled"
        | "cancelled"
        | "expired"
      exit_window_status_enum: "draft" | "active" | "ended"
      investment_status_enum: "pending" | "successful" | "rejected"
      membership_status_enum: "pending" | "approved" | "rejected"
      ownership_movement_reason_enum:
        | "primary_investment"
        | "secondary_trade"
        | "admin_adjustment"
      property_status_enum: "pending" | "approved" | "rejected"
      property_type_enum: "investment" | "rental"
      rank_types: "Associate" | "Steward" | "Champion" | "Legacy"
      user_role_enum: "investor" | "admin"
      withdrawal_status_enum: "rejected" | "pending" | "paid"
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
      application_status_enum: ["pending", "approved", "rejected"],
      exit_window_order_status_enum: [
        "open",
        "partially_filled",
        "filled",
        "cancelled",
        "expired",
      ],
      exit_window_status_enum: ["draft", "active", "ended"],
      investment_status_enum: ["pending", "successful", "rejected"],
      membership_status_enum: ["pending", "approved", "rejected"],
      ownership_movement_reason_enum: [
        "primary_investment",
        "secondary_trade",
        "admin_adjustment",
      ],
      property_status_enum: ["pending", "approved", "rejected"],
      property_type_enum: ["investment", "rental"],
      rank_types: ["Associate", "Steward", "Champion", "Legacy"],
      user_role_enum: ["investor", "admin"],
      withdrawal_status_enum: ["rejected", "pending", "paid"],
    },
  },
} as const
