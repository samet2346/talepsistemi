"use client"; 

import { createContext, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Geliştirici Hilesi: user başlangıçta null değil, sahte bir kullanıcı
  const [user, setUser] = useState({ ad: 'Test Kullanıcısı', email: 'test@test.com' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = (userData, token) => {
    setUser(userData);
    router.push('/taleplerim'); 
  };

  const logout = () => {
    setUser(null); 
    router.push('/giris'); 
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);