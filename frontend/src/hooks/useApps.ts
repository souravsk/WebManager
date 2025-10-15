import { useState, useEffect } from 'react';
import { App } from '../types/app';
import { appApi } from '../lib/api';

export function useApps() {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApps = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const appList = await appApi.list();
      setApps(appList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load apps');
      console.error('Failed to load apps:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const addApp = async (app: Omit<App, 'id' | 'status' | 'startedAt'>) => {
    try {
      const newApp = await appApi.create(app);
      setApps(prev => [...prev, newApp]);
      return newApp;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add app';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateApp = async (id: string, updates: Partial<App>) => {
    try {
      const updatedApp = await appApi.update(id, updates);
      setApps(prev => prev.map(app => app.id === id ? updatedApp : app));
      return updatedApp;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update app';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const removeApp = async (id: string) => {
    try {
      await appApi.delete(id);
      setApps(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove app';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const startApp = async (id: string, timeoutMinutes: number) => {
    try {
      const result = await appApi.start(id, timeoutMinutes);
      // Update app status locally
      setApps(prev => prev.map(app => 
        app.id === id 
          ? { ...app, status: 'running', startedAt: Date.now() }
          : app
      ));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start app';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const stopApp = async (id: string) => {
    try {
      const result = await appApi.stop(id);
      // Update app status locally
      setApps(prev => prev.map(app => 
        app.id === id 
          ? { ...app, status: 'stopped', startedAt: undefined }
          : app
      ));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop app';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getAppsByProject = (projectId: string) => {
    return apps.filter(app => app.projectId === projectId);
  };

  const getAppsByServer = (serverId: string) => {
    return apps.filter(app => app.serverId === serverId);
  };

  return {
    apps,
    isLoading,
    error,
    addApp,
    updateApp,
    removeApp,
    startApp,
    stopApp,
    getAppsByProject,
    getAppsByServer,
    refetch: loadApps,
  };
}
