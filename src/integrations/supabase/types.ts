export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      colaborador: {
        Row: {
          id: number
          produtor_id: number | null
          user_id: string
          username: string | null
        }
        Insert: {
          id?: number
          produtor_id?: number | null
          user_id: string
          username?: string | null
        }
        Update: {
          id?: number
          produtor_id?: number | null
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colaborador_produtor_id_fkey"
            columns: ["produtor_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      colheita: {
        Row: {
          cultura: string
          data_colheita: string
          id: string
          propriedade_id: number | null
          quantidade: number
          registrado_por: string | null
          user_id: string
        }
        Insert: {
          cultura: string
          data_colheita: string
          id?: string
          propriedade_id?: number | null
          quantidade: number
          registrado_por?: string | null
          user_id: string
        }
        Update: {
          cultura?: string
          data_colheita?: string
          id?: string
          propriedade_id?: number | null
          quantidade?: number
          registrado_por?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "colheita_propriedade_id_fkey"
            columns: ["propriedade_id"]
            isOneToOne: false
            referencedRelation: "propriedade"
            referencedColumns: ["id"]
          },
        ]
      }
      dados_extraidos_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      gasto: {
        Row: {
          data_gasto: string
          descricao: string | null
          id: string
          propriedade_id: number | null
          registrado_por: string | null
          tipo: string
          user_id: string
          valor: number
        }
        Insert: {
          data_gasto: string
          descricao?: string | null
          id?: string
          propriedade_id?: number | null
          registrado_por?: string | null
          tipo: string
          user_id: string
          valor: number
        }
        Update: {
          data_gasto?: string
          descricao?: string | null
          id?: string
          propriedade_id?: number | null
          registrado_por?: string | null
          tipo?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "gasto_propriedade_id_fkey"
            columns: ["propriedade_id"]
            isOneToOne: false
            referencedRelation: "propriedade"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_gestao_rural: {
        Row: {
          chat_id: string
          criado_em: string | null
          dados: Json | null
          estado: string | null
          id: number
          resposta_usuario: string
        }
        Insert: {
          chat_id: string
          criado_em?: string | null
          dados?: Json | null
          estado?: string | null
          id?: number
          resposta_usuario: string
        }
        Update: {
          chat_id?: string
          criado_em?: string | null
          dados?: Json | null
          estado?: string | null
          id?: number
          resposta_usuario?: string
        }
        Relationships: []
      }
      insumo: {
        Row: {
          id: number
          nome: string
          preco_unitario: number
          propriedade_id: number | null
          quantidade: number
          registrado_por: string | null
          tipo: string | null
          user_id: string
        }
        Insert: {
          id?: number
          nome: string
          preco_unitario: number
          propriedade_id?: number | null
          quantidade: number
          registrado_por?: string | null
          tipo?: string | null
          user_id: string
        }
        Update: {
          id?: number
          nome?: string
          preco_unitario?: number
          propriedade_id?: number | null
          quantidade?: number
          registrado_por?: string | null
          tipo?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insumo_propriedade_id_fkey"
            columns: ["propriedade_id"]
            isOneToOne: false
            referencedRelation: "propriedade"
            referencedColumns: ["id"]
          },
        ]
      }
      intencao_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      perguntas_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      plantio: {
        Row: {
          area_plantada: number
          cultura: string
          data_plantio: string
          id: string
          propriedade_id: number | null
          registrado_por: string | null
          user_id: string
        }
        Insert: {
          area_plantada: number
          cultura: string
          data_plantio: string
          id?: string
          propriedade_id?: number | null
          registrado_por?: string | null
          user_id: string
        }
        Update: {
          area_plantada?: number
          cultura?: string
          data_plantio?: string
          id?: string
          propriedade_id?: number | null
          registrado_por?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plantio_propriedade_id_fkey"
            columns: ["propriedade_id"]
            isOneToOne: false
            referencedRelation: "propriedade"
            referencedColumns: ["id"]
          },
        ]
      }
      propriedade: {
        Row: {
          area_total: number
          data_registro: string
          id: number
          nome: string
          user_id: number
        }
        Insert: {
          area_total: number
          data_registro: string
          id?: number
          nome: string
          user_id: number
        }
        Update: {
          area_total?: number
          data_registro?: string
          id?: number
          nome?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "propriedade_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      trabalho: {
        Row: {
          custo: number | null
          descricao: string
          id: number
          propriedade_id: number | null
          registrado_por: string | null
          responsavel: string | null
          user_id: string
        }
        Insert: {
          custo?: number | null
          descricao: string
          id?: number
          propriedade_id?: number | null
          registrado_por?: string | null
          responsavel?: string | null
          user_id: string
        }
        Update: {
          custo?: number | null
          descricao?: string
          id?: number
          propriedade_id?: number | null
          registrado_por?: string | null
          responsavel?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trabalho_propriedade_id_fkey"
            columns: ["propriedade_id"]
            isOneToOne: false
            referencedRelation: "propriedade"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario: {
        Row: {
          email: string
          id: number
          password: string
          user_id: string
        }
        Insert: {
          email: string
          id?: number
          password?: string
          user_id: string
        }
        Update: {
          email?: string
          id?: number
          password?: string
          user_id?: string
        }
        Relationships: []
      }
      venda: {
        Row: {
          cultura: string
          data_venda: string
          id: string
          propriedade_id: number | null
          quantidade: number
          registrado_por: string | null
          user_id: string
          valor_total: number | null
        }
        Insert: {
          cultura: string
          data_venda: string
          id?: string
          propriedade_id?: number | null
          quantidade: number
          registrado_por?: string | null
          user_id: string
          valor_total?: number | null
        }
        Update: {
          cultura?: string
          data_venda?: string
          id?: string
          propriedade_id?: number | null
          quantidade?: number
          registrado_por?: string | null
          user_id?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "venda_propriedade_id_fkey"
            columns: ["propriedade_id"]
            isOneToOne: false
            referencedRelation: "propriedade"
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
