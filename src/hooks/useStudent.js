/**
 * MILESTONE 3: Generic CRUD Engine – useStudent hook
 * Sample hook: GET list, POST create, DELETE by id using the Axios api instance.
 * Place in: src/hooks/useStudent.js
 */

import { useState, useCallback } from 'react';
import { api } from '../services/api';

const STUDENTS_ENDPOINT = '/students';

export function useStudent() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(STUDENTS_ENDPOINT);
      setStudents(Array.isArray(data) ? data : data?.data ?? []);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch students');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createStudent = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post(STUDENTS_ENDPOINT, payload);
      setStudents((prev) => (Array.isArray(prev) ? [...prev, data] : [data]));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create student');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStudent = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`${STUDENTS_ENDPOINT}/${id}`);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete student');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    students,
    loading,
    error,
    fetchStudents,
    createStudent,
    deleteStudent,
  };
}
