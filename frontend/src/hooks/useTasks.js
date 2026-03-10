import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/tasks');
      setTasks(data.tasks);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return { tasks, setTasks, loading, fetchTasks };
}
