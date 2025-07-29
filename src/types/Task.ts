export interface Task {
  id: string;
  tarefa: string;
  nome_cliente_id: string;
  tipo_id: string;
  solicitado_por_id: string;
  status_id: string;
  runrunit_task?: string;
  position: number;
  criado_em: string;
  atualizado_em: string;
}

export interface ConfigItem {
  id: string;
  nome: string;
  cor: string;
}

export type Cliente = ConfigItem;
export type Tipo = ConfigItem;
export type Solicitante = ConfigItem;
export type Status = ConfigItem;

export interface AppConfig {
  id?: number;
  in_progress_status_id?: string | null;
  entregue_status_id?: string | null;
  table_column_order?: string[] | null;
  kanban_status_order?: string[] | null;
}

export interface ConfigData {
  clientes: Cliente[];
  tipos: Tipo[];
  solicitantes: Solicitante[];
  statuses: Status[];
  app_config: AppConfig;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  updated_at: string;
}
