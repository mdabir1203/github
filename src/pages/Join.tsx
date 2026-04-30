import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Gift, ArrowRight, Store, Sparkles } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

export const Join = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [referrerName, setReferrerName] = useState<string>('');

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      // ref format is expected to be lenden-{safeName}-{hash}
      const parts = ref.split('-');
      if (parts.length >= 3 && parts[0].toLowerCase() === 'lenden') {
        const namePart = parts[1];
        setReferrerName(namePart);
        // Save the referral data for later activation
        localStorage.setItem('lenden_referred_by', ref);
      }
    }
  }, [searchParams]);

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 text-center px-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="w-32 h-32 rounded-[2rem] bg-brand-primary border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex items-center justify-center relative"
        >
          <Gift size={64} className="text-slate-900" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -right-4 bg-brand-yellow rounded-full p-2 border-2 border-slate-900"
          >
            <Sparkles size={24} className="text-slate-900" />
          </motion.div>
        </motion.div>

        <div className="space-y-4 max-w-sm">
          <h1 className="text-4xl font-black font-display italic uppercase tracking-tighter leading-none">
            Welcome to Lenden!
          </h1>
          
          {referrerName ? (
            <div className="card-street bg-white dark:bg-slate-900 p-4 border-2 border-slate-900 inline-flex flex-col items-center justify-center w-full relative overflow-hidden">
              <div className="absolute opacity-5 right-[-20px] top-[-20px]">
                <Store size={100} />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase italic tracking-widest relative z-10 w-full text-left">
                You were invited by:
              </p>
              <div className="flex items-center gap-2 mt-2 font-black text-xl uppercase italic relative z-10 w-full text-left text-brand-primary">
                <Store size={24} />
                <span className="truncate">{referrerName.toUpperCase()}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm font-bold text-slate-500 uppercase italic leading-relaxed">
              Your smart digital ledger for daily transactions.
            </p>
          )}

          <p className="text-sm font-bold text-slate-500 uppercase italic leading-relaxed pt-2">
            Set up your shop and get rewarded for joining via a friend's link!
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleContinue}
          className="w-full max-w-xs btn-street text-xl py-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] group"
        >
          <span className="flex items-center justify-center gap-2">
            Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.button>
      </div>
    </PageWrapper>
  );
};

export default Join;
