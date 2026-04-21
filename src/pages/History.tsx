import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, History as HistoryIcon, Search } from 'lucide-react';
import { initDB } from '../lib/db';
import { Transaction, Customer } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { PageWrapper } from '../components/PageWrapper';
import { motion } from 'framer-motion';

const History = () => {
  const [txs, setTxs] = useState<(Transaction & { customerName: string })[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const db = await initDB();
      const allTxs = await db.getAll('transactions') as Transaction[];
      const customers = await db.getAll('customers') as Customer[];
      const customerMap = new Map(customers.map(c => [c.id, c.name]));
      
      setTxs(allTxs.map(tx => ({
        ...tx,
        customerName: customerMap.get(tx.customerId) || 'Unknown'
      })).sort((a, b) => b.timestamp - a.timestamp));
      setIsLoading(false);
    };
    load();
  }, []);

  const filteredTxs = txs.filter(tx => 
    tx.customerName.toLowerCase().includes(search.toLowerCase()) ||
    (tx.note && tx.note.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) return null;

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <div>
            <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter leading-none">পুরান কিচ্ছা</h2>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">TRANSACTION LOGS</span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-900 flex items-center justify-center bg-brand-accent text-white shadow-[3px_3px_0px_rgba(0,0,0,1)] rotate-12">
            <HistoryIcon size={24} />
          </div>
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="লেনদেন খুঁজুন (Search history)..." 
            className="input-field border-2 border-slate-900 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {filteredTxs.map((tx, idx) => (
            <motion.div 
              key={tx.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card-street flex justify-between items-center py-4 bg-white dark:bg-slate-900 border-2 border-slate-900"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]", 
                  tx.type === 'CREDIT' ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                )}>
                  {tx.type === 'CREDIT' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                  <div className="font-black font-display text-lg tracking-tight leading-none uppercase italic">{tx.customerName}</div>
                  <div className="text-[10px] text-slate-400 font-bold italic mt-1 uppercase">
                    {formatDate(tx.timestamp)} <span className="mx-1">•</span> {tx.note || (tx.type === 'CREDIT' ? 'বাকি' : 'জমা')}
                  </div>
                </div>
              </div>
              <div className={cn("font-black text-xl italic font-display tracking-tighter", tx.type === 'CREDIT' ? "text-rose-600" : "text-emerald-600")}>
                {tx.type === 'CREDIT' ? '-' : '+'}{formatCurrency(tx.amount)}
              </div>
            </motion.div>
          ))}
          
          {filteredTxs.length === 0 && (
            <div className="text-center py-16 card-street border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/50">
              <p className="text-sm font-black text-slate-400 italic uppercase">এহনও কুন্নু কিচ্ছা নেই ক্যান!</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default History;
