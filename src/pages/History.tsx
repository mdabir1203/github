import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, ArrowDownLeft, History as HistoryIcon, Search, Filter, Trash2, Download, CheckCircle2, Calendar, X } from 'lucide-react';
import { initDB, deleteTransactions } from '../lib/db';
import { Transaction, Customer, TransactionType } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { PageWrapper } from '../components/PageWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import { useLendenData } from '../hooks/useLendenData';
import { motion, AnimatePresence } from 'framer-motion';

const History = () => {
  const { t } = useLanguage();
  const { refresh } = useLendenData();
  const [txs, setTxs] = useState<(Transaction & { customerName: string })[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadData = async () => {
    setIsLoading(true);
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

  useEffect(() => {
    loadData();
  }, []);

  const filteredTxs = useMemo(() => {
    return txs.filter(tx => {
      // Search
      const matchesSearch = tx.customerName.toLowerCase().includes(search.toLowerCase()) ||
                           (tx.note && tx.note.toLowerCase().includes(search.toLowerCase()));
      
      // Type
      const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;

      // Date Range
      let matchesRange = true;
      if (startDate) {
        const start = new Date(startDate).getTime();
        matchesRange = matchesRange && tx.timestamp >= start;
      }
      if (endDate) {
        const end = new Date(endDate).getTime() + 86399999; // End of day
        matchesRange = matchesRange && tx.timestamp <= end;
      }

      return matchesSearch && matchesType && matchesRange;
    });
  }, [txs, search, typeFilter, startDate, endDate]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`${selectedIds.size}টি লেনদেন ডিলিট করতে চান?`)) return;
    await deleteTransactions(Array.from(selectedIds));
    setSelectedIds(new Set());
    await loadData();
    await refresh();
  };

  const handleBulkExport = () => {
    const selectedTxs = txs.filter(t => selectedIds.has(t.id));
    const headers = ['Date', 'Customer', 'Type', 'Amount', 'Note'];
    const csvContent = [
      headers.join(','),
      ...selectedTxs.map(t => [
        new Date(t.timestamp).toLocaleDateString(),
        t.customerName,
        t.type,
        t.amount,
        `"${t.note || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lenden_export_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return null;

  return (
    <PageWrapper>
      <div className="space-y-6 pb-24">
        <div className="flex justify-between items-end px-2">
          <div>
            <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter leading-none">{t.history}</h2>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest italic leading-none">TRANSACTION LOGS</span>
          </div>
          <motion.div 
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "w-12 h-12 rounded-2xl border-2 border-slate-900 flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer",
              showFilters ? "bg-slate-900 text-white" : "bg-white text-slate-900"
            )}
          >
            <Filter size={20} />
          </motion.div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="card-street bg-white dark:bg-slate-900 border-2 border-slate-900 p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase italic text-slate-400 tracking-widest">ধরণ (TYPE)</label>
                  <div className="flex gap-2">
                    {['ALL', 'CREDIT', 'PAYMENT'].map(typ => (
                      <button 
                        key={typ}
                        onClick={() => setTypeFilter(typ as any)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border-2 text-[10px] font-black uppercase italic transition-all",
                          typeFilter === typ ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100"
                        )}
                      >
                        {typ === 'ALL' ? 'সব' : (typ === 'CREDIT' ? 'বাকি' : 'জমা')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase italic text-slate-400 tracking-widest">শুরু (START)</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-lg p-2 text-xs font-bold"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase italic text-slate-400 tracking-widest">শেষ (END)</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-lg p-2 text-xs font-bold"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSearch('');
                    setTypeFilter('ALL');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="w-full py-2 text-[10px] font-black uppercase italic text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  সব মুছুন (CLEAR ALL)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group">
          <input 
            type="text" 
            placeholder="খুঁজুন (Search)..." 
            className="input-field border-2 border-slate-900 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        </div>

        <div className="space-y-4">
          {filteredTxs.map((tx, idx) => (
            <motion.div 
              key={tx.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => toggleSelect(tx.id)}
              className={cn(
                "card-street flex justify-between items-center py-4 bg-white dark:bg-slate-900 border-2 transition-all cursor-pointer relative overflow-hidden",
                selectedIds.has(tx.id) ? "border-brand-primary bg-brand-primary/5 ring-4 ring-brand-primary/10" : "border-slate-900"
              )}
            >
              {selectedIds.has(tx.id) && (
                <div className="absolute top-0 right-0 p-1 bg-brand-primary text-slate-950 rounded-bl-xl border-l-2 border-b-2 border-slate-900">
                  <CheckCircle2 size={12} strokeWidth={3} />
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]", 
                  tx.type === 'CREDIT' ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                )}>
                  {tx.type === 'CREDIT' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                  <div className="font-black font-display text-lg tracking-tight leading-none uppercase italic">{tx.customerName}</div>
                  <div className="text-[10px] text-slate-400 font-bold italic mt-1 uppercase">
                    {formatDate(tx.timestamp)} <span className="mx-1 text-slate-200">•</span> {tx.note || (tx.type === 'CREDIT' ? 'বাকি' : 'জমা')}
                  </div>
                </div>
              </div>
              <div className={cn("font-black text-xl italic font-display tracking-tighter", tx.type === 'CREDIT' ? "text-rose-600" : "text-emerald-600")}>
                {tx.type === 'CREDIT' ? '-' : '+'}{formatCurrency(tx.amount)}
              </div>
            </motion.div>
          ))}
          
          {filteredTxs.length === 0 && (
            <div className="text-center py-20 card-street border-dashed border-2 border-slate-200 bg-slate-50/50 dark:bg-slate-900/50">
              <p className="text-sm font-black text-slate-400 italic uppercase">লেনদেন পাওয়া যায়নি ক্যান!</p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-24 left-6 right-6 z-50"
          >
            <div className="bg-slate-900 text-white p-4 rounded-3xl border-4 border-slate-800 shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3 ml-2">
                <div className="w-8 h-8 rounded-full bg-brand-primary text-slate-950 flex items-center justify-center font-black text-xs">
                  {selectedIds.size}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-400 leading-none">নির্বাচিত</span>
                  <span className="text-xs font-bold font-display uppercase italic text-white">SELECTED TXS</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleBulkExport}
                  className="p-3 rounded-2xl bg-slate-800 text-brand-primary hover:bg-slate-700 transition-colors"
                >
                  <Download size={20} />
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="p-3 rounded-2xl bg-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={() => setSelectedIds(new Set())}
                  className="p-3 rounded-2xl bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default History;
