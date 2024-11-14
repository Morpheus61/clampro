import Dexie, { Table } from 'dexie';

export interface Supplier {
  id?: number;
  name: string;
  contact: string;
  licenseNumber: string;
}

export interface RawMaterial {
  id?: number;
  supplierId: number;
  weight: number;
  photoUrl: string;
  date: Date;
  lotNumber: string | null;
  status: 'pending' | 'assigned';
}

export interface Lot {
  id?: number;
  lotNumber: string;
  receiptIds: number[];
  totalWeight: number;
  notes?: string;
  status: 'pending' | 'processing' | 'completed';
  createdAt: Date;
}

export interface ProcessingBatch {
  id?: number;
  lotNumber: string;
  shellOnWeight: number;
  meatWeight: number;
  boxes: Array<{
    type: 'shell-on' | 'meat';
    weight: number;
    boxNumber: string;
    grade: string;
  }>;
  date: Date;
  yieldPercentage: number;
  status: 'pending' | 'completed';
}

export interface ShellWeight {
  id?: number;
  weight: number;
  date: Date;
  createdAt: Date;
  notes?: string;
}

export interface ProductGrade {
  id?: number;
  code: string;
  name: string;
  description: string;
  productType: 'shell-on' | 'meat';
}

export class ClamFlowDB extends Dexie {
  suppliers!: Table<Supplier>;
  rawMaterials!: Table<RawMaterial>;
  lots!: Table<Lot>;
  processingBatches!: Table<ProcessingBatch>;
  shellWeights!: Table<ShellWeight>;
  productGrades!: Table<ProductGrade>;

  constructor() {
    super('ClamFlowDB');

    this.version(4).stores({
      suppliers: '++id, name, licenseNumber',
      rawMaterials: '++id, supplierId, lotNumber, status, date',
      lots: '++id, lotNumber, status, createdAt',
      processingBatches: '++id, lotNumber, status, date',
      shellWeights: '++id, date',
      productGrades: '++id, code, productType'
    });

    // Add hooks for date conversion
    this.rawMaterials.hook('reading', obj => ({
      ...obj,
      date: obj.date instanceof Date ? obj.date : new Date(obj.date)
    }));

    this.lots.hook('reading', obj => ({
      ...obj,
      createdAt: obj.createdAt instanceof Date ? obj.createdAt : new Date(obj.createdAt)
    }));

    this.processingBatches.hook('reading', obj => ({
      ...obj,
      date: obj.date instanceof Date ? obj.date : new Date(obj.date)
    }));

    this.shellWeights.hook('reading', obj => ({
      ...obj,
      date: obj.date instanceof Date ? obj.date : new Date(obj.date),
      createdAt: obj.createdAt instanceof Date ? obj.createdAt : new Date(obj.createdAt)
    }));
  }

  async initializeDatabase() {
    const supplierCount = await this.suppliers.count();
    const gradeCount = await this.productGrades.count();

    if (supplierCount === 0) {
      await this.suppliers.bulkAdd([
        { name: "John's Fishing", contact: "555-0101", licenseNumber: "LIC001" },
        { name: "Bay Clams", contact: "555-0102", licenseNumber: "LIC002" },
        { name: "Ocean Harvest", contact: "555-0103", licenseNumber: "LIC003" }
      ]);
    }

    if (gradeCount === 0) {
      await this.productGrades.bulkAdd([
        {
          code: 'A',
          name: 'Premium',
          description: 'Highest quality, uniform size, perfect condition',
          productType: 'shell-on'
        },
        {
          code: 'B',
          name: 'Standard',
          description: 'Good quality, minor variations allowed',
          productType: 'shell-on'
        },
        {
          code: 'A',
          name: 'Premium',
          description: 'Clean, white meat, no impurities',
          productType: 'meat'
        },
        {
          code: 'B',
          name: 'Standard',
          description: 'Good quality meat, slight color variations allowed',
          productType: 'meat'
        }
      ]);
    }
  }
}

export const db = new ClamFlowDB();

// Initialize database
db.open()
  .then(() => db.initializeDatabase())
  .catch(err => {
    console.error('Failed to initialize database:', err);
  });