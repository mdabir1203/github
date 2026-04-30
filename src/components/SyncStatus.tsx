import React, { useState, useEffect } from 'react';
import { RefreshCcw, CheckCircle2, AlertTriangle, CloudOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SyncState = 'IDLE' | 'SYNCING' | 'SYNCED' | 'CONFLICT' | 'OFFLINE';

export const SyncStatus = () => {
  const [syncState, setSyncState] = useState<SyncState>('IDLE');

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const showSynced = () => {
      setSyncState('SYNCED');
      timeout = setTimeout(() => setSyncState('IDLE'), 2000);
    };

    const handleOnline = () => {
      setSyncState('SYNCING');
      clearTimeout(timeout);
      timeout = setTimeout(showSynced, 1500);
    };

    const handleOffline = () => {
      clearTimeout(timeout);
      setSyncState('OFFLINE');
    };

    const doSync = () => {
      if (!navigator.onLine) {
        setSyncState('OFFLINE');
        return;
      }
      setSyncState('SYNCING');
      clearTimeout(timeout);
      
      const isConflict = Math.random() > 0.95;
      timeout = setTimeout(() => {
        if (isConflict) {
          setSyncState('CONFLICT');
          timeout = setTimeout(() => {
            setSyncState('SYNCING');
            timeout = setTimeout(showSynced, 1500);
          }, 3000);
        } else {
          showSynced();
        }
      }, 1000 + Math.random() * 1000);
    };

    // Initial sync
    const initialSyncTimeout = setTimeout(doSync, 1000);

    // Periodic sync simulation
    const syncInterval = setInterval(doSync, 20000 + Math.random() * 10000);

    // Set offline state immediately if offline
    if (!navigator.onLine) {
      setSyncState('OFFLINE');
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
      clearTimeout(initialSyncTimeout);
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
            ${syncState === 'CONFLICT' ? 'bg-rose-500 border-slate-900 text-white' : ''}
            ${syncState === 'OFFLINE' ? 'bg-slate-200 border-slate-900 text-slate-600' : ''}
          `} style={{
            backdropFilter: 'blur(4px)'
          }}>
            {syncState === 'SYNCING' && (
               <>
                 <RefreshCcw size={14} className="animate-spin" />
                 <span>Data load gorir...</span>
               </>
            )}
            {syncState === 'SYNCED' && (
               <>
                 <CheckCircle2 size={14} />
                 <span>Synced!</span>
               </>
            )}
            {syncState === 'CONFLICT' && (
               <>
                 <AlertTriangle size={14} className="animate-pulse" />
                 <span>Conflict Detected!</span>
               </>
            )}
            {syncState === 'OFFLINE' && (
               <>
                 <CloudOff size={14} />
                 <span>Offline Mode</span>
               </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
