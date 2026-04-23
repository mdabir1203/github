import { useState, useEffect, useCallback } from 'react';
import * as Comlink from 'comlink';
import { Customer, UserStats } from '../types';
import { getCustomers, getStats, getTransactions } from '../lib/db';
import { useSecurity } from '../contexts/SecurityContext';

// Worker Proxy (Scalability Engine)
const worker = new Worker(new URL('../lib/dataWorker.ts', import.meta.url), { type: 'module' });
const engine = Comlink.wrap<any>(worker);

export const useLendenData = () => {
  const { pin, isLocked } = useSecurity();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (isLocked && pin === null) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [c, s, txs] = await Promise.all([getCustomers(pin), getStats(), getTransactions()]);
      
      const [workerStats, learningInsights] = await Promise.all([
        engine.calculateStats(txs),
        engine.getLearningInsights(txs, c)
      ]);
      
      setCustomers(c.sort((a, b) => b.lastTransactionAt - a.lastTransactionAt));
      setStats({ ...s, ...workerStats });
      setInsights(learningInsights);
    } catch (e) {
      console.error('Scalability Engine Error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [pin, isLocked]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { customers, setCustomers, stats, setStats, insights, isLoading, refresh: loadData };
};
