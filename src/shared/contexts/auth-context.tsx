'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { User, AuthContextType } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // TODO: Validar token y cargar usuario
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // TODO: Implementar llamada a API
    setIsLoading(true);
    try {
      // const response = await authService.login(email, password);
      // setToken(response.token);
      // setUser(response.user);
      // localStorage.setItem('token', response.token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token,
      isLoading,
    }),
    [user, token, login, logout, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}