
import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
// FIX: Import types from the correct path
import { User } from '../types';
// FIX: Import mock data from the correct path
import { MOCK_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      const storedUser = sessionStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
      if (currentUser) {
          sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
      } else {
          sessionStorage.removeItem('currentUser');
      }
  }, [currentUser]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // This is a mock authentication check.
            // In a real app, you would make an API call.
            // FIX: Property 'email' does not exist on type 'User'. Use party.contactInfo.email instead.
            const user = MOCK_USERS.find(u => u.party.contactInfo.email === email);
            if (user && password === 'password123') { // Using a simple mock password
                setCurrentUser(user);
                resolve(true);
            } else {
                resolve(false);
            }
        }, 1000); // Simulate network delay
    });
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const value = {
    currentUser,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
