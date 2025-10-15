// User roles
export type UserRole = 'admin' | 'user';

// Server configuration
export interface Server {
  id: string;
  name: string;
  address: string; // hostname/IP
  sshUser: string;
  sshPort: number;
  sshPrivateKey: string; // Encrypted SSH private key (never displayed after saving)
  status: 'online' | 'offline' | 'checking';
  lastChecked?: number;
  runningAppsCount: number;
}

// Project (e.g., QMS, EBMR)
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
}

// Application
export interface App {
  id: string;
  name: string;
  projectId: string;
  serverId: string;
  domain: string; // Domain URL (e.g., pharma.qms.nexgensis.com)
  cdPath: string; // Path to docker-compose.yml directory
  autoStopTimeout: number; // in minutes (Total Run Time)
  status: 'running' | 'stopped';
  startedAt?: number; // timestamp
}

// Auth
export interface AuthUser {
  username: string;
  role: UserRole;
  token: string; // JWT token
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// API Payloads for server communication
export interface DockerComposeAction {
  serverId: string;
  cdPath: string;
  action: 'up' | 'down';
}

export interface ServerStatusResponse {
  status: 'online' | 'offline';
  runningContainers: number;
}

// User management types
export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Audit log types
export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  resourceId: string;
  resourceType: string;
  resourceName: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
}
