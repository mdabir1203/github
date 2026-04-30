import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle, Phone, Gift } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { PageWrapper } from '../components/PageWrapper';
import { useLendenData } from '../hooks/useLendenData';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

const Ledger = () => {
  const { customers, isLoading } = useLendenData();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  if (isLoading) return null;

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-1 translate-y-1 z-0 transition-transform group-focus-within:translate-x-0 group-focus-within:translate-y-0" />
          <div className="relative z-10">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary" size={20} />
            <input 
              type="text" 
              placeholder="খুঁজুন (Search)..." 
              className="input-field pl-14 border-2 border-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => navigate('/add-customer')}
            className="w-full btn-street mb-2"
          >
            <PlusCircle size={24} />
            {t.add_customer} (Add Customer)
          </button>

          <div className="space-y-3">
            {filteredCustomers.map(customer => (
              <motion.div 
                key={customer.id} 
                whileTap={{ scale: 0.98 }}
                className="card-street flex justify-between items-center group cursor-pointer" 
                onClick={() => navigate(`/patterns/${customer.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-900 dark:text-white text-2xl border-2 border-slate-900 transform group-hover:rotate-3 transition-transform shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    {customer.name[0]}
                  </div>
                  <div>
                    <div className="font-black font-display text-xl tracking-tight leading-tight">{customer.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-bold italic">
                      <Phone size={10} className="text-brand-primary" />
                      {customer.phone}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn("font-black text-xl italic font-display tracking-tighter leading-none", customer.totalBalance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    {formatCurrency(Math.abs(customer.totalBalance))}
                  </div>
                  <div className="text-[8px] font-black uppercase tracking-tighter text-slate-400 mt-1 italic">
                    {customer.totalBalance >= 0 ? "পাবো" : "দেব"}
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredCustomers.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/invite')}
                className="w-full card-street bg-white dark:bg-slate-900 p-4 border-dashed border-2 border-brand-primary/50 text-brand-primary flex items-center justify-center gap-2 mt-4"
              >
                <Gift size={20} />
                <span className="text-xs font-black uppercase italic tracking-widest">{t.invite_cta}</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Ledger;
