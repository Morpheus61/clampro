import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Supplier } from '../db';

export function useSuppliers() {
  return useLiveQuery(() => db.suppliers.toArray());
}

export async function addSupplier(supplier: Omit<Supplier, 'id'>) {
  return await db.suppliers.add(supplier);
}