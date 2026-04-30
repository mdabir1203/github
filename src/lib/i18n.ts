export type Dialect = 'STANDARD' | 'CHITTAGONIAN' | 'SYLHETI' | 'BARISHAILLA' | 'DHAKAIYYA' | 'BANGLISH';

export interface Translations {
  welcome: string;
  total_balance: string;
  debt: string;
  paid: string;
  add_customer: string;
  history: string;
  send_sms: string;
  trust_score: string;
  lock_title: string;
  save: string;
  next: string;
  unlock: string;
  nav_home: string;
  nav_ledger: string;
  nav_adda: string;
  nav_map: string;
  nav_history: string;
  rewards_title: string;
  badges_title: string;
  perks_title: string;
  feedback_title: string;
  feedback_prompt: string;
  feedback_voice: string;
  feedback_video: string;
  feedback_text: string;
  feedback_submit: string;
}

export const DIALECT_DATA: Record<Dialect, Translations> = {
  STANDARD: {
    welcome: "লেনদেনে স্বাগতম",
    total_balance: "বাকি ব্যালেন্স",
    debt: "বাকি (DEBT)",
    paid: "জমা (PAID)",
    add_customer: "নতুন খাতা",
    history: "ইতিহাস",
    send_sms: "এসএমএস পাঠান",
    trust_score: "বিশ্বাস স্কোর",
    lock_title: "লেনদেন ভল্ট",
    save: "সেভ করুন",
    next: "এগিয়ে যান",
    unlock: "আনলক করুন",
    nav_home: "ঘর",
    nav_ledger: "খাতা",
    nav_adda: "আড্ডা",
    nav_map: "ম্যাপ",
    nav_history: "কিচ্ছা",
    rewards_title: "জিতন",
    badges_title: "আপনার পদক",
    perks_title: "সুবিধা আনলক",
    feedback_title: "সাপোর্ট ও মতামত",
    feedback_prompt: "অ্যাপটি কেমন লাগছে? কোনো সমস্যা বা উন্নতির পরামর্শ থাকলে জানান।",
    feedback_voice: "মুখে বলুন",
    feedback_video: "ভিডিও বার্তা",
    feedback_text: "লিখে জানান",
    feedback_submit: "পাঠিয়ে দিন বস"
  },
  CHITTAGONIAN: {
    welcome: "লেনদেনত আইয়ুন্",
    total_balance: "বাকি টিয়া",
    debt: "ধারে দিয়ন (DEBT)",
    paid: "টিয়া পাইয়ুম (PAID)",
    add_customer: "নয়া কাস্টমার",
    history: "পুরানা হিসাব",
    send_sms: "মেসেজ মারুন",
    trust_score: "বিচ্ছাশর পয়েন্ট",
    lock_title: "সেফটি বক্স",
    save: "রাকি দুন",
    next: "সামনে যন",
    unlock: "খুলি দুন",
    nav_home: "বড়ি",
    nav_ledger: "খাতা",
    nav_adda: "আড্ডা",
    nav_map: "ম্যাপ",
    nav_history: "কিচ্ছা",
    rewards_title: "জিতুন (REWARDS)",
    badges_title: "অন্নের মেডেল",
    perks_title: "নয়া সুযোগ",
    feedback_title: "সাহায্য ও পরামর্শ",
    feedback_prompt: "অন্নের কোন সমস্যা আর নি? অ্যাপ কেন চলের আমত্তে জানান!",
    feedback_voice: "রবে কইন (Voice)",
    feedback_video: "ভিডিওত দেখান",
    feedback_text: "লেখি দুন",
    feedback_submit: "মারি দুন (Submit)"
  },
  SYLHETI: {
    welcome: "লেনদেনো খুশ আমদেদ",
    total_balance: "বাকি টেখা",
    debt: "বাকি দাউ (DEBT)",
    paid: "টেখা পাইছি (PAID)",
    add_customer: "নয়া মানু",
    history: "হিসাব কিতাব",
    send_sms: "এসএমএস দেও",
    trust_score: "একিনর স্কোর",
    lock_title: "ভল্ট তালা",
    save: "রাখো",
    next: "আগে যাও",
    unlock: "খুলো",
    nav_home: "ঘর",
    nav_ledger: "খাতা",
    nav_adda: "গপ",
    nav_map: "ম্যাপ",
    nav_history: "কিচ্ছা",
    rewards_title: "বখশিস",
    badges_title: "আপনার শীল",
    perks_title: "খুলা হগলি",
    feedback_title: "সাপোর্ট ও বয়ান",
    feedback_prompt: "কোনো মুশকিল অইলে কও, আর কি উন্নত করা যায় জানাও!",
    feedback_voice: "মাতিয়া কও (Voice)",
    feedback_video: "ভিডিও দেখাও",
    feedback_text: "লেখো",
    feedback_submit: "পাঠাও"
  },
  BARISHAILLA: {
    welcome: "লেনদেনে আইছেন মোরা",
    total_balance: "বাকি টাহা",
    debt: "বাকি দিছি (DEBT)",
    paid: "টাহা পাইছি (PAID)",
    add_customer: "নয়া পাইকার",
    history: "আগের খবর",
    send_sms: "এসএমএস হত্তন",
    trust_score: "বিচ্ছাসের মান",
    lock_title: "লোহার সিন্দুক",
    save: "থুয়ে দেন",
    next: "আগাই যান",
    unlock: "খুইল্লা ফালান",
    nav_home: "বড়ি",
    nav_ledger: "খাতা",
    nav_adda: "গপ-সপ",
    nav_map: "ম্যাপ",
    nav_history: "কিচ্ছা",
    rewards_title: "ইনাম",
    badges_title: "মোয়া-মেডেল",
    perks_title: "বাড়তি পাওনা",
    feedback_title: "মদদ ও নালিশ",
    feedback_prompt: "কোনো প্যাঁচ লাগলে মোরে কন, অ্যাপ কামে লাগে কি না হেইডাও কন!",
    feedback_voice: "মুখে কন (Voice)",
    feedback_video: "মুহ দেহান (Video)",
    feedback_text: "লেখেন দেহি",
    feedback_submit: "পাঠান দেহি"
  },
  DHAKAIYYA: {
    welcome: "লেনদেন মে আপকা সোয়াগত হ্যায়",
    total_balance: "বাকি ক্যাশ",
    debt: "বাকি দিসি (DEBT)",
    paid: "পেমেন্ট পাইসি (PAID)",
    add_customer: "নতুন খাতা খোল",
    history: "সব রেকর্ড",
    send_sms: "এসএমএস ঠোকো",
    trust_score: "ট্রাস্ট লেভেল",
    lock_title: "তিজোরি",
    save: "ডান কর",
    next: "চল আগে",
    unlock: "খোল এটা",
    nav_home: "বাসা",
    nav_ledger: "খাতা",
    nav_adda: "আড্ডা",
    nav_map: "ম্যাপ",
    nav_history: "কিচ্ছা",
    rewards_title: "রিওয়ার্ডস",
    badges_title: "গলার মালা",
    perks_title: "ওপেন করো",
    feedback_title: "মদদ ও মাশুয়ারা",
    feedback_prompt: "মামুরে কোনো ঝামেলা আছে? অ্যাপে কোনো নতুন কিচ্ছু লাগব? কন!",
    feedback_voice: "বুলি মারেন (Voice)",
    feedback_video: "ভিডিও বার্তা",
    feedback_text: "লেখেন দেখি",
    feedback_submit: "কাম সারেন"
  },
  BANGLISH: {
    welcome: "Welcome to Lenden",
    total_balance: "Due balance",
    debt: "Dhare (DEBT)",
    paid: "Cash (PAID)",
    add_customer: "New entry",
    history: "History check",
    send_sms: "Ping customer",
    trust_score: "Trust score",
    lock_title: "Secure lock",
    save: "Save now",
    next: "Next step",
    unlock: "Unlock now",
    nav_home: "Home",
    nav_ledger: "Ledger",
    nav_adda: "Adda",
    nav_map: "Map",
    nav_history: "History",
    rewards_title: "Rewards",
    badges_title: "Your Badges",
    perks_title: "Unlock Perks",
    feedback_title: "Support & Feedback",
    feedback_prompt: "Having issues or have a feature idea? Let us know!",
    feedback_voice: "Voice Support",
    feedback_video: "Video Support",
    feedback_text: "Write to us",
    feedback_submit: "Send Ticket"
  }
};
