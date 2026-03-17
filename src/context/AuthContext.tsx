import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserData = {
  id: number;
  name: string;
  email: string;
  department: string;
  role: 'student' | 'admin';
};

export interface AuthContextType {
  user: UserData | null;
  token: string | null;
  login: (userData: UserData, tokenStr: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (userData: UserData, tokenStr: string) => {
    setUser(userData);
    setToken(tokenStr);
    localStorage.setItem('srcb_user', JSON.stringify(userData));
    localStorage.setItem('srcb_token', tokenStr);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('srcb_user');
    localStorage.removeItem('srcb_token');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('srcb_user');
    const storedToken = localStorage.getItem('srcb_token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(parsedUser);
        setToken(storedToken);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        logout();
      }
    }
  }, []); // Run once on mount

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
