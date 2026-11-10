import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  authToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginDemoRole: (role: 'admin' | 'agent') => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isAutostartRequested(): boolean {
  if (typeof window === 'undefined') return false;
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('autostart') === '1') return true;
  const hashQueryIndex = window.location.hash.indexOf('?');
  if (hashQueryIndex !== -1) {
    const hashParams = new URLSearchParams(window.location.hash.slice(hashQueryIndex));
    if (hashParams.get('autostart') === '1') return true;
  }
  return false;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        sessionStorage.removeItem('currentUser');
      }
    }
    if (isAutostartRequested()) {
      const adminUser = MOCK_USERS.find((u) => u.party.contactInfo.email === 'admin@agency1.com') || MOCK_USERS[0];
      sessionStorage.setItem('currentUser', JSON.stringify(adminUser));
      return adminUser;
    }
    return null;
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return sessionStorage.getItem('agentos_token');
  });

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    if (authToken) {
      sessionStorage.setItem('agentos_token', authToken);
    } else {
      sessionStorage.removeItem('agentos_token');
    }
  }, [authToken]);

  // If autostart booted user without a signed server token yet, mint an HMAC token in background
  useEffect(() => {
    if (currentUser && !authToken) {
      const demoRole = currentUser.party.contactInfo.email === 'admin@agency1.com' ? 'admin' : 'agent';
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoRole }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.token) setAuthToken(data.token);
        })
        .catch(() => {
          // Offline mode fallback continues with local session
        });
    }
  }, [currentUser, authToken]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const matchedUser = MOCK_USERS.find(
          (u) => u.party.contactInfo.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (matchedUser) {
          setAuthToken(data.token);
          setCurrentUser(matchedUser);
          return true;
        }
      }
      return false;
    } catch {
      // Offline fallback when disconnected
      const matchedUser = MOCK_USERS.find(
        (u) => u.party.contactInfo.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (matchedUser && password === 'password123') {
        setCurrentUser(matchedUser);
        return true;
      }
      return false;
    }
  }, []);

  const loginDemoRole = useCallback(async (role: 'admin' | 'agent'): Promise<boolean> => {
    const targetEmail = role === 'admin' ? 'admin@agency1.com' : 'moniaros@gmail.com';
    const matchedUser = MOCK_USERS.find((u) => u.party.contactInfo.email === targetEmail);
    if (!matchedUser) return false;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoRole: role }),
      });
      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
      }
    } catch {
      // Offline fallback allowed
    }
    localStorage.setItem('onboarding_skipped', JSON.stringify(true));
    setCurrentUser(matchedUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setCurrentUser(null);
  }, []);

  const value = {
    currentUser,
    authToken,
    login,
    loginDemoRole,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
