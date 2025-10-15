import { useState, useEffect } from 'react';
import { Server } from '../types/app';
import { serverApi } from '../lib/api';

export function useServers() {
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const serverList = await serverApi.list();
      setServers(serverList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load servers');
      console.error('Failed to load servers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServers();
  }, []);

  const addServer = async (server: Omit<Server, 'id' | 'status' | 'runningAppsCount' | 'lastChecked'>) => {
    try {
      const newServer = await serverApi.create(server);
      setServers(prev => [...prev, newServer]);
      return newServer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add server';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateServer = async (id: string, updates: Partial<Server>) => {
    try {
      const updatedServer = await serverApi.update(id, updates);
      setServers(prev => prev.map(server => server.id === id ? updatedServer : server));
      return updatedServer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update server';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const removeServer = async (id: string) => {
    try {
      await serverApi.delete(id);
      setServers(prev => prev.filter(server => server.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove server';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const testServerConnection = async (id: string) => {
    try {
      const result = await serverApi.testConnection(id);
      // Update the server in the local state
      setServers(prev => prev.map(server => 
        server.id === id 
          ? { 
              ...server, 
              status: result.status as 'online' | 'offline' | 'checking',
              runningAppsCount: result.runningAppsCount,
              lastChecked: result.lastChecked
            }
          : server
      ));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test server connection';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshAllServers = async () => {
    try {
      setIsLoading(true);
      const result = await serverApi.refreshAll();
      setServers(result.servers);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh servers';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    servers,
    isLoading,
    error,
    addServer,
    updateServer,
    removeServer,
    testServerConnection,
    refreshAllServers,
    refetch: loadServers,
  };
}
