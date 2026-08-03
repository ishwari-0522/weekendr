'use client';

import { useAuthContext } from '../contexts/AuthContext';

/**
 * useAuth: Custom hook to reference AuthContext session actions easily.
 */
export function useAuth() {
  return useAuthContext();
}

export default useAuth;
