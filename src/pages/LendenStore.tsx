import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Zap, CreditCard, ShieldAlert, CheckCircle2, RefreshCcw, Coffee, Play, 
  Clock, Heart, ShieldCheck, HelpCircle, PhoneCall, MessageSquare, Flame, Sparkles, AlertCircle
} from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { getStats, saveStats } from '../lib/db';
import { useLendenData } from '../hooks/useLendenData';
import { pixel, PixelEvent } from '../lib/pixel';
import { formatCurrency } from '../lib/utils';

interface CoinPack {
  id: string;
  name: string;
  banglaName: string;
  coins: number;
  price: number;
  popular?: boolean;
  desc: string;
  bdtLabel: string;
}

export const LendenStore = () => {
  const { stats, refresh } = useLendenData();
  const [localCoins, setLocalCoins] = useState(120);
  const [isElite, setIsElite] = useState(false);
  
  // Custom states
  const [activeTab, setActiveTab] = useState<'store' | 'tong' | 'ads' | 'pixel'>('store');
  const [pixelLogs, setPixelLogs] = useState<PixelEvent[]>([]);

  // bKash/Nagad checkout overlay state
  const [selectedPack, setSelectedPack] = useState<CoinPack | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<'bkash' | 'nagad' | 'rocket' | null>(null);
  const [paymentStep, setPaymentStep] = useState<'number' | 'pin' | 'otp' | 'success'>('number');
  const [walletNumber, setWalletNumber] = useState('');
  const [paymentPin, setPaymentPin] = useState('');
  const [paymentOtp, setPaymentOtp] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // AdMob Simulator State
  const [activeAd, setActiveAd] = useState<any | null>(null);
  const [adCountdown, setAdCountdown] = useState(5);
  const [showAdSuccess, setShowAdSuccess] = useState(false);

  // Tong Tea Timer State
  const [tongMinutes, setTongMinutes] = useState(5);
  const [tongSeconds, setTongSeconds] = useState(0);
  const [isTongRunning, setIsTongRunning] = useState(false);
  const [tongEarned, setTongEarned] = useState(false);

  // Pack items
  const coinPacks: CoinPack[] = [
    {
      id: 'pack_muri',
      name: 'Muri-Murki Pack',
      banglaName: 'মুড়ি-মুড়কি প্যাক',
      coins: 50,
      price: 15,
      desc: 'ছোট বিপদের চটজলদি ব্যাকআপ! কাস্টমারকে ১০ বার এসএমএস তাগাদা পাঠাতে পারবেন।',
      bdtLabel: '৳১৫ রিচার্জ'
    },
    {
      id: 'pack_chasingara',
      name: 'Cha-Shinger Pack',
      banglaName: 'চা-সিঙ্গারা প্যাক',
      coins: 300,
      price: 50,
      popular: true,
      desc: 'সবচেয়ে প্রিয় অফার! এসএমএস তাগাদাসহ ৫ বার রোবো-কল করার সুবর্ণ সুযোগ।',
      bdtLabel: '৳৫০ রিচার্জ'
    },
    {
      id: 'pack_bazar',
      name: 'Bazaar Master Pack',
      banglaName: 'বাজার মাস্টার প্যাক',
      coins: 1000,
      price: 130,
      desc: 'পুরো সপ্তাহের জন্য নিশ্চিন্ত ল্যান্ডিং! এসএমএস, কল এবং আনলিমিটেড স্টেটমেন্ট রিচার্জ।',
      bdtLabel: '৳১৩০ রিচার্জ'
    },
    {
      id: 'pack_elite',
      name: 'Elite Mahajon Tier',
      banglaName: 'এলিট মহাজন মেম্বারশিপ',
      coins: 9999,
      price: 299,
      desc: 'আজীবন মহাজন ব্যাজ, সম্পূর্ণ এড-মুক্ত অ্যাপ, আনলিমিটেড রিপোর্ট ও ফ্রন্ট-সিট সাপোর্ট!',
      bdtLabel: '৳২৯৯ এককালীন'
    }
  ];

  // Ads repository
  const adsMockList = [
    {
      brand: 'PRAN Up',
      headline: 'জান ঠান্ডা করতে প্রান আপ!',
      body: 'বাজারের কড়া গরমে খাতা মিলাতে মন আইঢাই করতেছে? এখনই এক চুমুক প্রান আপ খায়া ফেলেন মামা!',
      accent: 'border-lime-500 bg-lime-50 text-lime-900',
      btnColor: 'bg-lime-500 hover:bg-lime-600',
      tagline: 'বুদবুদ করলেই খুশি!'
    },
    {
      brand: 'Super Star LED',
      headline: 'আলো ছড়াবে সারা দোকান!',
      body: 'নষ্ট এনার্জি বাল্ব বাদ দিয়া নিয়ে আসেন সুপার স্টার এলইডি। দোকান উজ্জ্বল, মনও উজ্জ্বল!',
      accent: 'border-yellow-500 bg-yellow-50 text-yellow-900',
      btnColor: 'bg-yellow-500 hover:bg-yellow-600',
      tagline: 'বিশ্বাস আর আলোর কারিগর'
    },
    {
      brand: 'Frutika Mango Juice',
      headline: 'একটুও ভেজাল নাই, ১০০% পিওর!',
      body: 'গরম বালুর রাস্তা দিয়া হেঁটে এসে দোকানে বসছেন? কাস্টমার তাগাদা দিতে দিতে প্রান জুস ঠান্ডা করেন!',
      accent: 'border-orange-500 bg-orange-50 text-orange-900',
      btnColor: 'bg-orange-500 hover:bg-orange-600',
      tagline: 'খাঁটি আমের আসল স্বাদ'
    },
    {
      brand: 'bKash Cash-Out',
      headline: 'দেশ জুড়ে সবচেয়ে কম ক্যাশআউট চার্জ!',
      body: 'লেনদেন অ্যাপে সরাসরি কানেকশন করে খাতার হিসাব মিলান। টেনশন ছাড়া টাকা পাঠান যেকোনো সময়!',
      accent: 'border-pink-500 bg-pink-50 text-pink-900',
      btnColor: 'bg-pink-600 hover:bg-pink-700 text-white',
      tagline: 'সহজ ও নিরাপদ মোবাইল ব্যাংকিং'
    }
  ];

  // Listen to pixel events & synchronize coins with database
  useEffect(() => {
    const unsub = pixel.subscribe((logs) => {
      setPixelLogs(logs);
    });

    const initStats = async () => {
      const dbStats = await getStats();
      setLocalCoins(dbStats.coins ?? 120);
      setIsElite(dbStats.isEliteMahajon ?? false);
    };
    initStats();

    // Fire screen views for App Mon_Pixel
    pixel.track('lenden_store_layout_view');

    return () => unsub();
  }, []);

  // Tong Tea break Pomodoro countdown timer logic
  useEffect(() => {
    let interval: any = null;
    if (isTongRunning) {
      interval = setInterval(() => {
        if (tongSeconds > 0) {
          setTongSeconds(prev => prev - 1);
        } else if (tongMinutes > 0) {
          setTongMinutes(prev => prev - 1);
          setTongSeconds(59);
        } else {
          // Timer ended
          setIsTongRunning(false);
          setTongEarned(true);
          awardCoins(25); // Award 25 coins for completing the tea break
          pixel.track('tea_break_completed_reward', { coins_awarded: 25 });
          
          // Send Native Vibrate simulation
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTongRunning, tongMinutes, tongSeconds]);

  // Ad countdown loop
  useEffect(() => {
    let interval: any = null;
    if (activeAd) {
      interval = setInterval(() => {
        setAdCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeAd]);

  const awardCoins = async (amount: number, setElite: boolean = false) => {
    try {
      const dbStats = await getStats();
      const updatedCoins = (dbStats.coins ?? 120) + amount;
      const updatedElite = setElite ? true : (dbStats.isEliteMahajon ?? false);

      const payload = {
        ...dbStats,
        coins: updatedCoins,
        isEliteMahajon: updatedElite
      };

      await saveStats(payload);
      setLocalCoins(updatedCoins);
      if (setElite) setIsElite(true);
      await refresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Launch sponsored Ad
  const startAd = () => {
    const randomAd = adsMockList[Math.floor(Math.random() * adsMockList.length)];
    setAdCountdown(5);
    setActiveAd(randomAd);
    pixel.track('ad_monetization_impression', { brand: randomAd.brand });
  };

  const closeAd = () => {
    if (adCountdown > 0) return; // Prevent closing early
    setActiveAd(null);
    setShowAdSuccess(true);
    awardCoins(15); // Earn 15 Lenden Coins
    pixel.track('ad_monetization_reward_granted', { coins_awarded: 15 });
    setTimeout(() => setShowAdSuccess(false), 4000);
  };

  // Start mobile checkout
  const handlePackSelection = (pack: CoinPack) => {
    setSelectedPack(pack);
    setPaymentProvider(null);
    setPaymentStep('number');
    setWalletNumber('');
    setPaymentPin('');
    setPaymentOtp('');
  };

  // bKash Checkout Loop
  const proceedPayment = () => {
    if (paymentStep === 'number') {
      if (!walletNumber.match(/^01[3-9]\d{8}$/)) {
        alert('সঠিক ১১ ডিজিটের মোবাইল ব্যাংকিং নম্বর দিন ক্যান!');
        return;
      }
      setIsProcessingPayment(true);
      pixel.track('payment_wallet_submitted', { wallet: walletNumber, provider: paymentProvider });
      setTimeout(() => {
        setIsProcessingPayment(false);
        setPaymentStep('otp');
      }, 1200);
    } else if (paymentStep === 'otp') {
      if (paymentOtp.length < 4) {
        alert('৪ সংখ্যার ওটিপি কোড লিখুন!');
        return;
      }
      setIsProcessingPayment(true);
      pixel.track('payment_otp_submitted', { otp: paymentOtp });
      setTimeout(() => {
        setIsProcessingPayment(false);
        setPaymentStep('pin');
      }, 1000);
    } else if (paymentStep === 'pin') {
      if (paymentPin.length < 4) {
        alert('৪ বা ৫ সংখ্যার পিন নম্বর দিন ক্যান!');
        return;
      }
      setIsProcessingPayment(true);
      pixel.track('payment_pin_submitted');
      setTimeout(() => {
        setIsProcessingPayment(false);
        setPaymentStep('success');
        
        // Finalize transaction
        const coinsToAward = selectedPack ? selectedPack.coins : 0;
        const isBoughtElite = selectedPack?.id === 'pack_elite';
        awardCoins(coinsToAward, isBoughtElite);
        
        pixel.track('lenden_coins_purchase_success', {
          pack_id: selectedPack?.id,
          amount_bdt: selectedPack?.price,
          coins_added: coinsToAward,
          is_elite: isBoughtElite
        });
      }, 1500);
    }
  };

  const getDokanTierName = (score: number) => {
    if (score >= 90) return 'বাজারের মহাজন (Diamond Mahajon)';
    if (score >= 75) return 'পাকা ব্যবসায়ী (Wise Merchant)';
    if (score >= 60) return 'চালাক দোকানদার (Active Merchant)';
    return 'ছোট দোকানদার (Starter Merchant)';
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Play Store Premium Header */}
        <div className="card-street bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 relative overflow-hidden border-4 border-brand-primary">
          <div className="absolute top-0 right-0 bg-brand-primary text-slate-950 font-black italic uppercase text-[9px] px-3 py-1 rounded-bl-xl shadow-md tracking-wider">
            Google Play Live
          </div>
          
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-emerald-400 font-bold font-mono text-[9px] uppercase tracking-widest block bg-slate-950/40 w-max px-2 py-0.5 rounded-full border border-slate-700">
                ⭐ {getDokanTierName(stats?.creditScore || 50)} 
              </span>
              <h2 className="text-3xl font-black font-display italic tracking-tight leading-none uppercase">
                লয়্যালটি ও কয়েন স্টোর
              </h2>
              <p className="text-slate-400 text-[10px] font-black uppercase italic tracking-wider">
                Lenden Virtual Coins & Ad Monetization Engine
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-[9px] font-black text-slate-400 uppercase italic">বর্তমান ব্যালেন্স</div>
              <motion.div 
                key={localCoins}
                animate={{ scale: [1, 1.15, 1] }}
                className="flex items-center gap-1.5 justify-end mt-1 text-brand-yellow font-black font-display text-4xl italic"
              >
                <Zap size={28} className="fill-brand-yellow animate-pulse" />
                {localCoins}
              </motion.div>
              <div className="text-[8px] font-mono text-slate-500 uppercase">Lenden Coins (কয়েন)</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/20 flex items-center justify-center border border-brand-primary">
                <ShieldCheck size={18} className="text-brand-primary" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase italic leading-none text-slate-300">ভেরিফাইড পেমেন্ট</div>
                <div className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">Secure Google Play Sandbox</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isElite ? 'bg-amber-400/20 border-amber-400 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                <Award size={18} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase italic leading-none text-slate-300">এলিট মহাজন স্টেটাস</div>
                <div className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">
                  {isElite ? 'ACTIVE • NO ADS UNLOCKED' : 'NOT ENABLED • BUY COINS'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 bg-slate-100 rounded-3xl border-2 border-slate-900 gap-1 overflow-x-auto shrink-0 scrollbar-none">
          <button 
            onClick={() => { setActiveTab('store'); pixel.track('tab_view_store'); }} 
            className={`flex-1 py-2.5 px-3 rounded-2xl font-black text-xs uppercase italic tracking-tighter transition-all whitespace-nowrap ${activeTab === 'store' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            🪙 কয়েন রিচার্জ
          </button>
          <button 
            onClick={() => { setActiveTab('tong'); pixel.track('tab_view_tong'); }} 
            className={`flex-1 py-2.5 px-3 rounded-2xl font-black text-xs uppercase italic tracking-tighter transition-all whitespace-nowrap ${activeTab === 'tong' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            ☕ চা আড্ডা টাইমার
          </button>
          <button 
            onClick={() => { setActiveTab('ads'); pixel.track('tab_view_ads'); }} 
            className={`flex-1 py-2.5 px-3 rounded-2xl font-black text-xs uppercase italic tracking-tighter transition-all whitespace-nowrap ${activeTab === 'ads' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            🎥 ফ্রি এড দেখে আয়
          </button>
          <button 
            onClick={() => { setActiveTab('pixel'); pixel.track('tab_view_pixel'); }} 
            className={`flex-1 py-2.5 px-3 rounded-2xl font-black text-xs uppercase italic tracking-tighter transition-all whitespace-nowrap ${activeTab === 'pixel' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            📊 পিক্সেল ট্র্যাকার
          </button>
        </div>

        {/* TAB 1: STORE */}
        {activeTab === 'store' && (
          <div className="space-y-4">
            <div className="px-2">
              <h3 className="font-black font-display uppercase italic text-xl tracking-tight leading-none">কয়েন প্যাক সমূহ বাছেন</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase italic mt-1 leading-tight">
                SMS রিমাইন্ডার, ভয়েস রোবো-কল এবং কাস্টমার স্টেটমেন্ট রিপোর্ট তৈরি করতে ১-১০ কয়েন কেটে নেওয়া হয় ক্যান!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coinPacks.map((pack) => (
                <motion.div 
                  key={pack.id}
                  whileHover={{ scale: 1.01 }}
                  className={`card-street flex flex-col justify-between p-5 relative overflow-hidden group border-2 ${pack.popular ? 'border-brand-primary/40 bg-brand-primary/5' : ''}`}
                >
                  {pack.popular && (
                    <div className="absolute top-0 right-0 p-1.5 px-3 bg-brand-primary text-slate-950 font-black italic uppercase text-[8px] rounded-bl-xl shadow-sm tracking-wider">
                      POPULAR CHOICE
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-2xl bg-brand-yellow/10 border-2 border-brand-yellow flex items-center justify-center text-brand-yellow">
                        <Zap size={20} className="fill-brand-yellow" />
                      </div>
                      <div>
                        <h4 className="font-black text-lg font-display tracking-tight leading-tight">{pack.banglaName}</h4>
                        <span className="text-[8px] font-bold font-mono text-slate-400 uppercase block leading-none">{pack.name}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug mt-3 font-medium">
                      {pack.desc}
                    </p>

                    <div className="mt-4 flex items-baseline gap-1.5 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-emerald-500 font-black text-3xl font-display italic leading-none">+{pack.coins}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase leading-none italic">Lenden Coins</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handlePackSelection(pack)}
                    className="btn-street w-full mt-5 bg-slate-900 text-white font-black italic text-sm uppercase py-3 border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-slate-800 active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
                  >
                    <CreditCard size={16} />
                    {pack.bdtLabel}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TONG TEA BREAK (POMODORO) */}
        {activeTab === 'tong' && (
          <div className="card-street p-6 bg-amber-50 dark:bg-amber-950/20 border-4 border-amber-900/30 text-center space-y-5">
            <div className="flex justify-center flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border-4 border-amber-800 p-4 flex items-center justify-center text-amber-800 animate-bounce">
                <Coffee size={40} className="stroke-[2.5]" />
              </div>
              <h3 className="font-black font-display text-2xl tracking-tight uppercase italic text-amber-900 dark:text-amber-400 mt-4 leading-none">
                টংয়ের চায়ের আড্ডা
              </h3>
              <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest italic mt-1">
                Culturally Tapped Habitual Pomodoro Loop
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <p className="text-xs font-medium text-amber-800/80 leading-relaxed bg-white/70 dark:bg-slate-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-900/50">
                &ldquo;বাজারের চায়ের টেবিলে বসে কাস্টমার তাগাদা দেবার আগে ৫ মিনিট চা-সিঙ্গারা আড্ডা দিন! মন শান্ত হলে হিসাব মিলাতে ভুল হবে না ক্যান!&rdquo; ☕<br />
                <span className="text-[10px] font-black text-brand-primary block mt-2 uppercase">🎁 প্রতি আড্ডা শেষে ২৫ টি রিচার্জ কয়েন একদম ফ্রি!</span>
              </p>
            </div>

            {/* Timer Counter */}
            <div className="py-4 font-display italic font-black text-6xl text-amber-900 dark:text-amber-200 tracking-tighter drop-shadow-[4px_4px_0px_white]">
              {String(tongMinutes).padStart(2, '0')}:{String(tongSeconds).padStart(2, '0')}
            </div>

            <div className="flex gap-4 justify-center max-w-sm mx-auto">
              {!isTongRunning ? (
                <button 
                  onClick={() => {
                    setIsTongRunning(true);
                    setTongEarned(false);
                    pixel.track('tea_break_timer_started');
                  }}
                  className="btn-street flex-1 bg-amber-800 text-white font-black italic uppercase text-sm py-3.5 shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-slate-900 flex items-center justify-center gap-2"
                >
                  <Play size={16} fill="currentColor" />
                  আড্ডা শুরু করুন
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsTongRunning(false);
                    pixel.track('tea_break_timer_paused');
                  }}
                  className="btn-street flex-1 bg-rose-500 text-white font-black italic uppercase text-sm py-3.5 shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-slate-900 flex items-center justify-center gap-2"
                >
                  <Clock size={16} />
                  বিরতি দিন
                </button>
              )}
              
              <button 
                onClick={() => {
                  setIsTongRunning(false);
                  setTongMinutes(5);
                  setTongSeconds(0);
                  setTongEarned(false);
                  pixel.track('tea_break_timer_reset');
                }}
                className="btn-street bg-white text-slate-900 border-2 border-slate-900 font-black italic text-xs uppercase px-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
              >
                রিসেট
              </button>
            </div>

            {tongEarned && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl max-w-sm mx-auto flex items-center gap-3 text-left"
              >
                <CheckCircle2 size={28} className="text-emerald-500" />
                <div>
                  <h4 className="font-black text-emerald-800 text-xs uppercase italic">আলহামদুলিল্লাহ! আড্ডা সফল!</h4>
                  <p className="text-[10px] text-emerald-600 font-bold">আপনার লেন্দেন ওয়ালেটে ২৫ টি কয়েন যোগ করা হয়েছে ক্যান!</p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* TAB 3: SPONSORED ADS */}
        {activeTab === 'ads' && (
          <div className="card-street p-6 bg-slate-50 dark:bg-slate-900 text-center space-y-5">
            <div className="flex justify-center flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border-2 border-brand-primary p-3 flex items-center justify-center text-brand-primary">
                <Play size={32} fill="currentColor" />
              </div>
              <h3 className="font-black font-display text-xl tracking-tight uppercase italic mt-4 leading-none">
                স্পন্সর এড দেখে কয়েন আয়
              </h3>
              <p className="text-slate-400 text-[9px] uppercase font-black tracking-widest italic mt-1">
                Embedded Pixel AdMob Ad Simulator
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                কোন টাকা ছাড়া কয়েন পেতে চান? মাত্র ৫ সেকেন্ডের একটি দেশি স্পন্সরডের এড দেখুন এবং আপনার একাউন্টে সাথে সাথে <span className="text-emerald-500 font-bold font-mono">১৫ কয়েন</span> যোগ করে নিন ক্যান! 🇧🇩
              </p>
            </div>

            <button 
              onClick={startAd}
              disabled={isElite}
              className="btn-street bg-brand-primary text-slate-950 font-black italic uppercase text-sm py-4 max-w-xs mx-auto w-full shadow-[6px_6px_0px_rgba(0,0,0,1)] border-2 border-slate-900 flex items-center justify-center gap-2 disabled:grayscale disabled:opacity-50"
            >
              <Sparkles size={16} fill="currentColor" />
              {isElite ? 'এলিট মেম্বার (বিজ্ঞাপন মুক্ত)' : 'স্পন্সর এড প্লে করুন'}
            </button>

            {showAdSuccess && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-500 text-white rounded-2xl border-4 border-slate-950 max-w-sm mx-auto flex items-center gap-3 text-left shadow-[4px_4px_0px_rgba(0,0,0,1)]"
              >
                <Zap size={24} className="fill-brand-yellow text-brand-yellow" />
                <div>
                  <h4 className="font-black text-slate-950 text-xs uppercase italic">অভিনন্দন! কয়েন রিচার্জ সম্পূর্ণ!</h4>
                  <p className="text-[10px] text-slate-100 font-semibold">এড দেখার জন্য ১৫ টি ফ্রি কয়েন সফলভাবে যোগ করা হয়েছে!</p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* TAB 4: PIXEL LOGGER CONSOLE */}
        {activeTab === 'pixel' && (
          <div className="space-y-4">
            <div className="card-street bg-slate-950 text-emerald-400 p-5 font-mono text-xs space-y-3 relative border-4 border-slate-800">
              <div className="absolute top-2 right-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">ANDROID_BRIDGE_ONLINE</span>
              </div>
              <h3 className="text-white font-black text-sm uppercase italic tracking-wider flex items-center gap-2 font-display">
                <RefreshCcw size={16} className="animate-spin text-brand-primary" />
                Embedded Monetization Console
              </h3>
              <p className="text-slate-400 text-[10px] leading-relaxed mb-4 font-sans font-medium">
                When packaged as an Android wrapper APK/AAB for Google Play, the application automatically dispatches standard JS window event parameters. These interact directly with native Google Play Referral trackers, AdMob mediation libraries, and Meta Conversion Ads SDK to monitor micro-transaction ROI.
              </p>

              <div className="border-t border-slate-800 pt-3 space-y-2 max-h-56 overflow-y-auto scrollbar-none antialiased">
                <div className="text-slate-500 text-[9px] italic">// real-time event audit logs</div>
                {pixelLogs.map((log) => (
                  <div key={log.id} className="p-2 bg-slate-900/40 rounded border border-slate-900 flex justify-between items-center text-[10px]">
                    <div>
                      <span className="text-slate-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                      <span className="text-brand-yellow font-bold">{log.eventName}</span>
                      <span className="text-[9px] bg-slate-800 text-slate-300 px-1 py-0.5 rounded ml-2 font-black">{log.destination}</span>
                    </div>
                    <span className={log.status === 'FIRED' ? 'text-emerald-400' : 'text-amber-400'}>
                      ● {log.status}
                    </span>
                  </div>
                ))}
                {pixelLogs.length === 0 && (
                  <div className="text-slate-500 text-center py-6">No tracking events recorded in this session.</div>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <button 
                  onClick={() => {
                    pixel.clearLogs();
                    pixel.track('logs_cleared');
                  }} 
                  className="text-slate-400 hover:text-white text-[9px] uppercase font-bold"
                >
                  Clear Terminal
                </button>
                <div className="text-slate-600 text-[9px] font-bold">
                  v3.1_MONET_CONTAINER
                </div>
              </div>
            </div>
          </div>
        )}

        {/* bKash/Nagad Checkout Modal Appears */}
        <AnimatePresence>
          {selectedPack && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-white rounded-3xl overflow-hidden border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col"
              >
                {/* Provider Selector if none chosen */}
                {paymentProvider === null ? (
                  <div className="p-6 space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black font-display text-2xl tracking-tight leading-none uppercase italic">পেমেন্ট গেটওয়ে</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">পছন্দের পেমেন্ট মেথডটি বাছেন মামা</p>
                      </div>
                      <button 
                        onClick={() => setSelectedPack(null)}
                        className="w-8 h-8 rounded-full border-2 border-slate-900 font-black text-sm active:translate-y-px"
                      >
                        X
                      </button>
                    </div>

                    <div className="p-3 bg-brand-primary/10 border-2 border-brand-primary/30 rounded-2xl flex items-center gap-3">
                      <Zap size={24} className="text-brand-primary" />
                      <div>
                        <div className="text-xs font-black uppercase text-slate-800 leading-none">{selectedPack.banglaName}</div>
                        <div className="text-xs font-black text-brand-primary mt-1">{selectedPack.bdtLabel}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button 
                        onClick={() => { setPaymentProvider('bkash'); pixel.track('payment_provider_selected', { provider: 'bkash' }); }}
                        className="w-full p-4 bg-[#e2126f] text-white font-black italic rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-px transition-all text-left flex justify-between items-center"
                      >
                        <span>bKash (বিকাশ পেমেন্ট)</span>
                        <span className="text-xs uppercase bg-white/20 px-2.5 py-1 rounded">FASTEST</span>
                      </button>

                      <button 
                        onClick={() => { setPaymentProvider('nagad'); pixel.track('payment_provider_selected', { provider: 'nagad' }); }}
                        className="w-full p-4 bg-[#f66d23] text-white font-black italic rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-px transition-all text-left flex justify-between items-center"
                      >
                        <span>Nagad (নগদ পেমেন্ট)</span>
                        <span className="text-xs uppercase bg-white/20 px-2.5 py-1 rounded">SECURE</span>
                      </button>

                      <button 
                        onClick={() => { setPaymentProvider('rocket'); pixel.track('payment_provider_selected', { provider: 'rocket' }); }}
                        className="w-full p-4 bg-[#8c3494] text-white font-black italic rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-px transition-all text-left flex justify-between items-center"
                      >
                        <span>Rocket (রকেট পেমেন্ট)</span>
                        <span className="text-xs uppercase bg-white/20 px-2.5 py-1 rounded">2% DISCOUNT</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Provider Checkout Fields */
                  <div className={`p-0 ${paymentProvider === 'bkash' ? 'bg-[#e2126f]' : paymentProvider === 'nagad' ? 'bg-[#f66d23]' : 'bg-[#8c3494]'} text-white`}>
                    
                    {/* Brand Banner */}
                    <div className="p-5 flex justify-between items-center border-b border-white/25">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-slate-950 uppercase italic text-sm">
                          {paymentProvider === 'bkash' ? 'bK' : paymentProvider === 'nagad' ? 'Na' : 'Ro'}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-lg leading-none uppercase">
                            {paymentProvider === 'bkash' ? 'bKash CheckOut' : paymentProvider === 'nagad' ? 'Nagad Pay' : 'Rocket Pay'}
                          </h4>
                          <span className="text-[9px] uppercase tracking-wider block opacity-75 mt-0.5">Google Play SDK Integration</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedPack(null)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center font-bold text-sm"
                      >
                        X
                      </button>
                    </div>

                    <div className="bg-slate-50 text-slate-900 p-6 space-y-4 rounded-t-3xl border-t-2 border-slate-900 flex-1">
                      
                      {/* STEP 1: WALLET NUMBER */}
                      {paymentStep === 'number' && (
                        <div className="space-y-4">
                          <div className="text-center pb-2">
                            <span className="text-slate-400 text-[10px] font-black uppercase italic">recharging package</span>
                            <div className="font-black text-lg text-slate-800 leading-tight">{selectedPack.banglaName}</div>
                            <div className="text-xl font-bold text-slate-900 mt-1">{selectedPack.bdtLabel}</div>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-extrabold uppercase ml-1">আপনার অ্যাকাউন্ট নম্বর</label>
                            <input 
                              type="tel" 
                              placeholder="e.g. 01712345678" 
                              value={walletNumber}
                              onChange={(e) => setWalletNumber(e.target.value)}
                              className="input-field border-2 border-slate-900 rounded-2xl p-4 bg-white text-slate-900 font-bold focus:outline-none"
                              maxLength={11}
                            />
                          </div>
                          
                          <p className="text-[10px] text-slate-400 leading-snug font-medium text-center italic">
                            পেমেন্ট বাটনে ক্লিক করার মাধ্যমে আপনি আমাদের গুগল প্লে মেম্বরশিপ শর্তাবলী ও পেমেন্ট প্রোটোকলের সাথে একমত হলেন ক্যান!
                          </p>
                        </div>
                      )}

                      {/* STEP 2: ENTER OTP */}
                      {paymentStep === 'otp' && (
                        <div className="space-y-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-brand-primary/10 border-2 border-brand-primary flex items-center justify-center text-brand-primary mx-auto">
                            <Clock size={20} className="animate-pulse" />
                          </div>
                          <div className="space-y-1">
                            <h5 className="font-black text-slate-800">ওটিপি ভেরিফিকেশন কোড</h5>
                            <p className="text-slate-500 text-[10px] font-bold">একটি ৪ সংখ্যার ওটিপি কোড নম্বর {walletNumber} নম্বরে পাঠানো হয়েছে!</p>
                          </div>
                          
                          <input 
                            type="text" 
                            placeholder="OTP লিখুন (e.g. 5824)" 
                            value={paymentOtp}
                            onChange={(e) => setPaymentOtp(e.target.value)}
                            className="input-field border-2 border-slate-900 text-center font-bold tracking-widest text-2xl bg-white p-4"
                            maxLength={4}
                          />
                        </div>
                      )}

                      {/* STEP 3: ENTER WALLET PIN */}
                      {paymentStep === 'pin' && (
                        <div className="space-y-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-slate-900/10 border-2 border-slate-900 flex items-center justify-center text-slate-900 mx-auto">
                            <Heart size={20} className="fill-brand-primary text-brand-primary" />
                          </div>
                          <div className="space-y-1">
                            <h5 className="font-black text-slate-800">আপনার চার বা পাঁচ সংখ্যার ব্যক্তিগত পিন</h5>
                            <p className="text-slate-500 text-[10px] font-bold">নিরাপদ পেমেন্ট সম্পন্ন করতে আপনার ওয়ালেট পিন কোড দিন ক্যান।</p>
                          </div>
                          
                          <input 
                            type="password" 
                            placeholder="PIN কোড" 
                            value={paymentPin}
                            onChange={(e) => setPaymentPin(e.target.value)}
                            className="input-field border-2 border-slate-900 text-center font-bold tracking-widest text-2xl bg-white p-4"
                            maxLength={5}
                          />
                        </div>
                      )}

                      {/* STEP 4: SUCCESS CONGRATULATIONS */}
                      {paymentStep === 'success' && (
                        <div className="space-y-5 text-center py-4">
                          <motion.div 
                            initial={{ scale: 0.5, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="w-16 h-16 rounded-full bg-emerald-500 border-4 border-slate-900 flex items-center justify-center text-white mx-auto shadow-md"
                          >
                            <CheckCircle2 size={36} />
                          </motion.div>
                          
                          <div className="space-y-2">
                            <h4 className="font-black font-display uppercase tracking-tight text-slate-900 text-2xl leading-none">রিচার্জ সফল হয়েছে!</h4>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                              আপনার একাউন্টে সফলভাবে <span className="text-emerald-500 font-bold">+{selectedPack.coins} কয়েন</span> রিচার্জ সম্পন্ন হয়েছে এবং পিক্সেল ট্যাগ সাকসেস ফায়ার হয়েছে মামা!
                            </p>
                          </div>

                          <button 
                            onClick={() => setSelectedPack(null)}
                            className="btn-street w-full bg-emerald-500 text-white font-black italic py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-slate-900"
                          >
                            স্টোরে ফিরে যাই
                          </button>
                        </div>
                      )}

                      {paymentStep !== 'success' && (
                        <button 
                          onClick={proceedPayment}
                          disabled={isProcessingPayment}
                          className="btn-street w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black italic uppercase text-sm border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
                        >
                          {isProcessingPayment && <RefreshCcw className="animate-spin" size={16} />}
                          {isProcessingPayment ? 'প্রসেসিং হচ্ছে...' : 'এগিয়ে যান'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* AdMob Simulator Video Popup */}
        <AnimatePresence>
          {activeAd && (
            <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center p-4 z-50">
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="w-full max-w-md bg-white rounded-3xl overflow-hidden border-8 border-slate-900 shadow-2xl flex flex-col relative"
              >
                {/* Countdown / Reward Badge */}
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur text-white font-black italic uppercase text-[10px] px-3.5 py-1.5 rounded-full z-20">
                  {adCountdown > 0 ? `রিওয়ার্ড পেতে অপেক্ষা করুন: ${adCountdown}s` : 'কয়েন রেডি (ক্লিক করুন!)'}
                </div>

                <div className="p-6 h-72 flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-850 text-white relative overflow-hidden">
                  <div className="absolute top-[-50%] right-[-10%] opacity-15 w-80 h-80 rounded-full border-8 border-white" />
                  
                  <div>
                    <span className="text-brand-primary font-black uppercase tracking-[0.2em] font-mono text-[9px] block">SPONSORED GOOGLE AP_MONET</span>
                    <h2 className="text-4xl font-black font-display text-brand-yellow italic tracking-tight leading-none mt-2">
                      {activeAd.brand}
                    </h2>
                    <p className="text-xl font-bold font-sans mt-3 text-slate-100 leading-tight">
                      {activeAd.headline}
                    </p>
                  </div>

                  <p className="text-xs font-semibold text-slate-400 leading-snug z-10">
                    {activeAd.body}
                  </p>

                  <div className="text-[10px] font-bold text-emerald-400 italic font-mono">
                    ✦ {activeAd.tagline}
                  </div>
                </div>

                <div className="bg-slate-50 p-6 flex justify-between gap-4 border-t-4 border-slate-900">
                  <button 
                    onClick={closeAd}
                    disabled={adCountdown > 0}
                    className="btn-street flex-1 py-4 bg-emerald-500 text-white border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] font-black uppercase text-sm italic flex items-center justify-center gap-2 disabled:opacity-40 disabled:grayscale transition-all"
                  >
                    <CheckCircle2 size={16} />
                    {adCountdown > 0 ? 'ভিডিও বিজ্ঞাপন চলছে' : 'বিজ্ঞাপন বন্ধ ও ১৫ কয়েন ও সংগ্রহ'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </PageWrapper>
  );
};

export default LendenStore;
