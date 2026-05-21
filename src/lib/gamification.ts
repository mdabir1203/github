import { Transaction, UserStats } from '../types';

export const INITIAL_STATS: UserStats = {
  creditScore: 50,
  streakDays: 0,
  totalCollections: 0,
  lastActiveDate: '',
  badges: [],
  coins: 120,
  isEliteMahajon: false
};

/**
 * Lenden Gamification Algorithm
 * 
 * Score (0-100)
 * - Consistency (30%): Daily logging behavior
 * - Repayment Speed (40%): How fast customers pay back (weighted average)
 * - Collection Volume (30%): Total amount collected relative to credit given
 */

export function calculateNewStats(
  currentStats: UserStats,
  transactions: Transaction[],
  newTransaction?: Transaction
): UserStats {
  const today = new Date().toISOString().split('T')[0];
  let { streakDays, lastActiveDate, creditScore, totalCollections, badges } = currentStats;

  // 1. Update Streak
  if (lastActiveDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActiveDate === yesterdayStr) {
      streakDays += 1;
    } else if (lastActiveDate === '') {
      streakDays = 1;
    } else {
      streakDays = 1; // Reset if missed a day
    }
    lastActiveDate = today;
  }

  // 2. Update Collections
  if (newTransaction?.type === 'PAYMENT') {
    totalCollections += newTransaction.amount;
  }

  // 3. Calculate Credit Score (Simplified for demo)
  // In a real app, this would be more complex
  const allPayments = transactions.filter(t => t.type === 'PAYMENT');
  const allCredits = transactions.filter(t => t.type === 'CREDIT');
  
  const totalCreditGiven = allCredits.reduce((sum, t) => sum + t.amount, 0);
  const totalPaymentReceived = allPayments.reduce((sum, t) => sum + t.amount, 0);
  
  const collectionRatio = totalCreditGiven > 0 ? totalPaymentReceived / totalCreditGiven : 1;
  
  // Base score from collection ratio
  let newScore = 50 + (collectionRatio * 30);
  
  // Bonus for streaks
  newScore += Math.min(streakDays * 2, 20);
  
  // Cap at 100
  creditScore = Math.min(Math.round(newScore), 100);

  // 4. Badges
  const newBadges = [...badges];
  if (streakDays >= 7 && !newBadges.includes('নিয়মিত দোকানদার')) newBadges.push('নিয়মিত দোকানদার'); // Regular Shopkeeper
  if (totalCollections >= 10000 && !newBadges.includes('টাকা আদায়কারী ওস্তাদ')) newBadges.push('টাকা আদায়কারী ওস্তাদ'); // Collection Master
  if (creditScore >= 90 && !newBadges.includes('সেরা ব্যবসায়ী')) newBadges.push('সেরা ব্যবসায়ী'); // Best Businessman

  return {
    ...currentStats,
    streakDays,
    lastActiveDate,
    creditScore,
    totalCollections,
    badges: newBadges
  };
}
