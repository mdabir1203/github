import { useState, useEffect } from 'react';
import { Customer, UserStats } from '../types';
import { getCustomers, getStats } from '../lib/db';

export const useLendenData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const [c, s] = await Promise.all([getCustomers(), getStats()]);
    setCustomers(c.sort((a, b) => b.lastTransactionAt - a.lastTransactionAt));
    setStats(s);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return { customers, setCustomers, stats, setStats, isLoading, refresh: loadData };
};
