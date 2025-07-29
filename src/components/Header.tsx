import React from 'react';
import { motion } from 'framer-motion';
import { Search, Moon, Sun, Kanban, Table, X, Filter } from 'lucide-react';
import { ViewMode } from '../App';
import { useTaskContext } from '../contexts/TaskContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: {
    status: string;
    cliente: string;
    tipo: string;
    solicitante: string;
  };
  onFiltersChange: (filters: any) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedView: 'main' | 'historico';
  onClearFilters: () => void;
  isHistoryView: boolean;
  isMobile: boolean;
  onOpenFilterModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  darkMode,
  onToggleDarkMode,
  viewMode,
  onViewModeChange,
  selectedView,
  onClearFilters,
  isHistoryView,
  isMobile,
  onOpenFilterModal,
}) => {
  const { config } = useTaskContext();
  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  const getAvailableStatuses = () => {
    const entregueStatus = config.statuses.find(s => s.id === config.app_config.entregue_status_id);
    if (selectedView === 'historico') {
      return entregueStatus ? [entregueStatus] : [];
    }
    return config.statuses.filter(s => s.id !== entregueStatus?.id);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3">
      <div className="flex items-center lg:items-start justify-between gap-4">
        <div className="flex-1 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {!isMobile && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Filter size={16} />
                <span className="text-sm font-medium">Filtros:</span>
              </div>

              <select
                value={filters.status}
                onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Todos os Status</option>
                {getAvailableStatuses().map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.nome}
                  </option>
                ))}
              </select>

              <select
                value={filters.cliente}
                onChange={(e) => onFiltersChange({ ...filters, cliente: e.target.value })}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Todos os Clientes</option>
                {config.clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>

              <select
                value={filters.tipo}
                onChange={(e) => onFiltersChange({ ...filters, tipo: e.target.value })}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Todos os Tipos</option>
                {config.tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>

              <select
                value={filters.solicitante}
                onChange={(e) => onFiltersChange({ ...filters, solicitante: e.target.value })}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Todos os Solicitantes</option>
                {config.solicitantes.map((solicitante) => (
                  <option key={solicitante.id} value={solicitante.id}>
                    {solicitante.nome}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={onClearFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-md transition-colors"
                >
                  <X size={14} />
                  Limpar
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 lg:gap-2">
          {isMobile && (
            <button
              onClick={onOpenFilterModal}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative"
            >
              <Filter size={20} />
              {hasActiveFilters && <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-purple-600" />}
            </button>
          )}

          {!isHistoryView && !isMobile && (
            <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('kanban')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm ${
                  viewMode === 'kanban' ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Visualização Kanban"
              >
                <Kanban size={16} />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => onViewModeChange('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm ${
                  viewMode === 'table' ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Visualização em Tabela"
              >
                <Table size={16} />
                <span>Tabela</span>
              </button>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleDarkMode}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
        </div>
      </div>
    </header>
  );
};
