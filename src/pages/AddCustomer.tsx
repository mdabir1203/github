import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { useLendenData } from '../hooks/useLendenData';
import { useSecurity } from '../contexts/SecurityContext';
import { validatePhone, validateNID } from '../lib/utils';
import { Customer } from '../types';
import { saveCustomer } from '../lib/db';

const AddCustomer = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nid, setNid] = useState('');
  const [bkash, setBkash] = useState('');
  const navigate = useNavigate();
  const { refresh } = useLendenData();
  const { pin } = useSecurity();

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

    await saveCustomer(newCustomer, pin);
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
            <input type="tel" inputMode="tel" placeholder="উদা: 017XXXXXXXX" className="input-field border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest ml-1">এনআইডি (NID)</label>
              <input type="number" inputMode="numeric" className="input-field border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]" value={nid} onChange={(e) => setNid(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest ml-1">বিকাশ নম্বর</label>
              <input type="tel" inputMode="tel" className="input-field border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]" value={bkash} onChange={(e) => setBkash(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-street w-full mt-4 text-lg">কাস্টমার সেভ করুন ক্যান!</button>
        </form>
      </div>
    </PageWrapper>
  );
};

export default AddCustomer;
