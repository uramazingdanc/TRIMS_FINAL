
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User, LoginCredentials, RegisterData } from '@/types/auth';
import { login, register, logout, getCurrentUser } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const user = getCurrentUser();
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const user = await login(credentials);
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const user = await register(data);
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast({
        title: "Registration successful",
        description: `Welcome to TMIS, ${user.name}!`,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await logout();
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  const value = {
    ...state,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
