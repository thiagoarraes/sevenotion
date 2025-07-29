import { useState, useEffect, useCallback } from 'react';
import { Task, ConfigData, AppConfig, ConfigItem } from '../types/Task';
import { generateInitialConfig } from '../utils/dataGenerator';
import { supabase } from '../lib/supabaseClient';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'react-hot-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [config, setConfig] = useState<ConfigData>(generateInitialConfig());
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [
        tasksRes,
        clientesRes,
        tiposRes,
        solicitantesRes,
        statusesRes,
        appConfigRes,
      ] = await Promise.all([
        supabase.from('tasks').select('*').order('position').order('criado_em', { ascending: true }),
        supabase.from('clientes').select('*'),
        supabase.from('tipos').select('*'),
        supabase.from('solicitantes').select('*'),
        supabase.from('statuses').select('*'),
        supabase.from('app_config').select('*').limit(1).single(),
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (clientesRes.error) throw clientesRes.error;
      if (tiposRes.error) throw tiposRes.error;
      if (solicitantesRes.error) throw solicitantesRes.error;
      if (statusesRes.error) throw statusesRes.error;
      if (appConfigRes.error) throw appConfigRes.error;

      setTasks(tasksRes.data || []);
      setConfig({
        clientes: clientesRes.data || [],
        tipos: tiposRes.data || [],
        solicitantes: solicitantesRes.data || [],
        statuses: statusesRes.data || [],
        app_config: appConfigRes.data || {},
      });
    } catch (error) {
      console.error('Error loading data from Supabase:', error);
      setConfig(generateInitialConfig());
      setTasks([]);
    } finally {
      setIsDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'criado_em' | 'atualizado_em' | 'position'>) => {
    const maxPosition = tasks.reduce((max, task) => Math.max(task.position || 0, max), 0);
    const newTaskPayload = { ...taskData, position: maxPosition + 65536 };

    const { data, error } = await supabase
      .from('tasks')
      .insert(newTaskPayload)
      .select()
      .single();
    
    if (error) throw error;
    if (data) setTasks(prev => [...prev, data]);
  }, [tasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<Omit<Task, 'id' | 'criado_em'>>) => {
    const finalUpdates = {
      ...updates,
      atualizado_em: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('tasks')
      .update(finalUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setTasks(prev => {
        const newTasks = prev.map(task => (task.id === id ? data : task));
        if (updates.position !== undefined) {
          newTasks.sort((a, b) => {
            const posA = a.position || 0;
            const posB = b.position || 0;
            if (posA !== posB) return posA - posB;
            return new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime();
          });
        }
        return newTasks;
      });
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const reorderTableViewTasks = useCallback(async (activeId: string, overId: string) => {
    const oldIndex = tasks.findIndex((t) => t.id === activeId);
    const newIndex = tasks.findIndex((t) => t.id === overId);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return;
    }

    const originalTasks = [...tasks];

    // Perform optimistic update in one go
    const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);

    const movedTaskIndex = reorderedTasks.findIndex(t => t.id === activeId);
    const prevTask = reorderedTasks[movedTaskIndex - 1];
    const nextTask = reorderedTasks[movedTaskIndex + 1];

    const posPrev = prevTask ? prevTask.position : 0;
    // If nextTask doesn't exist, we are at the end of the list.
    // The new position should be based on the last item's position.
    const posNext = nextTask ? nextTask.position : (posPrev) + 131072; // 65536 * 2 for a large gap
    
    const newPosition = (posPrev + posNext) / 2;

    const newOptimisticTasks = reorderedTasks.map(task => 
      task.id === activeId ? { ...task, position: newPosition } : task
    );
    
    setTasks(newOptimisticTasks);

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ position: newPosition, atualizado_em: new Date().toISOString() })
        .eq('id', activeId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Failed to reorder tasks:", error);
      toast.error('Falha ao salvar a nova ordem. Revertendo.');
      setTasks(originalTasks);
    }
  }, [tasks]);

  const updateAppConfig = useCallback(async (newConfig: Partial<AppConfig>) => {
    const { data, error } = await supabase
      .from('app_config')
      .update(newConfig)
      .eq('id', 1)
      .select()
      .single();
    
    if (error) throw error;
    if (data) setConfig(prev => ({ ...prev, app_config: data }));
  }, []);

  const addConfigItem = useCallback(async (table: 'clientes' | 'tipos' | 'solicitantes' | 'statuses', item: Omit<ConfigItem, 'id'>) => {
    const { data, error } = await supabase.from(table).insert(item).select().single();
    if (error) throw error;
    if (data) setConfig(prev => ({ ...prev, [table]: [...prev[table], data] }));
  }, []);

  const updateConfigItem = useCallback(async (table: 'clientes' | 'tipos' | 'solicitantes' | 'statuses', id: string, updates: Partial<ConfigItem>) => {
    const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
    if (error) throw error;
    if (data) setConfig(prev => ({ ...prev, [table]: prev[table].map(item => item.id === id ? data : item) }));
  }, []);

  const deleteConfigItem = useCallback(async (table: 'clientes' | 'tipos' | 'solicitantes' | 'statuses', id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    setConfig(prev => ({ ...prev, [table]: prev[table].filter(item => item.id !== id)}));
  }, []);

  const getClienteById = useCallback((id: string) => config.clientes.find(c => c.id === id), [config.clientes]);
  const getTipoById = useCallback((id: string) => config.tipos.find(t => t.id === id), [config.tipos]);
  const getSolicitanteById = useCallback((id: string) => config.solicitantes.find(s => s.id === id), [config.solicitantes]);
  const getStatusById = useCallback((id: string) => config.statuses.find(s => s.id === id), [config.statuses]);

  return {
    tasks,
    config,
    addTask,
    updateTask,
    deleteTask,
    reorderTableViewTasks,
    updateAppConfig,
    addConfigItem,
    updateConfigItem,
    deleteConfigItem,
    getClienteById,
    getTipoById,
    getSolicitanteById,
    getStatusById,
    isDataLoaded,
  };
};
