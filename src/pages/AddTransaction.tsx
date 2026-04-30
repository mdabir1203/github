import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/PageWrapper';
import { useLendenData } from '../hooks/useLendenData';
import { useSecurity } from '../contexts/SecurityContext';
import { cn } from '../lib/utils';
import { Transaction, TransactionType } from '../types';
import { addTransaction } from '../lib/db';
import { INITIAL_STATS, calculateNewStats } from '../lib/gamification';

const AddTransaction = () => {
  const { customers, isLoading, refresh, stats } = useLendenData();
  const { pin } = useSecurity();
  const [selectedId, setSelectedId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('CREDIT');
  const [note, setNote] = useState('');
  const navigate = useNavigate();

  const handleAdd = async () => {
    const customer = customers.find(c => c.id === selectedId);
    if (!customer || !amount) return;

    const val = parseFloat(amount);
    const tx: Transaction = {
      id: crypto.randomUUID(),
      customerId: customer.id,
      amount: val,
      type,
      timestamp: Date.now(),
      note
    };

    const updatedCustomer = {
      ...customer,
      totalBalance: customer.totalBalance + (type === 'CREDIT' ? val : -val),
      lastTransactionAt: Date.now()
    };

    const currentStats = stats || INITIAL_STATS;
    const allTx = customers.find(c => c.id === selectedId) ? [] : []; // We use the customer tx list from engine or history if needed, but for score delta tx is enough
    const newStats = calculateNewStats(currentStats, [], tx);

    await addTransaction(tx, updatedCustomer, newStats, pin);
    
    await refresh();
    navigate('/habits');
  };

  if (isLoading) return null;

  return (
    <PageWrapper>
      <div className="space-y-6">
        <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter">লেনদেন যোগ করেন</h2>
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest ml-1">কাস্টমার বেছে নিন</label>
            <select className="input-field border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] appearance-none" onChange={(e) => setSelectedId(e.target.value)} value={selectedId}>
              <option value="">কাস্টমার বাছেন ক্যান? (Select)...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setType('CREDIT')} className={cn("flex-1 py-4 rounded-2xl font-black font-display uppercase italic tracking-tight border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all", type === 'CREDIT' ? "bg-rose-500 text-white translate-x-0.5 translate-y-0.5 shadow-none" : "bg-white text-rose-500")}>বাকি (CREDIT)</button>
            <button onClick={() => setType('PAYMENT')} className={cn("flex-1 py-4 rounded-2xl font-black font-display uppercase italic tracking-tight border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all", type === 'PAYMENT' ? "bg-emerald-500 text-white translate-x-0.5 translate-y-0.5 shadow-none" : "bg-white text-emerald-500")}>জমা (PAYMENT)</button>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest ml-1">টাকার পরিমাণ</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-2xl font-display">৳</span>
              <input 
                type="number" 
                inputMode="decimal"
                placeholder="0.00" 
                className="input-field pl-12 text-3xl font-black font-display italic border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest ml-1">বিবরণ (ঐচ্ছিক)</label>
            <input type="text" placeholder="কিতা কিনলেন ক্যান? (Describe)" className="input-field border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <button onClick={handleAdd} disabled={!selectedId || !amount} className="btn-street w-full mt-4 text-lg disabled:opacity-50">লেনদেন সেভ (SAVE!)</button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AddTransaction;
