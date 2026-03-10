import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useCourses(filters = {}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchCourses = async (params = filters) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.category) query.set('category', params.category);
      if (params.level) query.set('level', params.level);
      if (params.search) query.set('search', params.search);
      if (params.page) query.set('page', params.page);
      const { data } = await api.get(`/api/courses?${query.toString()}`);
      setCourses(data.courses);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return { courses, loading, total, totalPages, fetchCourses };
}

export function useCourse(id) {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/api/courses/${id}`)
      .then(({ data }) => {
        setCourse(data.course);
        setLessons(data.lessons);
        setEnrollmentCount(data.enrollmentCount);
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id]);

  return { course, lessons, enrollmentCount, loading };
}

export function useAdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/courses/admin/all');
      setCourses(data.courses);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return { courses, loading, fetchCourses };
}
