import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/PageWrapper';
import { useLendenData } from '../hooks/useLendenData';
import { useSecurity } from '../contexts/SecurityContext';
import { cn } from '../lib/utils';
import { Transaction, TransactionType } from '../types';
import { addTransaction } from '../lib/db';
import { INITIAL_STATS, calculateNewStats } from '../lib/gamification';
import QRCode from 'react-qr-code';

const AddTransaction = () => {
  const { customers, isLoading, refresh, stats } = useLendenData();
  const { pin } = useSecurity();
  const [selectedId, setSelectedId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('CREDIT');
  const [note, setNote] = useState('');
  const navigate = useNavigate();

  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [otp, setOtp] = useState('');
  const [expectedOtp, setExpectedOtp] = useState('1234');

  const initiateAdd = () => {
    if (!selectedId || !amount) return;
    if (type === 'PAYMENT') {
      // Generate a dynamic OTP for demonstration
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setExpectedOtp(newOtp);
      console.log(`[SMS MOCK] Payment OTP: ${newOtp}`);
      setIsVerifyingPayment(true);
    } else {
      handleAdd();
    }
  };

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
    const newStats = calculateNewStats(currentStats, [], tx);

    await addTransaction(tx, updatedCustomer, newStats, pin);
    
    await refresh();
    navigate('/history');
  };

  if (isLoading) return null;

  const paymentUrl = `${window.location.origin}/pay?amount=${amount}&to=${selectedId}`;

  return (
    <PageWrapper>
      <div className="space-y-6">
        <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter">লেনদেন যোগ করেন</h2>
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest ml-1">কাস্টমার বেছে নিন</label>
            <select className="input-field border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] appearance-none bg-white" onChange={(e) => setSelectedId(e.target.value)} value={selectedId}>
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
          <button onClick={initiateAdd} disabled={!selectedId || !amount} className="btn-street w-full mt-4 text-lg disabled:opacity-50">লেনদেন সেভ (SAVE!)</button>
        </div>

        {isVerifyingPayment && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border-4 border-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-[8px_8px_0px_rgba(0,0,0,1)] relative">
              <button onClick={() => setIsVerifyingPayment(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center font-black active:translate-y-px">X</button>
              <h3 className="font-black font-display text-2xl uppercase italic tracking-tight mb-2">Two-Step Verification</h3>
              <p className="text-xs font-bold text-slate-500 uppercase italic leading-tight mb-6">Cash or bKash? Verify via OTP or QR to safely prevent chargeback disputes.</p>
              
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex flex-col items-center justify-center">
                  <div className="bg-white p-2 border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-xl">
                     <QRCode value={paymentUrl} size={100} level="M" />
                  </div>
                  <p className="mt-2 text-[10px] font-bold text-emerald-700 uppercase tracking-widest">অথবা কিউআর (QR) স্ক্যান করেন</p>
                </div>
                
                <div className="text-center font-black text-slate-400 uppercase italic text-xs">OR ENTER OTP SMS</div>
                
                <input 
                  type="text" 
                  placeholder={`OTP e.g. ${expectedOtp}`} 
                  className="input-field border-2 border-slate-900 text-center font-mono font-black text-xl tracking-widest bg-white"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                />
                
                <button 
                  onClick={() => {
                    setIsVerifyingPayment(false);
                    handleAdd();
                  }}
                  disabled={otp !== expectedOtp}
                  className="btn-street w-full bg-emerald-500 text-white disabled:opacity-50 disabled:grayscale transition-all"
                >
                  Confirm & Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AddTransaction;
