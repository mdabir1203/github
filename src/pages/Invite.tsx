import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Share2, 
  Copy, 
  Check, 
  Gift, 
  Users, 
  Bluetooth, 
  Wifi,
  Sparkles,
  Smartphone,
  Store
} from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Invite = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [sharerName, setSharerName] = useState(() => localStorage.getItem('lenden_shop_name') || '');
  const [referralHash, setReferralHash] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());

  useEffect(() => {
    if (sharerName) {
      localStorage.setItem('lenden_shop_name', sharerName);
    }
  }, [sharerName]);

  // Generate the formatted referral link
  const safeName = sharerName.trim().toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 3);
  const code = safeName ? `${safeName}${referralHash.substring(0, 3)}` : referralHash.substring(0, 6);
  const referralCode = code.toUpperCase();
  const referralLink = `${window.location.origin}/j?r=${referralCode}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lenden App',
          text: `Hey! Start using Lenden for your shop's ledger. It's secure, offline-first, and smart. Use my link:`,
          url: referralLink,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageWrapper>
      <div className="space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform">
            <ChevronLeft />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-black font-display italic uppercase tracking-tighter leading-none">{t.invite_title}</h2>
            <p className="text-[10px] text-slate-500 font-bold italic uppercase">Refer & Boost Trust Score</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border-2 border-brand-primary flex items-center justify-center text-brand-primary rotate-6">
            <Gift size={28} />
          </div>
        </div>

        {/* Hero Card */}
        <div className="card-street bg-slate-900 text-white p-6 relative overflow-hidden group">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform">
            <Users size={150} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary text-slate-900 text-[10px] font-black uppercase italic rounded-full">
              <Sparkles size={12} />
              Limited Offer
            </div>
            <h3 className="text-3xl font-black font-display italic uppercase leading-none tracking-tight">
              {t.invite_cta}
            </h3>
            <p className="text-sm font-bold text-slate-400 uppercase italic leading-relaxed max-w-[80%]">
              {t.invite_desc}
            </p>
          </div>
        </div>

        {/* Sharing Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest px-2">Your Name / Shop Name</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Store size={18} />
              </span>
              <input 
                type="text" 
                value={sharerName}
                onChange={(e) => setSharerName(e.target.value)}
                placeholder="e.g. Abir Store"
                className="input-field pl-12 border-2 border-slate-900 bg-white font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest px-2">Your Unique Share Link</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl p-4 font-mono text-xs overflow-hidden truncate flex items-center">
                {referralLink}
              </div>
              <button 
                onClick={handleCopy}
                className={cn(
                  "p-4 rounded-2xl border-2 border-slate-900 transition-all active:scale-95",
                  copied ? "bg-emerald-500 text-white" : "bg-brand-primary text-slate-900"
                )}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          <button 
            onClick={handleShare}
            className="w-full btn-street bg-brand-primary text-slate-950 font-black text-xl py-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] border-2 border-slate-900 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-3"
          >
            <Share2 size={24} />
            {t.invite_share}
          </button>
        </div>

        {/* Offline Sharing Options */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 px-2">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest">Offline Methods</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card-street p-4 border-dashed border-2 flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Bluetooth size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase italic">Bluetooth Share</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 italic leading-tight">Send APK to nearby Android users</p>
              </div>
            </div>
            <div className="card-street p-4 border-dashed border-2 flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Wifi size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase italic">Hotspot Share</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 italic leading-tight">Sync via local Wi-Fi mesh</p>
              </div>
            </div>
          </div>
        </div>

        {/* App Install Visual */}
        <div className="card-street bg-brand-yellow/10 border-2 border-brand-yellow border-dashed p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center border-2 border-slate-900 shrink-0 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <Smartphone size={32} className="text-slate-900" />
          </div>
          <div>
            <h4 className="font-black font-display text-lg uppercase italic leading-none">Instant Install (PWA)</h4>
            <p className="text-[10px] font-bold text-slate-500 uppercase italic mt-1 leading-tight">
              Referral links trigger "Add to Home Screen" prompt for one-click installation on Android & iOS.
            </p>
          </div>
        </div>

        <div className="p-6 text-center">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            REFERRAL REWARDS ARE APPLIED AUTOMATICALLY UPON FIRST PIN SETUP BY THE REFERRED USER.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export default Invite;
