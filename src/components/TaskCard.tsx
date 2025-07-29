import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, User, Building2, Tag, Link } from 'lucide-react';
import { Task, Cliente, Tipo, Solicitante, Status } from '../types/Task';

interface TaskCardProps {
  task: Task;
  cliente?: Cliente;
  tipo?: Tipo;
  solicitante?: Solicitante;
  status?: Status;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, statusId: string) => void;
  isAuthenticated: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  cliente,
  tipo,
  solicitante,
  status,
  onEdit,
  onDelete,
  isAuthenticated,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow relative"
    >
      {isAuthenticated && (
        <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100/80 hover:bg-gray-200 dark:bg-gray-900/80 dark:hover:bg-gray-700 rounded-md transition-all"
            title="Editar Tarefa"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 bg-gray-100/80 hover:bg-gray-200 dark:bg-gray-900/80 dark:hover:bg-gray-700 rounded-md transition-all"
            title="Excluir Tarefa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-3 pr-16">
            {task.tarefa}
          </h3>

          <div className="space-y-2 mb-4">
            {cliente && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 size={14} className="text-gray-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Cliente:</span>
                <span className="px-2 py-1 rounded-full text-white text-xs" style={{ backgroundColor: cliente.cor }}>
                  {cliente.nome}
                </span>
              </div>
            )}

            {tipo && (
              <div className="flex items-center gap-2 text-sm">
                <Tag size={14} className="text-gray-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Tipo da Tarefa:</span>
                <span className="px-2 py-1 rounded-full text-white text-xs" style={{ backgroundColor: tipo.cor }}>
                  {tipo.nome}
                </span>
              </div>
            )}

            {solicitante && (
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-gray-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Solicitado por:</span>
                <span className="px-2 py-1 rounded-full text-white text-xs" style={{ backgroundColor: solicitante.cor }}>
                  {solicitante.nome}
                </span>
              </div>
            )}
          </div>

          {task.runrunit_task && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <Link size={14} className="text-gray-500" />
              <a 
                href={task.runrunit_task} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate"
              >
                {task.runrunit_task}
              </a>
            </div>
          )}

          <div className="flex items-center justify-between">
            {status && (
              <div className="px-3 py-1 rounded-full text-white text-sm font-medium" style={{ backgroundColor: status.cor }}>
                {status.nome}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
