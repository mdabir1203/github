import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  User as UserIcon, 
  Sparkles, 
  Heart,
  Search,
  Plus,
  Phone
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { PageWrapper } from '../components/PageWrapper';
import { cn } from '../lib/utils';

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  whatsapp?: string;
  createdAt: any;
  likes: number;
}

export const Adda = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [whatsapp, setWhatsapp] = useState(localStorage.getItem('lenden_user_whatsapp') || '');
  const [user, setUser] = useState(auth.currentUser);
  const [isPosting, setIsPosting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (userDoc.exists() && userDoc.data().whatsapp) {
          setWhatsapp(userDoc.data().whatsapp);
          localStorage.setItem('lenden_user_whatsapp', userDoc.data().whatsapp);
        }
      }
    });

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
    });

    return () => {
      unsubAuth();
      unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login fail:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setIsPosting(true);
    try {
      // Update profile if whatsapp is set/changed
      if (whatsapp) {
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName,
          photoURL: user.photoURL,
          whatsapp: whatsapp
        }, { merge: true });
        localStorage.setItem('lenden_user_whatsapp', whatsapp);
      }

      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: user.displayName || 'লেনদেন সাথি',
        authorPhoto: user.photoURL || '',
        content: newPost,
        whatsapp: whatsapp,
        createdAt: serverTimestamp(),
        likes: 0
      });
      setNewPost('');
    } catch (error) {
      console.error("Post fail:", error);
    } finally {
      setIsPosting(false);
    }
  };

  if (!user) {
    return (
      <PageWrapper>
        <div className="h-[70vh] flex flex-col items-center justify-center text-center p-8">
          <div className="w-24 h-24 bg-brand-primary rounded-[2.5rem] border-4 border-slate-900 shadow-[10px_10px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-8 rotate-3">
            <MessageSquare className="text-white" size={48} />
          </div>
          <h2 className="text-4xl font-black font-display italic uppercase tracking-tighter mb-4 text-slate-900 dark:text-white leading-none">
            আড্ডায় জয়েন করেন ক্যান!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-12 max-w-xs">
            অন্যান্য ব্যবসায়ীদের সাথে কথা বলতে এবং টিপস শেয়ার করতে গুগল দিয়ে লগিন করুন।
          </p>
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="btn-street bg-white text-slate-950 flex items-center justify-center gap-4 px-10 py-5 text-xl font-black shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:bg-slate-50 transition-all border-4 border-slate-900"
          >
            {isLoggingIn ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <Sparkles size={24} />
              </motion.div>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>লিংক হত্তন (GOOGLE)</span>
              </>
            )}
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6 pb-32">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter leading-none">আড্ডা (ADDA)</h2>
            <p className="text-xs text-slate-500 font-bold italic uppercase mt-1">কই দিন ক্যান? (SHARE YOUR THOUGHTS)</p>
          </div>
          <div className="w-12 h-12 bg-brand-yellow rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-6">
            <MessageSquare className="text-slate-950" size={24} />
          </div>
        </div>

        {/* Post Input */}
        <div className="card-street p-4 bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <textarea 
            placeholder="আপনার মনের কথা কন ক্যান?..." 
            className="w-full bg-transparent border-none focus:ring-0 text-lg font-medium resize-none min-h-[100px]"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          
          <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="tel" 
                placeholder="আপনার হোয়াটসঅ্যাপ নম্বর (WHATSAPP)" 
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs font-bold"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400 italic">হক কথা, সাফ হিসাব</span>
              </div>
              <button 
                onClick={handlePost}
                disabled={!newPost.trim() || isPosting}
                className={cn(
                  "btn-street py-2 px-6 flex items-center gap-2 text-sm",
                  !newPost.trim() ? "opacity-50 grayscale" : "bg-brand-primary text-white"
                )}
              >
                পাঠান (POST)
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {posts.map((post, idx) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-street p-5 bg-white dark:bg-slate-900 border-2 border-slate-900"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-900 overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      {post.authorPhoto ? (
                        <img src={post.authorPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon size={18} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase italic font-display">{post.authorName}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{post.createdAt?.toDate() ? new Date(post.createdAt.toDate()).toLocaleTimeString() : 'এখনই'}</p>
                    </div>
                  </div>
                  
                  {post.whatsapp && (
                    <button 
                      onClick={() => window.open(`https://wa.me/${post.whatsapp.replace(/\D/g, '')}`, '_blank')}
                      className="w-10 h-10 bg-emerald-500 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center text-white active:scale-95 transition-transform"
                    >
                      <Phone size={18} fill="currentColor" />
                    </button>
                  )}
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {post.content}
                </p>
                <div className="mt-4 flex items-center gap-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                  <button className="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 transition-colors">
                    <Heart size={16} />
                    <span className="text-xs font-black italic">{post.likes || 0}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-slate-400">
                    <MessageSquare size={16} />
                    <span className="text-xs font-black italic">রিপ্লাই (REPLY)</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  );
};
