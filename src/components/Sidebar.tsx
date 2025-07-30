import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FileText, History, Settings, BarChart3, ChevronsLeft, LogOut } from 'lucide-react';
import { Logo } from './Logo';
import { useTaskContext } from '../contexts/TaskContext';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from './Avatar';

interface SidebarProps {
  selectedView: 'main' | 'historico';
  onViewChange: (view: 'main' | 'historico') => void;
  onNewTask: () => void;
  onOpenConfig: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedView,
  onViewChange,
  onNewTask,
  onOpenConfig,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { tasks, config } = useTaskContext();
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!session;

  const entregueStatusId = config.app_config.entregue_status_id;
  const inProgressStatusId = config.app_config.in_progress_status_id;

  const entregueCount = useMemo(() => tasks.filter(task => task.status_id === entregueStatusId).length, [tasks, entregueStatusId]);
  const activeCount = useMemo(() => tasks.length - entregueCount, [tasks, entregueCount]);
  const inProgressCount = useMemo(() => tasks.filter(task => task.status_id === inProgressStatusId).length, [tasks, inProgressStatusId]);
  const inProgressStatus = useMemo(() => config.statuses.find(s => s.id === inProgressStatusId), [config.statuses, inProgressStatusId]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 88 : 288 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white dark:bg-gray-800 h-screen p-4 border-r border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col"
    >
      <div className={`mb-8 ${isCollapsed ? 'px-2' : 'px-2'}`}>
        <Logo showText={!isCollapsed} />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNewTask}
        disabled={!isAuthenticated}
        className={`w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium flex items-center gap-2 mb-6 transition-colors ${isCollapsed ? 'justify-center' : ''} disabled:bg-gray-400 disabled:cursor-not-allowed`}
        title={!isAuthenticated ? "Faça login para adicionar tarefas" : "Nova Tarefa"}
      >
        <Plus size={20} />
        {!isCollapsed && <span>Nova Tarefa</span>}
      </motion.button>

      <div className="flex-grow space-y-6">
        <div>
          {!isCollapsed && (
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
              Visualizações
            </h3>
          )}
          <div className="space-y-1">
            <motion.button
              whileHover={{ x: isCollapsed ? 0 : 4 }}
              onClick={() => onViewChange('main')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                selectedView === 'main'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
              title="Tarefas Ativas"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} />
                {!isCollapsed && <span className="text-sm font-medium">Tarefas Ativas</span>}
              </div>
              {!isCollapsed && (
                <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                  {activeCount}
                </span>
              )}
            </motion.button>

            <motion.button
              whileHover={{ x: isCollapsed ? 0 : 4 }}
              onClick={() => onViewChange('historico')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                selectedView === 'historico'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
              title="Histórico"
            >
              <div className="flex items-center gap-3">
                <History size={18} />
                {!isCollapsed && <span className="text-sm font-medium">Histórico</span>}
              </div>
              {!isCollapsed && (
                <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                  {entregueCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>

        {!isCollapsed && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
              Estatísticas
            </h3>
            <div className="space-y-3 px-2">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 size={16} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tasks.length}
                </span>
              </div>
              
              {inProgressStatus && (
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                  <div className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
                    {inProgressStatus.nome}
                  </div>
                  <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {inProgressCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
        {isAuthenticated && profile ? (
          <Link to="/profile" className={`w-full p-2 rounded-lg flex items-center gap-3 transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${isCollapsed ? 'justify-center' : ''}`} title="Meu Perfil">
            <Avatar url={profile.avatar_url} size={isCollapsed ? 40 : 32} />
            {!isCollapsed && <span className="font-semibold truncate">{profile.username}</span>}
          </Link>
        ) : (
          <Link to="/auth" className={`w-full p-2 rounded-lg flex items-center gap-3 transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${isCollapsed ? 'justify-center' : ''}`} title="Fazer Login">
             <div className={`flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500`} style={{ height: isCollapsed ? 40 : 32, width: isCollapsed ? 40 : 32 }}>
                <LogOut size={isCollapsed ? 20 : 18} />
             </div>
            {!isCollapsed && <span className="font-semibold">Fazer Login</span>}
          </Link>
        )}
        
        {isAuthenticated && (
          <motion.button
            whileHover={{ x: isCollapsed ? 0 : 4 }}
            onClick={handleSignOut}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${isCollapsed ? 'justify-center' : ''}`}
            title="Sair"
          >
            <LogOut size={18} />
            {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
          </motion.button>
        )}

        <motion.button
          whileHover={{ x: isCollapsed ? 0 : 4 }}
          onClick={onOpenConfig}
          disabled={!isAuthenticated}
          className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${isCollapsed ? 'justify-center' : ''} disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed`}
          title={!isAuthenticated ? "Faça login para acessar as configurações" : "Configurações"}
        >
          <Settings size={18} />
          {!isCollapsed && <span className="text-sm font-medium">Configurações</span>}
        </motion.button>
        <button
          onClick={onToggleCollapse}
          className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Expandir' : 'Recolher'}
        >
          <ChevronsLeft size={18} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </motion.div>
  );
};
