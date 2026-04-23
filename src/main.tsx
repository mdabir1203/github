import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { SecurityProvider } from './contexts/SecurityContext.tsx';
import { LanguageProvider } from './contexts/LanguageContext.tsx';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <SecurityProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </SecurityProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
