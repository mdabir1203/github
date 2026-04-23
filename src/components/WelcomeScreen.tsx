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

const steps: Step[] = [
  {
    title: "আঁই লেন্দেন...",
    subtitle: "I AM LENDEN",
    description: "আপনার ব্যবসার নতুন ডিজিটাল খাতা। পুরনো খাতার ঝামেলা শেষ, এখন হবে স্মার্ট হিসাব।",
    icon: Sparkles,
    color: "bg-brand-primary",
    illustration: (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="w-32 h-32 bg-brand-yellow rounded-3xl border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex items-center justify-center text-4xl font-black font-display rotate-12"
        >
          ৳
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
    title: "পুরান খাতা? হেই দিন শেষ!",
    subtitle: "BYE BYE OLD LEDGER",
    description: "কাগজে হিসাব রাখার দিন শেষ। ছিঁড়ে যাওয়ার ভয় নাই, হারায় যাওয়ার চিন্তা নাই।",
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
    title: "আপনার বিশ্বাস এখন ডিজিটাল",
    subtitle: "DIGITAL TRUST SCORE",
    description: "ঠিক সময়ে টাকা তুলুন আর আপনার 'বিশ্বাস স্কোর' বাড়ান। বাজারের সেরা ব্যবসায়ী হয়ে উঠুন।",
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
          <span className="text-[10px] font-black uppercase text-slate-400">বিশ্বাস স্কোর</span>
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
    title: "বেশি কথা, সাফ হিসাব",
    subtitle: "COMMUNITY ADDA",
    description: "অন্যান্য দোকানদারদের সাথে আড্ডা দিন, বুদ্ধি নিন আর নিজের ব্যবসা বড় করেন ক্যান!",
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
    title: "আপনার দোকান ম্যাপে আনুন",
    subtitle: "DOKAN MAP",
    description: "আপনার দোকানের লোকেশন পিন করুন যাতে আশেপাশের লেন্দেন ব্যবহারকারীরা আপনাকে সহজে খুঁজে পায় ক্যান!",
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
    title: "হক কথা, সাফ হিসাব",
    subtitle: "CLEAN & SECURE",
    description: "আপনার সব ডাটা এনক্রিপ্ট করা। পিন ছাড়া কেউ আপনার খাতা খুলতে পারবে না।",
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

export const WelcomeScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

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
          {currentStep === steps.length - 1 ? 'শুরু করি ক্যান!' : 'এরপরে (NEXT)'}
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
