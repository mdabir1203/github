import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dialect, DIALECT_DATA, Translations } from '../lib/i18n';

interface LanguageContextType {
  dialect: Dialect;
  setDialect: (dialect: Dialect) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [dialect, setDialectState] = useState<Dialect>(
    (localStorage.getItem('lenden_dialect') as Dialect) || 'STANDARD'
  );

  const setDialect = (newDialect: Dialect) => {
    localStorage.setItem('lenden_dialect', newDialect);
    setDialectState(newDialect);
  };

  const t = DIALECT_DATA[dialect];

  return (
    <LanguageContext.Provider value={{ dialect, setDialect, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
