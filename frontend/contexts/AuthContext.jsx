'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider: Master context wrapper managing session status, guest roles, and token states.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore sessions from localStorage
  const restoreSession = useCallback(async () => {
    setLoading(true);
    try {
      const storedToken = localStorage.getItem('token');
      const isGuest = localStorage.getItem('guest_mode') === 'true';

      if (storedToken) {
        // Automatically fetch profile after token recovery
        const res = await authService.getMe();
        if (res.success) {
          setUser(res.data);
          setToken(storedToken);
          setIsAuthenticated(true);
        } else {
          // Token expired or invalid, clear session gracefully
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
        }
      } else if (isGuest) {
        setUser({ role: 'guest', full_name: 'Guest Explorer' });
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Login handler
  const login = useCallback(async (email, password) => {
    setLoading(true);
    const res = await authService.login(email, password);
    if (res.success) {
      const jwtToken = res.data.token;
      localStorage.setItem('token', jwtToken);
      localStorage.removeItem('guest_mode'); // Clear guest mode
      setToken(jwtToken);
      setUser(res.data.profile);
      setIsAuthenticated(true);
    }
    setLoading(false);
    return res;
  }, []);

  // Register handler
  const register = useCallback(async (fullName, email, password, phone = '') => {
    setLoading(true);
    const res = await authService.register(fullName, email, password, phone);
    setLoading(false);
    return res;
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('guest_mode');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  }, []);

  // Continue as Guest handler
  const continueAsGuest = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.setItem('guest_mode', 'true');
    setUser({ role: 'guest', full_name: 'Guest Explorer' });
    setIsAuthenticated(false);
  }, []);

  // Update preferences handler
  const updatePreferences = useCallback(async (prefs) => {
    if (user?.role === 'guest') {
      setUser((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          ...prefs
        }
      }));
      return { success: true, message: 'Guest preferences updated locally.' };
    }

    const res = await authService.updatePreferences(prefs);
    if (res.success) {
      setUser((prev) => ({
        ...prev,
        preferences: res.data.preferences
      }));
    }
    return res;
  }, [user]);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    continueAsGuest,
    updatePreferences,
    restoreSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
