import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('optilight_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('optilight_token')));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('optilight_token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await authApi.getCurrentUser();
      setUser(profile);
      setIsAuthenticated(true);
      return profile;
    } catch (err) {
      logout();
      throw err;
    }
  }, [logout]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('optilight_token');
      if (storedToken) {
        try {
          await refreshUser();
        } catch {
          // Token invalid or expired, handled in refreshUser
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for session expiry from Axios interceptor
    const handleAuthExpired = () => {
      logout();
    };
    window.addEventListener('auth_expired', handleAuthExpired);
    return () => window.removeEventListener('auth_expired', handleAuthExpired);
  }, [refreshUser, logout]);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    const accessToken = data.access_token;
    localStorage.setItem('optilight_token', accessToken);
    setToken(accessToken);
    setIsAuthenticated(true);
    // Fetch profile immediately
    const profile = await authApi.getCurrentUser();
    setUser(profile);
    return profile;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
