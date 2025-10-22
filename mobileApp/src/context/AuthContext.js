// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeUser } from '../utils/authHelpers';
import { setAuthToken, getProfile } from '../api/auth'; 

// Create context
export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Expose a reusable refresher (used by Home pull-to-refresh too)
  const refreshUser = useCallback(async () => {
    try {
      const res = await getProfile(); 
      if (res?.status && res?.user) {
        const normalized = normalizeUser(res.user);
        setUser(normalized);
        await AsyncStorage.setItem('userData', JSON.stringify(normalized));
        return true;
      }
    } catch (e) {
      // Token invalid/expired → clear local session
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setAuthToken(null);
      setUser(null);
      console.log(
        'refreshUser failed; session cleared:',
        e?.response?.status || e.message,
      );
    }
    return false;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Retrieve both user data & token
        const [userJson, token] = await Promise.all([
          AsyncStorage.getItem('userData'),
          AsyncStorage.getItem('userToken'),
        ]);

        if (token) setAuthToken(token);

        // Optimistic hydrate from cache so UI isn’t blank
        if (userJson) {
          const normalized = normalizeUser(JSON.parse(userJson));
          setUser(normalized);
          // ensure shape is normalized for future reads
          await AsyncStorage.setItem('userData', JSON.stringify(normalized));
        }

        // If we have a token, verify it & pull latest roles/permissions
        if (token) {
          await refreshUser(); // updates user or clears session if 401/invalid
        }
      } catch (err) {
        console.log('Error restoring session:', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  // Show nothing while restoring user
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
