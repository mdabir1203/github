import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, KeyRound } from 'lucide-react';
import { useSecurity } from '../contexts/SecurityContext';
import { useLanguage } from '../contexts/LanguageContext';

export const LockScreen = () => {
  const { hasPinSet, unlock, setNewPin, lockoutTime } = useSecurity();
  const { t } = useLanguage();
  const [entry, setEntry] = useState('');
  const [confirmEntry, setConfirmEntry] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(hasPinSet ? 'unlock' : 'setup');

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime > 0) {
      setError(`খুব বেশি ভুল পিন! ${lockoutTime} মিনিট অপেক্ষা করুন।`);
      return;
    }
    const success = await unlock(entry);
    if (!success) {
      setError('ভুল পিন! দয়া করে আবার চেষ্টা করুন।');
      setEntry('');
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (entry.length < 4) {
      setError('পিন কমপক্ষে ৪ সংখ্যার হতে হবে।');
      return;
    }
    setStep('confirm');
    setError('');
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (entry === confirmEntry) {
      await setNewPin(entry);
    } else {
      setError('পিন মিলছে না ক্যান?');
      setConfirmEntry('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-6 text-white overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border-2 border-brand-primary rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border-2 border-brand-accent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm card-street bg-slate-900 border-2 border-slate-700 p-8 text-center relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-brand-primary shadow-[4px_4px_0px_rgba(16,185,129,0.3)]">
            {step === 'unlock' ? <Lock size={40} /> : <ShieldCheck size={40} />}
          </div>
        </div>

        <h2 className="text-2xl font-black font-display italic uppercase tracking-tighter mb-2">
          {step === 'unlock' ? t.lock_title : 'সিকিউরিটি পিন (SET PIN)'}
        </h2>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-8">
          {step === 'unlock' ? 'আপনার পিন দিয়ে অ্যাপ আনলক করুন' : 'অ্যাপ সুরক্ষিত রাখতে একটি ৪-৬ সংখ্যার পিন দিন'}
        </p>

        <form onSubmit={step === 'unlock' ? handleUnlock : (step === 'setup' ? handleSetup : handleConfirm)} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="password" 
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={step === 'confirm' ? "নিশ্চিত করুন" : "পিন দিন"}
              className="input-field pl-14 text-center tracking-[1em] text-2xl font-black border-2 border-slate-700 bg-slate-800 focus:border-brand-primary"
              value={step === 'confirm' ? confirmEntry : entry}
              onChange={(e) => step === 'confirm' ? setConfirmEntry(e.target.value) : setEntry(e.target.value)}
              autoFocus
              required
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-500 text-[10px] font-black uppercase italic">
              {error}
            </motion.p>
          )}

          <button type="submit" className="w-full btn-street bg-brand-primary text-slate-950 font-black text-lg py-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-slate-900 mt-4">
            {step === 'unlock' ? t.unlock : (step === 'setup' ? t.next : t.save)}
          </button>
        </form>

        <p className="mt-8 text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
          SECURITY GUARANTEED BY LOCAL-FIRST ENCRYPTION.<br/>YOUR DATA NEVER LEAVES THIS DEVICE.
        </p>
      </motion.div>
    </div>
  );
};
