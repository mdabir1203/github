import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Lock, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSecurity } from '../contexts/SecurityContext';
import Navigation from './Navigation';
import PullToRefresh from './PullToRefresh';
import { SyncStatus } from './SyncStatus';
import { motion } from 'framer-motion';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { deleteAccount } = useAuth();
  const { lock, hasPinSet, isLocked } = useSecurity();
  
  const handleRefresh = async () => {
    // In a real app this might fetch from a server, 
    // here we just simulate it with a delay to verify UI feedback
    await new Promise(resolve => setTimeout(resolve, 1500));
    window.location.reload();
  };

  useEffect(() => {
    // Detect system color scheme
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    handleThemeChange(darkModeMediaQuery);
    darkModeMediaQuery.addEventListener('change', handleThemeChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  return (
    <div className="max-w-md mx-auto h-screen relative bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 bg-white dark:bg-slate-900 border-b-2 border-slate-900 dark:border-slate-800 transition-colors z-20">
        <div className="flex justify-between items-center mb-2">
          <div className="relative">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display uppercase italic tracking-tighter leading-none">
              লেনদেন <span className="text-brand-accent drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">Lenden</span>
            </h1>
            <div className="absolute -bottom-4 -left-2 transform -rotate-3 bg-brand-yellow px-2 py-0.5 border-2 border-slate-900 text-[8px] font-black uppercase italic tracking-widest text-slate-900">
              ডিজিটাল হিসাব খাতা
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">বিশ্বস্ত ব্যবসায়ী</span>
              <span className="text-sm font-black text-emerald-600 flex items-center gap-1 font-display italic">
                <Award size={14} fill="currentColor" />
                VERIFIED
              </span>
            </div>
            {hasPinSet && !isLocked && (
              <button 
                onClick={() => navigate('/language')}
                className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:scale-90 transition-all ml-1"
              >
                <Settings size={18} />
              </button>
            )}
            {hasPinSet && (
              <button 
                onClick={lock}
                className="w-10 h-10 rounded-2xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-rose-500 shadow-[3px_3px_0px_rgba(244,63,94,0.3)] active:scale-90 transition-all ml-1"
              >
                <Lock size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pt-6 px-6 pb-32 relative">
        <PullToRefresh onRefresh={handleRefresh} />
        {children}
        
        {/* Footer with Delete Account */}
        <footer className="mt-12 mb-8 pb-4 text-center">
          <button 
            onClick={deleteAccount}
            className="text-[10px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-tighter hover:underline decoration-2"
          >
            নিকাস গরি ফালানি (Delete Account)
          </button>
          <p className="text-[8px] text-slate-400 dark:text-slate-600 mt-2 font-mono">
            MADE WITH ❤️ IN BANGLADESH
          </p>
        </footer>
      </main>

      <SyncStatus />
      <Navigation />
    </div>
  );
};

export default Layout;
