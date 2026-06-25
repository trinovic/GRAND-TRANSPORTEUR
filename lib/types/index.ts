// ==========================================
// RBAC Types
// ==========================================
export type UserRole =
  | 'pca'
  | 'dg'
  | 'daf'
  | 'comptable'
  | 'facturation'
  | 'rh'
  | 'logistique'
  | 'chauffeur'
  | 'auditeur';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  avatar_url?: string;
  is_active: boolean;
  mfa_enabled: boolean;
  created_at: string;
}

// ==========================================
// Fleet Types
// ==========================================
export type VehicleType =
  | 'camion-citerne'
  | 'porte-conteneur'
  | 'camion-plateau'
  | 'semi-remorque'
  | 'vehicule-leger'
  | 'engin-special';

export type VehicleStatus = 'active' | 'immobilized' | 'maintenance' | 'sold';

export interface Vehicle {
  id: string;
  plate_number: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  chassis_number: string;
  acquisition_date: string;
  acquisition_value: number;
  current_km: number;
  status: VehicleStatus;
  insurance_expiry?: string;
  technical_control_expiry?: string;
  driver?: Driver;
  created_at: string;
}

export interface Driver {
  id: string;
  profile_id: string;
  full_name: string;
  phone: string;
  license_number: string;
  license_expiry: string;
  license_type: string;
  contract_type: 'cdi' | 'cdd' | 'interim';
  base_salary: number;
  hire_date: string;
  photo_url?: string;
  vehicle?: Vehicle;
  created_at: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  type: 'vidange' | 'pneus' | 'reparation' | 'controle-technique' | 'autre';
  date: string;
  cost: number;
  provider?: string;
  description?: string;
  next_due_date?: string;
  next_due_km?: number;
  created_at: string;
}

export interface FuelLog {
  id: string;
  vehicle_id: string;
  driver_id: string;
  date: string;
  liters: number;
  unit_price: number;
  total_cost: number;
  km_at_fill: number;
  station?: string;
  consumption_per_100km?: number;
  created_at: string;
}

// ==========================================
// Logistics Types
// ==========================================
export type MissionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface Mission {
  id: string;
  reference: string;
  vehicle_id: string;
  driver_id: string;
  client_id: string;
  departure_location: string;
  arrival_location: string;
  departure_at: string;
  arrival_at?: string;
  estimated_distance_km: number;
  actual_distance_km?: number;
  revenue: number;
  cost: number;
  margin: number;
  margin_percent: number;
  status: MissionStatus;
  notes?: string;
  vehicle?: Vehicle;
  driver?: Driver;
  client?: Client;
  created_at: string;
}

// ==========================================
// Finance Types
// ==========================================
export type Currency = 'XOF' | 'EUR' | 'USD' | 'GBP' | 'MAD';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_number?: string;
  credit_limit?: number;
  currency: Currency;
  created_at: string;
}

export interface Invoice {
  id: string;
  reference: string;
  client_id: string;
  mission_id?: string;
  amount_ht: number;
  tva_rate: number;
  tva_amount: number;
  amount_ttc: number;
  currency: Currency;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  paid_at?: string;
  notes?: string;
  client?: Client;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  account_code: string;
  account_name: string;
  label: string;
  debit: number;
  credit: number;
  journal_type: 'sale' | 'purchase' | 'bank' | 'cash' | 'misc';
  auto_generated: boolean;
  created_at: string;
}

// ==========================================
// HR Types
// ==========================================
export interface Employee {
  id: string;
  profile_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  department: string;
  position: string;
  hire_date: string;
  contract_type: 'cdi' | 'cdd' | 'interim';
  base_salary: number;
  currency: Currency;
  bank_account?: string;
  is_active: boolean;
  created_at: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  period: string; // YYYY-MM
  gross_salary: number;
  social_charges: number;
  income_tax: number;
  net_salary: number;
  bonuses: number;
  advances: number;
  deductions: number;
  currency: Currency;
  status: 'draft' | 'validated' | 'paid';
  employee?: Employee;
  created_at: string;
}

// ==========================================
// Dashboard Types
// ==========================================
export interface DashboardKPIs {
  revenue_today: number;
  revenue_month: number;
  expenses_today: number;
  expenses_month: number;
  net_result: number;
  treasury: number;
  receivables: number;
  payables: number;
  active_missions: number;
  active_vehicles: number;
  immobilized_vehicles: number;
  currency: Currency;
}

export interface Alert {
  id: string;
  type: 'danger' | 'warning' | 'info';
  category: 'fleet' | 'finance' | 'hr' | 'mission';
  title: string;
  description: string;
  created_at: string;
  is_read: boolean;
}
