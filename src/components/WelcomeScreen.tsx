import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BookOpen, ShieldCheck, Zap, Heart, Sparkles, Award, MessageSquare, User as UserIcon, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

interface Step {
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  color: string;
  illustration: React.ReactNode;
}

import { useLanguage } from '../contexts/LanguageContext';

const getSteps = (dialect: string): Step[] => {
  const getTexts = () => {
    switch (dialect) {
      case 'CHITTAGONIAN':
        return [
          { title: "আঁই লেন্দেন...", subtitle: "NEW KHATA", desc: "অন্নের ব্যবসার নয়া ডিজিটাল খাতা। পুরান খাতার ঝামেলা শেষ, এহন অইব স্মার্ট হিসাব।" },
          { title: "পুরান খাতা? বাদ দুন!", subtitle: "BYE BYE OLD LEDGER", desc: "কাগজে হিসাব রাখনর দিন শেষ। ছিঁড়ি যাইবর ভয় নাই, আরাই যাইবর চিন্তাও নাই।" },
          { title: "বিশ্বাস এহন ডিজিটাল", subtitle: "DIGITAL TRUST", desc: "ঠিক সমউত টিয়া তুলুন আর 'বিশ্বাস স্কোর' বাড়াউন। বাজারর সেরা ব্যবসায়ী অইন।" },
          { title: "হতা কম, হিসাব সাফ", subtitle: "COMMUNITY ADDA", desc: "বাকি দোকানদারর লগে আড্ডা দিন, বুদ্ধি লন আর নিজের ব্যবসা বড় গরি তুলুন!" },
          { title: "দোকান ম্যাপত আনুন", subtitle: "DOKAN MAP", desc: "দোকানর লোকেশন পিন গরি দুন যাতে মাইনশে সহজে খুঁজি পায়!" },
          { title: "হক হতা, সাফ হিসাব", subtitle: "CLEAN & SECURE", desc: "অন্নের সব ডাটা লক করা। পিন ছাড়া কেউ এই খাতা খুলিতত্ত ন।" },
        ];
      case 'SYLHETI':
        return [
          { title: "ইগু লেন্দেন!", subtitle: "NEW KHATA", desc: "আফনার বেবশার নয়া ডিজিটাল খাতা। পুরান খাতার ঝামেলা নাই, অখন অইব স্মার্ট হিসাব।" },
          { title: "পুরান খাতা গেইছেগি!", subtitle: "BYE BYE OLD LEDGER", desc: "কাগজো হিসাব রাখনি বাদ দেইন। ছিড়ার ভয় নাই, হারানির চিন্তাও নাই।" },
          { title: "একিন অখন ডিজিটাল", subtitle: "DIGITAL TRUST", desc: "টাইম মতো টেখা তুলিয়া 'একিন স্কোর' বাড়াইন। বাজারর সেরা বেবশায়ী অইন।" },
          { title: "আড্ডা আর গপ-সপ", subtitle: "COMMUNITY ADDA", desc: "হগল দোকানদারর লগে গপ করউক্কা, বুদ্ধি নেউক্কা আর বেবশা বড় করউক্কা!" },
          { title: "ম্যাপো দোকান দেও", subtitle: "DOKAN MAP", desc: "দোকানর জায়গা পিন করি দেইন যাতে কাস্টমারে জলদি পাইলাইন!" },
          { title: "খাঁটি কথা, সাফ হিসাব", subtitle: "CLEAN & SECURE", desc: "আফনার সব ডাটা সেফ। পিন ছাড়া খাতা কেউ খুলতে ফারতো নায়।" },
        ];
      case 'BARISHAILLA':
        return [
          { title: "মোরা লেন্দেন দিয়া আইছি", subtitle: "NEW KHATA", desc: "আপনের ব্যবসার নতুন ডিজিটাল খাতা। পুরান খাতার গ্যাঞ্জাম শ্যাষ, এহন স্মার্ট হিসাব।" },
          { title: "পুরান খাতার দিন শ্যাষ!", subtitle: "BYE BYE OLD LEDGER", desc: "কাগজে হিসাব রাহনের দিন গ্যাছে। ছিঁড়া যাওনের ডর নাই, হারাইনের চিন্তাও নাই।" },
          { title: "বিচ্ছাস এহন মেশিনে", subtitle: "DIGITAL TRUST", desc: "কামের টাহা কামে দ্যান আর 'বিচ্ছাস মান' বাড়ান। বাজারর সেরা ব্যাপারী হন।" },
          { title: "আড্ডা-গল্প, সাফ হিসাব", subtitle: "COMMUNITY ADDA", desc: "আশেপাশের ব্যাপারীগো লগে গপ করেন, বুদ্ধি দ্যান-ল্যান আর ব্যবসা বড় করেন!" },
          { title: "দোকানহান ম্যাপে দেহান", subtitle: "DOKAN MAP", desc: "দোকানের জায়গাটা পিন কইরা দ্যান যাতে কাস্টমার সোজা চইলা আইতে পারে!" },
          { title: "সাচ্চা কথা, সাফ হিসাব", subtitle: "CLEAN & SECURE", desc: "সব ডাটা তালা মারা। পিন ছাড়া এই খাতা কেউ খুলতে পারপে না।" },
        ];
      case 'DHAKAIYYA':
        return [
          { title: "লেনদেন নামাইয়া লন!", subtitle: "NEW KHATA", desc: "আপনার ব্যবসার ডিজিটাল খাতা। পুরান খাতার প্যারা নাই, এখন পুরা স্মার্ট হিসাব।" },
          { title: "পুরান খাতা? বাদ দে মামা!", subtitle: "BYE BYE OLD LEDGER", desc: "কাগজে হিসাব রাখার যুগ নাই। ছিঁড়া যাওয়ার টেনশন নাই, হারায় যাওয়ার প্যারা নাই।" },
          { title: "ট্রাস্ট এখন ডিজিটাল", subtitle: "DIGITAL TRUST", desc: "টাইমে টাকা ক্লিয়ার করেন আর 'ট্রাস্ট লেভেল' বাড়ান। বাজারের সেরা বস হয়ে যান।" },
          { title: "খালি আড্ডা, নো প্যারা", subtitle: "COMMUNITY ADDA", desc: "অন্য ভাই-বেরাদারদের লগে আড্ডা মারেন, আইডিয়া নেন আর ব্যবসা বড় করেন!" },
          { title: "দোকান ম্যাপে বসান", subtitle: "DOKAN MAP", desc: "দোকানের লোকেশন পিন করেন যাতে কাস্টমার এক টানে আইসা পড়ে!" },
          { title: "সাফ কথা, ক্লিয়ার হিসাব", subtitle: "CLEAN & SECURE", desc: "আপনার সব ডাটা সেফ। পিন ছাড়া কেউ এই খাতার ধারেকাছে ঘেষতে পারবো না।" },
        ];
      case 'BANGLISH':
        return [
          { title: "Welcome to Lenden", subtitle: "NEW KHATA", desc: "Your business's new digital ledger. Say goodbye to old paper khata." },
          { title: "Bye Bye Puran Khata", subtitle: "NO MORE PAPER", desc: "No more paper ledgers. Don't worry about torn pages or losing records." },
          { title: "Digital Trust Score", subtitle: "DIGITAL TRUST", desc: "Collect dues on time and boost your 'Trust Score'. Become a top merchant." },
          { title: "Community Adda", subtitle: "COMMUNITY ADDA", desc: "Hang out with other shopkeepers, share ideas, and grow together!" },
          { title: "Dokan Map", subtitle: "DOKAN MAP", desc: "Pin your shop location on the map so nearby users can easily find you!" },
          { title: "Clean & Secure", subtitle: "CLEAN & SECURE", desc: "All your data is fully encrypted. No one can open your khata without a PIN." },
        ];
      case 'STANDARD':
      default:
        return [
          { title: "আমি লেনদেন...", subtitle: "NEW KHATA", desc: "আপনার ব্যবসার নতুন ডিজিটাল খাতা। পুরনো খাতার ঝামেলা শেষ, এখন হবে স্মার্ট হিসাব।" },
          { title: "পুরান খাতা? দিন শেষ!", subtitle: "BYE BYE OLD LEDGER", desc: "কাগজে হিসাব রাখার দিন শেষ। ছিঁড়ে যাওয়ার ভয় নাই, হারিয়ে যাওয়ার চিন্তা নাই।" },
          { title: "বিশ্বাস এখন ডিজিটাল", subtitle: "DIGITAL TRUST", desc: "ঠিক সময়ে টাকা সংগ্রহ করুন আর 'বিশ্বাস স্কোর' বাড়ান। বাজারের সেরা ব্যবসায়ী হয়ে উঠুন।" },
          { title: "বেশি কথা, সাফ হিসাব", subtitle: "COMMUNITY ADDA", desc: "অন্যান্য দোকানদারদের সাথে আড্ডা দিন, বুদ্ধি নিন আর ব্যবসা বড় করুন!" },
          { title: "দোকান მ্যাপে আনুন", subtitle: "DOKAN MAP", desc: "দোকানের লোকেশন পিন করুন যাতে আশেপাশের ব্যবহারকারীরা সহজে খুঁজে পায়!" },
          { title: "হক কথা, সাফ হিসাব", subtitle: "CLEAN & SECURE", desc: "আপনার সব ডাটা এনক্রিপ্ট করা। পিন ছাড়া কেউ খাতা খুলতে পারবে না।" },
        ];
    }
  };

  const texts = getTexts();
  const cSym = dialect === 'BANGLISH' ? 'Tk' : '৳';
  const scoreTxt = dialect === 'BANGLISH' ? 'TRUST' : 'বিশ্বাস';

  return [
    {
      title: texts[0].title,
      subtitle: texts[0].subtitle,
      description: texts[0].desc,
      icon: Sparkles,
      color: "bg-brand-primary",
      illustration: (
        <div className="relative w-48 h-48 flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-32 h-32 bg-brand-yellow rounded-3xl border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex items-center justify-center text-4xl font-black font-display rotate-12"
          >
            {cSym}
          </motion.div>
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full border-4 border-slate-900 flex items-center justify-center"
          >
            <Sparkles className="text-brand-yellow" size={24} />
          </motion.div>
        </div>
      )
    },
    {
      title: texts[1].title,
      subtitle: texts[1].subtitle,
      description: texts[1].desc,
      icon: BookOpen,
      color: "bg-rose-500",
      illustration: (
        <div className="relative w-48 h-48 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0.5, rotate: -20, y: 50 }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop', repeatDelay: 1 }}
            className="w-28 h-36 bg-white border-2 border-slate-300 p-2 shadow-sm"
          >
            <div className="h-2 w-full bg-slate-100 mb-2" />
            <div className="h-2 w-3/4 bg-slate-100 mb-2" />
            <div className="h-2 w-full bg-slate-100" />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Zap className="text-brand-primary" size={64} fill="currentColor" />
          </motion.div>
        </div>
      )
    },
    {
      title: texts[2].title,
      subtitle: texts[2].subtitle,
      description: texts[2].desc,
      icon: Zap,
      color: "bg-brand-yellow text-slate-900",
      illustration: (
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full border-4 border-slate-900 flex flex-col items-center justify-center bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-4xl font-black font-display text-brand-primary italic"
            >
              ৮৫
            </motion.span>
            <span className="text-[10px] font-black uppercase text-slate-400">{scoreTxt}</span>
          </div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute bottom-0 right-0"
          >
            <Award className="text-brand-yellow fill-brand-yellow" size={48} />
          </motion.div>
        </div>
      )
    },
    {
      title: texts[3].title,
      subtitle: texts[3].subtitle,
      description: texts[3].desc,
      icon: MessageSquare,
      color: "bg-brand-accent",
      illustration: (
        <div className="relative w-48 h-48 flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-36 h-36 bg-rose-100 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-[10px_10px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex -space-x-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-12 h-12 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center">
                  <UserIcon size={20} className="text-slate-400" />
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="absolute top-0 right-0 w-14 h-14 bg-brand-primary rounded-2xl border-2 border-slate-900 flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)]"
          >
            <MessageSquare className="text-white" size={24} />
          </motion.div>
        </div>
      )
    },
    {
      title: texts[4].title,
      subtitle: texts[4].subtitle,
      description: texts[4].desc,
      icon: MapPin,
      color: "bg-emerald-500",
      illustration: (
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="w-36 h-36 bg-slate-100 rounded-3xl border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden relative">
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-10">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="border border-slate-900" />
              ))}
            </div>
            <motion.div 
              animate={{ y: [0, -8, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <MapPin className="text-brand-primary" size={48} fill="currentColor" />
            </motion.div>
          </div>
        </div>
      )
    },
    {
      title: texts[5].title,
      subtitle: texts[5].subtitle,
      description: texts[5].desc,
      icon: ShieldCheck,
      color: "bg-slate-900",
      illustration: (
        <div className="relative w-48 h-48 flex items-center justify-center">
          <motion.div 
            animate={{ rotateY: [0, 180, 360] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="w-32 h-32 bg-slate-800 rounded-3xl border-4 border-slate-700 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            <ShieldCheck className="text-brand-primary" size={64} />
          </motion.div>
        </div>
      )
    }
  ];
};

export const WelcomeScreen = ({ onComplete }: { onComplete: () => void }) => {
  const { dialect } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = getSteps(dialect);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 flex flex-col">
      <div className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden">
        {/* Background Decor */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              x: [0, 100, 0], 
              y: [0, -100, 0],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl" 
          />
          <motion.div 
            animate={{ 
              x: [0, -100, 0], 
              y: [0, 100, 0],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl" 
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            <div className="mb-12">
              {step.illustration}
            </div>

            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]", step.color, currentStep === 2 ? "text-slate-900" : "text-white")}
            >
              {step.subtitle}
            </motion.div>

            <h2 className="text-4xl font-black font-display italic uppercase tracking-tighter mb-4 leading-none text-slate-900 dark:text-white">
              {step.title}
            </h2>

            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="p-8 pb-[calc(env(safe-area-inset-bottom)+2rem)] flex flex-col gap-6">
        <div className="flex gap-2 justify-center">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-2 rounded-full transition-all duration-300", 
                i === currentStep ? "w-8 bg-brand-primary" : "w-2 bg-slate-200 dark:bg-slate-800"
              )} 
            />
          ))}
        </div>

        <button 
          onClick={next}
          className="btn-street bg-brand-primary text-slate-950 text-xl py-6 flex items-center justify-center gap-3 w-full shadow-[6px_6px_0px_rgba(0,0,0,1)] border-2 border-slate-900"
        >
          {currentStep === steps.length - 1 
            ? (dialect === 'BANGLISH' ? 'Start Now!' : 
               dialect === 'CHITTAGONIAN' ? 'শুরু গরি দুন!' : 
               dialect === 'SYLHETI' ? 'শুরু করউক্কা!' : 
               dialect === 'BARISHAILLA' ? 'শুরু হরেন দেহি!' : 
               dialect === 'DHAKAIYYA' ? 'শুরু দে মামা!' : 
               'শুরু করি!')
            : (dialect === 'BANGLISH' ? 'Next' :
               dialect === 'CHITTAGONIAN' ? 'সামনে যন' :
               dialect === 'SYLHETI' ? 'আগে যাও' :
               dialect === 'BARISHAILLA' ? 'আগাই যান' :
               dialect === 'DHAKAIYYA' ? 'চল আগে' :
               'এরপরে')}
          <ChevronRight size={24} />
        </button>

        {currentStep === 0 && (
          <p className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
            MADE WITH ❤️ FOR BANGLADESHI SHOPKEEPERS
          </p>
        )}
      </div>
    </div>
  );
};
