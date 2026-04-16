import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  Trophy, 
  ArrowUpRight, 
  ArrowDownLeft,
  Search,
  ChevronRight,
  Phone,
  History,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer, Transaction, UserStats, TransactionType } from './types';
import { getCustomers, getTransactionsByCustomer, getStats, saveCustomer, saveTransaction, saveStats, initDB } from './lib/db';
import { calculateNewStats } from './lib/gamification';
import { cn, formatCurrency, formatDate, validateNID, validatePhone, maskNID } from './lib/utils';

// --- Components ---

const BottomNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-50">
    <button onClick={() => setActiveTab('dashboard')} className={cn("flex flex-col items-center gap-1", activeTab === 'dashboard' ? "text-brand-primary" : "text-slate-400")}>
      <LayoutDashboard size={24} />
      <span className="text-[10px] font-medium uppercase tracking-wider">হোম (Home)</span>
    </button>
    <button onClick={() => setActiveTab('customers')} className={cn("flex flex-col items-center gap-1", activeTab === 'customers' ? "text-brand-primary" : "text-slate-400")}>
      <Users size={24} />
      <span className="text-[10px] font-medium uppercase tracking-wider">হিসাব (Ledger)</span>
    </button>
    <button onClick={() => setActiveTab('add')} className="bg-brand-primary text-white p-4 rounded-full -mt-12 shadow-lg shadow-emerald-200 active:scale-90 transition-transform">
      <PlusCircle size={28} />
    </button>
    <button onClick={() => setActiveTab('rewards')} className={cn("flex flex-col items-center gap-1", activeTab === 'rewards' ? "text-brand-primary" : "text-slate-400")}>
      <Trophy size={24} />
      <span className="text-[10px] font-medium uppercase tracking-wider">পুরস্কার (Rewards)</span>
    </button>
    <button onClick={() => setActiveTab('history')} className={cn("flex flex-col items-center gap-1", activeTab === 'history' ? "text-brand-primary" : "text-slate-400")}>
      <History size={24} />
      <span className="text-[10px] font-medium uppercase tracking-wider">ইতিহাস (History)</span>
    </button>
  </nav>
);

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: string }) => (
  <div className="card flex flex-col gap-2">
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
      <Icon size={20} className="text-white" />
    </div>
    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</span>
    <span className="text-xl font-bold">{value}</span>
  </div>
);

const CreditScoreDial = ({ score }: { score: number }) => {
  const rotation = (score / 100) * 180 - 90;
  return (
    <div className="card flex flex-col items-center justify-center gap-4 py-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Zap size={100} />
      </div>
      <div className="text-center">
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">বিশ্বাস স্কোর (Trust Score)</h3>
        <div className="text-5xl font-black text-brand-primary">{score}</div>
        <div className="text-xs font-medium text-emerald-600 mt-1 flex items-center justify-center gap-1">
          <TrendingUp size={12} />
          <span>আপনার এলাকার সেরা ৫% ব্যবসায়ীর মধ্যে আপনি</span>
        </div>
        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-tighter">
          <Award size={10} />
          সততার সাথে ব্যবসা (Fair Trade)
        </div>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          className="h-full bg-brand-primary"
        />
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerNid, setNewCustomerNid] = useState('');
  const [newCustomerBkash, setNewCustomerBkash] = useState('');
  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState<TransactionType>('CREDIT');
  const [note, setNote] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [c, s] = await Promise.all([getCustomers(), getStats()]);
    setCustomers(c.sort((a, b) => b.lastTransactionAt - a.lastTransactionAt));
    setStats(s);
    setIsLoading(false);
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newCustomerPhone) return;

    // Validation
    if (!validatePhone(newCustomerPhone)) {
      alert('সঠিক মোবাইল নম্বর দিন (উদা: 017XXXXXXXX)');
      return;
    }
    if (newCustomerNid && !validateNID(newCustomerNid)) {
      alert('সঠিক এনআইডি নম্বর দিন (১০, ১৩ অথবা ১৭ ডিজিট)');
      return;
    }
    if (newCustomerBkash && !validatePhone(newCustomerBkash)) {
      alert('সঠিক বিকাশ নম্বর দিন');
      return;
    }

    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name: newCustomerName,
      phone: newCustomerPhone,
      nid: newCustomerNid,
      bkashNumber: newCustomerBkash,
      totalBalance: 0,
      lastTransactionAt: Date.now(),
      createdAt: Date.now(),
      isVerified: !!newCustomerNid,
    };

    await saveCustomer(newCustomer);
    setCustomers([newCustomer, ...customers]);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerNid('');
    setNewCustomerBkash('');
    setActiveTab('customers');
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !amount) return;

    const val = parseFloat(amount);
    const tx: Transaction = {
      id: crypto.randomUUID(),
      customerId: selectedCustomer.id,
      amount: val,
      type: txType,
      timestamp: Date.now(),
      note,
    };

    // Update customer balance
    const updatedCustomer = {
      ...selectedCustomer,
      totalBalance: selectedCustomer.totalBalance + (txType === 'CREDIT' ? val : -val),
      lastTransactionAt: Date.now(),
    };

    // Update stats
    if (stats) {
      const allTx = await getTransactionsByCustomer(selectedCustomer.id);
      const newStats = calculateNewStats(stats, [...allTx, tx], tx);
      await saveStats(newStats);
      setStats(newStats);
    }

    await saveTransaction(tx);
    await saveCustomer(updatedCustomer);
    
    // Refresh local state
    setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    setAmount('');
    setNote('');
    setSelectedCustomer(null);
    setActiveTab('dashboard');
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-brand-primary font-black text-4xl flex flex-col items-center"
      >
        <span>লেনদেন</span>
        <span className="text-sm font-bold tracking-[0.2em] opacity-50">LENDEN</span>
      </motion.div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24 relative bg-slate-50">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 bg-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">লেনদেন (Lenden)</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">ডিজিটাল হিসাব খাতা</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase">বিশ্বস্ত ব্যবসায়ী</span>
              <span className="text-sm font-black text-emerald-600 flex items-center gap-1">
                <Award size={14} fill="currentColor" />
                Verified
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${stats?.lastActiveDate}`} alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <CreditScoreDial score={stats?.creditScore || 50} />
              
              <div className="grid grid-cols-2 gap-4">
                <StatCard 
                  label="দেব (Debo)" 
                  value={formatCurrency(customers.reduce((sum, c) => sum + (c.totalBalance < 0 ? Math.abs(c.totalBalance) : 0), 0))} 
                  icon={ArrowUpRight} 
                  color="bg-red-500" 
                />
                <StatCard 
                  label="পাবো (Pabo)" 
                  value={formatCurrency(customers.reduce((sum, c) => sum + (c.totalBalance > 0 ? c.totalBalance : 0), 0))} 
                  icon={ArrowDownLeft} 
                  color="bg-emerald-500" 
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold">সাম্প্রতিক কাস্টমার</h2>
                  <button onClick={() => setActiveTab('customers')} className="text-brand-primary text-sm font-bold">সব দেখুন</button>
                </div>
                <div className="space-y-3">
                  {customers.slice(0, 3).map(customer => (
                    <div key={customer.id} className="card flex justify-between items-center active:bg-slate-50 transition-colors" onClick={() => { setSelectedCustomer(customer); setActiveTab('ledger'); }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                          {customer.name[0]}
                        </div>
                        <div>
                          <div className="font-bold">{customer.name}</div>
                          <div className="text-xs text-slate-500">{formatDate(customer.lastTransactionAt)}</div>
                        </div>
                      </div>
                      <div className={cn("font-black", customer.totalBalance >= 0 ? "text-emerald-600" : "text-red-600")}>
                        {formatCurrency(Math.abs(customer.totalBalance))}
                      </div>
                    </div>
                  ))}
                  {customers.length === 0 && (
                    <div className="text-center py-8 text-slate-400 italic text-sm">
                      No customers yet. Add your first one!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'customers' && (
            <motion.div 
              key="customers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="কাস্টমার খুঁজুন..." 
                  className="input-field pl-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                {filteredCustomers.map(customer => (
                  <div key={customer.id} className="card flex justify-between items-center" onClick={() => { setSelectedCustomer(customer); setActiveTab('ledger'); }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-600 text-lg">
                        {customer.name[0]}
                      </div>
                      <div>
                        <div className="font-bold">{customer.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone size={10} />
                          {customer.phone}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn("font-black text-lg", customer.totalBalance >= 0 ? "text-emerald-600" : "text-red-600")}>
                        {formatCurrency(Math.abs(customer.totalBalance))}
                      </div>
                      <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        {customer.totalBalance >= 0 ? "পাবো (Pabo)" : "দেব (Debo)"}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => setActiveTab('add_customer')}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 active:bg-slate-50"
                >
                  <PlusCircle size={20} />
                  নতুন কাস্টমার যোগ করুন
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'add_customer' && (
            <motion.div 
              key="add_customer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-2">
                <button onClick={() => setActiveTab('customers')} className="p-2 bg-white rounded-xl shadow-sm"><ChevronRight className="rotate-180" /></button>
                <h2 className="text-xl font-bold">নতুন কাস্টমার</h2>
              </div>
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">কাস্টমারের নাম</label>
                  <input 
                    type="text" 
                    placeholder="উদা: রহিম মিয়া" 
                    className="input-field"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">মোবাইল নম্বর</label>
                  <input 
                    type="tel" 
                    placeholder="উদা: 017XXXXXXXX" 
                    className="input-field"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">এনআইডি (NID)</label>
                    <input 
                      type="number" 
                      placeholder="১০/১৩/১৭ ডিজিট" 
                      className="input-field"
                      value={newCustomerNid}
                      onChange={(e) => setNewCustomerNid(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">বিকাশ নম্বর</label>
                    <input 
                      type="tel" 
                      placeholder="01XXXXXXXXX" 
                      className="input-field"
                      value={newCustomerBkash}
                      onChange={(e) => setNewCustomerBkash(e.target.value)}
                    />
                  </div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <p className="text-[10px] text-emerald-700 leading-relaxed">
                    <span className="font-bold">নিরাপত্তা টিপস:</span> এনআইডি এবং বিকাশ নম্বর শুধুমাত্র আপনার ফোনে সেভ থাকবে। এটি আপনার ব্যবসার নিরাপত্তা এবং পাওনা আদায়ে সাহায্য করবে।
                  </p>
                </div>
                <button type="submit" className="btn-primary w-full mt-4">
                  কাস্টমার সেভ করুন
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'add' && (
            <motion.div 
              key="add_tx"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold">লেনদেন যোগ করুন</h2>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">কাস্টমার নির্বাচন করুন</label>
                  <select 
                    className="input-field appearance-none"
                    onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
                    value={selectedCustomer?.id || ''}
                  >
                    <option value="">কাস্টমার বেছে নিন...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setTxType('CREDIT')}
                    className={cn("flex-1 py-3 rounded-xl font-bold transition-all", txType === 'CREDIT' ? "bg-red-500 text-white shadow-lg shadow-red-100" : "bg-slate-100 text-slate-500")}
                  >
                    বাকি দিয়েছি (Credit)
                  </button>
                  <button 
                    onClick={() => setTxType('PAYMENT')}
                    className={cn("flex-1 py-3 rounded-xl font-bold transition-all", txType === 'PAYMENT' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-slate-100 text-slate-500")}
                  >
                    জমা পেয়েছি (Payment)
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">টাকার পরিমাণ</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      className="input-field pl-8 text-2xl font-black"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">বিবরণ (ঐচ্ছিক)</label>
                  <input 
                    type="text" 
                    placeholder="উদা: চাল ও ডাল" 
                    className="input-field"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleAddTransaction}
                  disabled={!selectedCustomer || !amount}
                  className="btn-primary w-full mt-4 disabled:opacity-50"
                >
                  লেনদেন সেভ করুন
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div 
              key="rewards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="card bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-none p-6 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
                  <Trophy size={120} />
                </div>
                <h2 className="text-xl font-black mb-1">পুরস্কার কেন্দ্র (Rewards)</h2>
                <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">আপনার বিশ্বাস স্কোর দিয়ে সুবিধা আনলক করুন</p>
                
                <div className="mt-8 flex items-end gap-2">
                  <span className="text-4xl font-black">{stats?.creditScore || 0}</span>
                  <span className="text-emerald-200 text-sm font-bold mb-1">পয়েন্ট</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold">আপনার অর্জন (Badges)</h3>
                <div className="grid grid-cols-3 gap-3">
                  {stats?.badges.map(badge => (
                    <div key={badge} className="card flex flex-col items-center gap-2 text-center p-3 bg-white">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <Award size={24} />
                      </div>
                      <span className="text-[10px] font-bold leading-tight">{badge}</span>
                    </div>
                  ))}
                  {stats?.badges.length === 0 && (
                    <div className="col-span-3 py-8 text-center text-slate-400 text-sm italic">
                      এখনো কোনো ব্যাজ পাননি। লেনদেন চালিয়ে যান!
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold">বিশেষ সুবিধা</h3>
                <div className="space-y-3">
                  <div className="card flex items-center gap-4 opacity-60">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <Zap size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">ফ্রি এসএমএস প্যাক</div>
                      <div className="text-[10px] font-bold text-slate-400">৭০ স্কোর হলে আনলক হবে</div>
                    </div>
                    <div className="text-xs font-bold text-slate-400">লকড</div>
                  </div>
                  <div className="card flex items-center gap-4 opacity-60">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <TrendingUp size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">প্রায়োরিটি সাপোর্ট</div>
                      <div className="text-[10px] font-bold text-slate-400">৮৫ স্কোর হলে আনলক হবে</div>
                    </div>
                    <div className="text-xs font-bold text-slate-400">লকড</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ledger' && selectedCustomer && (
            <motion.div 
              key="ledger"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <button onClick={() => { setSelectedCustomer(null); setActiveTab('customers'); }} className="p-2 bg-white rounded-xl shadow-sm"><ChevronRight className="rotate-180" /></button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold leading-tight">{selectedCustomer.name}</h2>
                    {selectedCustomer.isVerified && (
                      <div className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">Verified</div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{selectedCustomer.phone}</p>
                </div>
                {selectedCustomer.bkashNumber && (
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-bold text-pink-500 uppercase">bKash</span>
                    <span className="text-xs font-bold text-slate-700">{selectedCustomer.bkashNumber}</span>
                  </div>
                )}
              </div>

              {selectedCustomer.nid && (
                <div className="card bg-white border-dashed border-slate-200 py-2 px-4 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">NID Number</span>
                  <span className="text-xs font-mono font-bold text-slate-600">{maskNID(selectedCustomer.nid)}</span>
                </div>
              )}

              <div className="card bg-slate-900 text-white border-none p-6 flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">বর্তমান ব্যালেন্স</div>
                  <div className="text-3xl font-black">{formatCurrency(Math.abs(selectedCustomer.totalBalance))}</div>
                </div>
                <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", selectedCustomer.totalBalance >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                  {selectedCustomer.totalBalance >= 0 ? "পাবো (Pabo)" : "দেব (Debo)"}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => { setTxType('CREDIT'); setActiveTab('add'); }}
                  className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex flex-col items-center gap-1 active:scale-95 transition-transform"
                >
                  <ArrowUpRight size={20} />
                  <span>বাকি দিয়েছি</span>
                </button>
                <button 
                  onClick={() => { setTxType('PAYMENT'); setActiveTab('add'); }}
                  className="flex-1 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold flex flex-col items-center gap-1 active:scale-95 transition-transform"
                >
                  <ArrowDownLeft size={20} />
                  <span>জমা পেয়েছি</span>
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <History size={18} />
                  লেনদেনের ইতিহাস
                </h3>
                <div className="space-y-3">
                  {/* In a real app we'd fetch these. For now, let's show a placeholder or fetch them */}
                  <TransactionList customerId={selectedCustomer.id} />
                </div>
              </div>

              <div className="fixed bottom-24 left-6 right-6 space-y-3">
                <button 
                  onClick={() => {
                    const msg = `আসসালামু আলাইকুম ${selectedCustomer.name}, আপনার কাছে আমার পাওনা ${formatCurrency(Math.abs(selectedCustomer.totalBalance))}। সময়মতো পরিশোধ করলে কৃতজ্ঞ থাকব। ধন্যবাদ।`;
                    window.open(`sms:${selectedCustomer.phone}?body=${encodeURIComponent(msg)}`);
                  }}
                  className="w-full btn-secondary bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center gap-2"
                >
                  <Phone size={18} />
                  এসএমএস রিমাইন্ডার পাঠান
                </button>
                <p className="text-[10px] text-center text-slate-400 px-4 italic">
                  "সম্পর্ক বজায় রেখে লেনদেন করুন, ব্যবসায় বরকত আসবে"
                </p>
              </div>
            </motion.div>
          )}
          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold">সব লেনদেন</h2>
              <div className="space-y-3">
                <AllTransactionsList />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

const AllTransactionsList = () => {
  const [txs, setTxs] = useState<(Transaction & { customerName: string })[]>([]);

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
    };
    load();
  }, []);

  return (
    <div className="space-y-3">
      {txs.map(tx => (
        <div key={tx.id} className="card flex justify-between items-center py-3">
          <div className="flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", tx.type === 'CREDIT' ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500")}>
              {tx.type === 'CREDIT' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
            </div>
            <div>
              <div className="text-sm font-bold">{tx.customerName}</div>
              <div className="text-[10px] text-slate-400 font-medium">{formatDate(tx.timestamp)} • {tx.note || (tx.type === 'CREDIT' ? 'Credit' : 'Payment')}</div>
            </div>
          </div>
          <div className={cn("font-black", tx.type === 'CREDIT' ? "text-red-600" : "text-emerald-600")}>
            {tx.type === 'CREDIT' ? '-' : '+'}{formatCurrency(tx.amount)}
          </div>
        </div>
      ))}
      {txs.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm italic">No transactions yet.</div>
      )}
    </div>
  );
}

const TransactionList = ({ customerId }: { customerId: string }) => {
  const [txs, setTxs] = useState<Transaction[]>([]);

  useEffect(() => {
    getTransactionsByCustomer(customerId).then(res => setTxs(res.sort((a, b) => b.timestamp - a.timestamp)));
  }, [customerId]);

  return (
    <div className="space-y-3">
      {txs.map(tx => (
        <div key={tx.id} className="card flex justify-between items-center py-3">
          <div className="flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", tx.type === 'CREDIT' ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500")}>
              {tx.type === 'CREDIT' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
            </div>
            <div>
              <div className="text-sm font-bold">{tx.note || (tx.type === 'CREDIT' ? 'বাকি দিয়েছি' : 'জমা পেয়েছি')}</div>
              <div className="text-[10px] text-slate-400 font-medium">{formatDate(tx.timestamp)}</div>
            </div>
          </div>
          <div className={cn("font-black", tx.type === 'CREDIT' ? "text-red-600" : "text-emerald-600")}>
            {tx.type === 'CREDIT' ? '-' : '+'}{formatCurrency(tx.amount)}
          </div>
        </div>
      ))}
      {txs.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm italic">কোনো লেনদেন নেই।</div>
      )}
    </div>
  );
}
