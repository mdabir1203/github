import React, { useState, useEffect } from 'react';
import { RefreshCcw, CheckCircle2, AlertTriangle, CloudOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SyncState = 'IDLE' | 'SYNCING' | 'SYNCED' | 'OFFLINE';

export const SyncStatus = () => {
  const [syncState, setSyncState] = useState<SyncState>('IDLE');

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const showSynced = () => {
      setSyncState('SYNCED');
      timeout = setTimeout(() => setSyncState('IDLE'), 3000);
    };

    const handleOnline = () => {
      setSyncState('SYNCING');
      clearTimeout(timeout);
      // Let's assume sync takes a bit when coming online
      timeout = setTimeout(showSynced, 2000);
    };

    const handleOffline = () => {
      clearTimeout(timeout);
      setSyncState('OFFLINE');
    };

    // Set offline state immediately if offline
    if (!navigator.onLine) {
      setSyncState('OFFLINE');
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AnimatePresence>
      {(syncState !== 'IDLE') && (
        <motion.div
           initial={{ opacity: 0, y: 50, scale: 0.9 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, y: 20, scale: 0.9 }}
           transition={{ type: "spring", stiffness: 400, damping: 25 }}
           className="fixed bottom-[90px] left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className={`
            px-4 py-2.5 rounded-2xl border-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] 
            flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest
            ${syncState === 'SYNCING' ? 'bg-brand-primary border-slate-900 text-slate-900' : ''}
            ${syncState === 'SYNCED' ? 'bg-emerald-400 border-slate-900 text-slate-900' : ''}
            ${syncState === 'OFFLINE' ? 'bg-slate-200 border-slate-900 text-slate-600' : ''}
          `} style={{
            backdropFilter: 'blur(4px)'
          }}>
            {syncState === 'SYNCING' && (
               <>
                 <RefreshCcw size={14} className="animate-spin" />
                 <span>Syncing With Server...</span>
               </>
            )}
            {syncState === 'SYNCED' && (
               <>
                 <CheckCircle2 size={14} />
                 <span>Synced!</span>
               </>
            )}
            {syncState === 'OFFLINE' && (
               <>
                 <CloudOff size={14} />
                 <span>Offline Mode • 30 Day Backup</span>
               </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
