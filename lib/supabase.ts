import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: number
          created_at: string
          user_id: string
          business_name: string
          niche: string
          city: string
          contact: string | null
          project_value: number
          amount_received: number
          lead_status: string
          payment_status: string
          notes: string | null
          ai_analysis: string | null
          generated_message: string | null
        }
        Insert: {
          user_id: string
          business_name: string
          niche: string
          city: string
          contact?: string | null
          project_value?: number
          amount_received?: number
          lead_status?: string
          payment_status?: string
          notes?: string | null
          ai_analysis?: string | null
          generated_message?: string | null
        }
        Update: {
          business_name?: string
          niche?: string
          city?: string
          contact?: string | null
          project_value?: number
          amount_received?: number
          lead_status?: string
          payment_status?: string
          notes?: string | null
          ai_analysis?: string | null
          generated_message?: string | null
        }
      }
      user_preferences: {
        Row: {
          id: number
          user_id: string
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          user_id: string
          key: string
          value: string
        }
        Update: {
          value?: string
        }
      }
    }
  }
}
