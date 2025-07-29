import { ConfigData } from '../types/Task';

export const generateInitialConfig = (): ConfigData => ({
  clientes: [],
  tipos: [],
  solicitantes: [],
  statuses: [],
  app_config: {
    id: 1,
    in_progress_status_id: undefined,
    entregue_status_id: undefined,
    table_column_order: ['cliente', 'tarefa', 'tipo', 'solicitadoPor', 'status', 'actions'],
    kanban_status_order: [],
  }
});
