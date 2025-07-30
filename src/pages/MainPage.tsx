import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { TaskModal } from '../components/TaskModal';
import { ConfigModal } from '../components/ConfigModal';
import { KanbanView } from '../components/KanbanView';
import { TableView } from '../components/TableView';
import { useTaskContext } from '../contexts/TaskContext';
import { Task } from '../types/Task';
import useMediaQuery from '../hooks/useMediaQuery';
import { BottomNavBar } from '../components/BottomNavBar';
import { FilterModal } from '../components/FilterModal';
import { useAuth } from '../hooks/useAuth';

export type ViewMode = 'kanban' | 'table';

const MainPage: React.FC = () => {
  const { 
    tasks, 
    config, 
    addTask, 
    updateTask, 
    deleteTask, 
    getStatusById,
    getClienteById,
    isDataLoaded
  } = useTaskContext();
  
  const { session } = useAuth();
  const isAuthenticated = !!session;

  const location = useLocation();
  const navigate = useNavigate();
  const selectedView = location.pathname === '/historico' ? 'historico' : 'main';

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    cliente: '',
    tipo: '',
    solicitante: ''
  });
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (localStorage.getItem('darkMode')) {
      return localStorage.getItem('darkMode') === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const isMobile = useMediaQuery('(max-width: 1023px)');

  useEffect(() => {
    if (!isMobile) {
      setIsSidebarCollapsed(false);
    }
  }, [isMobile]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const entregueStatusId = config.app_config.entregue_status_id;

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (selectedView === 'main') {
      filtered = filtered.filter(task => task.status_id !== entregueStatusId);
    } else {
      filtered = filtered.filter(task => task.status_id === entregueStatusId);
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.tarefa.toLowerCase().includes(lowerCaseQuery) ||
        getClienteById(task.nome_cliente_id)?.nome.toLowerCase().includes(lowerCaseQuery) ||
        task.runrunit_task?.toLowerCase().includes(lowerCaseQuery)
      );
    }

    if (filters.status) filtered = filtered.filter(task => task.status_id === filters.status);
    if (filters.cliente) filtered = filtered.filter(task => task.nome_cliente_id === filters.cliente);
    if (filters.tipo) filtered = filtered.filter(task => task.tipo_id === filters.tipo);
    if (filters.solicitante) filtered = filtered.filter(task => task.solicitado_por_id === filters.solicitante);

    return filtered;
  }, [tasks, selectedView, searchQuery, filters, entregueStatusId, getClienteById]);

  const handleNewTask = () => {
    setEditingTask(undefined);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'criado_em' | 'atualizado_em' | 'position'>) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
        toast.success('Tarefa atualizada com sucesso!');
      } else {
        await addTask(taskData);
        toast.success('Tarefa criada com sucesso!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Ocorreu um erro ao salvar a tarefa.');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.')) {
      try {
        await deleteTask(id);
        toast.success('Tarefa excluída com sucesso!');
      } catch (error) {
        console.error(error);
        toast.error('Ocorreu um erro ao excluir a tarefa.');
      }
    }
  };

  const handleStatusChange = async (id: string, statusId: string) => {
    try {
      await updateTask(id, { status_id: statusId });
      const status = getStatusById(statusId);
      if (status?.id === entregueStatusId) {
        toast.success('Tarefa entregue! 🎉');
      } else {
        toast.success('Status atualizado!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Ocorreu um erro ao atualizar o status.');
    }
  };

  const clearFilters = () => setFilters({ status: '', cliente: '', tipo: '', solicitante: '' });
  
  const handleViewChange = (view: 'main' | 'historico') => {
    navigate(view === 'main' ? '/' : '/historico');
  };

  const renderContent = () => {
    if (!isDataLoaded) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-2xl font-semibold text-gray-500 dark:text-gray-400">Carregando dados...</div>
        </div>
      );
    }
    
    const viewProps = {
      tasks: filteredTasks,
      onEdit: handleEditTask,
      onDelete: handleDeleteTask,
      onStatusChange: handleStatusChange,
      isAuthenticated,
    };

    if (selectedView === 'historico') {
      return <TableView {...viewProps} />;
    }
    
    const currentViewMode = isMobile ? 'kanban' : viewMode;

    if (currentViewMode === 'kanban') {
      return <KanbanView {...viewProps} />;
    }

    if (currentViewMode === 'table') {
      return <TableView {...viewProps} />;
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {!isMobile && (
        <Sidebar
          selectedView={selectedView}
          onViewChange={handleViewChange}
          onNewTask={handleNewTask}
          onOpenConfig={() => setIsConfigModalOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedView={selectedView}
          onClearFilters={clearFilters}
          isHistoryView={selectedView === 'historico'}
          isMobile={isMobile}
          onOpenFilterModal={() => setIsFilterModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-full mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedView === 'main' ? 'Tarefas Ativas' : 'Histórico de Tarefas Entregues'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {filteredTasks.length} tarefa{filteredTasks.length !== 1 ? 's' : ''}
                {searchQuery && ` correspondendo a "${searchQuery}"`}
              </p>
            </div>

            {renderContent()}

          </div>
        </main>
      </div>
      
      {isMobile && (
        <BottomNavBar
          selectedView={selectedView}
          onViewChange={handleViewChange}
          onNewTask={handleNewTask}
          onOpenConfig={() => setIsConfigModalOpen(true)}
        />
      )}

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onSave={handleSaveTask} task={editingTask} />
      <ConfigModal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} />
      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)} 
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        selectedView={selectedView}
      />
    </div>
  );
};

export default MainPage;
