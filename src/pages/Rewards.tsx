import React from 'react';
import { Trophy, Award, Zap, TrendingUp, Star } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { useLendenData } from '../hooks/useLendenData';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

const Rewards = () => {
  const { stats, isLoading } = useLendenData();
  const { t } = useLanguage();

  if (isLoading) return null;

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="card-street bg-gradient-to-br from-brand-yellow to-amber-500 text-slate-900 p-8 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-30 group-hover:scale-110 transition-transform -rotate-12">
            <Trophy size={160} />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter mb-1 drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]">{t.rewards_title}</h2>
            <p className="text-slate-900/60 text-[10px] font-black uppercase tracking-widest italic tracking-tight">আপনার ব্যবসা কতটুকু আগাইছে ক্যান?</p>
            
            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-6xl font-black font-display italic tracking-tighter drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]">{stats?.creditScore || 0}</span>
              <span className="text-slate-900 font-black text-sm uppercase italic">পয়েন্ট</span>
            </div>
            
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase italic tracking-widest shadow-lg">
              <Star size={10} fill="currentColor" />
              TOP RATED MERCHANT
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="px-2">
            <h3 className="text-lg font-black font-display italic uppercase tracking-tighter leading-none">{t.badges_title} (BADGES)</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {stats?.badges.map((badge, idx) => (
              <motion.div 
                key={badge} 
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: idx * 0.1, type: "spring" }}
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="card-street flex flex-col items-center gap-2 text-center p-4 bg-white dark:bg-slate-900 aspect-square justify-center border-2 border-slate-900"
              >
                <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-brand-yellow shadow-[4px_4px_0px_rgba(251,191,36,1)] border-2 border-slate-900">
                  <Award size={28} />
                </div>
                <span className="text-[9px] font-black leading-tight uppercase font-display italic tracking-tight dark:text-white font-mono">{badge}</span>
              </motion.div>
            ))}
            {stats?.badges.length === 0 && (
              <div className="col-span-3 py-12 text-center card-street border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                <p className="text-xs font-black text-slate-400 italic uppercase">এহনও কুন্নু মেডেল পাননি ক্যান!</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="px-2">
            <h3 className="text-lg font-black font-display italic uppercase tracking-tighter leading-none">{t.perks_title} (PERKS)</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'ফ্রি এসএমএস প্যাক', score: 70, icon: Zap },
              { label: 'রিসেট করার অপশন', score: 85, icon: TrendingUp }
            ].map((perk) => (
              <div key={perk.label} className="card-street flex items-center gap-4 opacity-70 group border-2 border-slate-900 bg-slate-100 dark:bg-slate-800 grayscale">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-400 border-2 border-slate-900">
                  <perk.icon size={22} />
                </div>
                <div className="flex-1">
                  <div className="font-black text-sm uppercase italic tracking-tight font-display">{perk.label}</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase italic">{perk.score} স্কোর হলে আনলক হবে</div>
                </div>
                <div className="text-[10px] font-black text-slate-400 font-display italic bg-white px-2 py-1 border-2 border-slate-900 uppercase">LOCKED</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Rewards;
