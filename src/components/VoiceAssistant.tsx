import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Play, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'bn-BD'; // Support for Bengali

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Here you might process the command
        if (transcript) {
           console.log(`[AI Agent] Processing voice command: ${transcript}`);
        }
      };
    }
  }, [transcript]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech api not supported or already started.", err);
      }
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-brand-primary border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center text-slate-900 active:translate-y-1 active:shadow-none transition-all"
        aria-label="Voice Assistant"
      >
        <Mic size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-28 right-4 left-4 z-50 bg-white border-2 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-3xl p-5 overflow-hidden"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full border-2 border-slate-900 text-slate-900"
            >
              <X size={16} />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-slate-900">
                <Mic size={24} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-black font-display text-lg uppercase italic tracking-tight">ভয়েস সাহায্য</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Agent-Assisted Onboarding</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <button className="w-full text-left p-3 rounded-xl border-2 border-slate-900 bg-brand-yellow/20 flex items-center justify-between active:scale-95 transition-transform">
                <span className="font-bold text-sm">কীভাবে বাকি যোগ করবো?</span>
                <Play size={16} className="text-slate-900" />
              </button>
              <button className="w-full text-left p-3 rounded-xl border-2 border-slate-900 bg-brand-primary/20 flex items-center justify-between active:scale-95 transition-transform">
                <span className="font-bold text-sm">অফলাইনে কাজ করে?</span>
                <Play size={16} className="text-slate-900" />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <p className="text-xs font-bold text-slate-500 mb-3 text-center">মুখে বলুন, আমি লিখে দিব!</p>
              
              {transcript && (
                <div className="w-full p-3 mb-3 bg-slate-100 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 italic">
                  "{transcript}"
                </div>
              )}

              <button 
                onClick={toggleListen}
                className={`w-full py-4 rounded-xl border-2 border-slate-900 font-black italic uppercase transition-all flex justify-center items-center gap-2 outline-none ${isListening ? 'bg-rose-500 text-white animate-pulse shadow-inner' : 'bg-slate-900 text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none'}`}
              >
                <Mic size={20} />
                {isListening ? 'শুনছি... (থাপুন)' : 'এখন বলুন'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
