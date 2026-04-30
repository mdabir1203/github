import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Components
import Layout from './components/Layout';
import { LockScreen } from './components/LockScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FeedbackModal } from './components/FeedbackModal';

// Lazy load pages for better bundle management and security obscurity
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Ledger = React.lazy(() => import('./pages/Ledger'));
const Rewards = React.lazy(() => import('./pages/Rewards'));
const History = React.lazy(() => import('./pages/History'));
const Adda = React.lazy(() => import('./pages/Adda').then(m => ({ default: m.Adda })));
const ShopMap = React.lazy(() => import('./pages/ShopMap').then(m => ({ default: m.ShopMap })));
const AddTransaction = React.lazy(() => import('./pages/AddTransaction'));
const AddCustomer = React.lazy(() => import('./pages/AddCustomer'));
const CustomerDetail = React.lazy(() => import('./pages/CustomerDetail'));
const LanguageSettings = React.lazy(() => import('./pages/LanguageSettings').then(m => ({ default: m.LanguageSettings })));
const Governance = React.lazy(() => import('./pages/Governance').then(m => ({ default: m.Governance })));
const ReviewAdda = React.lazy(() => import('./pages/ReviewAdda').then(m => ({ default: m.ReviewAdda })));

import { useLendenData } from './hooks/useLendenData';
import { useSecurity } from './contexts/SecurityContext';

export default function App() {
  const { isLoading } = useLendenData();
  const { isLocked, hasSeenWelcome, completeOnboarding, lock } = useSecurity();
  const location = useLocation();

  // Financial App Standard: Auto-lock when user leaves the app app (APK packaging guideline)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        lock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lock]);

  if (!hasSeenWelcome) return <WelcomeScreen onComplete={completeOnboarding} />;

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-slate-950">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }} className="flex flex-col items-center">
        <div className="text-6xl font-black text-brand-primary font-display italic uppercase tracking-tighter drop-shadow-[8px_8px_0px_rgba(244,63,94,1)]">লেনদেন</div>
        <div className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic shrink-0">SECURE LOADIN KORER KAN?...</div>
      </motion.div>
    </div>
  );

  return (
    <Layout>
      <FeedbackModal />
      <React.Suspense fallback={<div className="flex-1 bg-slate-950" />}>
        <AnimatePresence mode="wait">
          <Routes location={location}>
            {/* Lock Screen Route */}
            <Route path="/lock" element={<LockScreen />} />
            
            {/* Guarded Routes */}
            <Route path="/" element={<ProtectedRoute><Navigate to="/habits" replace /></ProtectedRoute>} />
            <Route path="/habits" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/patterns" element={<ProtectedRoute><Ledger /></ProtectedRoute>} />
            <Route path="/beliefs" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
            <Route path="/receipts" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/add" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
            <Route path="/add-customer" element={<ProtectedRoute><AddCustomer /></ProtectedRoute>} />
            <Route path="/patterns/:id" element={<ProtectedRoute><CustomerDetail /></ProtectedRoute>} />
            <Route path="/language" element={<ProtectedRoute><LanguageSettings /></ProtectedRoute>} />
            <Route path="/governance" element={<ProtectedRoute><Governance /></ProtectedRoute>} />
            <Route path="/review-adda" element={<ProtectedRoute><ReviewAdda /></ProtectedRoute>} />
            <Route path="/adda" element={<ProtectedRoute><Adda /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><ShopMap /></ProtectedRoute>} />
            
            {/* Redirect any lock requests while already unlocked */}
            { !isLocked && (
              <Route path="/lock" element={<Navigate to="/habits" replace />} />
            )}
          </Routes>
        </AnimatePresence>
      </React.Suspense>
    </Layout>
  );
}
