
export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  intervalKm: number;
  intervalMonths: number;
  priority: MaintenancePriority;
  lastDoneKm?: number;
  lastDoneDate?: string;
  targetKm?: number; // O KM alvo deste marco específico
}

export interface MaintenanceMilestone {
  km: number;
  label: string;
  isWarranty: boolean;
  tasks: MaintenanceTask[];
  status: 'done' | 'pending' | 'overdue' | 'upcoming';
}

export interface VehicleManualPlan {
  title: string;
  description: string;
  intervalKm: number;
  intervalMonths: number;
  priority: MaintenancePriority;
}

export interface VehicleModelSpecs {
  brand: string;
  model: string;
  yearStart: number;
  yearEnd: number | null;
  engine: string;
  fuel: string[];
  transmission: string[];
  maintenancePlan: VehicleManualPlan[];
  warrantyKm: number;
  warrantyYears: number;
}

export interface TheftSighting {
  id: string;
  date: string;
  location: string;
  description: string;
  mapUrl?: string;
}

export interface TheftReport {
  date: string;
  state: string;
  city: string;
  neighborhood: string;
  description: string;
  declared: boolean;
  userIp?: string;
  latitude?: number;
  longitude?: number;
  reporterPlan?: 'free' | 'premium';
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  fuel: string;
  transmission: string;
  currentMileage: number;
  plate?: string;
  isStolen?: boolean;
  theftReport?: TheftReport;
  sightings?: TheftSighting[];
  lastKnownLat?: number;
  lastKnownLng?: number;
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  taskTitle: string;
  date: string;
  mileage: number;
  cost: number;
  notes: string;
  receiptUrl?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  userId: string;
  date: string;
  mileage: number;
  liters: number;
  cost: number;
  fuelType: string;
  isFullTank: boolean;
}

export interface AppState {
  vehicles: Vehicle[];
  records: ServiceRecord[];
  fuelLogs: FuelLog[];
  isPremium: boolean;
  selectedVehicleId: string | null;
  aiQuestionsRemaining: number;
}
