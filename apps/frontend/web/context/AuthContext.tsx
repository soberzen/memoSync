'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { usePathname } from 'next/navigation';

import {
  getProfile,
  logout as logoutRequest,
  type User,
} from '@/service/api/auth';

type AuthContextType = {
  loading: boolean;
  user: User | null;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  const refreshUser = useCallback(async () => {
    try {
      const response = await getProfile();
      setUser(response.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // 如果当前路径是登录页或注册页，则不刷新用户信息
    if (pathname === '/login' || pathname === '/signup') return;
    Promise.resolve().then(refreshUser);
  }, [refreshUser, pathname]);

  const value = useMemo<AuthContextType>(
    () => ({
      loading,
      user,
      isAuthenticated: user !== null,
      refreshUser,
      logout,
    }),
    [loading, logout, refreshUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
