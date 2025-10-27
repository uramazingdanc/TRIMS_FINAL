
export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  leaseStartDate: string;
  leaseEndDate: string;
  roomId: string;
  status: 'active' | 'inactive' | 'pending';
  paymentStatus: 'paid' | 'overdue' | 'pending';
  balance: number;
  userId?: string;
}

export interface Room {
  id: string;
  room_number?: string;
  number: string;  // Keep for backward compatibility
  floor: number;
  capacity: number;
  occupants: number;
  type: 'single' | 'double' | 'triple';
  status: 'available' | 'occupied' | 'maintenance';
  pricePerMonth: number;
  amenities: string[];
}

export interface Payment {
  id: string;
  tenantId: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  method: 'cash' | 'bank transfer' | 'credit card' | 'other';
  reference?: string;
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  roomId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'in progress' | 'completed' | 'cancelled';
  dateSubmitted: string;
  dateResolved?: string;
}
