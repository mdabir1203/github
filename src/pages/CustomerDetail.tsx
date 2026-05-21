import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Phone, ArrowUpRight, ArrowDownLeft, History as HistoryIcon, 
  Zap, MessageSquare, PhoneCall, CheckCircle2, ShieldAlert, Share2, Award, 
  RefreshCcw, Volume2
} from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { useLendenData } from '../hooks/useLendenData';
import { Transaction } from '../types';
import { getTransactionsByCustomer, saveStats } from '../lib/db';
import { cn, formatCurrency, formatDate, maskNID } from '../lib/utils';
import { pixel } from '../lib/pixel';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

const CustomerDetail = () => {
  const { id } = useParams();
  const { customers, stats, refresh, isLoading } = useLendenData();
  const { dialect } = useLanguage();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const navigate = useNavigate();
  const customer = customers.find(c => c.id === id);

  // Reminders simulation state
  const [activeSimulation, setActiveSimulation] = useState<'sms' | 'robo' | 'statement' | 'insufficient' | null>(null);
  const [simStep, setSimStep] = useState<string>('');
  const [simProgress, setSimProgress] = useState<number>(0);

  useEffect(() => {
    if (id) getTransactionsByCustomer(id).then(res => setTxs(res.sort((a, b) => b.timestamp - a.timestamp)));
  }, [id]);

  if (isLoading || !customer) return null;

  const currentCoins = stats?.coins ?? 120;
  const isElite = stats?.isEliteMahajon ?? false;

  const spendCoins = async (amount: number): Promise<boolean> => {
    if (isElite) return true; // Elite users execute everything for free
    if (currentCoins < amount) {
      setActiveSimulation('insufficient');
      pixel.track('insufficient_coins_trigger', { required: amount, available: currentCoins });
      return false;
    }

    try {
      const updatedCoins = currentCoins - amount;
      await saveStats({
        ...stats!,
        coins: updatedCoins
      });
      await refresh();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Trigger SMS Alert
  const triggerSmsAlert = async () => {
    const success = await spendCoins(10);
    if (!success) return;

    setActiveSimulation('sms');
    setSimStep('sending');
    setSimProgress(10);
    pixel.track('sms_alert_initiated', { customer_id: customer.id, balance: customer.totalBalance });

    const interval = setInterval(() => {
      setSimProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSimStep('done');
          pixel.track('sms_alert_dispatched_via_play_sdk');
          return 100;
        }
        return prev + 30;
      });
    }, 400);
  };

  // Trigger Robo call taagada simulation with local dialect script playback
  const triggerRoboCall = async () => {
    const success = await spendCoins(25);
    if (!success) return;

    setActiveSimulation('robo');
    setSimStep('dialing');
    setSimProgress(0);
    pixel.track('robo_call_initiated', { phone: customer.phone, dialect });

    // Dialing loop
    setTimeout(() => {
      setSimStep('connected');
      
      // Dialect simulated voice transcript countdown
      setTimeout(() => {
        setSimStep('speaking');
        
        // Simulating text-to-speech audio loop
        try {
          if ('speechSynthesis' in window) {
            const utterStr = dialect === 'CHITTAGONIAN' 
              ? `অই ভাই, এইখাতাত টেয়া বাকি অইয়ে, টেয়া দিয়া যান ক্যান!` 
              : `কাস্টমার সাব, আপনার কাছে বাকি পাওয়া যাইব, টাকা পরিশোধ করেন ক্যান!`;
            const utterance = new SpeechSynthesisUtterance(utterStr);
            utterance.lang = 'bn-BD';
            utterance.rate = 0.85;
            window.speechSynthesis.speak(utterance);
          }
        } catch (err) {
          // Speak fallback
        }

        setTimeout(() => {
          setSimStep('complete');
          pixel.track('robo_call_finished_successfully');
        }, 3500);
      }, 1500);
    }, 1500);
  };

  // Generate Trust Certificate Sharing statement
  const triggerStatementShare = async () => {
    const success = await spendCoins(15);
    if (!success) return;

    setActiveSimulation('statement');
    setSimStep('generating');
    setSimProgress(0);
    pixel.track('pdf_statement_generation_initiated');

    const interval = setInterval(() => {
      setSimProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSimStep('ready');
          pixel.track('pdf_statement_rendered_and_shared');
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  const getDialectTagline = () => {
    switch (dialect) {
      case 'CHITTAGONIAN': return "‘ভাইয়া, টেঁয়া বাকি আঁছে ইয়াগান দিয়ে যান কইলাম!’";
      case 'SYLHETI': return "‘আফনে টেকা নিছইন, অখন উসুল করি দেইন জানু!’";
      case 'BARISHAILLA': return "‘মামা, টাহা দিয়া প্যাচাল চুকাইয়া দ্যান এহনি!’";
      case 'DHAKAIYYA': return "‘মৌজা মারসন বাকি নিয়া, টাকা পরিশোধ দে আগে মামা!’";
      default: return "‘আপনার বকেয়া টাকা বুঝিয়ে দেয়ার অনুরোধ রইলো।’";
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-6 pb-24">
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

        {/* Traditional Debts modifiers */}
        <div className="flex gap-4">
          <button onClick={() => navigate('/add')} className="flex-1 py-5 bg-rose-500 text-white border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] font-black uppercase italic font-display rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-transform"><ArrowUpRight size={22} /><span>বাকি (DEBT)</span></button>
          <button onClick={() => navigate('/add')} className="flex-1 py-5 bg-emerald-500 text-white border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] font-black uppercase italic font-display rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-transform"><ArrowDownLeft size={22} /><span>জমা (PAID)</span></button>
        </div>

        {/* SMART REMINDER TAAGADA COIN HARNESS */}
        <div className="space-y-4 pt-2">
          <div className="px-1">
            <h3 className="text-lg font-black font-display italic uppercase tracking-tighter leading-none">রিমাইন্ডার ও তাগাদা হাব</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase italic mt-1 leading-none">Google Play monetization offering modules</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Action 1: SMS Taagada */}
            <div className="card-street bg-white dark:bg-slate-900 border-2 border-slate-900 p-4 flex justify-between items-center group animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-500 border border-sky-200">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase italic leading-tight">এসএমএস তাগাদা (SMS Alert)</h4>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5">কাস্টমারের মোবাইলে ডিরেক্ট এসএমএস গেটওয়ে তাগাদা</p>
                </div>
              </div>

              <button 
                onClick={triggerSmsAlert}
                className="btn-street bg-sky-500 text-white text-[11px] font-black italic uppercase px-3.5 py-2.5 border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center gap-1 cursor-pointer"
              >
                <Zap size={10} className="fill-white animate-pulse" />
                ১০ কয়েন
              </button>
            </div>

            {/* Action 2: Robo Dial Call */}
            <div className="card-street bg-white dark:bg-slate-900 border-2 border-slate-900 p-4 flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 border border-amber-200">
                  <PhoneCall size={18} />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase italic leading-tight">রোবো-কল তাগাদা (IVR Auto Tagada)</h4>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5">আঞ্চলিক ভাষায় কাস্টমারকে রিল্যাক্স মটোর রোবো-কল তাগাদা</p>
                </div>
              </div>

              <button 
                onClick={triggerRoboCall}
                className="btn-street bg-amber-500 text-white text-[11px] font-black italic uppercase px-3.5 py-2.5 border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center gap-1 cursor-pointer"
              >
                <Zap size={10} className="fill-white animate-pulse" />
                ২৫ কয়েন
              </button>
            </div>

            {/* Action 3: Statement Sharing */}
            <div className="card-street bg-white dark:bg-slate-900 border-2 border-slate-900 p-4 flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-500 border border-rose-200">
                  <Award size={18} />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase italic leading-tight">ডিজিটাল প্রমানপত্র (Verification Certificate)</h4>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5">গ্যারান্টি সার্টিফিকেট ও বিশ্বাস কিউআর কোড ডাউনলোড</p>
                </div>
              </div>

              <button 
                onClick={triggerStatementShare}
                className="btn-street bg-rose-500 text-white text-[11px] font-black italic uppercase px-3.5 py-2.5 border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center gap-1 cursor-pointer"
              >
                <Zap size={10} className="fill-white animate-pulse" />
                ১৫ কয়েন
              </button>
            </div>
          </div>
        </div>

        {/* History of customer movements */}
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
            {txs.length === 0 && (
              <div className="text-center py-10 card-street">
                <span className="text-slate-400 font-bold italic text-xs">কোন ট্রানজেকশন করা হয়নি!</span>
              </div>
            )}
          </div>
        </div>

        {/* SIMULATION MODALS */}

        {/* 1. SMS SEND SIMULATION */}
        {activeSimulation === 'sms' && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center space-y-4">
              {simStep === 'sending' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-sky-100 border-4 border-slate-900 flex items-center justify-center text-sky-500 mx-auto animate-bounce">
                    <MessageSquare size={32} />
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-900">এসএমএস তাগাদা পাঠানো হচ্ছে...</h4>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-900">
                    <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${simProgress}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase italic">SIMULATING STANDALONE GOOGLE PLAY CARRIER SDK</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500 border-4 border-slate-900 flex items-center justify-center text-white mx-auto shadow-md">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-xl font-black font-display text-slate-900">সাফল্যের সাথে প্রেরণ করা হয়েছে!</h4>
                  <p className="text-xs text-slate-600 font-medium">কাস্টমারকে সফলভাবে ১০ কয়েন রিচার্জের বিনিময়ে ডিরেক্ট রিমাইন্ডার এসএমএস এবং হিসাব নোটিফিকেশন পাঠানো হয়েছে মামা!</p>
                  
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left text-[11px] text-slate-500 leading-snug italic font-medium">
                    &ldquo;আসসালামু আলাইকুম {customer.name}, আপনার কাছে লেন্দেন হিসাব খাতার পাওনা বাকি {formatCurrency(Math.abs(customer.totalBalance))} পরিশোধের অনুরোধ রইল।&rdquo;
                  </div>
                  
                  <button onClick={() => setActiveSimulation(null)} className="btn-street w-full py-2.5 bg-slate-900 text-white border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)]">ঠিক আছে</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 2. ROBO-CALL CONVERSATION DIAL SIMULATION */}
        {activeSimulation === 'robo' && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center space-y-4">
              
              {simStep === 'dialing' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-amber-100 border-4 border-slate-900 flex items-center justify-center text-amber-500 mx-auto animate-pulse">
                    <PhoneCall size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-extrabold text-slate-900">তাগাদা কল ডায়াল হচ্ছে...</h4>
                    <p className="text-slate-500 text-xs font-bold font-mono text-center tracking-wider">{customer.phone}</p>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase italic">রোবো-রিমাইন্ডার আইভিআর গেটওয়ে কানেক্টিং...</p>
                </>
              )}

              {simStep === 'connected' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-slate-900 flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
                    <Phone size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-extrabold text-[#10b981]">কানেক্টেড হয়েছে!</h4>
                    <p className="text-slate-500 text-xs font-bold">কাস্টমার তাগাদা রিসিভ করেছে। আঞ্চলিক অডিও শোনানো হচ্ছে ক্যান...</p>
                  </div>
                </>
              )}

              {simStep === 'speaking' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-amber-500 border-4 border-slate-900 flex items-center justify-center text-white mx-auto animate-ping">
                    <Volume2 size={32} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black font-display text-slate-900">রোবো-কল স্পিকিং...</h4>
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-extrabold italic leading-snug">
                      {getDialectTagline()}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">ভয়েস সহকারী বাংলায় তাগাদা বিবরণ শোনাচ্ছে</p>
                </>
              )}

              {simStep === 'complete' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500 border-4 border-slate-900 flex items-center justify-center text-white mx-auto shadow-md">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-xl font-black font-display text-slate-900">কল সফলভাবে সম্পন্ন!</h4>
                  <p className="text-xs text-slate-600 font-medium">কাস্টমারকে ২৫ টি রিচার্জ কয়েনের বিনিময়ে বাংলায় রিমাইন্ডার কল সফলভাবে শোনানো হয়েছে ক্যান!</p>
                  
                  <button onClick={() => setActiveSimulation(null)} className="btn-street w-full py-2.5 bg-slate-900 text-white border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)]">কল সমাপন</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 3. DIGITAL TRUST STATEMENT SHARE */}
        {activeSimulation === 'statement' && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center space-y-4">
              {simStep === 'generating' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-rose-100 border-4 border-slate-900 flex items-center justify-center text-rose-500 mx-auto animate-spin">
                    <RefreshCcw size={32} />
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-900">প্রমানপত্র তৈরি হচ্ছে...</h4>
                  <p className="text-slate-500 text-xs font-bold italic">ডিজিটাল ট্রাস্ট ভাউচার ও কিউআর কোড রেন্ডার করা হচ্ছে</p>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-900">
                    <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${simProgress}%` }} />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-brand-yellow/20 border-4 border-brand-yellow flex items-center justify-center text-brand-yellow mx-auto">
                    <Award size={36} className="fill-brand-yellow text-slate-900" />
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-900">গ্যারান্টি প্রমানপত্র রেডি ক্যান!</h4>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    ১৫ কয়েন রিচার্জ সম্পূর্ণ। ট্রাস্ট সার্টিফিকেটে কাস্টমার {customer.name} এর ভেরিফাইড বিশ্বাস স্কোর ৮৫ যুক্ত করা হয়েছে!
                  </p>
                  
                  <div className="border-2 border-slate-950 rounded-2xl p-4 bg-slate-50 space-y-1.5 text-left text-xs text-slate-700">
                    <div className="flex justify-between font-bold border-b border-slate-300 pb-1 text-[10px] text-slate-400">
                      <span>LENDEN TRUST CORP</span>
                      <span>ID: #LD-9502</span>
                    </div>
                    <div className="font-black text-slate-900 text-sm">ভেরিফাইড পাওনা ভাউচার</div>
                    <div>কাস্টমার নাম: <strong>{customer.name}</strong></div>
                    <div>মোট অপরিশোধিত বাকি: <strong>{formatCurrency(Math.abs(customer.totalBalance))}</strong></div>
                    <div className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-1 rounded inline-block font-black mt-2">
                      ✔ SECURE SHARED (গুগল প্লে সার্টিফাইড)
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      pixel.track('share_action_triggered');
                      alert('প্রমানপত্র কপি ও শেয়ার করা হয়েছে মামা!');
                      setActiveSimulation(null);
                    }} 
                    className="btn-street w-full py-2.5 bg-rose-500 text-white border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 font-black italic uppercase text-sm"
                  >
                    <Share2 size={16} />
                    কাস্টমারকে পাঠান
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 4. INSUFFICIENT COINS WARNING SCREEN */}
        {activeSimulation === 'insufficient' && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-rose-100 border-4 border-rose-500 flex items-center justify-center text-rose-500 mx-auto">
                <ShieldAlert size={36} />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black font-display leading-tight text-slate-900 uppercase italic">কয়েন শেষ হয়ে গেছে মামা!</h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  আপনার লেন্দেন ওয়ালেটে রিমাইন্ডার পাঠানোর জন্য পর্যাপ্ত কয়েন অবশিষ্ট নাই ক্যান! দয়া করে কয়েন রিচার্জ করুন অথবা ফ্রি এড দেখে কয়েন সংগ্রহ করুন।
                </p>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
                <span className="text-[10px] text-rose-700 font-black uppercase">বর্তমান ব্যালেন্স:</span>
                <span className="text-rose-600 font-black font-mono flex items-center gap-1">
                  <Zap size={14} className="fill-rose-500 text-rose-500" />
                  {currentCoins} কয়েন
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => {
                    setActiveSimulation(null);
                    navigate('/store');
                  }} 
                  className="flex-1 btn-street py-3 bg-brand-primary text-slate-950 font-black italic uppercase text-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] border-2 border-slate-900 flex items-center justify-center gap-1"
                >
                  🪙 রিচার্জ স্টোর
                </button>
                <button 
                  onClick={() => {
                    setActiveSimulation(null);
                    navigate('/store');
                  }} 
                  className="flex-1 btn-street py-3 bg-white text-slate-950 font-black italic uppercase text-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] border-2 border-slate-900 flex items-center justify-center gap-1"
                >
                  🎥 ফ্রি এড দেখুন
                </button>
              </div>

              <button 
                onClick={() => setActiveSimulation(null)} 
                className="text-slate-400 font-bold hover:text-slate-600 text-[10px] uppercase block w-full text-center cursor-pointer"
              >
                পরে করবো ক্যান
              </button>
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
};

export default CustomerDetail;
