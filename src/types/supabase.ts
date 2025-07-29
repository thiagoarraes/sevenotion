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
      app_config: {
        Row: {
          entregue_status_id: string | null
          id: number
          in_progress_status_id: string | null
          kanban_status_order: string[] | null
          table_column_order: string[] | null
        }
        Insert: {
          entregue_status_id?: string | null
          id?: number
          in_progress_status_id?: string | null
          kanban_status_order?: string[] | null
          table_column_order?: string[] | null
        }
        Update: {
          entregue_status_id?: string | null
          id?: number
          in_progress_status_id?: string | null
          kanban_status_order?: string[] | null
          table_column_order?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "app_config_entregue_status_id_fkey"
            columns: ["entregue_status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_config_in_progress_status_id_fkey"
            columns: ["in_progress_status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cor: string
          id: string
          nome: string
        }
        Insert: {
          cor: string
          id?: string
          nome: string
        }
        Update: {
          cor?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      solicitantes: {
        Row: {
          cor: string
          id: string
          nome: string
        }
        Insert: {
          cor: string
          id?: string
          nome: string
        }
        Update: {
          cor?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      statuses: {
        Row: {
          cor: string
          id: string
          nome: string
        }
        Insert: {
          cor: string
          id?: string
          nome: string
        }
        Update: {
          cor?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          criado_em: string
          id: string
          nome_cliente_id: string
          position: number
          runrunit_task: string | null
          solicitado_por_id: string
          status_id: string
          tarefa: string
          tipo_id: string
          atualizado_em: string
        }
        Insert: {
          criado_em?: string
          id?: string
          nome_cliente_id: string
          position?: number | null
          runrunit_task?: string | null
          solicitado_por_id: string
          status_id: string
          tarefa: string
          tipo_id: string
          atualizado_em?: string
        }
        Update: {
          criado_em?: string
          id?: string
          nome_cliente_id?: string
          position?: number | null
          runrunit_task?: string | null
          solicitado_por_id?: string
          status_id?: string
          tarefa?: string
          tipo_id?: string
          atualizado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_nome_cliente_id_fkey"
            columns: ["nome_cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_solicitado_por_id_fkey"
            columns: ["solicitado_por_id"]
            isOneToOne: false
            referencedRelation: "solicitantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_tipo_id_fkey"
            columns: ["tipo_id"]
            isOneToOne: false
            referencedRelation: "tipos"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos: {
        Row: {
          cor: string
          id: string
          nome: string
        }
        Insert: {
          cor: string
          id?: string
          nome: string
        }
        Update: {
          cor?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      trigger_set_timestamp: {
        Args: Record<PropertyKey, never>
        Returns: {
          criado_em: string
          id: string
          nome_cliente_id: string | null
          position: number | null
          runrunit_task: string | null
          solicitado_por_id: string | null
          status_id: string | null
          tarefa: string
          tipo_id: string | null
          atualizado_em: string
        }
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
