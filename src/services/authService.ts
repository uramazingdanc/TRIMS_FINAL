
import { LoginCredentials, RegisterData, User } from '@/types/auth';
import { users, delay } from './mockData';
import { v4 as uuidv4 } from 'uuid';

// Mock authentication functions
export const login = async ({ email, password }: LoginCredentials): Promise<User> => {
  await delay(1000);
  
  // In a real app, this would verify against a backend service
  // For our mock, we'll just check if the email exists
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Simulate successful login
  localStorage.setItem('tmis_user', JSON.stringify(user));
  return user;
};

export const register = async (data: RegisterData): Promise<User> => {
  await delay(1500);
  
  // Check if user already exists
  const existingUser = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Validate password match
  if (data.password !== data.confirmPassword) {
    throw new Error('Passwords do not match');
  }
  
  // Create new user (always a tenant for registration)
  const newUser: User = {
    id: uuidv4(),
    name: data.name,
    email: data.email,
    role: 'tenant',
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
  };
  
  users.push(newUser);
  
  // Simulate successful registration & login
  localStorage.setItem('tmis_user', JSON.stringify(newUser));
  return newUser;
};

export const logout = async (): Promise<void> => {
  await delay(500);
  localStorage.removeItem('tmis_user');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('tmis_user');
  return userStr ? JSON.parse(userStr) : null;
};
