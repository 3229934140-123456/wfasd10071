export interface User {
  id: number;
  username: string;
  name: string;
  role: "admin" | "doctor" | "receptionist";
  phone: string;
}

export interface Owner {
  id: number;
  name: string;
  phone: string;
  email?: string;
}

export interface Pet {
  id: number;
  ownerId: number;
  ownerName?: string;
  ownerPhone?: string;
  name: string;
  species: "dog" | "cat" | "other";
  breed: string;
  gender: "male" | "female";
  birthDate: string;
  weight: number;
  neutered: boolean;
  avatar?: string;
  createdAt: string;
  lastVisitDate?: string;
}

export interface Vaccination {
  id: number;
  petId: number;
  petName?: string;
  ownerName?: string;
  ownerPhone?: string;
  vaccineName: string;
  vaccinationDate: string;
  nextDueDate: string;
  batchNumber?: string;
  manufacturer?: string;
  status: "upcoming" | "due" | "overdue" | "completed";
  daysUntilDue?: number;
}

export interface MedicalRecord {
  id: number;
  petId: number;
  petName?: string;
  petSpecies?: string;
  petBreed?: string;
  ownerName?: string;
  ownerPhone?: string;
  doctorId: number;
  doctorName?: string;
  visitDate: string;
  chiefComplaint: string;
  examination: string;
  diagnosis: string;
  treatment: string;
  weight: number;
  temperature: number;
  status: "pending" | "in-progress" | "completed";
  hasPrescription: boolean;
}

export interface Prescription {
  id: number;
  medicalRecordId: number;
  createdAt: string;
  notes: string;
  items: PrescriptionItem[];
}

export interface PrescriptionItem {
  id: number;
  prescriptionId: number;
  medicineId: number;
  medicineName: string;
  specification: string;
  dosage: number;
  frequency: string;
  durationDays: number;
  instructions: string;
}

export interface Medicine {
  id: number;
  name: string;
  specification: string;
  unit: string;
  stockQuantity: number;
  warningThreshold: number;
  price: number;
  manufacturer: string;
  category: string;
}

export interface StockRecord {
  id: number;
  medicineId: number;
  medicineName?: string;
  type: "in" | "out";
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
  supplier?: string;
  createdAt: string;
  operator?: string;
}

export interface Hospitalization {
  id: number;
  petId: number;
  petName?: string;
  petSpecies?: string;
  petBreed?: string;
  ownerName?: string;
  ownerPhone?: string;
  admitDate: string;
  dischargeDate?: string;
  ward: string;
  diagnosis: string;
  status: "admitted" | "discharged";
  dailyRecords?: DailyRecord[];
  recordCount?: number;
}

export interface DailyRecord {
  id: number;
  hospitalizationId: number;
  recordDate: string;
  recordTime?: string;
  appetite: "good" | "normal" | "poor" | "none";
  spirit: "good" | "normal" | "depressed";
  temperature: number;
  weight?: number;
  notes: string;
  notifiedOwner: boolean;
}

export interface DashboardStats {
  todayVisits: number;
  pendingVisits: number;
  lowStockAlerts: number;
  vaccineReminders: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  hospitalizedPets: number;
  newPetsThisMonth: number;
}

export interface DiseaseStats {
  name: string;
  count: number;
  percentage: number;
}

export interface PrescriptionStats {
  medicineName: string;
  count: number;
  totalAmount: number;
}

export interface RevisitRateStats {
  disease: string;
  totalVisits: number;
  revisitCount: number;
  revisitRate: number;
}
