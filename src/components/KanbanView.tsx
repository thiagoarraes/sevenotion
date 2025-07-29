import React, { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Task, Status } from '../types/Task';
import { TaskCard } from './TaskCard';
import { useTaskContext } from '../contexts/TaskContext';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface KanbanViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, statusId: string) => void;
  isAuthenticated: boolean;
}

const SortableTaskCard: React.FC<Omit<KanbanViewProps, 'tasks' | 'isAuthenticated'> & { task: Task; isAuthenticated: boolean }> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isAuthenticated,
}) => {
  const { getClienteById, getTipoById, getSolicitanteById, getStatusById } = useTaskContext();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { type: 'TASK', task }, disabled: !isAuthenticated });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        cliente={getClienteById(task.nome_cliente_id)}
        tipo={getTipoById(task.tipo_id)}
        solicitante={getSolicitanteById(task.solicitado_por_id)}
        status={getStatusById(task.status_id)}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

const KanbanColumn: React.FC<KanbanViewProps & { status: Status }> = ({ status, tasks, onEdit, onDelete, onStatusChange, isAuthenticated }) => {
  const { setNodeRef } = useDroppable({ id: status.id, data: { type: 'COLUMN' } });

  const columnTasks = useMemo(() => 
    tasks.filter(task => task.status_id === status.id),
    [tasks, status.id]
  );

  return (
    <div className="flex flex-col w-full lg:min-w-80 lg:max-w-80 flex-shrink-0">
      <div className="mb-4">
        <div className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm" style={{ backgroundColor: status.cor }}>
          <span>{status.nome}</span>
          <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">{columnTasks.length}</span>
        </div>
      </div>
      <div ref={setNodeRef} className="flex-1 space-y-3 min-h-96 bg-gray-100 dark:bg-gray-800/50 rounded-lg p-2">
        <SortableContext items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {columnTasks.map((task) => (
              <SortableTaskCard 
                key={task.id} 
                task={task} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                onStatusChange={onStatusChange}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
        {columnTasks.length === 0 && (
          <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">Arraste tarefas aqui</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const KanbanView: React.FC<KanbanViewProps> = (props) => {
  const { onStatusChange, onEdit, onDelete, isAuthenticated } = props;
  const { config, getClienteById, getTipoById, getSolicitanteById, getStatusById } = useTaskContext();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const availableStatuses = useMemo(() => 
    config.statuses.filter(status => status.id !== config.app_config.entregue_status_id),
    [config.statuses, config.app_config.entregue_status_id]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(event.active.data.current?.task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTask = active.data.current?.task as Task;
    const overType = over.data.current?.type;
    let newStatusId: string | null = null;

    if (overType === 'COLUMN') {
      newStatusId = over.id as string;
    } else if (overType === 'TASK') {
      newStatusId = (over.data.current?.task as Task).status_id;
    }
    
    if (newStatusId && activeTask.status_id !== newStatusId) {
      onStatusChange(activeTask.id, newStatusId);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} disabled={!isAuthenticated}>
      <div className="flex flex-col lg:flex-row gap-6 lg:overflow-x-auto lg:pb-6">
        {availableStatuses.map((status) => (
          <KanbanColumn key={status.id} status={status} {...props} />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <TaskCard
              task={activeTask}
              cliente={getClienteById(activeTask.nome_cliente_id)}
              tipo={getTipoById(activeTask.tipo_id)}
              solicitante={getSolicitanteById(activeTask.solicitado_por_id)}
              status={getStatusById(activeTask.status_id)}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              isAuthenticated={isAuthenticated}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
