import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Tag, User, BarChart3, Link } from 'lucide-react';
import { Task } from '../types/Task';
import { useTaskContext } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'criado_em' | 'atualizado_em' | 'position'>) => void;
  task?: Task;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
}) => {
  const { config } = useTaskContext();
  const { session } = useAuth();
  const isAuthenticated = !!session;
  const { entregue_status_id } = config.app_config;

  const getInitialFormData = () => {
    if (task) {
      return {
        nome_cliente_id: task.nome_cliente_id,
        tarefa: task.tarefa,
        tipo_id: task.tipo_id,
        solicitado_por_id: task.solicitado_por_id,
        status_id: task.status_id,
        runrunit_task: task.runrunit_task || '',
      };
    }
    const availableStatuses = config.statuses.filter(s => s.id !== entregue_status_id);
    const defaultStatus = availableStatuses.find(s => s.nome === 'Pendente') || availableStatuses[0];
    return {
      nome_cliente_id: config.clientes[0]?.id || '',
      tarefa: '',
      tipo_id: config.tipos[0]?.id || '',
      solicitado_por_id: config.solicitantes[0]?.id || '',
      status_id: defaultStatus?.id || '',
      runrunit_task: '',
    };
  };
  
  const [formData, setFormData] = useState(getInitialFormData);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
    }
  }, [task, config, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tarefa.trim() || !formData.nome_cliente_id || !formData.tipo_id || !formData.solicitado_por_id || !formData.status_id) {
        toast.error("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    const taskData = {
      nome_cliente_id: formData.nome_cliente_id,
      tarefa: formData.tarefa,
      tipo_id: formData.tipo_id,
      solicitado_por_id: formData.solicitado_por_id,
      status_id: formData.status_id,
      runrunit_task: formData.runrunit_task || null,
    };

    onSave(taskData as any);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 sm:p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-none sm:rounded-lg w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {task ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
            <div className="p-6 space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tarefa
                </label>
                <input
                  type="text"
                  value={formData.tarefa}
                  onChange={(e) => setFormData({ ...formData, tarefa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  autoFocus
                  placeholder="Descreva a tarefa..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Building2 size={16} className="inline mr-1" />
                    Cliente
                  </label>
                  <select
                    value={formData.nome_cliente_id}
                    onChange={(e) => setFormData({ ...formData, nome_cliente_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {config.clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Tag size={16} className="inline mr-1" />
                    Tipo da tarefa
                  </label>
                  <select
                    value={formData.tipo_id}
                    onChange={(e) => setFormData({ ...formData, tipo_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Selecione um tipo</option>
                    {config.tipos.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <User size={16} className="inline mr-1" />
                    Solicitado por
                  </label>
                  <select
                    value={formData.solicitado_por_id}
                    onChange={(e) => setFormData({ ...formData, solicitado_por_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Selecione um solicitante</option>
                    {config.solicitantes.map((solicitante) => (
                      <option key={solicitante.id} value={solicitante.id}>
                        {solicitante.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <BarChart3 size={16} className="inline mr-1" />
                    Status
                  </label>
                  <select
                    value={formData.status_id}
                    onChange={(e) => setFormData({ ...formData, status_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Selecione um status</option>
                    {config.statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Link size={16} className="inline mr-1" />
                  Tarefa do Runrun.it
                </label>
                <input
                  type="text"
                  value={formData.runrunit_task}
                  onChange={(e) => setFormData({ ...formData, runrunit_task: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Cole o link da tarefa do Runrun.it..."
                />
              </div>
            </div>
            <div className="p-6 pt-2">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isAuthenticated}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {task ? 'Atualizar' : 'Criar'} Tarefa
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
