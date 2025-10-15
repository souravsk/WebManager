import { Server, ServerStatusResponse, DockerComposeAction } from '../types/app';

/**
 * Mock server API - In production, this would make real API calls to your backend
 * which would then SSH into servers or call their APIs to execute docker-compose commands
 */

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check server status
 * In production: Backend would SSH into server or call health endpoint
 */
export async function checkServerStatus(server: Server): Promise<ServerStatusResponse> {
  await delay(500 + Math.random() * 500); // Simulate network delay
  
  // Mock: Randomly determine if server is online (90% chance)
  const isOnline = Math.random() > 0.1;
  
  return {
    status: isOnline ? 'online' : 'offline',
    runningContainers: isOnline ? Math.floor(Math.random() * 5) : 0,
  };
}

/**
 * Execute docker-compose action on a server
 * In production: Backend would SSH into server and run docker-compose up/down
 */
export async function executeDockerCompose(action: DockerComposeAction): Promise<boolean> {
  await delay(1000 + Math.random() * 1000); // Simulate command execution time
  
  console.log(`[Mock API] Executing docker-compose ${action.action} at ${action.cdPath} on server ${action.serverId}`);
  
  // Mock: 95% success rate
  const success = Math.random() > 0.05;
  
  if (!success) {
    throw new Error('Failed to execute docker-compose command on server');
  }
  
  return true;
}

/**
 * Get running apps count for a server
 * In production: Backend would query docker ps on the server
 */
export async function getRunningAppsCount(serverId: string): Promise<number> {
  await delay(300);
  
  // Mock: Return random count
  return Math.floor(Math.random() * 5);
}
