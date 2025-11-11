import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { authService, User as ApiUser } from '../services/authService';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to convert API user to app User type
const convertApiUserToUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.id.toString(),
    party: {
      contactInfo: {
        name: `${apiUser.firstName} ${apiUser.lastName}`,
        email: apiUser.email,
        phone: apiUser.phone || '',
        address: ''
      }
    },
    role: apiUser.role,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    email: apiUser.email,
    avatarUrl: apiUser.avatarUrl,
    licenseNumber: apiUser.licenseNumber,
    licenseState: apiUser.licenseState,
    licenseExpiry: apiUser.licenseExpiry
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize user from localStorage/API on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Try to get current user from API
          const apiUser = await authService.getCurrentUser();
          const user = convertApiUserToUser(apiUser);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid tokens
        await authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { user: apiUser } = await authService.login({ email, password });
      const user = convertApiUserToUser(apiUser);
      setCurrentUser(user);
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
    }
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};