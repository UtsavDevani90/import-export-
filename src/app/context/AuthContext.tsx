import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://import-export-jhik.onrender.com/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;   // 'admin' | 'superadmin'
  company?: string;
  country?: string;
  avatar?: string;
}

interface AuthCtx {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  signup: (data: Omit<AuthUser, 'avatar' | 'id' | 'role'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('tanzora_token') || sessionStorage.getItem('tanzora_token');
    const storedUser  = localStorage.getItem('tanzora_user')  || sessionStorage.getItem('tanzora_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, remember = false): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password }, { withCredentials: true });
      const { admin, token: jwt } = res.data.data;
      const u: AuthUser = { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
      setUser(u);
      setToken(jwt);
      const store = remember ? localStorage : sessionStorage;
      store.setItem('tanzora_token', jwt);
      store.setItem('tanzora_user', JSON.stringify(u));
      setIsLoading(false);
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (data: Omit<AuthUser, 'avatar' | 'id' | 'role'> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, data);
      const { admin, token: jwt } = res.data.data;
      const u: AuthUser = { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
      setUser(u);
      setToken(jwt);
      localStorage.setItem('tanzora_token', jwt);
      localStorage.setItem('tanzora_user', JSON.stringify(u));
      setIsLoading(false);
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tanzora_token');
    localStorage.removeItem('tanzora_user');
    sessionStorage.removeItem('tanzora_token');
    sessionStorage.removeItem('tanzora_user');
    try { axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true }); } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
