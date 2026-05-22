import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AuthUser {
  name: string;
  email: string;
  company?: string;
  country?: string;
  avatar?: string;
}

interface AuthCtx {
  user: AuthUser | null;
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  signup: (data: Omit<AuthUser, "avatar"> & { password: string }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("tanzora_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string, remember = false): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const u: AuthUser = { name: email.split("@")[0].replace(/[._]/g, " "), email };
    setUser(u);
    if (remember) localStorage.setItem("tanzora_user", JSON.stringify(u));
    else sessionStorage.setItem("tanzora_user", JSON.stringify(u));
    setIsLoading(false);
    return true;
  };

  const signup = async (data: Omit<AuthUser, "avatar"> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1100));
    const { password: _, ...u } = data;
    setUser(u);
    localStorage.setItem("tanzora_user", JSON.stringify(u));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tanzora_user");
    sessionStorage.removeItem("tanzora_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
