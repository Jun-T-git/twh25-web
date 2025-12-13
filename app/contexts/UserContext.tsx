'use client';

import { createContext, useContext, useState } from 'react';

interface UserContextType {
  userId: string | null;
  setUserId: (id: string | null) => void;
  registerUser: (roomId: string, userId: string) => void;
  loadUser: (roomId: string) => string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  // Helper to persist user ID for a specific room
  const registerUser = (roomId: string, newUserId: string) => {
    localStorage.setItem(`user_${roomId}`, newUserId);
    setUserId(newUserId);
  };

  // Helper to load user ID for a specific room
  const loadUser = (roomId: string) => {
    const stored = localStorage.getItem(`user_${roomId}`);
    if (stored) {
      setUserId(stored);
      return stored;
    }
    return null;
  };

  return (
    <UserContext.Provider value={{ userId, setUserId, registerUser, loadUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
