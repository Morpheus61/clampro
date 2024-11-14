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
}

export interface ProcessingBatch {
  id?: number;
  rawMaterialId: number;
  shellOnWeight: number;
  meatWeight: number;
  shellWeight: number;
  date: Date;
}

export interface Package {
  id?: number;
  batchId: number;
  type: 'shell-on' | 'meat';
  weight: number;
  qrCode: string;
  date: Date;
}

export interface ProcessingData {
  lotNumber: string;
  shellOnWeight: number;
  meatWeight: number;
  shellWeight: number;
}