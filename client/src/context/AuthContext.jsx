import { createContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getMe } from '@/services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('ec_token');
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then((data) => setUser(data))
      .catch(() => localStorage.removeItem('ec_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: userData } = await loginUser(email, password);
    localStorage.setItem('ec_token', token);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { token, user: userData } = await registerUser(name, email, password);
    localStorage.setItem('ec_token', token);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ec_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
