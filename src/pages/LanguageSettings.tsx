import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Languages, Check, ShieldCheck, Lock, LifeBuoy } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import { Dialect } from '../lib/i18n';
import { motion } from 'framer-motion';

const DIALECT_OPTIONS: { id: Dialect; name: string; region: string }[] = [
  { id: 'STANDARD', name: 'প্রমিত বাংলা', region: 'Standard Bengali' },
  { id: 'CHITTAGONIAN', name: 'চাঁটগাঁইয়া', region: 'Chittagong' },
  { id: 'SYLHETI', name: 'ছিলটি', region: 'Sylhet' },
  { id: 'BARISHAILLA', name: 'বরিশাইল্লা', region: 'Barishal' },
  { id: 'DHAKAIYYA', name: 'ঢাকাইয়া মর্ডান', region: 'Old Dhaka / Modern' },
  { id: 'BANGLISH', name: 'Banglish', region: 'Modern Mixed' },
];

export const LanguageSettings = () => {
  const navigate = useNavigate();
  const { dialect, setDialect, t } = useLanguage();

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform">
            <ChevronRight className="rotate-180" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-black font-display italic uppercase tracking-tighter leading-none">ভাষা (LANGUAGE)</h2>
            <p className="text-xs text-slate-500 font-bold italic uppercase">আপনার পছন্দের বোলি বেছে নিন</p>
          </div>
        </div>

        <div className="space-y-3">
          {DIALECT_OPTIONS.map((opt) => (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDialect(opt.id)}
              className={`w-full card-street p-5 flex items-center justify-between border-2 transition-all ${
                dialect === opt.id 
                  ? "bg-brand-primary/10 border-brand-primary" 
                  : "bg-white dark:bg-slate-900 border-slate-900"
              }`}
            >
              <div className="flex items-center gap-4 text-left">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${
                  dialect === opt.id ? "bg-brand-primary text-slate-900 border-slate-900" : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-800"
                }`}>
                  <Languages size={20} />
                </div>
                <div>
                  <div className="font-black font-display text-lg tracking-tight">{opt.name}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase italic">{opt.region}</div>
                </div>
              </div>
              {dialect === opt.id && (
                <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <Check size={16} className="text-slate-950" />
                </div>
              )}
            </motion.button>
          ))}

          <div className="pt-4">
            <h3 className="px-2 text-[10px] font-black uppercase italic tracking-widest text-slate-400 mb-2">Audit & GRC</h3>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/governance')}
              className="w-full card-street p-5 flex items-center justify-between border-2 border-slate-900 bg-slate-900 text-white"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border-2 border-slate-700 text-brand-primary">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="font-black font-display text-lg tracking-tight leading-none uppercase italic">Security & Compliance</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase italic mt-1">ISO 27001 / SOC 2 / GDPR</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500" />
            </motion.button>
          </div>

          <div className="pt-2">
            <h3 className="px-2 text-[10px] font-black uppercase italic tracking-widest text-slate-400 mb-2">Help & Improvement</h3>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/review-adda')}
              className="w-full card-street p-5 flex items-center justify-between border-2 border-slate-900 bg-brand-primary text-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border-2 border-slate-900">
                  <LifeBuoy size={20} />
                </div>
                <div>
                  <div className="font-black font-display text-lg tracking-tight leading-none uppercase italic">{t.feedback_title}</div>
                  <div className="text-[10px] font-bold text-slate-700 uppercase italic mt-1">Submit technical issues or UI feedback</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-900" />
            </motion.button>
          </div>
        </div>

        <div className="p-6 card-street border-dashed bg-brand-yellow/5 border-2 text-center space-y-2">
          <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase italic">
            "নিজের ভাষায় হিসাব রাখলে মনে থাকে বেশি"
          </p>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            CUSTOMIZING YOUR LEDGER FOR CULTURAL COHERENCY.<br/>LOCAL DIALECTS STRENGTHEN CUSTOMER TRUST.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
};
