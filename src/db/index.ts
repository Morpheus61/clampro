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
  shellWeight: number;
  date: Date;
  yieldPercentage: number;
  status: 'pending' | 'completed';
  boxes: Array<{
    type: 'shell-on' | 'meat';
    weight: number;
    boxNumber: string;
    grade: string;
  }>;
}

export interface Package {
  id?: number;
  lotNumber: string;
  type: 'shell-on' | 'meat';
  weight: number;
  boxNumber: string;
  grade: string;
  qrCode: string;
  date: Date;
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
  packages!: Table<Package>;
  productGrades!: Table<ProductGrade>;

  constructor() {
    super('ClamFlowDB');

    // Define tables and their indexes
    this.version(2).stores({
      suppliers: '++id, name, licenseNumber',
      rawMaterials: '++id, supplierId, lotNumber, status, date',
      lots: '++id, lotNumber, status, createdAt',
      processingBatches: '++id, lotNumber, status, date',
      packages: '++id, lotNumber, boxNumber, date',
      productGrades: '++id, code, productType'
    }).upgrade(tx => {
      // This will run if the database is being upgraded from version 1 or is new
      return tx.productGrades.bulkAdd([
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
    });

    // Add hooks for date conversion
    this.rawMaterials.hook('reading', material => ({
      ...material,
      date: material.date instanceof Date ? material.date : new Date(material.date)
    }));

    this.lots.hook('reading', lot => ({
      ...lot,
      createdAt: lot.createdAt instanceof Date ? lot.createdAt : new Date(lot.createdAt)
    }));

    this.processingBatches.hook('reading', batch => ({
      ...batch,
      date: batch.date instanceof Date ? batch.date : new Date(batch.date)
    }));

    this.packages.hook('reading', pkg => ({
      ...pkg,
      date: pkg.date instanceof Date ? pkg.date : new Date(pkg.date)
    }));
  }

  // Initialize database with sample data
  async initializeDatabase() {
    const supplierCount = await this.suppliers.count();
    if (supplierCount === 0) {
      // Add sample suppliers
      await this.suppliers.bulkAdd([
        { name: "John's Fishing", contact: "555-0101", licenseNumber: "LIC001" },
        { name: "Bay Clams", contact: "555-0102", licenseNumber: "LIC002" },
        { name: "Ocean Harvest", contact: "555-0103", licenseNumber: "LIC003" }
      ]);
    }

    const gradeCount = await this.productGrades.count();
    if (gradeCount === 0) {
      // Add sample product grades
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

  // Delete the database and create a new one
  async resetDatabase() {
    await this.delete();
    const newDb = new ClamFlowDB();
    await newDb.open();
    await newDb.initializeDatabase();
    return newDb;
  }
}

// Create and export a single instance
export const db = new ClamFlowDB();

// Initialize database and handle errors
db.open()
  .then(() => db.initializeDatabase())
  .catch(err => {
    console.error('Failed to open database:', err);
    // If there's a version error, reset the database
    if (err.name === 'VersionError') {
      console.log('Version mismatch, resetting database...');
      db.resetDatabase().catch(console.error);
    }
  });