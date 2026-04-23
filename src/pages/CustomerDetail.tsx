import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Phone, ArrowUpRight, ArrowDownLeft, History as HistoryIcon } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { useLendenData } from '../hooks/useLendenData';
import { Transaction } from '../types';
import { getTransactionsByCustomer } from '../lib/db';
import { cn, formatCurrency, formatDate, maskNID } from '../lib/utils';

const CustomerDetail = () => {
  const { id } = useParams();
  const { customers, isLoading } = useLendenData();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const navigate = useNavigate();
  const customer = customers.find(c => c.id === id);

  useEffect(() => {
    if (id) getTransactionsByCustomer(id).then(res => setTxs(res.sort((a, b) => b.timestamp - a.timestamp)));
  }, [id]);

  if (isLoading || !customer) return null;

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform"><ChevronRight className="rotate-180" /></button>
          <div className="flex-1">
            <h2 className="text-2xl font-black font-display italic uppercase tracking-tighter leading-none">{customer.name}</h2>
            <p className="text-xs text-slate-500 font-bold italic uppercase">{customer.phone}</p>
          </div>
        </div>

        <div className="card-street bg-slate-900 text-white p-6 flex justify-between items-center border-2 border-slate-700">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 italic">বাকি ব্যালেন্স</div>
            <div className="text-4xl font-black font-display italic tracking-tighter">{formatCurrency(Math.abs(customer.totalBalance))}</div>
          </div>
          <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic tracking-widest border-2", customer.totalBalance >= 0 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" : "bg-rose-500/20 text-rose-400 border-rose-500/50")}>
            {customer.totalBalance >= 0 ? "পাবো" : "দেব"}
          </div>
        </div>

        {/* Sensitive Info Cards */}
        {(customer.nid || customer.bkashNumber) && (
          <div className="grid grid-cols-2 gap-3">
            {customer.nid && (
              <div className="card-street py-3 px-4 border-dashed border-2 flex flex-col gap-0.5">
                <span className="text-[8px] font-black uppercase text-slate-400 italic">এনআইডি (NID)</span>
                <span className="text-xs font-black font-mono tracking-tight text-slate-700 dark:text-slate-300">
                  {maskNID(customer.nid)}
                </span>
              </div>
            )}
            {customer.bkashNumber && (
              <div className="card-street py-3 px-4 border-dashed border-2 flex flex-col gap-0.5">
                <span className="text-[8px] font-black uppercase text-slate-400 italic">বিকাশ (bKash)</span>
                <span className="text-xs font-black font-mono tracking-tight text-slate-700 dark:text-slate-300">
                  {customer.bkashNumber}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <button onClick={() => navigate('/add')} className="flex-1 py-5 bg-rose-500 text-white border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] font-black uppercase italic font-display rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-transform"><ArrowUpRight size={22} /><span>বাকি (DEBT)</span></button>
          <button onClick={() => navigate('/add')} className="flex-1 py-5 bg-emerald-500 text-white border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] font-black uppercase italic font-display rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-transform"><ArrowDownLeft size={22} /><span>জমা (PAID)</span></button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-black font-display italic uppercase tracking-tighter leading-none flex items-center gap-2 px-1">
            <HistoryIcon size={20} className="text-brand-accent" />
            ইতিহাস (HISTORY)
          </h3>
          <div className="space-y-3">
            {txs.map(tx => (
              <div key={tx.id} className="card-street flex justify-between items-center py-4 bg-white dark:bg-slate-900 border-2 border-slate-900">
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]", tx.type === 'CREDIT' ? "bg-rose-100 text-rose-500" : "bg-emerald-100 text-emerald-500")}>
                    {tx.type === 'CREDIT' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                  </div>
                  <div>
                    <div className="text-sm font-black uppercase italic font-display">{tx.note || (tx.type === 'CREDIT' ? 'বাকি' : 'জমা')}</div>
                    <div className="text-[9px] text-slate-400 font-bold italic font-mono">{formatDate(tx.timestamp)}</div>
                  </div>
                </div>
                <div className={cn("font-black text-lg italic font-display", tx.type === 'CREDIT' ? "text-rose-600" : "text-emerald-600")}>
                  {tx.type === 'CREDIT' ? '-' : '+'}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-28 left-6 right-6 space-y-4">
          <button onClick={() => {
            const msg = `আসসালামু আলাইকুম ${customer.name}, আপনার কাছে আমার পাওনা ${formatCurrency(Math.abs(customer.totalBalance))}। মেহেরবানী করি পরিশোধ করি দিন ক্যান? ধইন্যবাদ।`;
            window.open(`sms:${customer.phone}?body=${encodeURIComponent(msg)}`);
          }} className="w-full btn-street bg-blue-500 text-white border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3">
            <Phone size={22} fill="currentColor" />
            <span className="text-lg">এসএমএস হত্তন (SEND SMS)</span>
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CustomerDetail;
