import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  Trophy, 
  History 
} from 'lucide-react';
import { cn } from '../lib/utils';

const Navigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50 transition-colors">
      <NavLink 
        to="/habits" 
        className={({ isActive }) => cn(
          "bottom-nav-item",
          isActive ? "text-brand-primary" : "text-slate-400 dark:text-slate-500"
        )}
      >
        <LayoutDashboard size={22} className="transition-transform active:scale-125" />
        <span className="text-[10px] font-black uppercase tracking-tighter font-display italic">ঘর</span>
      </NavLink>

      <NavLink 
        to="/patterns" 
        className={({ isActive }) => cn(
          "bottom-nav-item",
          isActive ? "text-brand-primary" : "text-slate-400 dark:text-slate-500"
        )}
      >
        <Users size={22} className="transition-transform active:scale-125" />
        <span className="text-[10px] font-black uppercase tracking-tighter font-display italic">খাতা</span>
      </NavLink>

      <NavLink 
        to="/add" 
        className="bg-brand-accent text-white p-4 rounded-3xl -mt-14 shadow-lg shadow-rose-200 dark:shadow-none border-2 border-slate-900 active:scale-90 transition-transform flex items-center justify-center rotate-3"
      >
        <PlusCircle size={32} />
      </NavLink>

      <NavLink 
        to="/beliefs" 
        className={({ isActive }) => cn(
          "bottom-nav-item",
          isActive ? "text-brand-primary" : "text-slate-400 dark:text-slate-500"
        )}
      >
        <Trophy size={22} className="transition-transform active:scale-125" />
        <span className="text-[10px] font-black uppercase tracking-tighter font-display italic">জিতন</span>
      </NavLink>

      <NavLink 
        to="/receipts" 
        className={({ isActive }) => cn(
          "bottom-nav-item",
          isActive ? "text-brand-primary" : "text-slate-400 dark:text-slate-500"
        )}
      >
        <History size={22} className="transition-transform active:scale-125" />
        <span className="text-[10px] font-black uppercase tracking-tighter font-display italic">কিচ্ছা</span>
      </NavLink>
    </nav>
  );
};

export default Navigation;
