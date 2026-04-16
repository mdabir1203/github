import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(amount).replace('BDT', '৳');
}

export function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('en-BD', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  }).format(new Date(timestamp));
}

export function validateNID(nid: string) {
  // Bangladesh NID can be 10, 13, or 17 digits
  return /^\d{10}$|^\d{13}$|^\d{17}$/.test(nid);
}

export function validatePhone(phone: string) {
  // Standard BD mobile number: 01 followed by 9 digits
  return /^01[3-9]\d{8}$/.test(phone);
}

export function maskNID(nid: string) {
  if (!nid) return '';
  if (nid.length <= 4) return nid;
  return 'X'.repeat(nid.length - 4) + nid.slice(-4);
}
