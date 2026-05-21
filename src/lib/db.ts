import { openDB, type IDBPDatabase } from 'idb';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Customer, Transaction, UserStats } from '../types';
import { encrypt, decrypt } from './crypto';

const DB_NAME = 'lenden_engine_v3';
const DB_VERSION = 3;

// Initialize the CRDT shared document for real-time mesh sync
export const ydoc = new Y.Doc();
const persistence = new IndexeddbPersistence('lenden-mesh-storage', ydoc);
const yCustomers = ydoc.getMap<any>('customers');
const yTransactions = ydoc.getArray<any>('transactions');

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains('customers')) {
        db.createObjectStore('customers', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('by-customer', 'customerId');
        txStore.createIndex('by-timestamp', 'timestamp');
      } else if (oldVersion < 2) {
        const txStore = transaction.objectStore('transactions');
        if (!txStore.indexNames.contains('by-customer')) {
          txStore.createIndex('by-customer', 'customerId');
        }
        if (!txStore.indexNames.contains('by-timestamp')) {
          txStore.createIndex('by-timestamp', 'timestamp');
        }
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

/**
 * Encrypts sensitive fields if a PIN is provided.
 */
async function processCustomerForStorage(customer: Customer, pin?: string | null): Promise<Customer> {
  if (!pin) return customer;
  
  const encryptedCustomer = { ...customer };
  if (customer.nid) {
    encryptedCustomer.nid = await encrypt(customer.nid, pin);
  }
  if (customer.bkashNumber) {
    encryptedCustomer.bkashNumber = await encrypt(customer.bkashNumber, pin);
  }
  return encryptedCustomer;
}

/**
 * Decrypts sensitive fields if a PIN is provided.
 */
async function processCustomerFromStorage(customer: Customer, pin?: string | null): Promise<Customer> {
  if (!pin) return customer;

  const decryptedCustomer = { ...customer };
  if (customer.nid && customer.nid.length > 20) { // Simple check if it looks encrypted (base64)
    try {
      decryptedCustomer.nid = await decrypt(customer.nid, pin);
    } catch (e) {
      console.warn('Failed to decrypt NID', e);
    }
  }
  if (customer.bkashNumber && customer.bkashNumber.length > 20) {
    try {
      decryptedCustomer.bkashNumber = await decrypt(customer.bkashNumber, pin);
    } catch (e) {
      console.warn('Failed to decrypt bKash', e);
    }
  }
  return decryptedCustomer;
}

export async function addTransaction(tx: Transaction, updatedCustomer: Customer, stats: UserStats, pin?: string | null) {
  const db = await getDB();
  const transaction = db.transaction(['transactions', 'customers', 'stats'], 'readwrite');
  
  const processedCustomer = await processCustomerForStorage(updatedCustomer, pin);
  
  await transaction.objectStore('transactions').put(tx);
  await transaction.objectStore('customers').put(processedCustomer);
  await transaction.objectStore('stats').put({ ...stats, id: 'current' });
  
  await transaction.done;
}

export async function saveCustomer(customer: Customer, pin?: string | null) {
  const db = await getDB();
  const processed = await processCustomerForStorage(customer, pin);
  await db.put('customers', processed);
}

export async function getCustomers(pin?: string | null) {
  const db = await getDB();
  const rawCustomers = await db.getAll('customers') as Customer[];
  return Promise.all(rawCustomers.map(c => processCustomerFromStorage(c, pin)));
}

export async function saveTransaction(tx: Transaction) {
  const db = await getDB();
  await db.put('transactions', tx);
}

export async function getTransactionsByCustomer(customerId: string) {
  const db = await getDB();
  return db.getAllFromIndex('transactions', 'by-customer', customerId) as Promise<Transaction[]>;
}

export async function getTransactions() {
  const db = await getDB();
  return db.getAll('transactions') as Promise<Transaction[]>;
}

export async function deleteTransactions(ids: string[]) {
  const db = await getDB();
  const tx = db.transaction(['transactions', 'customers', 'stats'], 'readwrite');
  
  for (const id of ids) {
    const transaction = await tx.objectStore('transactions').get(id) as Transaction;
    if (transaction) {
      // Revert balance change
      const customer = await tx.objectStore('customers').get(transaction.customerId) as Customer;
      if (customer) {
        const amountChange = transaction.type === 'CREDIT' ? -transaction.amount : transaction.amount;
        customer.totalBalance += amountChange;
        await tx.objectStore('customers').put(customer);
      }
      await tx.objectStore('transactions').delete(id);
    }
  }
  await tx.done;
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
      coins: 120,
      isEliteMahajon: false
    };
    await db.put('stats', defaultStats);
    return defaultStats;
  }
  
  // Backward compatibility backfill
  const sanitizedStats = { ...stats };
  if (sanitizedStats.coins === undefined) sanitizedStats.coins = 120;
  if (sanitizedStats.isEliteMahajon === undefined) sanitizedStats.isEliteMahajon = false;
  
  return sanitizedStats as UserStats;
}

export async function saveStats(stats: UserStats) {
  const db = await getDB();
  await db.put('stats', { ...stats, id: 'current' });
}
