
import { User, UserRole } from '@/types/auth';
import { Tenant, Room, Payment, MaintenanceRequest } from '@/types/tenant';
import { v4 as uuidv4 } from 'uuid';

// Mock Users
export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@tmis.com',
    role: 'admin',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'tenant',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'tenant',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
  }
];

// Mock Rooms
export const rooms: Room[] = [
  {
    id: '1',
    number: '101',
    floor: 1,
    capacity: 1,
    occupants: 1,
    type: 'single',
    status: 'occupied',
    pricePerMonth: 8000,
    amenities: ['Air Conditioning', 'Private Bathroom', 'Study Desk']
  },
  {
    id: '2',
    number: '102',
    floor: 1,
    capacity: 2,
    occupants: 1,
    type: 'double',
    status: 'occupied',
    pricePerMonth: 6500,
    amenities: ['Air Conditioning', 'Shared Bathroom', 'Study Desk']
  },
  {
    id: '3',
    number: '103',
    floor: 1,
    capacity: 2,
    occupants: 0,
    type: 'double',
    status: 'available',
    pricePerMonth: 6500,
    amenities: ['Air Conditioning', 'Shared Bathroom', 'Study Desk']
  },
  {
    id: '4',
    number: '201',
    floor: 2,
    capacity: 1,
    occupants: 0,
    type: 'single',
    status: 'maintenance',
    pricePerMonth: 8500,
    amenities: ['Air Conditioning', 'Private Bathroom', 'Study Desk', 'Mini Fridge']
  },
  {
    id: '5',
    number: '202',
    floor: 2,
    capacity: 3,
    occupants: 0,
    type: 'triple',
    status: 'available',
    pricePerMonth: 5500,
    amenities: ['Air Conditioning', 'Shared Bathroom', 'Study Desk']
  }
];

// Mock Tenants
export const tenants: Tenant[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '09123456789',
    address: '123 Main St, Anytown',
    emergencyContact: '09123456789 (Mary Doe, Mother)',
    leaseStartDate: '2023-01-01',
    leaseEndDate: '2023-12-31',
    roomId: '1',
    status: 'active',
    paymentStatus: 'paid',
    balance: 0,
    userId: '2'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '09987654321',
    address: '456 Oak St, Somewhere City',
    emergencyContact: '09987654322 (Robert Smith, Father)',
    leaseStartDate: '2023-02-15',
    leaseEndDate: '2023-12-31',
    roomId: '2',
    status: 'active',
    paymentStatus: 'overdue',
    balance: 6500,
    userId: '3'
  }
];

// Mock Payments
export const payments: Payment[] = [
  {
    id: '1',
    tenantId: '1',
    amount: 8000,
    date: '2023-04-28',
    dueDate: '2023-05-05',
    status: 'paid',
    method: 'bank transfer',
    reference: 'REF123456'
  },
  {
    id: '2',
    tenantId: '1',
    amount: 8000,
    date: '2023-03-29',
    dueDate: '2023-04-05',
    status: 'paid',
    method: 'cash'
  },
  {
    id: '3',
    tenantId: '2',
    amount: 6500,
    date: '2023-04-02',
    dueDate: '2023-04-05',
    status: 'paid',
    method: 'bank transfer',
    reference: 'REF987654'
  },
  {
    id: '4',
    tenantId: '2',
    amount: 6500,
    date: '',
    dueDate: '2023-05-05',
    status: 'overdue',
    method: 'pending'
  }
];

// Mock Maintenance Requests
export const maintenanceRequests: MaintenanceRequest[] = [
  {
    id: '1',
    tenantId: '1',
    roomId: '1',
    title: 'Leaking faucet',
    description: 'The bathroom faucet is constantly leaking and wasting water.',
    priority: 'medium',
    status: 'completed',
    dateSubmitted: '2023-04-10',
    dateResolved: '2023-04-12'
  },
  {
    id: '2',
    tenantId: '2',
    roomId: '2',
    title: 'AC not cooling',
    description: 'The air conditioner is running but not cooling the room properly.',
    priority: 'high',
    status: 'in progress',
    dateSubmitted: '2023-04-25'
  },
  {
    id: '3',
    tenantId: '1',
    roomId: '1',
    title: 'Light bulb replacement',
    description: 'The light bulb in the study area has burned out and needs replacement.',
    priority: 'low',
    status: 'open',
    dateSubmitted: '2023-05-01'
  }
];

// Helper functions to mimic API calls
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const addDataItem = async <T extends { id: string }>(
  collection: T[], 
  item: Omit<T, 'id'>
): Promise<T> => {
  await delay(500);
  const newItem = { ...item, id: uuidv4() } as T;
  collection.push(newItem);
  return newItem;
};

export const updateDataItem = async <T extends { id: string }>(
  collection: T[], 
  id: string, 
  updates: Partial<T>
): Promise<T> => {
  await delay(500);
  const index = collection.findIndex(item => item.id === id);
  if (index === -1) throw new Error('Item not found');
  
  collection[index] = { ...collection[index], ...updates };
  return collection[index];
};

export const deleteDataItem = async <T extends { id: string }>(
  collection: T[], 
  id: string
): Promise<void> => {
  await delay(500);
  const index = collection.findIndex(item => item.id === id);
  if (index === -1) throw new Error('Item not found');
  
  collection.splice(index, 1);
};

export const getDataItem = async <T extends { id: string }>(
  collection: T[], 
  id: string
): Promise<T> => {
  await delay(300);
  const item = collection.find(item => item.id === id);
  if (!item) throw new Error('Item not found');
  
  return item;
};

export const getAllDataItems = async <T extends { id: string }>(
  collection: T[]
): Promise<T[]> => {
  await delay(300);
  return [...collection];
};
