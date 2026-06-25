import {
  collection, doc, addDoc, getDocs, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { requireDb } from './firebase';

// ---- Types ----
// A "lead" is a person who booked through the embedded widget (or was added
// manually). The status tracks the follow-up lifecycle.
export type ContactStatus = 'New' | 'Contacted' | 'Follow-up' | 'Won' | 'Lost';
export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: ContactStatus;
  source?: string;        // e.g. "Booking · Discovery Call" or "Manual"
  nextFollowUp?: string;  // YYYY-MM-DD
  createdAt?: number;
}

export type DealStage = 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won';
export interface Deal {
  id: string;
  company: string;
  amount: number;
  stage: DealStage;
  contact?: string;
  createdAt?: number;
}

// All data is namespaced per user: users/{uid}/{collection}/{docId}
const userCol = (uid: string, name: string) => collection(requireDb(), 'users', uid, name);
const userDoc = (uid: string, name: string, id: string) => doc(requireDb(), 'users', uid, name, id);

// ---- Contacts ----
export async function listContacts(uid: string): Promise<Contact[]> {
  const snap = await getDocs(query(userCol(uid, 'contacts'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Contact, 'id'>) }));
}
export async function addContact(uid: string, data: Omit<Contact, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(userCol(uid, 'contacts'), { ...data, createdAt: Date.now(), createdAtServer: serverTimestamp() });
}
export async function updateContact(uid: string, id: string, data: Partial<Omit<Contact, 'id'>>): Promise<void> {
  await updateDoc(userDoc(uid, 'contacts', id), data);
}
export async function deleteContact(uid: string, id: string): Promise<void> {
  await deleteDoc(userDoc(uid, 'contacts', id));
}

// ---- Deals ----
export async function listDeals(uid: string): Promise<Deal[]> {
  const snap = await getDocs(query(userCol(uid, 'deals'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Deal, 'id'>) }));
}
export async function addDeal(uid: string, data: Omit<Deal, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(userCol(uid, 'deals'), { ...data, createdAt: Date.now(), createdAtServer: serverTimestamp() });
}
export async function updateDeal(uid: string, id: string, data: Partial<Omit<Deal, 'id'>>): Promise<void> {
  await updateDoc(userDoc(uid, 'deals', id), data);
}
export async function deleteDeal(uid: string, id: string): Promise<void> {
  await deleteDoc(userDoc(uid, 'deals', id));
}
