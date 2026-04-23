import React, { createContext, useContext, useState, useEffect } from 'react';
import { generatePinHash } from '../lib/crypto';

interface SecurityContextType {
  isLocked: boolean;
  pin: string | null;
  unlock: (pin: string) => Promise<boolean>;
  setNewPin: (pin: string) => Promise<void>;
  lock: () => void;
  hasPinSet: boolean;
  hasSeenWelcome: boolean;
  completeOnboarding: () => void;
  shouldShowFeedback: boolean;
  dismissFeedback: () => void;
  lockoutTime: number; // minutes remaining
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider = ({ children }: { children: React.ReactNode }) => {
  const [pin, setPin] = useState<string | null>(null);
  const [hasPinSet, setHasPinSet] = useState<boolean>(!!localStorage.getItem('lenden_pin_hash'));
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(!!localStorage.getItem('lenden_welcome_seen'));
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [shouldShowFeedback, setShouldShowFeedback] = useState(false);

  // Dynamic System: Check for feedback every 2 weeks (1209600000 ms)
  useEffect(() => {
    const lastFeedback = localStorage.getItem('lenden_last_feedback');
    const now = Date.now();
    if (!lastFeedback) {
      localStorage.setItem('lenden_last_feedback', now.toString());
    } else {
      const diff = now - parseInt(lastFeedback);
      if (diff > 1209600000) { // 14 days
        setShouldShowFeedback(true);
      }
    }
  }, []);

  const unlock = async (entry: string): Promise<boolean> => {
    const now = Date.now();
    if (lockoutUntil && now < lockoutUntil) return false;

    const storedHash = localStorage.getItem('lenden_pin_hash');
    if (!storedHash) return false;

    const entryHash = await generatePinHash(entry);
    if (entryHash === storedHash) {
      setPin(entry);
      setIsLocked(false);
      setFailedAttempts(0);
      setLockoutUntil(null);
      return true;
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 5) {
        // Ninja Russian Hacker Defense: Exponential lockout
        const penalty = Math.pow(2, newAttempts - 5) * 60 * 1000; 
        setLockoutUntil(now + penalty);
      }
      return false;
    }
  };

  const dismissFeedback = () => {
    localStorage.setItem('lenden_last_feedback', Date.now().toString());
    setShouldShowFeedback(false);
  };

  const lockoutTime = lockoutUntil ? Math.ceil((lockoutUntil - Date.now()) / 60000) : 0;

  const setNewPin = async (newPin: string) => {
    const hash = await generatePinHash(newPin);
    localStorage.setItem('lenden_pin_hash', hash);
    setPin(newPin);
    setHasPinSet(true);
    setIsLocked(false);
  };

  const lock = () => {
    setPin(null);
    setIsLocked(true);
  };

  const completeOnboarding = () => {
    localStorage.setItem('lenden_welcome_seen', 'true');
    setHasSeenWelcome(true);
  };

  return (
    <SecurityContext.Provider value={{ 
      isLocked, pin, unlock, setNewPin, lock, hasPinSet, 
      hasSeenWelcome, completeOnboarding, shouldShowFeedback, dismissFeedback, lockoutTime
    }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
