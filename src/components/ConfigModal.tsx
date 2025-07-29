import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Building2, Tag, User, BarChart3, Star, CheckCircle2 } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { toast } from 'react-hot-toast';
import { ConfigItem } from '../types/Task';
import { useAuth } from '../contexts/AuthContext';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ActiveTab = 'clientes' | 'tipos' | 'solicitantes' | 'statuses';

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
  const {
    config,
    tasks,
    updateAppConfig,
    addConfigItem,
    updateConfigItem,
    deleteConfigItem,
  } = useTaskContext();
  const { session } = useAuth();
  const isAuthenticated = !!session;

  const [activeTab, setActiveTab] = useState<ActiveTab>('clientes');
  const [editingItem, setEditingItem] = useState<ConfigItem | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemColor, setNewItemColor] = useState('#8B5CF6');

  const isItemInUse = (itemId: string): boolean => {
    switch (activeTab) {
      case 'clientes': return tasks.some(task => task.nome_cliente_id === itemId);
      case 'tipos': return tasks.some(task => task.tipo_id === itemId);
      case 'solicitantes': return tasks.some(task => task.solicitado_por_id === itemId);
      case 'statuses': return tasks.some(task => task.status_id === itemId);
      default: return false;
    }
  };

  const handleAction = async (action: () => Promise<void>, successMessage: string) => {
    try {
      await action();
      toast.success(successMessage);
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro.');
      console.error(error);
    }
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    handleAction(
      () => addConfigItem(activeTab, { nome: newItemName.trim(), cor: newItemColor }),
      'Item adicionado com sucesso!'
    );
    setNewItemName('');
    setNewItemColor('#8B5CF6');
  };

  const handleUpdateItem = () => {
    if (!newItemName.trim() || !editingItem) return;
    handleAction(
      () => updateConfigItem(activeTab, editingItem.id, { nome: newItemName.trim(), cor: newItemColor }),
      'Item atualizado com sucesso!'
    );
    setEditingItem(null);
    setNewItemName('');
    setNewItemColor('#8B5CF6');
  };

  const handleEditClick = (item: ConfigItem) => {
    setEditingItem(item);
    setNewItemName(item.nome);
    setNewItemColor(item.cor);
  };

  const handleDeleteItem = (id: string) => {
    if (activeTab === 'statuses') {
      if (id === config.app_config.in_progress_status_id) {
        toast.error('Este status não pode ser excluído pois está definido como "Em Andamento".');
        return;
      }
      if (id === config.app_config.entregue_status_id) {
        toast.error('Este status não pode ser excluído pois está definido como "Entregue".');
        return;
      }
    }
    if (isItemInUse(id)) {
      toast.error('Este item não pode ser excluído pois está sendo utilizado em uma ou mais tarefas.');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.')) {
      handleAction(() => deleteConfigItem(activeTab, id), 'Item excluído com sucesso!');
    }
  };

  const handleSetInProgressStatus = (statusId: string) => {
    handleAction(() => updateAppConfig({ in_progress_status_id: statusId }), 'Status "Em Andamento" definido.');
  };

  const handleSetEntregueStatus = (statusId: string) => {
    handleAction(() => updateAppConfig({ entregue_status_id: statusId }), 'Status "Entregue" definido.');
  };

  const tabs = [
    { id: 'clientes', label: 'Clientes', icon: Building2, placeholder: 'Nome do cliente' },
    { id: 'tipos', label: 'Tipos de Tarefa', icon: Tag, placeholder: 'Nome do tipo de tarefa' },
    { id: 'solicitantes', label: 'Solicitantes', icon: User, placeholder: 'Nome do solicitante' },
    { id: 'statuses', label: 'Status', icon: BarChart3, placeholder: 'Nome do status' },
  ];

  const getCurrentItems = () => config[activeTab] || [];

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md text-center p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Acesso Restrito</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Você precisa estar logado para acessar as configurações.</p>
            <button onClick={onClose} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Fechar</button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

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
          className="bg-white dark:bg-gray-800 rounded-none sm:rounded-lg w-full h-full sm:max-w-4xl sm:max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Configurações do Sistema
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
            <div className="w-full sm:w-64 bg-gray-50 dark:bg-gray-900 p-4 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700">
              <div className="flex sm:flex-col gap-1 sm:space-y-2 overflow-x-auto pb-2 sm:pb-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors flex-shrink-0 sm:flex-shrink-1 ${
                        activeTab === tab.id
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Gerenciar {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                    <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder={tabs.find(t => t.id === activeTab)?.placeholder || ''} />
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor</label>
                      <input
                        type="color"
                        value={newItemColor}
                        onChange={(e) => setNewItemColor(e.target.value)}
                        className="w-16 h-10 p-1 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div className="flex items-end flex-1">
                      <button onClick={editingItem ? handleUpdateItem : handleAddItem} disabled={!newItemName.trim()} className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 h-10"><Plus size={16} />{editingItem ? 'Atualizar' : 'Adicionar'}</button>
                    </div>
                  </div>
                  {editingItem && <button onClick={() => { setEditingItem(null); setNewItemName(''); setNewItemColor('#8B5CF6'); }} className="w-full sm:w-auto px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancelar</button>}
                </div>
              </div>

              {activeTab === 'statuses' && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg text-sm text-blue-800 dark:text-blue-200 space-y-2">
                  <div>
                    <Star size={14} className="inline mr-2" />
                    Selecione o status que representa tarefas "em andamento" para as estatísticas.
                  </div>
                  <div>
                    <CheckCircle2 size={14} className="inline mr-2" />
                    Selecione o status que representa tarefas "entregues" para o histórico.
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {getCurrentItems().map((item: ConfigItem) => {
                  const inUse = isItemInUse(item.id);
                  const isSpecialStatus = activeTab === 'statuses' && (item.id === config.app_config.in_progress_status_id || item.id === config.app_config.entregue_status_id);
                  const isDeletable = !inUse && !isSpecialStatus;

                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        {activeTab === 'statuses' && (
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleSetInProgressStatus(item.id)} title="Marcar como status 'Em Andamento'">
                              <Star size={18} className={config.app_config.in_progress_status_id === item.id ? 'text-yellow-400 fill-current' : 'text-gray-400 hover:text-yellow-400'} />
                            </button>
                            <button onClick={() => handleSetEntregueStatus(item.id)} title="Marcar como status 'Entregue'">
                              <CheckCircle2 size={18} className={config.app_config.entregue_status_id === item.id ? 'text-green-500' : 'text-gray-400 hover:text-green-500'} />
                            </button>
                          </div>
                        )}
                        <div className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600" style={{ backgroundColor: item.cor }} />
                        <span className="font-medium text-gray-900 dark:text-white">{item.nome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditClick(item)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)} 
                          disabled={!isDeletable}
                          title={isDeletable ? 'Excluir' : 'Item em uso ou status especial.'}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:text-gray-300 disabled:dark:text-gray-600 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
