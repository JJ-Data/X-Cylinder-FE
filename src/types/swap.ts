export interface SwapRecord {
  id: number;
  leaseId: number;
  oldCylinderId: number;
  newCylinderId: number;
  staffId: number;
  swapDate: string;
  condition: 'good' | 'poor' | 'damaged';
  weightRecorded?: number;
  damageNotes?: string;
  swapFee: number;
  reasonForFee?: string;
  receiptPrinted: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Related data when included
  lease?: {
    id: number;
    leaseStatus: string;
    customer: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
    };
    outlet: {
      id: number;
      name: string;
      location: string;
    };
  };
  oldCylinder?: {
    id: number;
    cylinderCode: string;
    type: string;
    status: string;
    currentGasVolume: number;
  };
  newCylinder?: {
    id: number;
    cylinderCode: string;
    type: string;
    status: string;
    currentGasVolume: number;
    maxGasVolume: number;
  };
  staff?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateSwapDto {
  leaseId?: number;
  cylinderCode?: string;
  qrCode?: string;
  newCylinderId: number;
  condition: 'good' | 'poor' | 'damaged';
  weightRecorded?: number;
  damageNotes?: string;
  swapFee?: number;
  reasonForFee?: string;
  notes?: string;
}

export interface SwapFilters {
  leaseId?: number;
  customerId?: number;
  staffId?: number;
  oldCylinderId?: number;
  newCylinderId?: number;
  condition?: 'good' | 'poor' | 'damaged';
  outletId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface SwapStatistics {
  totalSwaps: number;
  swapsByCondition: {
    good: number;
    poor: number;
    damaged: number;
  };
  totalFees: number;
  averageSwapFee: number;
  averageWeight: number;
  mostActiveStaff: {
    staffId: number;
    staffName: string;
    swapCount: number;
  };
  recentSwaps: SwapRecord[];
}

export interface SwapReceiptData {
  swap: SwapRecord;
  customer: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  outlet: {
    id: number;
    name: string;
    location: string;
    phone?: string;
  };
  oldCylinder: {
    id: number;
    cylinderCode: string;
    type: string;
    currentGasVolume: number;
  };
  newCylinder: {
    id: number;
    cylinderCode: string;
    type: string;
    currentGasVolume: number;
    maxGasVolume: number;
  };
}

export interface SwapsResponse {
  swaps: SwapRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}