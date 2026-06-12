import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://import-export-jhik.onrender.com/api';

// ── Types ─────────────────────────────────────────────────────
export type UserType = 'admin' | 'superadmin' | 'user' | null;

export interface AuthUser {
  id:           string;
  name:         string;   // Normalized: full_name for users, name for admins
  email:        string;
  role:         UserType;
  phone?:       string;
  company?:     string;
  country?:     string;
}

export interface UserRegisterData {
  full_name:    string;
  email:        string;
  password:     string;
  phone?:       string;
  company_name?: string;
  country?:     string;
}

interface AuthCtx {
  user:         AuthUser | null;
  token:        string | null;
  userType:     UserType;
  isLoading:    boolean;
  // Admin auth
  adminLogin:   (email: string, password: string, remember?: boolean) => Promise<{ ok: boolean; error?: string }>;
  adminLogout:  () => void;
  // User auth
  userLogin:    (email: string, password: string, remember?: boolean) => Promise<{ ok: boolean; error?: string }>;
  userRegister: (data: UserRegisterData) => Promise<{ ok: boolean; error?: string }>;
  userLogout:   () => void;
  // Shared
  logout:       () => void;
  setUser:      (u: AuthUser | null) => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

// ── Cookie helper (reads same cookie the backend sets) ────────
function clearAuthStorage() {
  ['tanzora_admin_token','tanzora_admin_user','tanzora_user_token','tanzora_user_data']
    .forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [userType,  setUserType]  = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Rehydrate session on mount ────────────────────────────
  useEffect(() => {
    const tryLoad = (tokenKey: string, dataKey: string) => {
      const t = localStorage.getItem(tokenKey) || sessionStorage.getItem(tokenKey);
      const d = localStorage.getItem(dataKey)  || sessionStorage.getItem(dataKey);
      if (t && d) {
        try { return { t, u: JSON.parse(d) as AuthUser }; } catch {}
      }
      return null;
    };

    const admin = tryLoad('tanzora_admin_token', 'tanzora_admin_user');
    const portal = tryLoad('tanzora_user_token', 'tanzora_user_data');

    if (admin) {
      setToken(admin.t);
      setUser(admin.u);
      setUserType(admin.u.role as UserType);
    } else if (portal) {
      setToken(portal.t);
      setUser(portal.u);
      setUserType('user');
    }
    setIsLoading(false);
  }, []);

  // ── Admin login ───────────────────────────────────────────
  const adminLogin = async (
    email: string, password: string, remember = false
  ): Promise<{ ok: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res  = await axios.post(`${API_BASE}/auth/login`, { email, password }, { withCredentials: true });
      const { admin: a, token: jwt } = res.data.data;
      const u: AuthUser = {
        id:      a.id,
        name:    a.name,
        email:   a.email,
        role:    a.role as UserType,
      };
      setUser(u); setToken(jwt); setUserType(a.role as UserType);
      const store = remember ? localStorage : sessionStorage;
      store.setItem('tanzora_admin_token', jwt);
      store.setItem('tanzora_admin_user',  JSON.stringify(u));
      setIsLoading(false);
      return { ok: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const e = err as { response?: { data?: { message?: string } } };
      return { ok: false, error: e?.response?.data?.message || 'Login failed' };
    }
  };

  // ── Admin logout ──────────────────────────────────────────
  const adminLogout = () => {
    setUser(null); setToken(null); setUserType(null);
    localStorage.removeItem('tanzora_admin_token');
    localStorage.removeItem('tanzora_admin_user');
    sessionStorage.removeItem('tanzora_admin_token');
    sessionStorage.removeItem('tanzora_admin_user');
    try { axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true }); } catch {}
  };

  // ── User login ────────────────────────────────────────────
  const userLogin = async (
    email: string, password: string, remember = false
  ): Promise<{ ok: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res  = await axios.post(`${API_BASE}/users/auth/login`, { email, password }, { withCredentials: true });
      const { user: u, token: jwt } = res.data.data;
      const authUser: AuthUser = {
        id:      u.id,
        name:    u.full_name,
        email:   u.email,
        role:    'user',
        phone:   u.phone,
        company: u.company_name,
        country: u.country,
      };
      setUser(authUser); setToken(jwt); setUserType('user');
      const store = remember ? localStorage : sessionStorage;
      store.setItem('tanzora_user_token', jwt);
      store.setItem('tanzora_user_data',  JSON.stringify(authUser));
      setIsLoading(false);
      return { ok: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const e = err as { response?: { data?: { message?: string } } };
      return { ok: false, error: e?.response?.data?.message || 'Login failed' };
    }
  };

  // ── User register ─────────────────────────────────────────
  const userRegister = async (
    data: UserRegisterData
  ): Promise<{ ok: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res  = await axios.post(`${API_BASE}/users/auth/register`, data, { withCredentials: true });
      const { user: u, token: jwt } = res.data.data;
      const authUser: AuthUser = {
        id:      u.id,
        name:    u.full_name,
        email:   u.email,
        role:    'user',
        phone:   u.phone,
        company: u.company_name,
        country: u.country,
      };
      setUser(authUser); setToken(jwt); setUserType('user');
      localStorage.setItem('tanzora_user_token', jwt);
      localStorage.setItem('tanzora_user_data',  JSON.stringify(authUser));
      setIsLoading(false);
      return { ok: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const e = err as { response?: { data?: { message?: string } } };
      return { ok: false, error: e?.response?.data?.message || 'Registration failed' };
    }
  };

  // ── User logout ───────────────────────────────────────────
  const userLogout = () => {
    setUser(null); setToken(null); setUserType(null);
    localStorage.removeItem('tanzora_user_token');
    localStorage.removeItem('tanzora_user_data');
    sessionStorage.removeItem('tanzora_user_token');
    sessionStorage.removeItem('tanzora_user_data');
    try { axios.post(`${API_BASE}/users/auth/logout`, {}, { withCredentials: true }); } catch {}
  };

  // ── Universal logout ──────────────────────────────────────
  const logout = () => {
    if (userType === 'user') userLogout();
    else adminLogout();
    clearAuthStorage();
  };

  // ── Legacy shim: keep old 'login' working for any existing code ──
  const login = adminLogin;

  return (
    <AuthContext.Provider value={{
      user, token, userType, isLoading,
      adminLogin, adminLogout,
      userLogin, userRegister, userLogout,
      logout, setUser,
      // @ts-expect-error — legacy compat
      login,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// ── Role helpers ──────────────────────────────────────────────
export const isAdmin      = (role: UserType) => role === 'admin' || role === 'superadmin';
export const isSuperAdmin = (role: UserType) => role === 'superadmin';
export const isUser       = (role: UserType) => role === 'user';
