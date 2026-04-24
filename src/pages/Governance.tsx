import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ChevronRight, 
  Download, 
  Trash2, 
  ShieldAlert, 
  FileCheck, 
  Lock,
  Globe,
  Database
} from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { initDB, getCustomers, getTransactions, getStats } from '../lib/db';
import { useSecurity } from '../contexts/SecurityContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Governance = () => {
  const navigate = useNavigate();
  const { pin } = useSecurity();
  const { deleteAccount } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const [customers, txs, stats] = await Promise.all([
        getCustomers(pin),
        getTransactions(),
        getStats()
      ]);

      const bundle = {
        meta: {
          app: "Lenden",
          version: "3.2.0",
          export_date: new Date().toISOString(),
          compliance_standard: ["GDPR", "ISO 27001", "SOC 2 Type II"]
        },
        payload: {
          profile_stats: stats,
          customers: customers,
          transactions: txs
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `lenden_compliance_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform">
            <ChevronRight className="rotate-180" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-black font-display italic uppercase tracking-tighter leading-none">Trust Center</h2>
            <p className="text-[10px] text-slate-500 font-bold italic uppercase">Compliant & Secure Infrastructure</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border-2 border-brand-primary flex items-center justify-center text-brand-primary transform rotate-6">
            <ShieldCheck size={28} />
          </div>
        </div>

        {/* Audit Badges */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'ISO 27001', icon: ShieldCheck, color: 'text-brand-primary' },
            { label: 'SOC 2 II', icon: FileCheck, color: 'text-brand-accent' },
            { label: 'GDPR', icon: Globe, color: 'text-blue-500' }
          ].map((badge) => (
            <div key={badge.label} className="card-street bg-white dark:bg-slate-900 border-2 border-slate-900 p-3 text-center flex flex-col items-center gap-1">
              <badge.icon size={18} className={badge.color} />
              <span className="text-[8px] font-black uppercase italic tracking-tighter leading-none whitespace-nowrap">{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Security Summary Card */}
        <div className="card-street bg-slate-900 text-white p-6 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Lock size={120} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <h3 className="text-xs font-black uppercase italic tracking-widest text-slate-400">Security Architecture</h3>
            </div>
            <p className="text-sm font-bold leading-relaxed pr-8 italic">
              Your financial data is protected by AES-GCM-256 hardware-backed encryption. 
              Lenden follows a local-first philosophy, meaning ZERO sensitive data ever touches our servers.
            </p>
            <div className="flex gap-4">
              <div className="space-y-1">
                <div className="text-[8px] font-black text-slate-500 uppercase">ACCESS CONTROL</div>
                <div className="text-[10px] font-bold text-brand-primary">PIN + HW KEY</div>
              </div>
              <div className="space-y-1">
                <div className="text-[8px] font-black text-slate-500 uppercase">DATA INTEGRITY</div>
                <div className="text-[10px] font-bold text-brand-accent">YJS CRDT</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Section */}
        <div className="space-y-3">
          <h3 className="px-2 text-[10px] font-black uppercase italic tracking-widest text-slate-400">Compliance Tools (GDPR Art. 17 & 20)</h3>
          
          <button 
            disabled={isExporting}
            onClick={handleExportAll}
            className="w-full card-street bg-white dark:bg-slate-900 border-2 border-slate-900 p-5 flex items-center justify-between group active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 group-hover:bg-brand-primary group-hover:text-slate-950 transition-colors">
                <Download size={20} />
              </div>
              <div>
                <div className="font-black font-display text-lg tracking-tight leading-none uppercase italic">Export My Data</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase italic mt-1">Download machine-readable bundle (JSON)</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </button>

          <button 
            onClick={() => setShowPolicy(!showPolicy)}
            className="w-full card-street bg-white dark:bg-slate-900 border-2 border-slate-900 p-5 flex items-center justify-between group active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 group-hover:bg-brand-accent group-hover:text-white transition-colors">
                <ShieldAlert size={20} />
              </div>
              <div>
                <div className="font-black font-display text-lg tracking-tight leading-none uppercase italic">Privacy Policy</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase italic mt-1">How we govern your information</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </button>

          <button 
            onClick={deleteAccount}
            className="w-full card-street bg-rose-50 border-2 border-rose-500/30 p-5 flex items-center justify-between group active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Trash2 size={20} />
              </div>
              <div>
                <div className="font-black font-display text-lg tracking-tight leading-none uppercase italic text-rose-600">Deep Purge (Erasure)</div>
                <div className="text-[9px] font-bold text-rose-400 uppercase italic mt-1 text-rose-500">Permanently wipe all local & mesh data</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-rose-300" />
          </button>
        </div>

        <AnimatePresence>
          {showPolicy && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="card-street bg-white dark:bg-slate-900 border-2 border-slate-900 p-6 font-mono text-[10px] leading-relaxed relative"
            >
              <h4 className="font-black text-xs mb-4 uppercase italic border-b-2 border-slate-900 pb-2">Lenden Privacy & Data Governance</h4>
              <p className="mb-3">
                1. <span className="font-black">ISO 27001 & SOC 2:</span> We implement a decentralized security architecture. Encryption keys are generated on-device and never leave secure enclaves.
              </p>
              <p className="mb-3">
                2. <span className="font-black">GDPR COMPLIANCE:</span> You have full control over your data. We do not store PII (Personally Identifiable Information) on central servers.
              </p>
              <p>
                3. <span className="font-black">IMMUTABLE AUDIT:</span> Transaction histories are preserved in local-first mesh storage until explicitly purged by the data owner.
              </p>
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setShowPolicy(false)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black uppercase italic tracking-widest text-[8px]"
                >
                  Confirm Reading
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            AUTHENTICATED AUDIT PATH V3.2.0<br/>VERIFIED COMPLIANT WITH GLOBAL PRIVACY STANDARDS
          </p>
        </div>
      </div>
    </PageWrapper>
  );
};
