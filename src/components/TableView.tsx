import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Building2, Tag, User, BarChart3, Link, GripVertical } from 'lucide-react';
import { Task } from '../types/Task';
import { useTaskContext } from '../contexts/TaskContext';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const defaultColumns = [
  { id: 'cliente', label: 'Cliente', icon: Building2 },
  { id: 'tarefa', label: 'Tarefa', icon: null },
  { id: 'tipo', label: 'Tipo da Tarefa', icon: Tag },
  { id: 'solicitadoPor', label: 'Solicitado por', icon: User },
  { id: 'status', label: 'Status', icon: BarChart3 },
  { id: 'actions', label: 'Ações', icon: null },
];

interface SortableHeaderProps {
  id: string;
  label: string;
  icon?: React.ElementType;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ id, label, icon: Icon }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type: 'column' } });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <th ref={setNodeRef} style={style} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider relative whitespace-nowrap">
      <div className="flex items-center gap-2">
        <span {...attributes} {...listeners} className="cursor-grab touch-none p-1">
          <GripVertical size={14} />
        </span>
        {Icon && <Icon size={14} />}
        {label}
      </div>
    </th>
  );
};

interface TableViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, statusId: string) => void;
  isAuthenticated: boolean;
}

const renderCell = (task: Task, columnId: string, props: TableViewProps & ReturnType<typeof useTaskContext>) => {
  const { getClienteById, getTipoById, getSolicitanteById, getStatusById, onEdit, onDelete, onStatusChange, config, isAuthenticated } = props;
  const cliente = getClienteById(task.nome_cliente_id);
  const tipo = getTipoById(task.tipo_id);
  const solicitante = getSolicitanteById(task.solicitado_por_id);
  const status = getStatusById(task.status_id);

  const handleStatusClick = () => {
    if (config.app_config.entregue_status_id && task.status_id !== config.app_config.entregue_status_id) {
      onStatusChange(task.id, config.app_config.entregue_status_id);
    }
  };

  switch (columnId) {
    case 'cliente':
      return cliente ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: cliente.cor }}>{cliente.nome}</span> : null;
    case 'tarefa':
      return (
        <>
          <div className="text-sm font-medium text-gray-900 dark:text-white">{task.tarefa}</div>
          {task.runrunit_task && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <Link size={12} />
              <a href={task.runrunit_task} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-xs">Tarefa no Runrun.it</a>
            </div>
          )}
        </>
      );
    case 'tipo':
      return tipo ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: tipo.cor }}>{tipo.nome}</span> : null;
    case 'solicitadoPor':
      return solicitante ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: solicitante.cor }}>{solicitante.nome}</span> : null;
    case 'status':
      return status ? (
        <button onClick={handleStatusClick} disabled={!isAuthenticated || status.id === config.app_config.entregue_status_id} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white transition-opacity ${status.id !== config.app_config.entregue_status_id && isAuthenticated ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`} style={{ backgroundColor: status.cor }}>
          {status.nome}
        </button>
      ) : null;
    case 'actions':
      return (
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <button onClick={() => onEdit(task)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"><Edit2 size={16} /></button>
              <button onClick={() => onDelete(task.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><Trash2 size={16} /></button>
            </>
          )}
        </div>
      );
    default:
      return null;
  }
};

const SortableRow: React.FC<{ task: Task; columns: typeof defaultColumns; renderProps: TableViewProps & ReturnType<typeof useTaskContext> }> = ({ task, columns, renderProps }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { type: 'row' }, disabled: !renderProps.isAuthenticated });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.7 : 1, zIndex: isDragging ? 1 : 'auto' };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-2 py-4 whitespace-nowrap">
        {renderProps.isAuthenticated && (
          <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 p-2 touch-none">
            <GripVertical size={16} />
          </button>
        )}
      </td>
      {columns.map(col => (
        <td key={col.id} className="px-4 py-4 whitespace-nowrap">
          {renderCell(task, col.id, renderProps)}
        </td>
      ))}
    </tr>
  );
};

export const TableView: React.FC<TableViewProps> = (props) => {
  const { tasks, isAuthenticated } = props;
  const context = useTaskContext();
  const { config, updateAppConfig, reorderTableViewTasks } = context;
  const [columnOrder, setColumnOrder] = useState<string[]>(config.app_config.table_column_order || defaultColumns.map(c => c.id));
  
  const columns = useMemo(() => {
    return columnOrder.map(id => defaultColumns.find(c => c.id === id)).filter(Boolean) as typeof defaultColumns;
  }, [columnOrder]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !isAuthenticated) return;

    const activeType = active.data.current?.type;

    if (activeType === 'column') {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
        setColumnOrder(newOrder);
        updateAppConfig({ table_column_order: newOrder });
      }
    } else if (activeType === 'row') {
      reorderTableViewTasks(active.id as string, over.id as string);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-2 py-3"></th>
                <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy} disabled={!isAuthenticated}>
                  {columns.map(col => (
                    <SortableHeader key={col.id} id={col.id} label={col.label} icon={col.icon} />
                  ))}
                </SortableContext>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy} disabled={!isAuthenticated}>
                {tasks.map(task => (
                  <SortableRow key={task.id} task={task} columns={columns} renderProps={{...props, ...context}} />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-gray-500 dark:text-gray-400">As tarefas aparecerão aqui quando disponíveis. Comece criando algumas configurações e depois uma nova tarefa!</p>
          </div>
        )}
      </div>
    </DndContext>
  );
};
