import { useState, useEffect } from 'react';
import { Project } from '../types/app';
import { projectApi } from '../lib/api';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const projectList = await projectApi.list();
      setProjects(projectList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const addProject = async (project: Omit<Project, 'id' | 'createdAt'>) => {
    try {
      const newProject = await projectApi.create(project);
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await projectApi.update(id, updates);
      setProjects(prev => prev.map(project => project.id === id ? updatedProject : project));
      return updatedProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const removeProject = async (id: string) => {
    try {
      await projectApi.delete(id);
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    projects,
    isLoading,
    error,
    addProject,
    updateProject,
    removeProject,
    refetch: loadProjects,
  };
}
