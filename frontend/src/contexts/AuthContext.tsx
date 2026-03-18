'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';

interface User { id: string; nome: string; email: string; role: string; }
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = Cookies.get('token');
    if (!token) {
      setUser(null);
      return;
    }

    const res = await api.get('/api/auth/me');
    setUser(res.data);
  };

  useEffect(() => {
    refreshUser()
      .catch(() => {
        Cookies.remove('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, senha: string) => {
    const res = await api.post('/api/auth/login', { email, senha });
    Cookies.set('token', res.data.token, {
      expires: 7,
      secure: window.location.protocol === 'https:',
      sameSite: 'Lax',
    });
    setUser(res.data.usuario);
    return res.data.usuario;
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
