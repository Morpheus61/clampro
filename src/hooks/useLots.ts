import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export interface Lot {
  lotNumber: string;
  weight: number;
  status: 'pending' | 'assigned' | 'processing' | 'completed';
  supplierName: string;
  receiptDate: string;
}

export function useAvailableLots() {
  return useLiveQuery(async () => {
    const rawMaterials = await db.rawMaterials.toArray();
    const suppliers = await db.suppliers.toArray();

    return rawMaterials.map(material => {
      const supplier = suppliers.find(s => s.id === material.supplierId);
      return {
        lotNumber: material.lotNumber,
        weight: material.weight,
        status: 'processing',
        supplierName: supplier?.name || 'Unknown',
        receiptDate: material.date.toISOString()
      };
    });
  });
}