import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Zap, TrendingUp, Award } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { PageWrapper } from '../components/PageWrapper';
import { useLendenData } from '../hooks/useLendenData';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon: Icon, color, sublabel, delay = 0 }: { label: string, value: string | number, icon: any, color: string, sublabel?: string, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="card-street flex flex-col gap-1 p-5 relative overflow-hidden h-full group"
  >
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-2 border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:-translate-y-1 transition-transform", color)}>
      <Icon size={24} className="text-white" />
    </div>
    <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest font-display italic">{label}</span>
    <span className="text-2xl font-black font-display italic tracking-tighter">{value}</span>
    {sublabel && <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase italic opacity-0 group-hover:opacity-100 transition-opacity">{sublabel}</span>}
  </motion.div>
);

const Dashboard = () => {
  const { customers, stats, insights, isLoading } = useLendenData();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (isLoading) return null;

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Intelligence Hub (CoreML principle) */}
        {insights && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 bg-brand-primary/10 border-2 border-brand-primary/30 rounded-2xl cursor-pointer"
            onClick={() => navigate('/language')}
          >
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center shrink-0">
              <TrendingUp size={16} className="text-slate-950" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-black uppercase italic text-brand-primary leading-tight">লেনদেন ইন্টেলিজেন্স (Insight):</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                {insights.peakDay !== 'N/A' ? `এই সপ্তাহে পেমেন্ট বেশি হয়েছে ${insights.peakDay}।` : insights.dynamicTip}
              </p>
            </div>
          </motion.div>
        )}

        {/* Credit Score Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ rotate: 1 }}
          className="card-street bg-slate-900 dark:bg-slate-800 text-white p-6 relative overflow-hidden group border-4 border-brand-primary/20"
        >
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
            <Zap size={140} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] font-display italic">{t.trust_score} (TRUST SCORE)</h3>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                    className="w-1.5 h-1.5 rounded-full bg-brand-primary" 
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-end gap-3">
              <span className="text-7xl font-black font-display italic tracking-tighter drop-shadow-[5px_5px_0px_rgba(16,185,129,1)]">
                {stats?.creditScore || 50}
              </span>
              <div className="flex flex-col mb-2">
                <span className="text-emerald-400 text-xs font-black leading-none uppercase italic">পয়েন্ট</span>
                <span className="text-slate-400 text-[8px] font-bold uppercase tracking-widest mt-1 italic">TOP 5% IN AREA</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2">
              <div className="flex-1 h-4 bg-slate-800 dark:bg-slate-700 rounded-full overflow-hidden border-2 border-slate-700 dark:border-slate-600 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.creditScore || 50}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            label={t.debt} 
            value={formatCurrency(customers.reduce((sum, c) => sum + (c.totalBalance < 0 ? Math.abs(c.totalBalance) : 0), 0))} 
            icon={ArrowUpRight} 
            color="bg-rose-500" 
            sublabel="OUTSTANDING DEBT"
            delay={0.1}
          />
          <StatCard 
            label={t.paid} 
            value={formatCurrency(customers.reduce((sum, c) => sum + (c.totalBalance > 0 ? c.totalBalance : 0), 0))} 
            icon={ArrowDownLeft} 
            color="bg-emerald-500" 
            sublabel="TOTAL COLLECTIONS"
            delay={0.2}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <div>
              <h2 className="text-xl font-black font-display italic tracking-tighter uppercase leading-none">সাম্প্রতিক খাতা</h2>
              <span className="text-[10px] font-bold text-slate-400 italic">RECENT CUSTOMERS</span>
            </div>
            <button onClick={() => navigate('/patterns')} className="text-brand-primary text-xs font-black uppercase italic tracking-tighter">সব দেখুন -{'>'}</button>
          </div>
          
          <div className="space-y-3">
            {customers.slice(0, 3).map(customer => (
              <motion.div 
                key={customer.id} 
                whileTap={{ scale: 0.98 }}
                className="card-street flex justify-between items-center group cursor-pointer" 
                onClick={() => navigate(`/patterns/${customer.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-yellow flex items-center justify-center font-black text-slate-900 text-xl border-2 border-slate-900 transform -rotate-3 group-hover:rotate-0 transition-transform shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                    {customer.name[0]}
                  </div>
                  <div>
                    <div className="font-black font-display text-lg tracking-tight leading-tight">{customer.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold italic">{formatDate(customer.lastTransactionAt)}</div>
                  </div>
                </div>
                <div className={cn("font-black text-xl italic font-display tracking-tighter", customer.totalBalance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                  {customer.totalBalance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(customer.totalBalance))}
                </div>
              </motion.div>
            ))}
            {customers.length === 0 && (
              <div className="text-center py-12 card-street border-dashed bg-slate-50/50 dark:bg-slate-900/50">
                <p className="text-sm font-bold text-slate-400 italic">নতুন কাস্টমার যোগ করেন ক্যান?</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
