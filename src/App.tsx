import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChevronRight, 
  Phone, 
  ArrowUpRight, 
  ArrowDownLeft,
  History as HistoryIcon,
  PlusCircle
} from 'lucide-react';

import { Customer, Transaction, TransactionType } from './types';
import { 
  getCustomers, 
  getTransactionsByCustomer, 
  saveCustomer, 
  saveTransaction, 
  initDB 
} from './lib/db';
import { calculateNewStats, INITIAL_STATS } from './lib/gamification';
import { cn, formatCurrency, formatDate, validateNID, validatePhone, maskNID } from './lib/utils';

// Pages
import Dashboard from './pages/Dashboard';
import Ledger from './pages/Ledger';
import Rewards from './pages/Rewards';
import History from './pages/History';
import Layout from './components/Layout';
import { PageWrapper } from './components/PageWrapper';
import { useLendenData } from './hooks/useLendenData';

// Sub-pages/Forms
const AddCustomer = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nid, setNid] = useState('');
  const [bkash, setBkash] = useState('');
  const navigate = useNavigate();
  const { refresh } = useLendenData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    if (!validatePhone(phone)) { alert('সঠিক মোবাইল নম্বর দিন ক্যান? (017...)'); return; }
    if (nid && !validateNID(nid)) { alert('সঠিক এনআইডি নম্বর দিন ক্যান? (১০/১৩/১৭ ডিজিট)'); return; }

    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name,
      phone,
      nid,
      bkashNumber: bkash,
      totalBalance: 0,
      lastTransactionAt: Date.now(),
      createdAt: Date.now(),
      isVerified: !!nid
    };

    await saveCustomer(newCustomer);
    await refresh();
    navigate('/patterns');
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform"><ChevronRight className="rotate-180" /></button>
          <h2 className="text-2xl font-black font-display italic uppercase tracking-tighter">নতুন কাস্টমার (Add)</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest ml-1">কাস্টমারের নাম</label>
            <input type="text" placeholder="উদা: রহিম মিয়া" className="input-field border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest ml-1">মোবাইল নম্বর</label>
            <input type="tel" placeholder="উদা: 017XXXXXXXX" className="input-field border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest ml-1">এনআইডি (NID)</label>
              <input type="number" className="input-field border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]" value={nid} onChange={(e) => setNid(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest ml-1">বিকাশ নম্বর</label>
              <input type="tel" className="input-field border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]" value={bkash} onChange={(e) => setBkash(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-street w-full mt-4 text-lg">কাস্টমার সেভ করুন ক্যান!</button>
        </form>
      </div>
    </PageWrapper>
  );
};

const AddTransaction = () => {
  const { customers, isLoading, refresh, stats } = useLendenData();
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

    const db = await initDB();
    const currentStats = stats || INITIAL_STATS;
    const allTx = await db.getAllFromIndex('transactions', 'customerId', customer.id);
    const newStats = calculateNewStats(currentStats, [...allTx, tx], tx);

    await saveTransaction(tx);
    await saveCustomer(updatedCustomer);
    await db.put('stats', newStats, 'current');
    
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
              <input type="number" placeholder="0.00" className="input-field pl-12 text-3xl font-black font-display italic border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]" value={amount} onChange={(e) => setAmount(e.target.value)} />
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

export default function App() {
  const { isLoading } = useLendenData();
  const location = useLocation();

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-slate-950">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }} className="flex flex-col items-center">
        <div className="text-6xl font-black text-brand-primary font-display italic uppercase tracking-tighter drop-shadow-[8px_8px_0px_rgba(244,63,94,1)]">লেনদেন</div>
        <div className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">LOADIN KORER KAN?...</div>
      </motion.div>
    </div>
  );

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/habits" replace />} />
          <Route path="/habits" element={<Dashboard />} />
          <Route path="/patterns" element={<Ledger />} />
          <Route path="/beliefs" element={<Rewards />} />
          <Route path="/receipts" element={<History />} />
          <Route path="/add" element={<AddTransaction />} />
          <Route path="/add-customer" element={<AddCustomer />} />
          <Route path="/patterns/:id" element={<CustomerDetail />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
