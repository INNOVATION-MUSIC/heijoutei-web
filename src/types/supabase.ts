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
      business_calendars: {
        Row: {
          created_at: string | null
          date: string
          id: string
          note: string | null
          status: string
          store_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          note?: string | null
          status?: string
          store_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          note?: string | null
          status?: string
          store_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_calendars_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_read: boolean | null
          kana: string | null
          message: string
          name: string
          phone: string | null
          read_at: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_read?: boolean | null
          kana?: string | null
          message: string
          name: string
          phone?: string | null
          read_at?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_read?: boolean | null
          kana?: string | null
          message?: string
          name?: string
          phone?: string | null
          read_at?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      course_categories: {
        Row: {
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          course_category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          notes: string | null
          price_label: string | null
          sort_order: number | null
          store_id: string
          type_label: string | null
          updated_at: string | null
          with_rice: boolean
        }
        Insert: {
          course_category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          notes?: string | null
          price_label?: string | null
          sort_order?: number | null
          store_id: string
          type_label?: string | null
          updated_at?: string | null
          with_rice?: boolean
        }
        Update: {
          course_category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          notes?: string | null
          price_label?: string | null
          sort_order?: number | null
          store_id?: string
          type_label?: string | null
          updated_at?: string | null
          with_rice?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "courses_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_course_category_id_fkey"
            columns: ["course_category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_products: {
        Row: {
          content: string | null
          content_label: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_short: boolean
          price_amount: string | null
          price_note: string | null
          sort_order: number | null
          specs: Json
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          content_label?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_short?: boolean
          price_amount?: string | null
          price_note?: string | null
          sort_order?: number | null
          specs?: Json
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          content_label?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_short?: boolean
          price_amount?: string | null
          price_note?: string | null
          sort_order?: number | null
          specs?: Json
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gift_shipping_areas: {
        Row: {
          created_at: string | null
          fee: string | null
          id: string
          prefectures: string[]
          region: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fee?: string | null
          id?: string
          prefectures?: string[]
          region: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fee?: string | null
          id?: string
          prefectures?: string[]
          region?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      media: {
        Row: {
          created_at: string | null
          filename: string
          id: string
          mime_type: string | null
          size: number | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          filename: string
          id?: string
          mime_type?: string | null
          size?: number | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          filename?: string
          id?: string
          mime_type?: string | null
          size?: number | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      lunch_categories: {
        Row: {
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          description: string | null
          id: string
          image_url: string | null
          lunch_category_id: string | null
          name: string
          price_label: string | null
          sort_order: number | null
          store_menu_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          image_url?: string | null
          lunch_category_id?: string | null
          name: string
          price_label?: string | null
          sort_order?: number | null
          store_menu_id: string
        }
        Update: {
          description?: string | null
          id?: string
          image_url?: string | null
          lunch_category_id?: string | null
          name?: string
          price_label?: string | null
          sort_order?: number | null
          store_menu_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_store_menu_id_fkey"
            columns: ["store_menu_id"]
            isOneToOne: false
            referencedRelation: "store_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_lunch_category_id_fkey"
            columns: ["lunch_category_id"]
            isOneToOne: false
            referencedRelation: "lunch_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          body: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          slug: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      news_tags: {
        Row: {
          color: string
          id: string
          label: string
          news_id: string
          sort_order: number | null
        }
        Insert: {
          color?: string
          id?: string
          label: string
          news_id: string
          sort_order?: number | null
        }
        Update: {
          color?: string
          id?: string
          label?: string
          news_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_tags_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      recruitment_details: {
        Row: {
          id: string
          label: string
          recruitment_id: string
          sort_order: number | null
          value: string
        }
        Insert: {
          id?: string
          label: string
          recruitment_id: string
          sort_order?: number | null
          value: string
        }
        Update: {
          id?: string
          label?: string
          recruitment_id?: string
          sort_order?: number | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_details_recruitment_id_fkey"
            columns: ["recruitment_id"]
            isOneToOne: false
            referencedRelation: "recruitments"
            referencedColumns: ["id"]
          },
        ]
      }
      recruitment_tags: {
        Row: {
          color: string
          id: string
          label: string
          recruitment_id: string
          sort_order: number | null
        }
        Insert: {
          color?: string
          id?: string
          label: string
          recruitment_id: string
          sort_order?: number | null
        }
        Update: {
          color?: string
          id?: string
          label?: string
          recruitment_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_tags_recruitment_id_fkey"
            columns: ["recruitment_id"]
            isOneToOne: false
            referencedRelation: "recruitments"
            referencedColumns: ["id"]
          },
        ]
      }
      recruitments: {
        Row: {
          body: string | null
          created_at: string | null
          hero_image_url: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          published_at: string | null
          sort_order: number | null
          store_id: string
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          hero_image_url?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          sort_order?: number | null
          store_id: string
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          hero_image_url?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          sort_order?: number | null
          store_id?: string
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recruitments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_menus: {
        Row: {
          category_id: string | null
          created_at: string | null
          detail_description: string | null
          detail_image_url: string | null
          detail_slug: string | null
          has_detail_page: boolean | null
          id: string
          is_active: boolean | null
          section_title: string | null
          sort_order: number | null
          store_id: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          detail_description?: string | null
          detail_image_url?: string | null
          detail_slug?: string | null
          has_detail_page?: boolean | null
          id?: string
          is_active?: boolean | null
          section_title?: string | null
          sort_order?: number | null
          store_id: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          detail_description?: string | null
          detail_image_url?: string | null
          detail_slug?: string | null
          has_detail_page?: boolean | null
          id?: string
          is_active?: boolean | null
          section_title?: string | null
          sort_order?: number | null
          store_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_menus_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_menus_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_takeout_menu_stores: {
        Row: {
          store_id: string
          takeout_menu_id: string
        }
        Insert: {
          store_id: string
          takeout_menu_id: string
        }
        Update: {
          store_id?: string
          takeout_menu_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_takeout_menu_stores_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_takeout_menu_stores_takeout_menu_id_fkey"
            columns: ["takeout_menu_id"]
            isOneToOne: false
            referencedRelation: "store_takeout_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      store_takeout_menus: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_takeout_menus_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "takeout_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          access: string | null
          address: string | null
          business_hours: string | null
          closed_days: string | null
          created_at: string | null
          description: string | null
          gallery_image_urls: string[] | null
          google_map_url: string | null
          hero_image_url: string | null
          id: string
          is_active: boolean | null
          is_coming_soon: boolean | null
          line_id: string | null
          logo_image_url: string | null
          name: string
          name_en: string | null
          phone: string | null
          seat_count: string | null
          seat_description: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          access?: string | null
          address?: string | null
          business_hours?: string | null
          closed_days?: string | null
          created_at?: string | null
          description?: string | null
          gallery_image_urls?: string[] | null
          google_map_url?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          is_coming_soon?: boolean | null
          line_id?: string | null
          logo_image_url?: string | null
          name: string
          name_en?: string | null
          phone?: string | null
          seat_count?: string | null
          seat_description?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          access?: string | null
          address?: string | null
          business_hours?: string | null
          closed_days?: string | null
          created_at?: string | null
          description?: string | null
          gallery_image_urls?: string[] | null
          google_map_url?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          is_coming_soon?: boolean | null
          line_id?: string | null
          logo_image_url?: string | null
          name?: string
          name_en?: string | null
          phone?: string | null
          seat_count?: string | null
          seat_description?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      takeout_categories: {
        Row: {
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      takeout_order_items: {
        Row: {
          id: string
          item_name: string
          order_id: string
          price: number
          quantity: number
          takeout_menu_id: string | null
        }
        Insert: {
          id?: string
          item_name: string
          order_id: string
          price: number
          quantity?: number
          takeout_menu_id?: string | null
        }
        Update: {
          id?: string
          item_name?: string
          order_id?: string
          price?: number
          quantity?: number
          takeout_menu_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "takeout_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "takeout_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "takeout_order_items_takeout_menu_id_fkey"
            columns: ["takeout_menu_id"]
            isOneToOne: false
            referencedRelation: "store_takeout_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      takeout_orders: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_kana: string | null
          customer_name: string
          customer_note: string | null
          customer_phone: string | null
          id: string
          is_read: boolean | null
          pickup_date: string
          pickup_time: string
          read_at: string | null
          slot_id: string | null
          status: string
          store_id: string
          total_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_kana?: string | null
          customer_name: string
          customer_note?: string | null
          customer_phone?: string | null
          id?: string
          is_read?: boolean | null
          pickup_date: string
          pickup_time: string
          read_at?: string | null
          slot_id?: string | null
          status?: string
          store_id: string
          total_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_kana?: string | null
          customer_name?: string
          customer_note?: string | null
          customer_phone?: string | null
          id?: string
          is_read?: boolean | null
          pickup_date?: string
          pickup_time?: string
          read_at?: string | null
          slot_id?: string | null
          status?: string
          store_id?: string
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "takeout_orders_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "takeout_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "takeout_orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      takeout_slot_times: {
        Row: {
          capacity: number
          id: string
          is_active: boolean | null
          slot_id: string
          sort_order: number | null
          time_label: string
        }
        Insert: {
          capacity?: number
          id?: string
          is_active?: boolean | null
          slot_id: string
          sort_order?: number | null
          time_label: string
        }
        Update: {
          capacity?: number
          id?: string
          is_active?: boolean | null
          slot_id?: string
          sort_order?: number | null
          time_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "takeout_slot_times_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "takeout_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      takeout_slots: {
        Row: {
          available_date: string
          created_at: string | null
          default_capacity: number
          id: string
          is_closed: boolean | null
          store_id: string
          updated_at: string | null
        }
        Insert: {
          available_date: string
          created_at?: string | null
          default_capacity?: number
          id?: string
          is_closed?: boolean | null
          store_id: string
          updated_at?: string | null
        }
        Update: {
          available_date?: string
          created_at?: string | null
          default_capacity?: number
          id?: string
          is_closed?: boolean | null
          store_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "takeout_slots_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
