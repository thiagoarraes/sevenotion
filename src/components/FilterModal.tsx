import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    status: string;
    cliente: string;
    tipo: string;
    solicitante: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  selectedView: 'main' | 'historico';
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
  selectedView,
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-end justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Filter size={20} />
              Filtros
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos os Status</option>
                {getAvailableStatuses().map((status) => (
                  <option key={status.id} value={status.id}>{status.nome}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
              <select
                value={filters.cliente}
                onChange={(e) => onFiltersChange({ ...filters, cliente: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos os Clientes</option>
                {config.clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Tarefa</label>
              <select
                value={filters.tipo}
                onChange={(e) => onFiltersChange({ ...filters, tipo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos os Tipos</option>
                {config.tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Solicitante</label>
              <select
                value={filters.solicitante}
                onChange={(e) => onFiltersChange({ ...filters, solicitante: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos os Solicitantes</option>
                {config.solicitantes.map((solicitante) => (
                  <option key={solicitante.id} value={solicitante.id}>{solicitante.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-800">
            {hasActiveFilters && (
              <button
                onClick={() => { onClearFilters(); onClose(); }}
                className="flex-1 px-4 py-2 text-red-600 dark:text-red-400 border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
              >
                Limpar Filtros
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Ver Resultados
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
