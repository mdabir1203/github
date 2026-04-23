import React, { createContext, useContext, ReactNode } from 'react';
import { initDB } from '../lib/db';

interface AuthContextType {
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const deleteAccount = async () => {
    const confirmation = window.confirm('আঁই সত্যি গরি ডিলিট গরিতাম চাননি? (Nikas gori falata chan?) - This will clear all your local data.');
    if (confirmation) {
      const db = await initDB();
      // Clearing all stores in IndexedDB
      const stores = ['customers', 'transactions', 'stats'];
      const tx = db.transaction(stores, 'readwrite');
      await Promise.all(stores.map(store => tx.objectStore(store).clear()));
      await tx.done;
      
      // Clear security PIN and onboarding
      localStorage.removeItem('lenden_pin_hash');
      localStorage.removeItem('lenden_welcome_seen');
      
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider value={{ deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
