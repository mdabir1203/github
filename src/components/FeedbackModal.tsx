import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareHeart, X, Star } from 'lucide-react';
import { useSecurity } from '../contexts/SecurityContext';

export const FeedbackModal = () => {
  const { shouldShowFeedback, dismissFeedback } = useSecurity();
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      dismissFeedback();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {shouldShowFeedback && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center p-6 bg-slate-950/40 backdrop-blur-sm">
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center border-2 border-slate-900">
                <MessageSquareHeart className="text-slate-950" />
              </div>
              <button 
                onClick={dismissFeedback}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <h3 className="text-2xl font-black font-display italic uppercase tracking-tighter mb-2">
              আপনার মতামত দিন ক্যান?
            </h3>
            <p className="text-xs font-bold text-slate-500 uppercase italic mb-6">
              অ্যাপটিকে আরও উন্নত করতে আপনার ফিডব্যাক প্রয়োজন।
            </p>

            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <p className="text-xl font-black text-brand-primary italic">ধন্যবাদ! আপনার ফিডব্যাক পাওয়া গেছে।</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-3xl transition-transform active:scale-90 ${rating >= star ? "text-brand-yellow scale-110" : "text-slate-200 dark:text-slate-800"}`}
                    >
                      <Star fill={rating >= star ? "currentColor" : "none"} strokeWidth={3} />
                    </button>
                  ))}
                </div>
                
                <textarea 
                  placeholder="আপনার কোনো পরামর্শ থাকলে লিখুন..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 rounded-2xl p-4 text-sm font-bold resize-none focus:ring-0 outline-none"
                  rows={3}
                />

                <button 
                  onClick={handleSubmit}
                  disabled={rating === 0}
                  className="w-full btn-street bg-brand-primary py-4 text-lg disabled:opacity-50"
                >
                  ফিডব্যাক পাঠান (SUBMIT)
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
