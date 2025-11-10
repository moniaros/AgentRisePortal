import React, { createContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In a real app, this would come from an authentication service after login.
// For this simulation, we'll hardcode a logged-in user.
// user_1 is an admin for agency_1 ('Alpha Insurance').
const MOCK_CURRENT_USER: User = {
    id: 'user_1',
    name: 'Admin User',
    email: 'admin@alpha.com',
    role: 'admin',
    agencyId: 'agency_1',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser] = useState<User | null>(MOCK_CURRENT_USER);

  const value = {
    currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
