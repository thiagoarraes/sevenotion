import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, History, PlusCircle, Settings, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface BottomNavBarProps {
  selectedView: 'main' | 'historico';
  onViewChange: (view: 'main' | 'historico') => void;
  onNewTask: () => void;
  onOpenConfig: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  selectedView,
  onViewChange,
  onNewTask,
  onOpenConfig,
}) => {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!session;

  const handleAuthClick = () => {
    navigate(isAuthenticated ? '/profile' : '/auth');
  };

  const navItems = [
    {
      id: 'main',
      label: 'Tarefas',
      icon: FileText,
      action: () => onViewChange('main'),
    },
    {
      id: 'historico',
      label: 'Histórico',
      icon: History,
      action: () => onViewChange('historico'),
    },
    {
      id: 'new',
      label: 'Adicionar',
      icon: PlusCircle,
      action: onNewTask,
      isCentral: true,
      disabled: !isAuthenticated,
    },
    {
      id: 'config',
      label: 'Ajustes',
      icon: Settings,
      action: onOpenConfig,
      disabled: !isAuthenticated,
    },
    {
      id: 'auth',
      label: isAuthenticated ? profile?.username || 'Perfil' : 'Login',
      icon: User,
      action: handleAuthClick,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 z-40 lg:hidden">
      {navItems.map((item) => {
        const isSelected = !item.isCentral && selectedView === item.id;
        const Icon = item.icon;

        if (item.isCentral) {
          return (
            <button
              key={item.id}
              onClick={item.action}
              disabled={item.disabled}
              className="flex-shrink-0 -mt-8 bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-purple-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
              aria-label="Nova Tarefa"
            >
              <Icon size={32} />
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={item.action}
            disabled={item.disabled}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isSelected
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
            } disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed`}
          >
            <Icon size={24} />
            <span className="text-xs mt-1 truncate w-16 text-center">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
