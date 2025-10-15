import { useState, useEffect } from 'react';
import { AuthUser, LoginCredentials, UserRole } from '../types/app';
import { authApi } from '../lib/api';

const AUTH_STORAGE_KEY = 'devops-dashboard-auth';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          const authUser = JSON.parse(stored) as AuthUser;
          
          // Verify token with backend
          try {
            const { user: verifiedUser } = await authApi.verify();
            const updatedUser: AuthUser = {
              username: verifiedUser.username,
              role: verifiedUser.role as UserRole,
              token: authUser.token,
            };
            setUser(updatedUser);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
          } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem(AUTH_STORAGE_KEY);
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to parse auth from localStorage:', error);
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const { token } = await authApi.login(credentials);
      
      // Store token temporarily to make verify call
      const tempAuth = { username: credentials.username, role: 'user' as UserRole, token };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tempAuth));
      
      // Get user details
      const { user: userDetails } = await authApi.verify();
      
      const authUser: AuthUser = {
        username: userDetails.username,
        role: userDetails.role as UserRole,
        token,
      };

      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const isAdmin = user?.role === 'admin';

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    login,
    logout,
  };
}
