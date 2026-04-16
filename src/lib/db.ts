import { openDB, type IDBPDatabase } from 'idb';
import { Customer, Transaction, UserStats } from '../types';

const DB_NAME = 'lenden_db';
const DB_VERSION = 1;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('customers')) {
        db.createObjectStore('customers', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('by-customer', 'customerId');
        txStore.createIndex('by-timestamp', 'timestamp');
      }
      if (!db.objectStoreNames.contains('stats')) {
        db.createObjectStore('stats', { keyPath: 'id' });
      }
    },
  });
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) dbPromise = initDB();
  return dbPromise;
}

export async function saveCustomer(customer: Customer) {
  const db = await getDB();
  await db.put('customers', customer);
}

export async function getCustomers() {
  const db = await getDB();
  return db.getAll('customers') as Promise<Customer[]>;
}

export async function saveTransaction(tx: Transaction) {
  const db = await getDB();
  await db.put('transactions', tx);
}

export async function getTransactionsByCustomer(customerId: string) {
  const db = await getDB();
  return db.getAllFromIndex('transactions', 'by-customer', customerId) as Promise<Transaction[]>;
}

export async function getStats() {
  const db = await getDB();
  const stats = await db.get('stats', 'current');
  if (!stats) {
    const defaultStats: UserStats & { id: string } = {
      id: 'current',
      creditScore: 50,
      streakDays: 0,
      totalCollections: 0,
      lastActiveDate: '',
      badges: [],
    };
    await db.put('stats', defaultStats);
    return defaultStats;
  }
  return stats as UserStats;
}

export async function saveStats(stats: UserStats) {
  const db = await getDB();
  await db.put('stats', { ...stats, id: 'current' });
}
