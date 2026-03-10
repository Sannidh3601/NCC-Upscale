import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useProgress(courseId) {
  const [progress, setProgress] = useState({ total: 0, completed: 0, percentage: 0, completedLessonIds: [] });
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    if (!courseId) return;
    try {
      const { data } = await api.get(`/api/progress/course/${courseId}`);
      setProgress(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProgress();
  }, [courseId]);

  return { progress, loading, fetchProgress };
}

export function useStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    api.get('/api/progress/streak')
      .then(({ data }) => setStreak(data.streak))
      .catch(() => {});
  }, []);

  return streak;
}
