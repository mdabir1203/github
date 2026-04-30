import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Video, 
  Send, 
  ChevronLeft, 
  LifeBuoy, 
  StopCircle, 
  RefreshCcw,
  Sparkles,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export const ReviewAdda = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [recording, setRecording] = useState<'NONE' | 'VOICE' | 'VIDEO'>('NONE');
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [success, setSuccess] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async (type: 'VOICE' | 'VIDEO') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'VIDEO'
      });
      
      streamRef.current = stream;
      if (type === 'VIDEO' && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: type === 'VOICE' ? 'audio/ogg' : 'video/webm' });
        setMediaBlob(blob);
      };

      recorder.start();
      setRecording(type);
    } catch (err) {
      console.error("Failed to start recording", err);
      alert("Permission denied or device not found! We need your feedback to improve.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setRecording('NONE');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <PageWrapper>
      <div className="space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform">
            <ChevronLeft />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-black font-display italic uppercase tracking-tighter leading-none">{t.feedback_title}</h2>
            <p className="text-[10px] text-slate-500 font-bold italic uppercase">Support Center & UI Feedback</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border-2 border-brand-primary flex items-center justify-center text-brand-primary rotate-6">
            <LifeBuoy size={28} />
          </div>
        </div>

        <div className="card-street bg-slate-900 text-white p-6 relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] opacity-10">
            <HelpCircle size={100} />
          </div>
          <div className="relative z-10">
            <p className="font-black font-display text-lg italic uppercase leading-tight text-white pr-10">
              {t.feedback_prompt}
            </p>
          </div>
        </div>

        <AnimatePresence>
          {success ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-20 text-center space-y-4"
            >
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto border-4 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                <Send className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-black font-display italic uppercase">প্রাপ্তি স্বীকার! (Submitted!)</h3>
              <p className="text-sm font-bold text-slate-500 uppercase italic">আপনার মূল্যবান মতামত আমরা পেয়েছি। ধন্যবাদ!</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Media Recording Section */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => recording === 'VOICE' ? stopRecording() : startRecording('VOICE')}
                    className={cn(
                      "flex-1 p-5 card-street border-2 flex flex-col items-center gap-2 transition-all",
                      recording === 'VOICE' ? "bg-rose-500 text-white border-slate-900" : "bg-white dark:bg-slate-900 border-slate-900"
                    )}
                  >
                    {recording === 'VOICE' ? <StopCircle size={28} className="animate-pulse" /> : <Mic size={28} />}
                    <span className="text-[10px] font-black uppercase italic tracking-widest">{t.feedback_voice}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => recording === 'VIDEO' ? stopRecording() : startRecording('VIDEO')}
                    className={cn(
                      "flex-1 p-5 card-street border-2 flex flex-col items-center gap-2 transition-all",
                      recording === 'VIDEO' ? "bg-brand-accent text-white border-slate-900" : "bg-white dark:bg-slate-900 border-slate-900"
                    )}
                  >
                    {recording === 'VIDEO' ? <StopCircle size={28} className="animate-pulse" /> : <Video size={28} />}
                    <span className="text-[10px] font-black uppercase italic tracking-widest">{t.feedback_video}</span>
                  </button>
                </div>

                <AnimatePresence>
                  {recording === 'VIDEO' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative rounded-3xl overflow-hidden border-4 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] bg-slate-950 aspect-video group transition-all"
                    >
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-rose-500 text-white text-[8px] font-black uppercase italic tracking-widest rounded-full animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-white" />
                        Recording Feedback...
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {mediaBlob && (
                  <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500 border-dashed rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                        <Sparkles size={16} />
                      </div>
                      <span className="text-xs font-black uppercase italic text-emerald-600">Media attachment attached!</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setMediaBlob(null)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <RefreshCcw size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Text Feedback */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase italic tracking-widest text-slate-400 px-2">{t.feedback_text}</label>
                <textarea 
                  className="w-full input-field border-2 border-slate-900 bg-white p-5 min-h-[120px] resize-none text-sm font-bold"
                  placeholder="Describe your issue or suggestion here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                disabled={!text && !mediaBlob}
                className="w-full btn-street bg-brand-primary text-slate-950 font-black text-lg py-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-slate-900 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:grayscale"
              >
                <Send size={20} />
                {t.feedback_submit}
              </button>
            </form>
          )}
        </AnimatePresence>

        <div className="p-6 card-street border-dashed border-2 border-slate-200 text-center">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            SUPPORT QUALITY ASSURANCE (QA)<br/>FEEDBACK IS REVIEWED BY OUR PRODUCT TEAM WITHIN 24H.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
};

// Supporting utility
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');
